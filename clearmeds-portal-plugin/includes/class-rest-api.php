<?php
/**
 * REST API class
 * Handles all REST API endpoints for the Next.js frontend
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_REST_API {
    
    private $namespace = 'clearmeds/v1';
    private $wpdb;
    private $auth;
    private $referral;
    private $commission;
    
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->auth = new ClearMeds_Auth();
        $this->referral = new ClearMeds_Referral();
        $this->commission = new ClearMeds_Commission();
        
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register all REST API routes
     */
    public function register_routes() {
        // Authentication routes
        register_rest_route($this->namespace, '/auth/register', array(
            'methods' => 'POST',
            'callback' => array($this, 'register_user'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route($this->namespace, '/auth/login', array(
            'methods' => 'POST',
            'callback' => array($this, 'login_user'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route($this->namespace, '/auth/user', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_current_user'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/auth/forgot-password', array(
            'methods' => 'POST',
            'callback' => array($this, 'forgot_password'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route($this->namespace, '/auth/reset-password', array(
            'methods' => 'POST',
            'callback' => array($this, 'reset_password'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route($this->namespace, '/auth/sso', array(
            'methods' => 'GET',
            'callback' => array($this, 'generate_sso_token'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // Combined Dashboard endpoint
        register_rest_route($this->namespace, '/dashboard', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_dashboard'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // User endpoints
        register_rest_route($this->namespace, '/users/profile', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_user_profile'),
                'permission_callback' => array($this, 'check_auth')
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_user_profile'),
                'permission_callback' => array($this, 'check_auth')
            )
        ));
        
        register_rest_route($this->namespace, '/users/referral-link', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_referral_link'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/users/payment-details', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_payment_details'),
                'permission_callback' => array($this, 'check_auth')
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_payment_details'),
                'permission_callback' => array($this, 'check_auth')
            )
        ));
        
        register_rest_route($this->namespace, '/users/tax-info', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_tax_info'),
                'permission_callback' => array($this, 'check_auth')
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_tax_info'),
                'permission_callback' => array($this, 'check_auth')
            )
        ));
        
        register_rest_route($this->namespace, '/users/password', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_password'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // Combined Network endpoint
        register_rest_route($this->namespace, '/referrals/network-full', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_network_full'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // Individual referral endpoints
        register_rest_route($this->namespace, '/referrals/stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_referral_stats'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/referrals/network', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_referral_network'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/referrals/direct', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_direct_referrals'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/referrals/breakdown', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_commission_breakdown'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // User pending commissions (own + network)
        register_rest_route($this->namespace, '/commissions/pending', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_user_pending_commissions'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // Combined Transactions endpoint
        register_rest_route($this->namespace, '/transactions', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_transactions'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/transactions/export', array(
            'methods' => 'GET',
            'callback' => array($this, 'export_transactions'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // Combined Payments endpoint
        register_rest_route($this->namespace, '/payments', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_payments'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/payments/methods', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_payment_methods'),
                'permission_callback' => array($this, 'check_auth')
            ),
            array(
                'methods' => 'POST',
                'callback' => array($this, 'add_payment_method'),
                'permission_callback' => array($this, 'check_auth')
            )
        ));
        
        register_rest_route($this->namespace, '/payments/methods/(?P<id>\d+)', array(
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_payment_method'),
                'permission_callback' => array($this, 'check_auth')
            ),
            array(
                'methods' => 'DELETE',
                'callback' => array($this, 'delete_payment_method'),
                'permission_callback' => array($this, 'check_auth')
            )
        ));
        
        register_rest_route($this->namespace, '/payments/methods/(?P<id>\d+)/set-primary', array(
            'methods' => 'POST',
            'callback' => array($this, 'set_primary_payment_method'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // Combined Leaderboard endpoint
        register_rest_route($this->namespace, '/leaderboard', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_leaderboard'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/leaderboard/widget', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_leaderboard_widget'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // Combined Guides endpoint
        register_rest_route($this->namespace, '/guides', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_guides'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/guides/checklist/(?P<item_key>[a-zA-Z0-9_-]+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_checklist_item'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        // Marketing endpoints
        register_rest_route($this->namespace, '/marketing/links', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_marketing_links'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/marketing/generate-link', array(
            'methods' => 'POST',
            'callback' => array($this, 'generate_marketing_link'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/marketing/stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_marketing_stats'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/marketing/media', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_marketing_media'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/marketing/resources', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_marketing_resources'),
            'permission_callback' => array($this, 'check_auth')
        ));
        
        register_rest_route($this->namespace, '/marketing/integrations', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_marketing_integrations'),
                'permission_callback' => array($this, 'check_auth')
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_marketing_integration'),
                'permission_callback' => array($this, 'check_auth')
            )
        ));
        
        // Settings endpoints
        register_rest_route($this->namespace, '/settings/notifications', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_notification_settings'),
                'permission_callback' => array($this, 'check_auth')
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_notification_settings'),
                'permission_callback' => array($this, 'check_auth')
            )
        ));
        
        register_rest_route($this->namespace, '/settings/integrations', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_integration_settings'),
                'permission_callback' => array($this, 'check_auth')
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_integration_settings'),
                'permission_callback' => array($this, 'check_auth')
            )
        ));
        
        // Admin endpoints
        register_rest_route($this->namespace, '/admin/dashboard', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_admin_dashboard'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/config', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_admin_config'),
                'permission_callback' => array($this, 'check_admin')
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_admin_config'),
                'permission_callback' => array($this, 'check_admin')
            )
        ));
        
        register_rest_route($this->namespace, '/admin/users', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_admin_users'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/users/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_admin_user_by_id'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/users/(?P<id>\d+)/approve', array(
            'methods' => 'PUT',
            'callback' => array($this, 'approve_user'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/users/(?P<id>\d+)/reject', array(
            'methods' => 'PUT',
            'callback' => array($this, 'reject_user'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/commissions', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_admin_commissions'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/commissions/pending', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_pending_commissions'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/commissions/(?P<id>\d+)/approve', array(
            'methods' => 'PUT',
            'callback' => array($this, 'approve_commission'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/commissions/(?P<id>\d+)/reject', array(
            'methods' => 'PUT',
            'callback' => array($this, 'reject_commission'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/payouts', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_admin_payouts'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        register_rest_route($this->namespace, '/admin/payouts/process', array(
            'methods' => 'POST',
            'callback' => array($this, 'process_payouts'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        // Seed data endpoint (for testing)
        register_rest_route($this->namespace, '/admin/seed-data', array(
            'methods' => 'POST',
            'callback' => array($this, 'seed_test_data'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        // Seed payment methods endpoint (for testing)
        register_rest_route($this->namespace, '/admin/seed-payment-methods/(?P<user_id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'seed_payment_methods'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        // Seed payouts endpoint (for testing)
        register_rest_route($this->namespace, '/admin/seed-payouts/(?P<user_id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'seed_payouts'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        // Rebuild tables endpoint
        register_rest_route($this->namespace, '/admin/rebuild-tables', array(
            'methods' => 'POST',
            'callback' => array($this, 'rebuild_tables'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        // Create referral relationships endpoint (for testing)
        register_rest_route($this->namespace, '/admin/create-referrals', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_referral_relationships'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        // Sync commissions with orders endpoint
        register_rest_route($this->namespace, '/admin/sync-commissions', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_commissions_with_orders'),
            'permission_callback' => array($this, 'check_admin')
        ));
        
        // Debug endpoint
        register_rest_route($this->namespace, '/debug/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_debug_status'),
            'permission_callback' => array($this, 'check_admin')
        ));
    }
    
    /**
     * Check if debug mode is enabled
     */
    private function is_debug_enabled() {
        return get_option('clearmeds_debug_mode') === '1';
    }
    
    /**
     * Log debug information
     */
    private function debug_log($message, $data = null) {
        if (!$this->is_debug_enabled()) {
            return;
        }
        
        $log_message = '[ClearMeds Debug] ' . $message;
        if ($data !== null) {
            $log_message .= ' | Data: ' . print_r($data, true);
        }
        
        error_log($log_message);
    }
    
    /**
     * Check authentication via JWT
     */
    public function check_auth($request) {
        // Try JWT token first
        $token = ClearMeds_JWT::extract_token_from_header($request);
        
        if ($token) {
            $payload = ClearMeds_JWT::verify_token($token);
            if ($payload && isset($payload['user_id'])) {
                // Set current user for WordPress functions
                wp_set_current_user($payload['user_id']);
                $this->debug_log('Auth check (JWT)', array(
                    'authenticated' => true,
                    'user_id' => $payload['user_id'],
                    'endpoint' => $request->get_route()
                ));
                return true;
            }
        }
        
        // Fallback to WordPress session (for backward compatibility)
        $is_authenticated = is_user_logged_in();
        $this->debug_log('Auth check (Session)', array(
            'authenticated' => $is_authenticated,
            'user_id' => get_current_user_id(),
            'endpoint' => $request->get_route()
        ));
        return $is_authenticated;
    }
    
    /**
     * Check admin permissions
     */
    public function check_admin($request) {
        // Check JWT token first
        $token = ClearMeds_JWT::extract_token_from_header($request);
        if ($token) {
            $payload = ClearMeds_JWT::verify_token($token);
            if ($payload && isset($payload['user_id'])) {
                wp_set_current_user($payload['user_id']);
                $is_admin = ClearMeds_Utils::is_admin($payload['user_id']);
                $this->debug_log('Admin check (JWT)', array(
                    'is_admin' => $is_admin,
                    'user_id' => $payload['user_id'],
                    'endpoint' => $request->get_route()
                ));
                return $is_admin;
            }
        }
        
        // Fallback to session check
        if (!is_user_logged_in()) {
            $this->debug_log('Admin check failed - not logged in');
            return false;
        }
        
        $is_admin = ClearMeds_Utils::is_admin(get_current_user_id());
        $this->debug_log('Admin check (Session)', array(
            'is_admin' => $is_admin,
            'user_id' => get_current_user_id(),
            'endpoint' => $request->get_route()
        ));
        
        return $is_admin;
    }
    
    /**
     * Get debug status
     */
    public function get_debug_status($request) {
        return new WP_REST_Response(array(
            'debug_enabled' => $this->is_debug_enabled(),
            'timestamp' => current_time('mysql')
        ), 200);
    }
    
    /**
     * Register user
     */
    public function register_user($request) {
        $data = $request->get_json_params();
        $this->debug_log('Register user request', array('email' => $data['email'] ?? 'N/A'));
        
        $result = $this->auth->register($data);
        
        if (is_wp_error($result)) {
            $this->debug_log('Register user error', $result->get_error_message());
            return $result;
        }
        
        $this->debug_log('Register user success', array('user_id' => $result['user_id'] ?? 'N/A'));
        return new WP_REST_Response($result, 201);
    }
    
    /**
     * Login user
     */
    public function login_user($request) {
        $data = $request->get_json_params();
        $this->debug_log('Login request', array('email' => $data['email'] ?? 'N/A'));
        
        $result = $this->auth->login($data['email'], $data['password']);
        
        if (is_wp_error($result)) {
            $this->debug_log('Login error', $result->get_error_message());
            return $result;
        }
        
        $this->debug_log('Login success', array('user_id' => $result['user_id'] ?? 'N/A'));
        return new WP_REST_Response($result, 200);
    }
    
    /**
     * Get current user
     */
    public function get_current_user($request) {
        // Try JWT token first
        $token = ClearMeds_JWT::extract_token_from_header($request);
        
        if ($token) {
            $user = $this->auth->get_current_user_from_token($token);
            if ($user) {
                return new WP_REST_Response($user, 200);
            }
        }
        
        // Fallback to session-based auth
        $user = $this->auth->get_current_user();
        
        if (!$user) {
            return new WP_Error('not_found', 'User not found', array('status' => 404));
        }
        
        return new WP_REST_Response($user, 200);
    }
    
    /**
     * Forgot password
     */
    public function forgot_password($request) {
        $data = $request->get_json_params();
        $this->debug_log('Forgot password request', array('email' => $data['email'] ?? 'N/A'));
        
        if (empty($data['email'])) {
            return new WP_Error('missing_email', 'Email address is required', array('status' => 400));
        }
        
        $result = $this->auth->forgot_password($data['email']);
        
        if (is_wp_error($result)) {
            $this->debug_log('Forgot password error', $result->get_error_message());
            return $result;
        }
        
        $this->debug_log('Forgot password success', array('email' => $data['email']));
        return new WP_REST_Response($result, 200);
    }
    
    /**
     * Reset password
     */
    public function reset_password($request) {
        $data = $request->get_json_params();
        $this->debug_log('Reset password request', array('login' => $data['login'] ?? 'N/A'));
        
        if (empty($data['key']) || empty($data['login']) || empty($data['password'])) {
            return new WP_Error('missing_fields', 'Reset key, login, and password are required', array('status' => 400));
        }
        
        $result = $this->auth->reset_password($data['key'], $data['login'], $data['password']);
        
        if (is_wp_error($result)) {
            $this->debug_log('Reset password error', $result->get_error_message());
            return $result;
        }
        
        $this->debug_log('Reset password success', array('login' => $data['login']));
        return new WP_REST_Response($result, 200);
    }
    
    /**
     * Generate SSO token for shop login
     */
    public function generate_sso_token($request) {
        // Get current user from JWT token
        $token = ClearMeds_JWT::extract_token_from_header($request);
        
        if (!$token) {
            return new WP_Error('unauthorized', 'Authentication required', array('status' => 401));
        }
        
        $user = $this->auth->get_current_user_from_token($token);
        
        if (!$user) {
            return new WP_Error('unauthorized', 'Invalid token', array('status' => 401));
        }
        
        $user_id = $user['id'];
        
        // Generate a secure, one-time-use SSO token
        $sso_token = bin2hex(random_bytes(32));
        $expires_at = time() + 300; // 5 minutes expiration
        
        // Store SSO token in transient (WordPress cache) with user ID
        set_transient('clearmeds_sso_' . $sso_token, array(
            'user_id' => $user_id,
            'created_at' => time()
        ), 300); // 5 minutes TTL
        
        // Get shop URL from options or use default
        $shop_url = get_option('clearmeds_shop_url', 'https://clearmeds.advait.site');
        
        // Build SSO URL
        $sso_url = add_query_arg(array(
            'sso_token' => $sso_token
        ), rtrim($shop_url, '/'));
        
        $this->debug_log('SSO token generated', array('user_id' => $user_id));
        
        return new WP_REST_Response(array(
            'sso_url' => $sso_url,
            'token' => $sso_token,
            'expires_in' => 300
        ), 200);
    }
    
    /**
     * Get combined dashboard data
     */
    public function get_dashboard($request) {
        $user_id = get_current_user_id();
        $this->debug_log('Get dashboard', array('user_id' => $user_id));
        
        $profile = $this->get_user_profile_data($user_id);
        $referral_link = $this->get_referral_link_data($user_id);
        $stats = $this->get_dashboard_stats($user_id);
        $rank = $this->get_user_rank($user_id);
        $leaderboard = $this->get_leaderboard_widget_data();
        $recent_transactions = $this->get_recent_transactions($user_id, 10);
        
        $response = array(
            'profile' => $profile,
            'referralLink' => $referral_link,
            'stats' => $stats,
            'rank' => $rank,
            'leaderboard' => $leaderboard,
            'recentTransactions' => $recent_transactions
        );
        
        $this->debug_log('Dashboard response', array('stats_count' => count($stats), 'transactions_count' => count($recent_transactions)));
        
        return new WP_REST_Response($response, 200);
    }
    
    /**
     * Get user profile
     */
    public function get_user_profile($request) {
        $user_id = get_current_user_id();
        $profile = $this->get_user_profile_data($user_id);
        
        return new WP_REST_Response($profile, 200);
    }
    
    /**
     * Get user profile data
     */
    private function get_user_profile_data($user_id) {
        $user = get_userdata($user_id);
        $affiliate = $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT * FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
        
        return array(
            'name' => $user->display_name,
            'email' => $user->user_email,
            'company' => get_user_meta($user_id, 'company', true) ?: '',
            'avatar' => get_avatar_url($user_id),
            'affiliateId' => $affiliate ? $affiliate->affiliate_id : '',
            'phone' => get_user_meta($user_id, 'phone', true) ?: '',
            'bio' => get_user_meta($user_id, 'bio', true) ?: ''
        );
    }
    
    /**
     * Update user profile
     */
    public function update_user_profile($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $update_data = array('ID' => $user_id);
        
        if (isset($data['name'])) {
            $name_parts = explode(' ', $data['name'], 2);
            $update_data['first_name'] = $name_parts[0];
            $update_data['last_name'] = isset($name_parts[1]) ? $name_parts[1] : '';
            $update_data['display_name'] = $data['name'];
        }
        
        if (isset($data['email'])) {
            $update_data['user_email'] = ClearMeds_Utils::sanitize($data['email'], 'email');
        }
        
        wp_update_user($update_data);
        
        if (isset($data['phone'])) {
            update_user_meta($user_id, 'phone', ClearMeds_Utils::sanitize($data['phone']));
        }
        
        if (isset($data['company'])) {
            update_user_meta($user_id, 'company', ClearMeds_Utils::sanitize($data['company']));
        }
        
        if (isset($data['bio'])) {
            update_user_meta($user_id, 'bio', ClearMeds_Utils::sanitize($data['bio']));
        }
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    /**
     * Get referral link
     */
    public function get_referral_link($request) {
        $user_id = get_current_user_id();
        $data = $this->get_referral_link_data($user_id);
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * Get referral link data
     */
    private function get_referral_link_data($user_id) {
        $affiliate = $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT affiliate_id FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
        
        $site_url = get_site_url();
        $link = $site_url . '/?ref=' . $affiliate->affiliate_id;
        
        return array(
            'link' => $link,
            'commissionRate' => '10%'
        );
    }
    
    /**
     * Get dashboard stats with real percent changes
     */
    private function get_dashboard_stats($user_id) {
        // Current period totals
        $total_orders = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(DISTINCT order_id) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d",
            $user_id
        ));
        
        $total_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(order_amount) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d AND status = 'approved'",
            $user_id
        ));
        
        $commissions_earned = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(commission_amount) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d AND status = 'approved'",
            $user_id
        ));
        
        $clinics_onboarded = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network WHERE referrer_id = %d",
            $user_id
        ));
        
        // Period comparisons (30-60 days ago vs last 30 days)
        $current_start = date('Y-m-d', strtotime('-30 days'));
        $previous_start = date('Y-m-d', strtotime('-60 days'));
        $previous_end = date('Y-m-d', strtotime('-30 days'));
        
        // Current period (last 30 days)
        $current_orders = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(DISTINCT order_id) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND created_at >= %s",
            $user_id, $current_start
        ));
        
        $current_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(order_amount) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND status = 'approved' AND created_at >= %s",
            $user_id, $current_start
        ));
        
        $current_commissions = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(commission_amount) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND status = 'approved' AND created_at >= %s",
            $user_id, $current_start
        ));
        
        $current_clinics = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network 
             WHERE referrer_id = %d AND created_at >= %s",
            $user_id, $current_start
        ));
        
        // Previous period (30-60 days ago)
        $prev_orders = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(DISTINCT order_id) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND created_at >= %s AND created_at < %s",
            $user_id, $previous_start, $previous_end
        ));
        
        $prev_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(order_amount) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND status = 'approved' AND created_at >= %s AND created_at < %s",
            $user_id, $previous_start, $previous_end
        ));
        
        $prev_commissions = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(commission_amount) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND status = 'approved' AND created_at >= %s AND created_at < %s",
            $user_id, $previous_start, $previous_end
        ));
        
        $prev_clinics = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network 
             WHERE referrer_id = %d AND created_at >= %s AND created_at < %s",
            $user_id, $previous_start, $previous_end
        ));
        
        return array(
            'totalOrders' => intval($total_orders),
            'totalSales' => floatval($total_sales ? $total_sales : 0),
            'commissionsEarned' => floatval($commissions_earned ? $commissions_earned : 0),
            'clinicsOnboarded' => intval($clinics_onboarded),
            'changes' => array(
                'orders' => $this->calculate_percent_change($prev_orders, $current_orders),
                'sales' => $this->calculate_percent_change($prev_sales, $current_sales),
                'commissions' => $this->calculate_percent_change($prev_commissions, $current_commissions),
                'clinics' => $this->calculate_percent_change($prev_clinics, $current_clinics)
            )
        );
    }
    
    /**
     * Calculate percent change between two values
     */
    private function calculate_percent_change($previous, $current) {
        $prev = floatval($previous ? $previous : 0);
        $curr = floatval($current ? $current : 0);
        
        if ($prev == 0) {
            return $curr > 0 ? '+100%' : '0%';
        }
        
        $change = (($curr - $prev) / $prev) * 100;
        $formatted = number_format(abs($change), 0);
        
        if ($change > 0) {
            return '+' . $formatted . '%';
        } elseif ($change < 0) {
            return '-' . $formatted . '%';
        } else {
            return '0%';
        }
    }
    
    /**
     * Get user rank
     */
    private function get_user_rank($user_id) {
        $total_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(order_amount) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d AND status = 'approved'",
            $user_id
        ));
        
        // Calculate rank based on sales
        $rank = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) + 1 FROM (
                SELECT user_id, SUM(order_amount) as total
                FROM {$this->wpdb->prefix}clearmeds_commissions
                WHERE status = 'approved'
                GROUP BY user_id
                HAVING total > %f
            ) as ranked",
            floatval($total_sales ? $total_sales : 0)
        ));
        
        $tiers = array(
            array('name' => 'Bronze', 'min' => 0, 'max' => 25000),
            array('name' => 'Silver', 'min' => 25001, 'max' => 50000),
            array('name' => 'Gold', 'min' => 50001, 'max' => 100000),
            array('name' => 'Platinum', 'min' => 100001, 'max' => PHP_INT_MAX)
        );
        
        $current_amount = floatval($total_sales ? $total_sales : 0);
        $current_tier = null;
        $next_tier = null;
        
        foreach ($tiers as $tier) {
            if ($current_amount >= $tier['min'] && $current_amount <= $tier['max']) {
                $current_tier = $tier;
                $next_tier_index = array_search($tier, $tiers) + 1;
                if (isset($tiers[$next_tier_index])) {
                    $next_tier = $tiers[$next_tier_index];
                }
                break;
            }
        }
        
        $next_rank_amount = $next_tier ? $next_tier['min'] : $current_tier['max'];
        $percentage = $next_tier ? (($current_amount - $current_tier['min']) / ($next_tier['min'] - $current_tier['min'])) * 100 : 100;
        
        return array(
            'currentRank' => intval($rank),
            'currentAmount' => $current_amount,
            'nextRankAmount' => $next_rank_amount,
            'percentage' => min(100, max(0, $percentage)),
            'nextRank' => $next_tier ? $next_tier['name'] : 'Max'
        );
    }
    
    /**
     * Get leaderboard widget data
     */
    private function get_leaderboard_widget_data() {
        $top10 = $this->wpdb->get_results("
            SELECT 
                u.ID as user_id,
                u.display_name as name,
                u.user_email as email,
                COALESCE(SUM(c.order_amount), 0) as sales
            FROM {$this->wpdb->prefix}users u
            INNER JOIN {$this->wpdb->prefix}clearmeds_affiliates a ON u.ID = a.user_id
            LEFT JOIN {$this->wpdb->prefix}clearmeds_commissions c ON u.ID = c.user_id AND c.status = 'approved'
            WHERE a.status = 'active'
            GROUP BY u.ID
            ORDER BY sales DESC
            LIMIT 10
        ");
        
        $user_id = get_current_user_id();
        $user_rank = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) + 1 FROM (
                SELECT user_id, SUM(order_amount) as total
                FROM {$this->wpdb->prefix}clearmeds_commissions
                WHERE status = 'approved'
                GROUP BY user_id
                HAVING total > (
                    SELECT COALESCE(SUM(order_amount), 0)
                    FROM {$this->wpdb->prefix}clearmeds_commissions
                    WHERE user_id = %d AND status = 'approved'
                )
            ) as ranked",
            $user_id
        ));
        
        return array(
            'top10' => array_map(function($item) {
                return array(
                    'rank' => 0, // Will be set on frontend
                    'name' => $item->name,
                    'email' => $item->email,
                    'sales' => '$' . number_format(floatval($item->sales), 2)
                );
            }, $top10),
            'userRank' => intval($user_rank)
        );
    }
    
    /**
     * Get recent transactions
     */
    private function get_recent_transactions($user_id, $limit = 10) {
        $results = $this->wpdb->get_results($this->wpdb->prepare(
            "SELECT 
                c.id,
                c.order_id,
                c.order_amount as amount,
                c.commission_amount as commission,
                c.status,
                c.created_at as date,
                p.post_title as customer
            FROM {$this->wpdb->prefix}clearmeds_commissions c
            LEFT JOIN {$this->wpdb->prefix}posts p ON c.order_id = p.ID
            WHERE c.user_id = %d
            ORDER BY c.created_at DESC
            LIMIT %d",
            $user_id,
            $limit
        ));
        
        return array_map(function($item) {
            return array(
                'date' => date('Y-m-d', strtotime($item->date)),
                'customer' => $item->customer ?: 'Unknown',
                'orderNumber' => 'ORD-' . date('Y') . '-' . str_pad($item->order_id, 4, '0', STR_PAD_LEFT),
                'amount' => '$' . number_format(floatval($item->amount), 2),
                'commission' => '$' . number_format(floatval($item->commission), 2),
                'status' => $item->status
            );
        }, $results);
    }
    
    // Continue with remaining endpoint methods...
    // Due to length, I'll create a separate file for the remaining methods
    
    /**
     * Get network full data
     */
    public function get_network_full($request) {
        $user_id = get_current_user_id();
        
        // Check for errors
        $errors = array();
        
        $stats = $this->referral->get_network_stats($user_id);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'network_stats', 'error' => $this->wpdb->last_error);
        }
        
        $network_tree = $this->referral->get_network_tree($user_id);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'network_tree', 'error' => $this->wpdb->last_error);
        }
        
        $direct_referrals = $this->referral->get_direct_referrals($user_id);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'direct_referrals', 'error' => $this->wpdb->last_error);
        }
        
        $breakdown = $this->referral->get_commission_breakdown($user_id);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'commission_breakdown', 'error' => $this->wpdb->last_error);
        }
        
        $response = array(
            'stats' => $stats,
            'networkTree' => $network_tree,
            'directReferrals' => $direct_referrals,
            'breakdown' => $breakdown
        );
        
        // Include errors if any
        if (!empty($errors)) {
            $response['errors'] = $errors;
            $response['hasErrors'] = true;
        }
        
        return new WP_REST_Response($response, 200);
    }
    
    /**
     * Get transactions (combined stats + list)
     */
    public function get_transactions($request) {
        $user_id = get_current_user_id();
        $params = $request->get_query_params();
        
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $limit = isset($params['limit']) ? intval($params['limit']) : 10;
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';
        $offset = ($page - 1) * $limit;
        
        // Get stats
        $total_transactions = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d",
            $user_id
        ));
        
        $total_amount = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(order_amount) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d AND status = 'approved'",
            $user_id
        ));
        
        $total_commission = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(commission_amount) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d AND status = 'approved'",
            $user_id
        ));
        
        // Get transactions
        $where = $this->wpdb->prepare("c.user_id = %d", $user_id);
        
        if (!empty($search)) {
            $search_like = '%' . $this->wpdb->esc_like($search) . '%';
            $where .= $this->wpdb->prepare(" AND (p.post_title LIKE %s OR c.order_id LIKE %s)", $search_like, $search_like);
        }
        
        $transactions = $this->wpdb->get_results($this->wpdb->prepare(
            "SELECT 
                c.id,
                c.order_id,
                c.order_amount as amount,
                c.commission_amount as commission,
                c.status,
                c.created_at as date,
                p.post_title as customer
            FROM {$this->wpdb->prefix}clearmeds_commissions c
            LEFT JOIN {$this->wpdb->prefix}posts p ON c.order_id = p.ID
            WHERE $where
            ORDER BY c.created_at DESC
            LIMIT %d OFFSET %d",
            $limit,
            $offset
        ));
        
        return new WP_REST_Response(array(
            'stats' => array(
                'totalTransactions' => intval($total_transactions),
                'totalAmount' => floatval($total_amount ? $total_amount : 0),
                'totalCommission' => floatval($total_commission ? $total_commission : 0)
            ),
            'transactions' => array_map(function($item) {
                return array(
                    'date' => date('Y-m-d', strtotime($item->date)),
                    'customer' => $item->customer ?: 'Unknown',
                    'orderNumber' => 'ORD-' . date('Y') . '-' . str_pad($item->order_id, 4, '0', STR_PAD_LEFT),
                    'amount' => floatval($item->amount),
                    'commission' => floatval($item->commission),
                    'status' => $item->status
                );
            }, $transactions),
            'pagination' => array(
                'page' => $page,
                'limit' => $limit,
                'total' => intval($total_transactions),
                'totalPages' => ceil(intval($total_transactions) / $limit)
            )
        ), 200);
    }
    
    /**
     * Get payments (combined)
     */
    public function get_payments($request) {
        $user_id = get_current_user_id();
        
        // Get stats
        $total_paid = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(amount) FROM {$this->wpdb->prefix}clearmeds_payouts WHERE user_id = %d AND status = 'completed'",
            $user_id
        ));
        
        $pending = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(amount) FROM {$this->wpdb->prefix}clearmeds_payouts WHERE user_id = %d AND status = 'pending'",
            $user_id
        ));
        
        $next_payout = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(commission_amount) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d AND status = 'approved'",
            $user_id
        ));
        
        // Get payment methods (stored in user meta for simplicity)
        $methods = get_user_meta($user_id, 'clearmeds_payment_methods', true) ?: array();
        
        // Get payment history
        $history = $this->wpdb->get_results($this->wpdb->prepare(
            "SELECT * FROM {$this->wpdb->prefix}clearmeds_payouts WHERE user_id = %d ORDER BY created_at DESC LIMIT 20",
            $user_id
        ));
        
        return new WP_REST_Response(array(
            'stats' => array(
                'totalPaid' => floatval($total_paid ? $total_paid : 0),
                'pending' => floatval($pending ? $pending : 0),
                'nextPayout' => floatval($next_payout ? $next_payout : 0),
                'payoutDate' => date('F j, Y', strtotime('+2 weeks monday'))
            ),
            'methods' => $methods,
            'history' => array_map(function($item) {
                return array(
                    'date' => date('Y-m-d', strtotime($item->created_at)),
                    'reference' => $item->reference ?: 'PAY-' . date('Y') . '-' . str_pad($item->id, 3, '0', STR_PAD_LEFT),
                    'method' => $item->payment_method,
                    'amount' => floatval($item->amount),
                    'status' => $item->status
                );
            }, $history)
        ), 200);
    }
    
    /**
     * Get leaderboard (combined)
     */
    public function get_leaderboard($request) {
        $params = $request->get_query_params();
        $period = isset($params['period']) ? sanitize_text_field($params['period']) : 'all-time';
        
        $user_id = get_current_user_id();
        $user_rank = $this->get_user_rank($user_id);
        
        // Get tiers
        $tiers = array(
            array('name' => 'Bronze', 'range' => '$0 - $25,000', 'commission' => '10% commission', 'color' => 'bg-gradient-to-b from-[#CD7F32] to-[#B87333]'),
            array('name' => 'Silver', 'range' => '$25,001 - $50,000', 'commission' => '12% commission', 'color' => 'bg-gradient-to-b from-[#C0C0C0] to-[#A8A8A8]'),
            array('name' => 'Gold', 'range' => '$50,001 - $100,000', 'commission' => '15% commission', 'color' => 'bg-gradient-to-b from-[#FFD700] to-[#FFC700]'),
            array('name' => 'Platinum', 'range' => '$100,001+', 'commission' => '18% commission', 'color' => 'bg-gradient-to-b from-[#A8C4A8] to-[#8FB08F]')
        );
        
        // Get leaderboard list
        $date_filter = '';
        if ($period === 'this-month') {
            $date_filter = " AND c.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')";
        } elseif ($period === 'last-month') {
            $date_filter = " AND c.created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') 
                            AND c.created_at < DATE_FORMAT(NOW(), '%Y-%m-01')";
        }
        
        $leaderboard = $this->wpdb->get_results("
            SELECT 
                u.ID as user_id,
                u.display_name as name,
                u.user_email as email,
                COALESCE(SUM(c.order_amount), 0) as sales,
                COUNT(DISTINCT c.order_id) as orders
            FROM {$this->wpdb->prefix}users u
            INNER JOIN {$this->wpdb->prefix}clearmeds_affiliates a ON u.ID = a.user_id
            LEFT JOIN {$this->wpdb->prefix}clearmeds_commissions c ON u.ID = c.user_id AND c.status = 'approved' $date_filter
            WHERE a.status = 'active'
            GROUP BY u.ID
            ORDER BY sales DESC
            LIMIT 100
        ");
        
        return new WP_REST_Response(array(
            'userRank' => $user_rank,
            'tiers' => $tiers,
            'leaderboard' => array_map(function($item, $index) {
                return array(
                    'rank' => $index + 1,
                    'name' => $item->name,
                    'email' => $item->email,
                    'level' => 'Level ' . min(3, ceil($item->orders / 10) + 1),
                    'badge' => $index < 4 ? array('platinum', 'gold', 'silver', 'bronze')[$index] : null,
                    'sales' => floatval($item->sales)
                );
            }, $leaderboard, array_keys($leaderboard))
        ), 200);
    }
    
    /**
     * Get leaderboard widget
     */
    public function get_leaderboard_widget($request) {
        $user_id = get_current_user_id();
        $this->debug_log('Get leaderboard widget', array('user_id' => $user_id));
        
        $widget_data = $this->get_leaderboard_widget_data();
        
        return new WP_REST_Response($widget_data, 200);
    }
    
    /**
     * Get guides (combined)
     */
    public function get_guides($request) {
        $user_id = get_current_user_id();
        
        // Get checklist
        $checklist_items = array(
            array('id' => 1, 'text' => 'Complete your profile', 'key' => 'complete_profile'),
            array('id' => 2, 'text' => 'Add payment method', 'key' => 'add_payment'),
            array('id' => 3, 'text' => 'Generate your affiliate link', 'key' => 'generate_link'),
            array('id' => 4, 'text' => 'Share your first referral', 'key' => 'share_referral'),
            array('id' => 5, 'text' => 'Make your first sale', 'key' => 'first_sale')
        );
        
        $checklist = array();
        foreach ($checklist_items as $item) {
            $completed = $this->wpdb->get_var($this->wpdb->prepare(
                "SELECT completed FROM {$this->wpdb->prefix}clearmeds_checklist_items WHERE user_id = %d AND item_key = %s",
                $user_id,
                $item['key']
            ));
            
            $checklist[] = array(
                'id' => $item['id'],
                'text' => $item['text'],
                'completed' => (bool)$completed
            );
        }
        
        // Get tutorials
        $tutorials = array(
            array('id' => 1, 'title' => 'Getting Started: Your First Week as an Affiliate', 'description' => 'Welcome to Our Premium Wellness Program', 'category' => 'Sales'),
            array('id' => 2, 'title' => 'How to Use Marketing Tools Effectively', 'description' => 'Welcome to Our Premium Wellness Program', 'category' => 'Sales'),
            array('id' => 3, 'title' => 'Complete Affiliate Guide 2025', 'description' => 'Welcome to Our Premium Wellness Program', 'category' => 'Sales')
        );
        
        // Get FAQs
        $faqs = array(
            array('id' => 1, 'question' => 'How do I receive my commission payments?', 'answer' => 'Commission payments are processed on the 15th of each month for the previous month\'s sales. You can receive payments via bank transfer, PayPal, or other methods you\'ve set up in the Payments section.'),
            array('id' => 2, 'question' => 'How do I receive my commission payments?', 'answer' => 'Commission payments are processed on the 15th of each month for the previous month\'s sales.'),
            array('id' => 3, 'question' => 'How do I receive my commission payments?', 'answer' => 'Commission payments are processed on the 15th of each month.')
        );
        
        return new WP_REST_Response(array(
            'checklist' => $checklist,
            'tutorials' => $tutorials,
            'faqs' => $faqs
        ), 200);
    }
    
    // Stub methods for remaining endpoints - will implement fully
    public function get_referral_stats($request) {
        $user_id = get_current_user_id();
        return new WP_REST_Response($this->referral->get_network_stats($user_id), 200);
    }
    
    public function get_referral_network($request) {
        $user_id = get_current_user_id();
        return new WP_REST_Response($this->referral->get_network_tree($user_id), 200);
    }
    
    public function get_direct_referrals($request) {
        $user_id = get_current_user_id();
        $params = $request->get_query_params();
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';
        return new WP_REST_Response($this->referral->get_direct_referrals($user_id, $search), 200);
    }
    
    public function get_commission_breakdown($request) {
        $user_id = get_current_user_id();
        return new WP_REST_Response($this->referral->get_commission_breakdown($user_id), 200);
    }
    
    /**
     * Get pending commissions for user and their network
     * Returns only commissions that the logged-in user earns (from their own orders and their network's orders)
     */
    public function get_user_pending_commissions($request) {
        $user_id = get_current_user_id();
        $params = $request->get_query_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $limit = isset($params['limit']) ? intval($params['limit']) : 20;
        $offset = ($page - 1) * $limit;
        
        // Get pending commissions where the logged-in user is the one earning the commission
        // This includes:
        // 1. Commissions from the user's own orders (level 1)
        // 2. Commissions from their network's orders (level 1, 2, or 3 depending on the referral chain)
        // All of these have user_id = logged_in_user_id because that's who earns the commission
        $query = "SELECT * FROM {$this->wpdb->prefix}clearmeds_commissions 
                  WHERE user_id = %d AND status = 'pending' 
                  ORDER BY created_at DESC 
                  LIMIT %d OFFSET %d";
        
        $commissions = $this->wpdb->get_results(
            $this->wpdb->prepare($query, $user_id, $limit, $offset)
        );
        
        // Get total count
        $total_count = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND status = 'pending'",
            $user_id
        ));
        
        // Format the response
        $formatted_commissions = array();
        foreach ($commissions as $commission) {
            // Determine if this is from user's own order or network order
            // Check if the order was placed by the logged-in user
            $is_own_order = false;
            $source = 'network';
            
            // Try to get order customer to determine if it's user's own order
            if (class_exists('WooCommerce')) {
                $order = wc_get_order($commission->order_id);
                if ($order) {
                    $order_customer_id = $order->get_customer_id();
                    $is_own_order = ($order_customer_id == $user_id);
                    $source = $is_own_order ? 'own_order' : 'network';
                } else {
                    // If order doesn't exist, assume it's from network if level > 1
                    // Level 1 could be from own order or direct referral
                    $source = ($commission->level == 1) ? 'network' : 'network';
                }
            } else {
                // WooCommerce not available, use level as indicator
                // Level 1 might be own order, level 2+ is definitely network
                $source = ($commission->level == 1) ? 'network' : 'network';
            }
            
            $formatted_commissions[] = array(
                'id' => intval($commission->id),
                'user_id' => intval($commission->user_id),
                'order_id' => $commission->order_id,
                'order_amount' => floatval($commission->order_amount),
                'commission_rate' => floatval($commission->commission_rate),
                'commission_amount' => floatval($commission->commission_amount),
                'level' => intval($commission->level),
                'status' => $commission->status,
                'created_at' => $commission->created_at,
                'is_own' => $is_own_order,
                'source' => $source
            );
        }
        
        return new WP_REST_Response(array(
            'commissions' => $formatted_commissions,
            'pagination' => array(
                'page' => $page,
                'limit' => $limit,
                'total' => intval($total_count),
                'total_pages' => ceil(intval($total_count) / $limit)
            )
        ), 200);
    }
    
    public function get_payment_details($request) {
        $user_id = get_current_user_id();
        $affiliate = $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT payment_details FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
        
        $details = $affiliate && $affiliate->payment_details ? 
            json_decode(ClearMeds_Utils::decrypt($affiliate->payment_details), true) : array();
        
        return new WP_REST_Response($details, 200);
    }
    
    public function update_payment_details($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        $encrypted = ClearMeds_Utils::encrypt(json_encode($data));
        
        $this->wpdb->update(
            $this->wpdb->prefix . 'clearmeds_affiliates',
            array('payment_details' => $encrypted),
            array('user_id' => $user_id),
            array('%s'),
            array('%d')
        );
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function get_tax_info($request) {
        $user_id = get_current_user_id();
        $affiliate = $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT tax_id_type, tax_id FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
        
        return new WP_REST_Response(array(
            'taxId' => $affiliate && $affiliate->tax_id ? ClearMeds_Utils::decrypt($affiliate->tax_id) : '',
            'taxIdType' => $affiliate ? $affiliate->tax_id_type : '',
            'businessName' => get_user_meta($user_id, 'business_name', true) ?: '',
            'taxAddress' => get_user_meta($user_id, 'tax_address', true) ?: ''
        ), 200);
    }
    
    public function update_tax_info($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $update_data = array();
        if (isset($data['taxId'])) {
            $update_data['tax_id'] = ClearMeds_Utils::encrypt($data['taxId']);
        }
        if (isset($data['taxIdType'])) {
            $update_data['tax_id_type'] = ClearMeds_Utils::sanitize($data['taxIdType']);
        }
        
        if (!empty($update_data)) {
            $this->wpdb->update(
                $this->wpdb->prefix . 'clearmeds_affiliates',
                $update_data,
                array('user_id' => $user_id)
            );
        }
        
        if (isset($data['businessName'])) {
            update_user_meta($user_id, 'business_name', ClearMeds_Utils::sanitize($data['businessName']));
        }
        if (isset($data['taxAddress'])) {
            update_user_meta($user_id, 'tax_address', ClearMeds_Utils::sanitize($data['taxAddress']));
        }
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function update_password($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $user = get_userdata($user_id);
        if (!wp_check_password($data['currentPassword'], $user->user_pass)) {
            return new WP_Error('invalid_password', 'Current password is incorrect', array('status' => 400));
        }
        
        wp_set_password($data['newPassword'], $user_id);
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function get_payment_methods($request) {
        $user_id = get_current_user_id();
        $methods = get_user_meta($user_id, 'clearmeds_payment_methods', true) ?: array();
        return new WP_REST_Response($methods, 200);
    }
    
    public function add_payment_method($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        
        $methods = get_user_meta($user_id, 'clearmeds_payment_methods', true) ?: array();
        $methods[] = $data;
        update_user_meta($user_id, 'clearmeds_payment_methods', $methods);
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function update_payment_method($request) {
        $user_id = get_current_user_id();
        $method_id = intval($request['id']);
        $data = $request->get_json_params();
        
        $methods = get_user_meta($user_id, 'clearmeds_payment_methods', true) ?: array();
        if (isset($methods[$method_id])) {
            $methods[$method_id] = array_merge($methods[$method_id], $data);
            update_user_meta($user_id, 'clearmeds_payment_methods', $methods);
        }
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function delete_payment_method($request) {
        $user_id = get_current_user_id();
        $method_id = intval($request['id']);
        
        $methods = get_user_meta($user_id, 'clearmeds_payment_methods', true) ?: array();
        if (isset($methods[$method_id])) {
            // If deleting primary method, clear primary flag
            if (isset($methods[$method_id]['isPrimary']) && $methods[$method_id]['isPrimary']) {
                update_user_meta($user_id, 'clearmeds_primary_payment_method', null);
            }
            unset($methods[$method_id]);
            // Re-index array to maintain sequential keys
            $methods = array_values($methods);
            update_user_meta($user_id, 'clearmeds_payment_methods', $methods);
        }
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function set_primary_payment_method($request) {
        $user_id = get_current_user_id();
        $method_id = intval($request['id']);
        
        $methods = get_user_meta($user_id, 'clearmeds_payment_methods', true) ?: array();
        if (isset($methods[$method_id])) {
            // Remove primary flag from all methods
            foreach ($methods as $key => $method) {
                unset($methods[$key]['isPrimary']);
            }
            // Set the selected method as primary
            $methods[$method_id]['isPrimary'] = true;
            update_user_meta($user_id, 'clearmeds_payment_methods', $methods);
            update_user_meta($user_id, 'clearmeds_primary_payment_method', $method_id);
        }
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function update_checklist_item($request) {
        $user_id = get_current_user_id();
        $item_key = $request['item_key'];
        $data = $request->get_json_params();
        
        $this->wpdb->replace(
            $this->wpdb->prefix . 'clearmeds_checklist_items',
            array(
                'user_id' => $user_id,
                'item_key' => $item_key,
                'completed' => $data['completed'] ? 1 : 0,
                'completed_at' => $data['completed'] ? current_time('mysql') : null
            ),
            array('%d', '%s', '%d', '%s')
        );
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function get_marketing_links($request) {
        $user_id = get_current_user_id();
        $data = $this->get_referral_link_data($user_id);
        return new WP_REST_Response(array('defaultLink' => $data['link']), 200);
    }
    
    public function generate_marketing_link($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        $affiliate = $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT affiliate_id FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
        
        $site_url = get_site_url();
        $link = $site_url . '/?ref=' . $affiliate->affiliate_id;
        
        $params = array();
        if (!empty($data['productId'])) $params['product'] = $data['productId'];
        if (!empty($data['utmSource'])) $params['utm_source'] = $data['utmSource'];
        if (!empty($data['utmMedium'])) $params['utm_medium'] = $data['utmMedium'];
        if (!empty($data['utmCampaign'])) $params['utm_campaign'] = $data['utmCampaign'];
        
        if (!empty($params)) {
            $link .= '&' . http_build_query($params);
        }
        
        return new WP_REST_Response(array('link' => $link), 200);
    }
    
    public function get_marketing_stats($request) {
        $user_id = get_current_user_id();
        
        $total_clicks = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_link_clicks WHERE user_id = %d",
            $user_id
        ));
        
        $conversions = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_link_clicks WHERE user_id = %d AND converted = 1",
            $user_id
        ));
        
        $conversion_rate = $total_clicks > 0 ? ($conversions / $total_clicks) * 100 : 0;
        
        return new WP_REST_Response(array(
            'totalClicks' => intval($total_clicks),
            'conversionRate' => round($conversion_rate, 1)
        ), 200);
    }
    
    public function get_marketing_media($request) {
        // Return mock data - can be extended to use WordPress media library
        return new WP_REST_Response(array(
            array('id' => 1, 'title' => 'Product Banner 1920x1080', 'category' => 'Banners', 'type' => 'image'),
            array('id' => 2, 'title' => 'Product Demo Video', 'category' => 'Videos', 'type' => 'video'),
            array('id' => 3, 'title' => 'Product Brochure PDF', 'category' => 'Documents', 'type' => 'document')
        ), 200);
    }
    
    public function get_marketing_resources($request) {
        // Return mock data
        return new WP_REST_Response(array(
            array('category' => 'Email Templates', 'items' => array(
                array('id' => 1, 'title' => 'Welcome Email', 'description' => 'Welcome to Our Premium Wellness Program')
            )),
            array('category' => 'Sales Script', 'items' => array(
                array('id' => 2, 'title' => 'Sales Script', 'description' => 'Welcome to Our Premium Wellness Program')
            ))
        ), 200);
    }
    
    public function get_marketing_integrations($request) {
        $user_id = get_current_user_id();
        $integrations = get_user_meta($user_id, 'clearmeds_marketing_integrations', true) ?: array(
            array('id' => 'google-ads', 'name' => 'Google Ads', 'enabled' => true),
            array('id' => 'facebook-ads', 'name' => 'Facebook Ads', 'enabled' => true)
        );
        return new WP_REST_Response($integrations, 200);
    }
    
    public function update_marketing_integration($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        $integration_id = isset($data['id']) ? $data['id'] : '';
        
        $integrations = get_user_meta($user_id, 'clearmeds_marketing_integrations', true) ?: array();
        foreach ($integrations as &$integration) {
            if ($integration['id'] === $integration_id) {
                $integration['enabled'] = isset($data['enabled']) ? $data['enabled'] : false;
                break;
            }
        }
        update_user_meta($user_id, 'clearmeds_marketing_integrations', $integrations);
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function get_notification_settings($request) {
        $user_id = get_current_user_id();
        $settings = get_user_meta($user_id, 'clearmeds_notification_settings', true) ?: array(
            'emailNotifications' => true,
            'referralAlerts' => true,
            'paymentNotifications' => true,
            'marketingUpdates' => true,
            'monthlyReports' => true
        );
        return new WP_REST_Response($settings, 200);
    }
    
    public function update_notification_settings($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        update_user_meta($user_id, 'clearmeds_notification_settings', $data);
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function get_integration_settings($request) {
        $user_id = get_current_user_id();
        $settings = get_user_meta($user_id, 'clearmeds_integration_settings', true) ?: array(
            array('name' => 'Mailchimp', 'connected' => true),
            array('name' => 'Google Analytics', 'connected' => false),
            array('name' => 'Zapier', 'connected' => true),
            array('name' => 'Slack', 'connected' => false)
        );
        return new WP_REST_Response($settings, 200);
    }
    
    public function update_integration_settings($request) {
        $user_id = get_current_user_id();
        $data = $request->get_json_params();
        update_user_meta($user_id, 'clearmeds_integration_settings', $data);
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function export_transactions($request) {
        // CSV export implementation
        return new WP_Error('not_implemented', 'Export not yet implemented', array('status' => 501));
    }
    
    // Admin endpoints
    public function get_admin_dashboard($request) {
        $errors = array();
        
        // Get stats with error checking
        $total_affiliates_query = "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_affiliates";
        $total_affiliates = $this->wpdb->get_var($total_affiliates_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'totalAffiliates', 'error' => $this->wpdb->last_error, 'query_string' => $total_affiliates_query);
        }
        
        $active_affiliates_query = "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE status = 'active'";
        $active_affiliates = $this->wpdb->get_var($active_affiliates_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'activeAffiliates', 'error' => $this->wpdb->last_error, 'query_string' => $active_affiliates_query);
        }
        
        $pending_users_query = "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE status = 'pending'";
        $pending_users = $this->wpdb->get_var($pending_users_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'pendingUsers', 'error' => $this->wpdb->last_error, 'query_string' => $pending_users_query);
        }
        
        $total_sales_query = "SELECT COALESCE(SUM(order_amount), 0) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE status = 'approved'";
        $total_sales = $this->wpdb->get_var($total_sales_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'totalSales', 'error' => $this->wpdb->last_error, 'query_string' => $total_sales_query);
        }
        
        $total_commissions_query = "SELECT COALESCE(SUM(commission_amount), 0) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE status = 'approved'";
        $total_commissions = $this->wpdb->get_var($total_commissions_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'totalCommissions', 'error' => $this->wpdb->last_error, 'query_string' => $total_commissions_query);
        }
        
        $total_payouts_query = "SELECT COALESCE(SUM(amount), 0) FROM {$this->wpdb->prefix}clearmeds_payouts WHERE status = 'completed'";
        $total_payouts = $this->wpdb->get_var($total_payouts_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'totalPayouts', 'error' => $this->wpdb->last_error, 'query_string' => $total_payouts_query);
        }
        
        $active_referrals_query = "SELECT COUNT(DISTINCT user_id) FROM {$this->wpdb->prefix}clearmeds_referral_network";
        $active_referrals = $this->wpdb->get_var($active_referrals_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'activeReferrals', 'error' => $this->wpdb->last_error, 'query_string' => $active_referrals_query);
        }
        
        $pending_commissions_count_query = "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE status = 'pending'";
        $pending_commissions_count = $this->wpdb->get_var($pending_commissions_count_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'pendingCommissions', 'error' => $this->wpdb->last_error, 'query_string' => $pending_commissions_count_query);
        }
        
        $stats = array(
            'totalAffiliates' => intval($total_affiliates ? $total_affiliates : 0),
            'activeAffiliates' => intval($active_affiliates ? $active_affiliates : 0),
            'pendingUsers' => intval($pending_users ? $pending_users : 0),
            'totalSales' => floatval($total_sales ? $total_sales : 0),
            'totalCommissions' => floatval($total_commissions ? $total_commissions : 0),
            'totalPayouts' => floatval($total_payouts ? $total_payouts : 0),
            'activeReferrals' => intval($active_referrals ? $active_referrals : 0),
            'pendingCommissions' => intval($pending_commissions_count ? $pending_commissions_count : 0)
        );
        
        $pending_commissions_query = "SELECT * FROM {$this->wpdb->prefix}clearmeds_commissions WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10";
        $pending_commissions_raw = $this->wpdb->get_results($pending_commissions_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'pendingCommissionsList', 'error' => $this->wpdb->last_error, 'query_string' => $pending_commissions_query);
        }
        
        $pending_commissions = array();
        if ($pending_commissions_raw) {
            foreach ($pending_commissions_raw as $commission) {
                $pending_commissions[] = array(
                    'id' => intval($commission->id),
                    'user_id' => intval($commission->user_id),
                    'order_id' => $commission->order_id,
                    'order_amount' => floatval($commission->order_amount),
                    'commission_amount' => floatval($commission->commission_amount),
                    'level' => intval($commission->level),
                    'status' => $commission->status,
                    'created_at' => $commission->created_at,
                );
            }
        }
        
        $processing_payouts_query = "SELECT * FROM {$this->wpdb->prefix}clearmeds_payouts WHERE status = 'processing' ORDER BY created_at DESC LIMIT 10";
        $processing_payouts_raw = $this->wpdb->get_results($processing_payouts_query);
        if ($this->wpdb->last_error) {
            $errors[] = array('query' => 'processingPayouts', 'error' => $this->wpdb->last_error, 'query_string' => $processing_payouts_query);
        }
        
        $processing_payouts = array();
        if ($processing_payouts_raw) {
            foreach ($processing_payouts_raw as $payout) {
                $processing_payouts[] = array(
                    'id' => intval($payout->id),
                    'user_id' => intval($payout->user_id),
                    'amount' => floatval($payout->amount),
                    'status' => $payout->status,
                    'reference' => $payout->reference ?? null,
                    'created_at' => $payout->created_at,
                );
            }
        }
        
        $this->debug_log('Admin dashboard fetched', array('stats' => $stats, 'errors' => $errors));
        
        $response = array(
            'stats' => $stats,
            'pendingCommissions' => $pending_commissions,
            'processingPayouts' => $processing_payouts
        );
        
        // Include errors in response if any occurred
        if (!empty($errors)) {
            $response['errors'] = $errors;
            $response['hasErrors'] = true;
        }
        
        return new WP_REST_Response($response, 200);
    }
    
    public function get_admin_config($request) {
        return new WP_REST_Response(array(
            'commissionRates' => get_option('clearmeds_commission_rates'),
            'payoutSettings' => get_option('clearmeds_payout_settings')
        ), 200);
    }
    
    public function update_admin_config($request) {
        $data = $request->get_json_params();
        
        if (isset($data['commissionRates'])) {
            update_option('clearmeds_commission_rates', $data['commissionRates']);
        }
        
        if (isset($data['payoutSettings'])) {
            update_option('clearmeds_payout_settings', $data['payoutSettings']);
        }
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function get_admin_users($request) {
        $params = $request->get_query_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $limit = isset($params['limit']) ? intval($params['limit']) : 20;
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';
        $status = isset($params['status']) ? sanitize_text_field($params['status']) : '';
        $offset = ($page - 1) * $limit;
        
        // Build WHERE clause with proper placeholders
        $where_conditions = array();
        $where_values = array();
        
        if (!empty($search)) {
            $search_like = '%' . $this->wpdb->esc_like($search) . '%';
            $where_conditions[] = "(u.display_name LIKE %s OR u.user_email LIKE %s)";
            $where_values[] = $search_like;
            $where_values[] = $search_like;
        }
        
        if (!empty($status)) {
            // Check if status column exists before filtering
            $status_column_exists = $this->wpdb->get_results("SHOW COLUMNS FROM {$this->wpdb->prefix}clearmeds_affiliates LIKE 'status'");
            if (!empty($status_column_exists)) {
                // Handle status filter with LEFT JOIN - if status is 'pending', include NULLs
                if ($status === 'pending') {
                    $where_conditions[] = "(a.status = %s OR a.status IS NULL)";
                    $where_values[] = $status;
                } else {
                    $where_conditions[] = "a.status = %s";
                    $where_values[] = $status;
                }
            }
            // If status column doesn't exist, skip status filtering (all users are treated as pending)
        }
        
        $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";
        
        // Build the full query - use LEFT JOIN to show ALL users (all users are affiliates by default)
        // Check if status column exists in affiliates table
        $status_column_exists = $this->wpdb->get_results("SHOW COLUMNS FROM {$this->wpdb->prefix}clearmeds_affiliates LIKE 'status'");
        $status_select = !empty($status_column_exists) ? "COALESCE(a.status, 'pending') as affiliate_status" : "'pending' as affiliate_status";
        
        $query = "SELECT u.*, a.affiliate_id, $status_select
             FROM {$this->wpdb->prefix}users u
                  LEFT JOIN {$this->wpdb->prefix}clearmeds_affiliates a ON u.ID = a.user_id
                  $where_clause
             ORDER BY u.user_registered DESC
                  LIMIT %d OFFSET %d";
        
        // Prepare the query - always include limit and offset
        $prepare_values = array_merge($where_values, array($limit, $offset));
        
        // Execute query and catch errors
        $users = $this->wpdb->get_results(
            $this->wpdb->prepare($query, $prepare_values)
        );
        
        // Check for query errors and return them in response
        if ($this->wpdb->last_error) {
            return new WP_REST_Response(array(
                'error' => true,
                'message' => 'Database query error',
                'details' => array(
                    'query' => $query,
                    'prepare_values' => $prepare_values,
                    'where_clause' => $where_clause,
                    'wpdb_error' => $this->wpdb->last_error,
                    'wpdb_error_query' => $this->wpdb->last_query
                )
            ), 500);
        }
        
        // Format the response
        $formatted_users = array();
        foreach ($users as $user) {
            // Get user meta for first_name and last_name
            $first_name = get_user_meta($user->ID, 'first_name', true) ?: '';
            $last_name = get_user_meta($user->ID, 'last_name', true) ?: '';
            
            $formatted_users[] = array(
                'ID' => intval($user->ID),
                'display_name' => $user->display_name,
                'user_email' => $user->user_email,
                'user_registered' => $user->user_registered,
                'affiliate_id' => $user->affiliate_id ?? null,
                'affiliate_status' => $user->affiliate_status ?? 'pending',
                'first_name' => $first_name,
                'last_name' => $last_name,
            );
        }
        
        $this->debug_log('Admin users fetched', array('count' => count($formatted_users), 'page' => $page));
        
        return new WP_REST_Response($formatted_users, 200);
    }
    
    /**
     * Get detailed user information by ID
     */
    public function get_admin_user_by_id($request) {
        $user_id = intval($request['id']);
        
        // Get user data
        $user = get_userdata($user_id);
        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }
        
        // Get affiliate data
        $affiliate = $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT * FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
        
        // Get user meta
        $first_name = get_user_meta($user_id, 'first_name', true) ?: '';
        $last_name = get_user_meta($user_id, 'last_name', true) ?: '';
        $phone = get_user_meta($user_id, 'phone', true) ?: '';
        $address = get_user_meta($user_id, 'address', true) ?: '';
        $city = get_user_meta($user_id, 'city', true) ?: '';
        $state = get_user_meta($user_id, 'state', true) ?: '';
        $zip_code = get_user_meta($user_id, 'zip_code', true) ?: '';
        $company = get_user_meta($user_id, 'company', true) ?: '';
        $bio = get_user_meta($user_id, 'bio', true) ?: '';
        
        // Get payment details (encrypted, so we'll just show if exists)
        $payment_details = null;
        if ($affiliate && !empty($affiliate->payment_details)) {
            $payment_details = ClearMeds_Utils::decrypt($affiliate->payment_details);
        }
        
        // Get tax info (encrypted)
        $tax_id_type = $affiliate->tax_id_type ?? null;
        $tax_id = null;
        if ($affiliate && !empty($affiliate->tax_id)) {
            $tax_id = ClearMeds_Utils::decrypt($affiliate->tax_id);
        }
        
        // Get referrer info if exists
        $referrer_info = null;
        if ($affiliate && !empty($affiliate->referrer_id)) {
            $referrer_user = get_userdata($affiliate->referrer_id);
            if ($referrer_user) {
                $referrer_info = array(
                    'user_id' => $affiliate->referrer_id,
                    'name' => $referrer_user->display_name,
                    'email' => $referrer_user->user_email
                );
            }
        }
        
        // Get commission stats
        $total_commissions = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COALESCE(SUM(commission_amount), 0) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d AND status = 'approved'",
            $user_id
        ));
        
        $total_orders = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = %d",
            $user_id
        ));
        
        // Get referral count
        $referral_count = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network WHERE referrer_id = %d",
            $user_id
        ));
        
        $user_data = array(
            // Basic info
            'ID' => intval($user->ID),
            'user_email' => $user->user_email,
            'display_name' => $user->display_name,
            'user_registered' => $user->user_registered,
            'first_name' => $first_name,
            'last_name' => $last_name,
            
            // Contact info
            'phone' => $phone,
            'address' => $address,
            'city' => $city,
            'state' => $state,
            'zip_code' => $zip_code,
            'company' => $company,
            'bio' => $bio,
            
            // Affiliate info
            'affiliate_id' => $affiliate->affiliate_id ?? null,
            'affiliate_status' => $affiliate->status ?? 'pending',
            'referrer' => $referrer_info,
            'created_at' => $affiliate->created_at ?? null,
            'updated_at' => $affiliate->updated_at ?? null,
            
            // Payment & Tax info
            'payment_details' => $payment_details,
            'tax_id_type' => $tax_id_type,
            'tax_id' => $tax_id ? '***' . substr($tax_id, -4) : null, // Only show last 4 digits
            
            // Stats
            'total_commissions' => floatval($total_commissions ? $total_commissions : 0),
            'total_orders' => intval($total_orders ? $total_orders : 0),
            'referral_count' => intval($referral_count ? $referral_count : 0)
        );
        
        $this->debug_log('Admin user details fetched', array('user_id' => $user_id));
        
        return new WP_REST_Response($user_data, 200);
    }
    
    /**
     * Approve user
     */
    public function approve_user($request) {
        $user_id = intval($request['id']);
        
        $result = $this->wpdb->update(
            $this->wpdb->prefix . 'clearmeds_affiliates',
            array('status' => 'active'),
            array('user_id' => $user_id),
            array('%s'),
            array('%d')
        );
        
        if ($result === false) {
            return new WP_Error('update_failed', 'Failed to approve user', array('status' => 500));
        }
        
        $this->debug_log('User approved', array('user_id' => $user_id));
        
        return new WP_REST_Response(array('success' => true, 'message' => 'User approved successfully'), 200);
    }
    
    /**
     * Reject user
     */
    public function reject_user($request) {
        $user_id = intval($request['id']);
        $data = $request->get_json_params();
        $reason = isset($data['reason']) ? sanitize_text_field($data['reason']) : '';
        
        $result = $this->wpdb->update(
            $this->wpdb->prefix . 'clearmeds_affiliates',
            array('status' => 'rejected'),
            array('user_id' => $user_id),
            array('%s'),
            array('%d')
        );
        
        if ($result === false) {
            return new WP_Error('update_failed', 'Failed to reject user', array('status' => 500));
        }
        
        $this->debug_log('User rejected', array('user_id' => $user_id, 'reason' => $reason));
        
        return new WP_REST_Response(array('success' => true, 'message' => 'User rejected successfully'), 200);
    }
    
    public function get_admin_commissions($request) {
        $params = $request->get_query_params();
        $status = isset($params['status']) ? sanitize_text_field($params['status']) : '';
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $limit = isset($params['limit']) ? intval($params['limit']) : 20;
        $offset = ($page - 1) * $limit;
        
        // Build WHERE clause with proper placeholders
        $where_conditions = array();
        $where_values = array();
        
        if (!empty($status)) {
            $where_conditions[] = "status = %s";
            $where_values[] = $status;
        }
        
        $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";
        
        // Build the full query
        $query = "SELECT * FROM {$this->wpdb->prefix}clearmeds_commissions 
                  $where_clause 
                  ORDER BY created_at DESC 
                  LIMIT %d OFFSET %d";
        
        // Prepare the query - always include limit and offset
        $prepare_values = array_merge($where_values, array($limit, $offset));
        $commissions = $this->wpdb->get_results(
            $this->wpdb->prepare($query, $prepare_values)
        );
        
        // Check for query errors and return them in response
        if ($this->wpdb->last_error) {
            return new WP_REST_Response(array(
                'error' => true,
                'message' => 'Database query error',
                'details' => array(
                    'query' => $query,
                    'prepare_values' => $prepare_values,
                    'where_clause' => $where_clause,
                    'wpdb_error' => $this->wpdb->last_error,
                    'wpdb_error_query' => $this->wpdb->last_query
                )
            ), 500);
        }
        
        // Format the response
        $formatted_commissions = array();
        foreach ($commissions as $commission) {
            $formatted_commissions[] = array(
                'id' => intval($commission->id),
                'user_id' => intval($commission->user_id),
                'order_id' => $commission->order_id,
                'order_amount' => floatval($commission->order_amount),
                'commission_amount' => floatval($commission->commission_amount),
                'level' => intval($commission->level),
                'status' => $commission->status,
                'created_at' => $commission->created_at,
                'updated_at' => $commission->updated_at ?? null,
            );
        }
        
        $this->debug_log('Admin commissions fetched', array('count' => count($formatted_commissions), 'page' => $page, 'status' => $status));
        
        return new WP_REST_Response($formatted_commissions, 200);
    }
    
    /**
     * Get pending commissions (convenience endpoint)
     */
    public function get_pending_commissions($request) {
        $params = $request->get_query_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $limit = isset($params['limit']) ? intval($params['limit']) : 50;
        $offset = ($page - 1) * $limit;
        
        // Get pending commissions
        $commissions = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->wpdb->prefix}clearmeds_commissions 
                 WHERE status = 'pending' 
                 ORDER BY created_at DESC 
                 LIMIT %d OFFSET %d",
                $limit,
                $offset
            )
        );
        
        // Check for query errors
        if ($this->wpdb->last_error) {
            return new WP_REST_Response(array(
                'error' => true,
                'message' => 'Database query error',
                'details' => array(
                    'wpdb_error' => $this->wpdb->last_error,
                    'wpdb_error_query' => $this->wpdb->last_query
                )
            ), 500);
        }
        
        // Get total count for pagination
        $total_count = $this->wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE status = 'pending'"
        );
        
        // Format the response
        $formatted_commissions = array();
        foreach ($commissions as $commission) {
            // Get user info
            $user = get_userdata($commission->user_id);
            $user_name = $user ? $user->display_name : 'Unknown';
            $user_email = $user ? $user->user_email : '';
            
            $formatted_commissions[] = array(
                'id' => intval($commission->id),
                'user_id' => intval($commission->user_id),
                'user_name' => $user_name,
                'user_email' => $user_email,
                'order_id' => $commission->order_id,
                'order_amount' => floatval($commission->order_amount),
                'commission_rate' => floatval($commission->commission_rate),
                'commission_amount' => floatval($commission->commission_amount),
                'level' => intval($commission->level),
                'status' => $commission->status,
                'created_at' => $commission->created_at,
                'updated_at' => $commission->updated_at ?? null,
            );
        }
        
        return new WP_REST_Response(array(
            'commissions' => $formatted_commissions,
            'pagination' => array(
                'page' => $page,
                'limit' => $limit,
                'total' => intval($total_count),
                'total_pages' => ceil(intval($total_count) / $limit)
            )
        ), 200);
    }
    
    public function approve_commission($request) {
        $commission_id = intval($request['id']);
        $this->wpdb->update(
            $this->wpdb->prefix . 'clearmeds_commissions',
            array('status' => 'approved'),
            array('id' => $commission_id),
            array('%s'),
            array('%d')
        );
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function reject_commission($request) {
        $commission_id = intval($request['id']);
        $data = $request->get_json_params();
        $this->wpdb->update(
            $this->wpdb->prefix . 'clearmeds_commissions',
            array('status' => 'declined'),
            array('id' => $commission_id),
            array('%s'),
            array('%d')
        );
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    public function get_admin_payouts($request) {
        $query = "SELECT * FROM {$this->wpdb->prefix}clearmeds_payouts ORDER BY created_at DESC LIMIT 20";
        $payouts = $this->wpdb->get_results($query);
        
        // Check for query errors and return them in response
        if ($this->wpdb->last_error) {
            return new WP_REST_Response(array(
                'error' => true,
                'message' => 'Database query error',
                'details' => array(
                    'query' => $query,
                    'wpdb_error' => $this->wpdb->last_error,
                    'wpdb_error_query' => $this->wpdb->last_query
                )
            ), 500);
        }
        
        // Format the response
        $formatted_payouts = array();
        foreach ($payouts as $payout) {
            $formatted_payouts[] = array(
                'id' => intval($payout->id),
                'user_id' => intval($payout->user_id),
                'amount' => floatval($payout->amount),
                'status' => $payout->status,
                'reference' => $payout->reference ?? null,
                'payment_method' => $payout->payment_method ?? null,
                'created_at' => $payout->created_at,
                'processed_at' => $payout->processed_at ?? null,
            );
        }
        
        $this->debug_log('Admin payouts fetched', array('count' => count($formatted_payouts)));
        
        return new WP_REST_Response($formatted_payouts, 200);
    }
    
    public function process_payouts($request) {
        // Payout processing logic
        return new WP_Error('not_implemented', 'Payout processing not yet implemented', array('status' => 501));
    }
    
    /**
     * Rebuild all database tables
     */
    public function rebuild_tables($request) {
        $data = $request->get_json_params();
        $confirm = isset($data['confirm']) ? $data['confirm'] : false;
        
        // Require explicit confirmation
        if ($confirm !== true && $confirm !== 'true') {
            return new WP_REST_Response(array(
                'error' => true,
                'message' => 'Confirmation required. Set "confirm": true in request body.',
                'warning' => 'This will DELETE ALL DATA in ClearMeds tables and recreate them!'
            ), 400);
        }
        
        try {
            $database = new ClearMeds_Database();
            $result = $database->rebuild_tables();
            
            if ($result['success']) {
                $this->debug_log('Tables rebuilt successfully', $result);
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => $result['message'],
                    'dropped_tables' => $result['dropped']
                ), 200);
            } else {
                $this->debug_log('Table rebuild failed', $result);
                return new WP_REST_Response(array(
                    'error' => true,
                    'message' => $result['message'],
                    'details' => $result
                ), 500);
            }
        } catch (Exception $e) {
            $this->debug_log('Table rebuild exception', array('error' => $e->getMessage()));
            return new WP_REST_Response(array(
                'error' => true,
                'message' => 'Failed to rebuild tables',
                'exception' => $e->getMessage()
            ), 500);
        }
    }
    
    /**
     * Create referral relationships (for testing)
     */
    public function create_referral_relationships($request) {
        $data = $request->get_json_params();
        $relationships = isset($data['relationships']) ? $data['relationships'] : array();
        
        $results = array(
            'created' => 0,
            'failed' => 0,
            'errors' => array()
        );
        
        foreach ($relationships as $rel) {
            $user_id = intval($rel['user_id']);
            $referrer_id = intval($rel['referrer_id']);
            
            if (!$user_id || !$referrer_id) {
                $results['failed']++;
                $results['errors'][] = 'Invalid user_id or referrer_id';
                continue;
            }
            
            // Check if relationship already exists
            $exists = $this->wpdb->get_var($this->wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network 
                 WHERE user_id = %d AND referrer_id = %d",
                $user_id,
                $referrer_id
            ));
            
            if ($exists) {
                continue; // Skip if already exists
            }
            
            // Create referral relationship
            $referral = new ClearMeds_Referral();
            $result = $referral->create_referral_relationship($user_id, $referrer_id);
            
            if ($result) {
                $results['created']++;
            } else {
                $results['failed']++;
                $results['errors'][] = "Failed to create relationship: user_id=$user_id, referrer_id=$referrer_id";
            }
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'results' => $results
        ), 200);
    }
    
    /**
     * Sync commissions with WooCommerce orders
     * Reprocesses completed orders to create commissions
     */
    public function sync_commissions_with_orders($request) {
        $data = $request->get_json_params();
        $order_ids = isset($data['order_ids']) ? $data['order_ids'] : array();
        $date_from = isset($data['date_from']) ? sanitize_text_field($data['date_from']) : null;
        $date_to = isset($data['date_to']) ? sanitize_text_field($data['date_to']) : null;
        $force_reprocess = isset($data['force_reprocess']) ? (bool)$data['force_reprocess'] : false;
        
        // Check if WooCommerce is active
        if (!class_exists('WooCommerce')) {
            return new WP_REST_Response(array(
                'success' => false,
                'error' => 'WooCommerce is not active'
            ), 400);
        }
        
        $commission = new ClearMeds_Commission();
        $results = array(
            'processed' => 0,
            'skipped' => 0,
            'failed' => 0,
            'errors' => array(),
            'orders' => array()
        );
        
        // If specific order IDs provided, process only those
        if (!empty($order_ids)) {
            foreach ($order_ids as $order_id) {
                $order_id = intval($order_id);
                $result = $this->process_single_order($commission, $order_id, $force_reprocess);
                $this->update_sync_results($results, $order_id, $result);
            }
        } else {
            // Process orders based on date range or all completed orders
            $args = array(
                'status' => 'completed',
                'limit' => -1,
                'return' => 'ids'
            );
            
            if ($date_from || $date_to) {
                $args['date_created'] = '';
                if ($date_from) {
                    $args['date_created'] .= $date_from . '...';
                }
                if ($date_to) {
                    $args['date_created'] .= $date_to;
                } else {
                    $args['date_created'] .= date('Y-m-d');
                }
            }
            
            $order_ids = wc_get_orders($args);
            
            foreach ($order_ids as $order_id) {
                $result = $this->process_single_order($commission, $order_id, $force_reprocess);
                $this->update_sync_results($results, $order_id, $result);
            }
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'results' => $results,
            'summary' => array(
                'total_processed' => $results['processed'],
                'total_skipped' => $results['skipped'],
                'total_failed' => $results['failed']
            )
        ), 200);
    }
    
    /**
     * Process a single order for commission sync
     */
    private function process_single_order($commission, $order_id, $force_reprocess = false) {
        // Check if commissions already exist for this order
        if (!$force_reprocess) {
            $existing_commissions = $this->wpdb->get_var($this->wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE order_id = %d",
                $order_id
            ));
            
            if ($existing_commissions > 0) {
                return array('status' => 'skipped', 'reason' => 'Commissions already exist');
            }
        } else {
            // Delete existing commissions if force reprocess
            $this->wpdb->delete(
                $this->wpdb->prefix . 'clearmeds_commissions',
                array('order_id' => $order_id),
                array('%d')
            );
        }
        
        // Process the order
        $result = $commission->process_order_commissions($order_id);
        
        if ($result) {
            return array('status' => 'processed', 'message' => 'Commissions created successfully');
        } else {
            $order = wc_get_order($order_id);
            
            $reason = 'Unknown error';
            if (!$order) {
                $reason = 'Order not found';
            } else {
                $customer_id = $order->get_customer_id();
                if (!$customer_id) {
                    $reason = 'Order has no customer ID';
                } else {
                    // Check if customer has a referrer
                    $referrer_id = $this->wpdb->get_var($this->wpdb->prepare(
                        "SELECT referrer_id FROM {$this->wpdb->prefix}clearmeds_referral_network 
                         WHERE user_id = %d ORDER BY level ASC LIMIT 1",
                        $customer_id
                    ));
                    
                    if (!$referrer_id) {
                        $reason = 'Customer has no referrer in the network';
                    } else {
                        $status = $this->wpdb->get_var($this->wpdb->prepare(
                            "SELECT status FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
                            $referrer_id
                        ));
                        if ($status !== 'active') {
                            $reason = 'Referrer is not active (status: ' . ($status ? $status : 'pending') . ')';
                        } else {
                            $reason = 'Failed to process commissions (unknown error)';
                        }
                    }
                }
            }
            
            return array('status' => 'failed', 'reason' => $reason);
        }
    }
    
    /**
     * Update sync results based on processing result
     */
    private function update_sync_results(&$results, $order_id, $result) {
        $status = $result['status'];
        
        if ($status === 'processed') {
            $results['processed']++;
            $results['orders'][] = array(
                'order_id' => $order_id,
                'status' => 'processed',
                'message' => $result['message']
            );
        } elseif ($status === 'skipped') {
            $results['skipped']++;
            $results['orders'][] = array(
                'order_id' => $order_id,
                'status' => 'skipped',
                'reason' => $result['reason']
            );
        } else {
            $results['failed']++;
            $results['errors'][] = "Order #{$order_id}: " . $result['reason'];
            $results['orders'][] = array(
                'order_id' => $order_id,
                'status' => 'failed',
                'reason' => $result['reason']
            );
        }
    }
    
    /**
     * Seed test data (commissions and payouts)
     * For testing purposes only
     */
    public function seed_test_data($request) {
        $data = $request->get_json_params();
        $users = isset($data['users']) ? $data['users'] : array();
        $commissions_count = isset($data['commissions_per_user']) ? intval($data['commissions_per_user']) : 5;
        $payouts_count = isset($data['payouts_per_user']) ? intval($data['payouts_per_user']) : 2;
        
        $results = array(
            'commissions' => array('created' => 0, 'failed' => 0),
            'payouts' => array('created' => 0, 'failed' => 0)
        );
        
        // Get commission rates
        $commission_rates = get_option('clearmeds_commission_rates', array(
            'level1' => 15,
            'level2' => 10,
            'level3' => 5
        ));
        
        // Create commissions for each user
        foreach ($users as $user) {
            $user_id = intval($user['user_id']);
            
            if (!$user_id) {
                continue;
            }
            
            // Check if user is active - pending users can't have commissions
            $user_status = $this->wpdb->get_var($this->wpdb->prepare(
                "SELECT status FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
                $user_id
            ));
            
            if ($user_status !== 'active') {
                // Skip commission creation for non-active users
                continue;
            }
            
            // Create commissions
            for ($i = 0; $i < $commissions_count; $i++) {
                $order_id = 1000 + ($user_id * 100) + $i;
                $order_amount = rand(5000, 50000) / 100; // Random amount between $50 and $500
                $level = ($i % 3) + 1; // Cycle through levels 1, 2, 3
                $rate = isset($commission_rates['level' . $level]) ? floatval($commission_rates['level' . $level]) : (16 - $level * 5);
                $commission_amount = ($order_amount * $rate) / 100;
                
                // Random status: 60% pending, 30% approved, 10% declined
                $status_rand = rand(1, 100);
                if ($status_rand <= 60) {
                    $status = 'pending';
                } elseif ($status_rand <= 90) {
                    $status = 'approved';
                } else {
                    $status = 'declined';
                }
                
                $result = $this->wpdb->insert(
                    $this->wpdb->prefix . 'clearmeds_commissions',
                    array(
                        'user_id' => $user_id,
                        'order_id' => $order_id,
                        'order_amount' => $order_amount,
                        'commission_rate' => $rate,
                        'commission_amount' => $commission_amount,
                        'level' => $level,
                        'status' => $status,
                        'created_at' => date('Y-m-d H:i:s', strtotime('-' . ($i * 7) . ' days'))
                    ),
                    array('%d', '%d', '%f', '%f', '%f', '%d', '%s', '%s')
                );
                
                if ($result !== false) {
                    $results['commissions']['created']++;
                } else {
                    $results['commissions']['failed']++;
                }
            }
            
            // Create payouts for approved commissions
            $approved_commissions_total = $this->wpdb->get_var($this->wpdb->prepare(
                "SELECT COALESCE(SUM(commission_amount), 0) FROM {$this->wpdb->prefix}clearmeds_commissions 
                 WHERE user_id = %d AND status = 'approved'",
                $user_id
            ));
            
            if ($approved_commissions_total > 0) {
                for ($i = 0; $i < $payouts_count; $i++) {
                    // Split approved commissions into payouts
                    $payout_amount = $approved_commissions_total / $payouts_count;
                    
                    // Random status: 40% pending, 50% processing, 10% completed
                    $status_rand = rand(1, 100);
                    if ($status_rand <= 40) {
                        $status = 'pending';
                    } elseif ($status_rand <= 90) {
                        $status = 'processing';
                    } else {
                        $status = 'completed';
                    }
                    
                    $reference = 'PAY-' . strtoupper(substr(md5($user_id . $i . time()), 0, 8));
                    
                    $result = $this->wpdb->insert(
                        $this->wpdb->prefix . 'clearmeds_payouts',
                        array(
                            'user_id' => $user_id,
                            'amount' => $payout_amount,
                            'payment_method' => ($i % 2 === 0) ? 'paypal' : 'bank_transfer',
                            'payment_details' => json_encode(array(
                                'email' => isset($user['email']) ? $user['email'] : '',
                                'account' => '****' . rand(1000, 9999)
                            )),
                            'status' => $status,
                            'reference' => $reference,
                            'created_at' => date('Y-m-d H:i:s', strtotime('-' . ($i * 14) . ' days')),
                            'processed_at' => $status === 'completed' ? date('Y-m-d H:i:s', strtotime('-' . ($i * 14) . ' days + 2 days')) : null
                        ),
                        array('%d', '%f', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
                    );
                    
                    if ($result !== false) {
                        $results['payouts']['created']++;
                    } else {
                        $results['payouts']['failed']++;
                    }
                }
            }
        }
        
        $this->debug_log('Test data seeded', $results);
        
        return new WP_REST_Response(array(
            'success' => true,
            'results' => $results
        ), 200);
    }
    
    /**
     * Seed payment methods for a user (for testing)
     */
    public function seed_payment_methods($request) {
        $user_id = intval($request['user_id']);
        
        // Check if user exists
        $user = get_user_by('ID', $user_id);
        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }
        
        // Payment methods to seed
        $payment_methods = [
            [
                'type' => 'Bank Account',
                'bankName' => 'Chase Bank',
                'accountHolder' => $user->display_name ?: $user->user_login,
                'accountType' => 'Checking',
                'routingNumber' => '021000021',
                'accountNumber' => '1234567890',
                'last4' => '7890',
                'isPrimary' => true,
                'details' => [
                    'accountType' => 'Checking',
                    'fullAccountNumber' => '1234567890',
                    'routingNumber' => '021000021'
                ]
            ],
            [
                'type' => 'PayPal',
                'email' => $user->user_email,
                'last4' => substr($user->user_email, -4),
                'isPrimary' => false,
                'details' => [
                    'email' => $user->user_email
                ]
            ],
            [
                'type' => 'Venmo',
                'email' => $user->user_email,
                'phone' => '5551234567',
                'last4' => substr($user->user_email, -4),
                'isPrimary' => false,
                'details' => [
                    'email' => $user->user_email,
                    'phone' => '5551234567'
                ]
            ],
            [
                'type' => 'Zelle',
                'email' => $user->user_email,
                'phone' => '5559876543',
                'last4' => substr($user->user_email, -4),
                'isPrimary' => false,
                'details' => [
                    'email' => $user->user_email,
                    'phone' => '5559876543'
                ]
            ]
        ];
        
        // Get existing payment methods
        $existing_methods = get_user_meta($user_id, 'clearmeds_payment_methods', true) ?: [];
        
        // Add new payment methods
        $updated_methods = array_merge($existing_methods, $payment_methods);
        
        // Update user meta
        update_user_meta($user_id, 'clearmeds_payment_methods', $updated_methods);
        update_user_meta($user_id, 'clearmeds_primary_payment_method', count($existing_methods)); // First new method (Bank Account) is primary
        
        $this->debug_log('Payment methods seeded for user ' . $user_id, array(
            'user_id' => $user_id,
            'user_email' => $user->user_email,
            'methods_added' => count($payment_methods),
            'total_methods' => count($updated_methods)
        ));
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Payment methods seeded successfully',
            'user_id' => $user_id,
            'user_email' => $user->user_email,
            'methods_added' => count($payment_methods),
            'total_methods' => count($updated_methods),
            'methods' => $payment_methods
        ), 200);
    }
    
    /**
     * Seed payouts for a user (for testing)
     */
    public function seed_payouts($request) {
        $user_id = intval($request['user_id']);
        
        // Check if user exists
        $user = get_user_by('ID', $user_id);
        if (!$user) {
            return new WP_Error('user_not_found', 'User not found', array('status' => 404));
        }
        
        // Get user's payment methods to use for payouts
        $payment_methods = get_user_meta($user_id, 'clearmeds_payment_methods', true) ?: [];
        $primary_method = null;
        foreach ($payment_methods as $method) {
            if (isset($method['isPrimary']) && $method['isPrimary']) {
                $primary_method = $method;
                break;
            }
        }
        if (!$primary_method && !empty($payment_methods)) {
            $primary_method = $payment_methods[0];
        }
        
        // Generate payout data with different statuses and dates
        $payouts_data = [
            [
                'amount' => 1250.00,
                'status' => 'completed',
                'payment_method' => $primary_method ? $primary_method['type'] : 'Bank Account',
                'reference' => 'PAY-' . strtoupper(substr(md5($user_id . '1' . time()), 0, 8)),
                'created_at' => date('Y-m-d H:i:s', strtotime('-30 days')),
                'processed_at' => date('Y-m-d H:i:s', strtotime('-29 days')),
                'payment_details' => json_encode([
                    'method' => $primary_method ? $primary_method['type'] : 'Bank Account',
                    'account' => $primary_method && isset($primary_method['last4']) ? '****' . $primary_method['last4'] : '****7890'
                ])
            ],
            [
                'amount' => 850.50,
                'status' => 'completed',
                'payment_method' => 'PayPal',
                'reference' => 'PAY-' . strtoupper(substr(md5($user_id . '2' . time()), 0, 8)),
                'created_at' => date('Y-m-d H:i:s', strtotime('-20 days')),
                'processed_at' => date('Y-m-d H:i:s', strtotime('-19 days')),
                'payment_details' => json_encode([
                    'method' => 'PayPal',
                    'email' => $user->user_email
                ])
            ],
            [
                'amount' => 625.75,
                'status' => 'processing',
                'payment_method' => $primary_method ? $primary_method['type'] : 'Bank Account',
                'reference' => 'PAY-' . strtoupper(substr(md5($user_id . '3' . time()), 0, 8)),
                'created_at' => date('Y-m-d H:i:s', strtotime('-5 days')),
                'processed_at' => null,
                'payment_details' => json_encode([
                    'method' => $primary_method ? $primary_method['type'] : 'Bank Account',
                    'account' => $primary_method && isset($primary_method['last4']) ? '****' . $primary_method['last4'] : '****7890'
                ])
            ],
            [
                'amount' => 320.25,
                'status' => 'pending',
                'payment_method' => 'Venmo',
                'reference' => 'PAY-' . strtoupper(substr(md5($user_id . '4' . time()), 0, 8)),
                'created_at' => date('Y-m-d H:i:s', strtotime('-2 days')),
                'processed_at' => null,
                'payment_details' => json_encode([
                    'method' => 'Venmo',
                    'email' => $user->user_email
                ])
            ],
            [
                'amount' => 1500.00,
                'status' => 'completed',
                'payment_method' => 'Zelle',
                'reference' => 'PAY-' . strtoupper(substr(md5($user_id . '5' . time()), 0, 8)),
                'created_at' => date('Y-m-d H:i:s', strtotime('-10 days')),
                'processed_at' => date('Y-m-d H:i:s', strtotime('-9 days')),
                'payment_details' => json_encode([
                    'method' => 'Zelle',
                    'email' => $user->user_email,
                    'phone' => '5559876543'
                ])
            ],
            [
                'amount' => 450.00,
                'status' => 'failed',
                'payment_method' => 'PayPal',
                'reference' => 'PAY-' . strtoupper(substr(md5($user_id . '6' . time()), 0, 8)),
                'created_at' => date('Y-m-d H:i:s', strtotime('-15 days')),
                'processed_at' => date('Y-m-d H:i:s', strtotime('-14 days')),
                'payment_details' => json_encode([
                    'method' => 'PayPal',
                    'email' => $user->user_email,
                    'error' => 'Payment failed - insufficient funds'
                ])
            ]
        ];
        
        $created_payouts = [];
        $errors = [];
        
        foreach ($payouts_data as $payout_data) {
            $result = $this->wpdb->insert(
                $this->wpdb->prefix . 'clearmeds_payouts',
                array(
                    'user_id' => $user_id,
                    'amount' => $payout_data['amount'],
                    'payment_method' => $payout_data['payment_method'],
                    'payment_details' => $payout_data['payment_details'],
                    'status' => $payout_data['status'],
                    'reference' => $payout_data['reference'],
                    'created_at' => $payout_data['created_at'],
                    'processed_at' => $payout_data['processed_at']
                ),
                array('%d', '%f', '%s', '%s', '%s', '%s', '%s', '%s')
            );
            
            if ($result !== false) {
                $payout_id = $this->wpdb->insert_id;
                $created_payouts[] = array(
                    'id' => $payout_id,
                    'amount' => $payout_data['amount'],
                    'status' => $payout_data['status'],
                    'reference' => $payout_data['reference']
                );
            } else {
                $errors[] = array(
                    'payout' => $payout_data,
                    'error' => $this->wpdb->last_error
                );
            }
        }
        
        // Calculate stats
        $total_paid = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COALESCE(SUM(amount), 0) FROM {$this->wpdb->prefix}clearmeds_payouts 
             WHERE user_id = %d AND status = 'completed'",
            $user_id
        ));
        
        $pending = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COALESCE(SUM(amount), 0) FROM {$this->wpdb->prefix}clearmeds_payouts 
             WHERE user_id = %d AND status IN ('pending', 'processing')",
            $user_id
        ));
        
        $this->debug_log('Payouts seeded for user ' . $user_id, array(
            'user_id' => $user_id,
            'user_email' => $user->user_email,
            'payouts_created' => count($created_payouts),
            'errors' => count($errors),
            'total_paid' => $total_paid,
            'pending' => $pending
        ));
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Payouts seeded successfully',
            'user_id' => $user_id,
            'user_email' => $user->user_email,
            'payouts_created' => count($created_payouts),
            'total_paid' => floatval($total_paid),
            'pending' => floatval($pending),
            'payouts' => $created_payouts,
            'errors' => $errors
        ), 200);
    }
}

