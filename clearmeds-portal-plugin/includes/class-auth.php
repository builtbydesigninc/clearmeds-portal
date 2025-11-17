<?php
/**
 * Authentication class
 * Handles WordPress user authentication integration
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_Auth {
    
    private $wpdb;
    
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }
    
    /**
     * Register new affiliate user
     */
    public function register($data) {
        // Validate required fields
        $required = array('email', 'password', 'firstName', 'lastName');
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return new WP_Error('missing_field', sprintf('Field %s is required', $field), array('status' => 400));
            }
        }
        
        // Check if user already exists
        if (email_exists($data['email'])) {
            return new WP_Error('email_exists', 'Email already registered', array('status' => 400));
        }
        
        // Create WordPress user
        $user_id = wp_create_user(
            $data['email'],
            $data['password'],
            $data['email']
        );
        
        if (is_wp_error($user_id)) {
            return $user_id;
        }
        
        // Update user meta
        wp_update_user(array(
            'ID' => $user_id,
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'display_name' => $data['firstName'] . ' ' . $data['lastName']
        ));
        
        if (!empty($data['phone'])) {
            update_user_meta($user_id, 'phone', ClearMeds_Utils::sanitize($data['phone']));
        }
        
        // Create affiliate record
        $affiliate_id = ClearMeds_Utils::generate_affiliate_id($user_id);
        
        // Handle referral code (could be affiliate ID or user ID)
        // Three scenarios:
        // 1. No referral code provided → top-level user (OK)
        // 2. Valid referral code → create relationship (OK)
        // 3. Invalid referral code → return error (user should be informed)
        $referrer_user_id = null;
        if (!empty($data['referrerId'])) {
            $referral_code = trim($data['referrerId']);
            
            // Check if it's an affiliate ID (format: AFF-YYYY-XXXX) or numeric user ID
            if (is_numeric($referral_code)) {
                // It's a numeric user ID
                $referrer_user_id = intval($referral_code);
            } else if (preg_match('/^AFF-\d{4}-\d+$/', $referral_code)) {
                // It's an affiliate ID - convert to user ID
                $referrer_user_id = $this->wpdb->get_var($this->wpdb->prepare(
                    "SELECT user_id FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE affiliate_id = %s",
                    $referral_code
                ));
                
                // If affiliate ID format is valid but doesn't exist in DB
                if (!$referrer_user_id) {
                    return new WP_Error('invalid_referral_code', 'The referral code you entered is not valid. Please check and try again, or sign up without a referral code.', array('status' => 400));
                }
            } else {
                // Referral code provided but format is invalid
                return new WP_Error('invalid_referral_format', 'Invalid referral code format. Please use a valid affiliate code (e.g., AFF-2025-0020) or leave blank to sign up directly.', array('status' => 400));
            }
            
            // If we have a referrer_user_id, validate it
            if ($referrer_user_id) {
                // Check self-referral
                if ($referrer_user_id == $user_id) {
                    return new WP_Error('self_referral', 'You cannot refer yourself', array('status' => 400));
                }
                
                // Validate referrer exists in WordPress
                if (!get_userdata($referrer_user_id)) {
                    return new WP_Error('referrer_not_found', 'The referrer account does not exist. Please use a valid referral code or sign up without one.', array('status' => 400));
                }
            }
        }
        
        // Handle payment method - save as payment method if provided, otherwise use legacy paymentDetails
        $payment_details_encrypted = null;
        if (!empty($data['paymentMethod'])) {
            // Save payment method in user meta (same structure as payments page)
            $payment_methods = array($data['paymentMethod']);
            update_user_meta($user_id, 'clearmeds_payment_methods', $payment_methods);
            update_user_meta($user_id, 'clearmeds_primary_payment_method', 0); // First method is primary
            
            // Also store encrypted payment details for backward compatibility
            $payment_details_encrypted = ClearMeds_Utils::encrypt(json_encode($data['paymentMethod']));
        } else if (!empty($data['paymentDetails'])) {
            // Legacy support - if paymentDetails is provided as string, encrypt it
            $payment_details_encrypted = ClearMeds_Utils::encrypt($data['paymentDetails']);
        }
        
        $this->wpdb->insert(
            $this->wpdb->prefix . 'clearmeds_affiliates',
            array(
                'user_id' => $user_id,
                'affiliate_id' => $affiliate_id,
                'referrer_id' => $referrer_user_id,
                'status' => 'pending', // New users are pending approval
                'payment_details' => $payment_details_encrypted,
                'tax_id_type' => !empty($data['taxIdType']) ? ClearMeds_Utils::sanitize($data['taxIdType']) : null,
                'tax_id' => !empty($data['taxId']) ? ClearMeds_Utils::encrypt($data['taxId']) : null
            ),
            array('%d', '%s', '%d', '%s', '%s', '%s', '%s')
        );
        
        // Create referral relationship if valid referrer exists
        if ($referrer_user_id) {
            $referral = new ClearMeds_Referral();
            $result = $referral->create_referral_relationship($user_id, $referrer_user_id);
            
            if (is_wp_error($result)) {
                // Rollback: delete the user and affiliate record
                wp_delete_user($user_id);
                $this->wpdb->delete(
                    $this->wpdb->prefix . 'clearmeds_affiliates',
                    array('user_id' => $user_id),
                    array('%d')
                );
                return $result;
            }
        }
        
        // Get user role
        $role = ClearMeds_Utils::get_user_role($user_id);
        
        // Generate JWT token
        $token = ClearMeds_JWT::generate_token($user_id, $data['email'], $role);
        
        return array(
            'user_id' => $user_id,
            'affiliate_id' => $affiliate_id,
            'token' => $token
        );
    }
    
    /**
     * Login user
     */
    public function login($email, $password) {
        $user = wp_authenticate($email, $password);
        
        if (is_wp_error($user)) {
            return $user;
        }
        
        // Check if user is approved
        $affiliate = $this->get_affiliate_data($user->ID);
        if ($affiliate && $affiliate->status !== 'active') {
            // Admin users can always login
            $role = ClearMeds_Utils::get_user_role($user->ID);
            if ($role !== 'admin' && $role !== 'super_admin') {
                return new WP_Error('pending_approval', 'Your account is pending admin approval. Please wait for approval before logging in.', array('status' => 403));
            }
        }
        
        // Get user role
        $role = ClearMeds_Utils::get_user_role($user->ID);
        
        // Generate JWT token
        $token = ClearMeds_JWT::generate_token($user->ID, $user->user_email, $role);
        
        return array(
            'user_id' => $user->ID,
            'email' => $user->user_email,
            'token' => $token,
            'role' => $role,
            'status' => $affiliate ? $affiliate->status : 'active'
        );
    }
    
    /**
     * Get current user data from JWT token
     */
    public function get_current_user_from_token($token) {
        $payload = ClearMeds_JWT::verify_token($token);
        
        if (!$payload || !isset($payload['user_id'])) {
            return null;
        }
        
        $user_id = intval($payload['user_id']);
        $user = get_userdata($user_id);
        
        if (!$user) {
            return null;
        }
        
        $affiliate = $this->get_affiliate_data($user_id);
        
        return array(
            'id' => $user->ID,
            'email' => $user->user_email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'displayName' => $user->display_name,
            'role' => $payload['role'] ?? ClearMeds_Utils::get_user_role($user_id),
            'affiliate_id' => $affiliate ? $affiliate->affiliate_id : null
        );
    }
    
    /**
     * Get current user data (legacy method for backward compatibility)
     */
    public function get_current_user() {
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            return null;
        }
        
        $user = get_userdata($user_id);
        $affiliate = $this->get_affiliate_data($user_id);
        
        return array(
            'id' => $user->ID,
            'email' => $user->user_email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'displayName' => $user->display_name,
            'role' => ClearMeds_Utils::get_user_role($user_id),
            'affiliate_id' => $affiliate ? $affiliate->affiliate_id : null
        );
    }
    
    /**
     * Get affiliate data for user
     */
    private function get_affiliate_data($user_id) {
        return $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT * FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
    }
    
    /**
     * Verify user authentication
     */
    public function verify_auth($request) {
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            return new WP_Error('unauthorized', 'Authentication required', array('status' => 401));
        }
        
        return $user_id;
    }
    
    /**
     * Request password reset
     */
    public function forgot_password($email) {
        if (empty($email)) {
            return new WP_Error('missing_email', 'Email address is required', array('status' => 400));
        }
        
        // Check if user exists
        $user = get_user_by('email', $email);
        if (!$user) {
            // Don't reveal if email exists or not for security
            return array('success' => true, 'message' => 'If an account exists with this email, a password reset link has been sent.');
        }
        
        // Generate password reset key
        $key = get_password_reset_key($user);
        
        if (is_wp_error($key)) {
            return new WP_Error('reset_key_error', 'Failed to generate reset key', array('status' => 500));
        }
        
        // Get frontend URL for reset link (configurable via WordPress option, fallback to site URL)
        $frontend_url = get_option('clearmeds_frontend_url', get_site_url());
        $reset_link = add_query_arg(array(
            'key' => $key,
            'login' => rawurlencode($user->user_login)
        ), rtrim($frontend_url, '/') . '/reset-password');
        
        // Send email
        $subject = 'Password Reset Request';
        $message = sprintf(
            "Hello %s,\n\n" .
            "You have requested to reset your password for your ClearMeds account.\n\n" .
            "Please click the following link to reset your password:\n%s\n\n" .
            "This link will expire in 24 hours.\n\n" .
            "If you did not request this password reset, please ignore this email.\n\n" .
            "Best regards,\nClearMeds Team",
            $user->display_name,
            $reset_link
        );
        
        $headers = array('Content-Type: text/plain; charset=UTF-8');
        $sent = wp_mail($user->user_email, $subject, $message, $headers);
        
        if (!$sent) {
            return new WP_Error('email_failed', 'Failed to send password reset email', array('status' => 500));
        }
        
        return array('success' => true, 'message' => 'If an account exists with this email, a password reset link has been sent.');
    }
    
    /**
     * Reset password using reset key
     */
    public function reset_password($key, $login, $new_password) {
        if (empty($key) || empty($login) || empty($new_password)) {
            return new WP_Error('missing_fields', 'Reset key, login, and new password are required', array('status' => 400));
        }
        
        // Validate password strength
        if (strlen($new_password) < 8) {
            return new WP_Error('weak_password', 'Password must be at least 8 characters long', array('status' => 400));
        }
        
        // Get user by login
        $user = get_user_by('login', $login);
        if (!$user) {
            return new WP_Error('invalid_user', 'Invalid reset link', array('status' => 400));
        }
        
        // Verify reset key
        $user_check = check_password_reset_key($key, $login);
        
        if (is_wp_error($user_check)) {
            return new WP_Error('invalid_key', 'Invalid or expired reset link', array('status' => 400));
        }
        
        // Reset password
        reset_password($user, $new_password);
        
        return array('success' => true, 'message' => 'Password has been reset successfully.');
    }
}

