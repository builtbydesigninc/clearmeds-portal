<?php
/**
 * Utility functions
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_Utils {
    
    /**
     * Encrypt sensitive data
     */
    public static function encrypt($data) {
        if (empty($data)) {
            return '';
        }
        
        $key = self::get_encryption_key();
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('AES-256-CBC'));
        $encrypted = openssl_encrypt($data, 'AES-256-CBC', $key, 0, $iv);
        
        return base64_encode($encrypted . '::' . $iv);
    }
    
    /**
     * Decrypt sensitive data
     */
    public static function decrypt($data) {
        if (empty($data)) {
            return '';
        }
        
        $key = self::get_encryption_key();
        list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
        
        return openssl_decrypt($encrypted_data, 'AES-256-CBC', $key, 0, $iv);
    }
    
    /**
     * Get encryption key
     */
    private static function get_encryption_key() {
        $key = get_option('clearmeds_encryption_key');
        
        if (empty($key)) {
            $key = wp_generate_password(32, true, true);
            update_option('clearmeds_encryption_key', $key);
        }
        
        return hash('sha256', $key);
    }
    
    /**
     * Generate affiliate ID
     */
    public static function generate_affiliate_id($user_id) {
        return 'AFF-' . date('Y') . '-' . str_pad($user_id, 4, '0', STR_PAD_LEFT);
    }
    
    /**
     * Get commission rates
     */
    public static function get_commission_rates() {
        return get_option('clearmeds_commission_rates', array(
            'level1' => 15,
            'level2' => 10,
            'level3' => 5
        ));
    }
    
    /**
     * Calculate commission amount
     */
    public static function calculate_commission($order_amount, $level) {
        $rates = self::get_commission_rates();
        $rate = isset($rates['level' . $level]) ? $rates['level' . $level] : 0;
        
        return ($order_amount * $rate) / 100;
    }
    
    /**
     * Format currency
     */
    public static function format_currency($amount) {
        return '$' . number_format($amount, 2);
    }
    
    /**
     * Get user role from WordPress user
     */
    public static function get_user_role($user_id) {
        $user = get_userdata($user_id);
        
        if (!$user) {
            return 'affiliate';
        }
        
        if (in_array('administrator', $user->roles)) {
            return 'super_admin';
        }
        
        if (in_array('editor', $user->roles) || user_can($user_id, 'manage_clearmeds')) {
            return 'admin';
        }
        
        return 'affiliate';
    }
    
    /**
     * Check if user is admin
     */
    public static function is_admin($user_id) {
        $role = self::get_user_role($user_id);
        return in_array($role, array('admin', 'super_admin'));
    }
    
    /**
     * Sanitize input
     */
    public static function sanitize($data, $type = 'text') {
        switch ($type) {
            case 'email':
                return sanitize_email($data);
            case 'url':
                return esc_url_raw($data);
            case 'int':
                return intval($data);
            case 'float':
                return floatval($data);
            case 'array':
                return is_array($data) ? array_map('sanitize_text_field', $data) : array();
            default:
                return sanitize_text_field($data);
        }
    }
    
    /**
     * Validate nonce
     */
    public static function verify_nonce($nonce, $action = 'wp_rest') {
        return wp_verify_nonce($nonce, $action);
    }
    
    /**
     * Get current user ID from WordPress
     */
    public static function get_current_user_id() {
        return get_current_user_id();
    }
    
    /**
     * Check if user can access resource
     */
    public static function can_access($user_id, $resource_user_id) {
        // Admin can access all
        if (self::is_admin($user_id)) {
            return true;
        }
        
        // User can only access their own data
        return $user_id === $resource_user_id;
    }
}

