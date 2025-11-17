<?php
/**
 * WooCommerce integration class
 * Hooks into WooCommerce to track orders and calculate commissions
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_WooCommerce {
    
    private $commission;
    
    public function __construct() {
        $this->commission = new ClearMeds_Commission();
        
        // Hook into order completion
        add_action('woocommerce_order_status_completed', array($this, 'on_order_completed'), 10, 1);
        
        // Track affiliate link clicks
        add_action('init', array($this, 'track_affiliate_click'));
        
        // Set affiliate cookie on order
        add_action('woocommerce_checkout_order_processed', array($this, 'set_affiliate_cookie'), 10, 1);
    }
    
    /**
     * Handle order completion
     */
    public function on_order_completed($order_id) {
        $this->commission->process_order_commissions($order_id);
    }
    
    /**
     * Track affiliate link clicks
     */
    public function track_affiliate_click() {
        if (!isset($_GET['ref'])) {
            return;
        }
        
        $affiliate_id = sanitize_text_field($_GET['ref']);
        
        // Validate affiliate ID format
        if (!preg_match('/^AFF-\d{4}-\d+$/', $affiliate_id)) {
            return;
        }
        
        // Get user ID from affiliate ID
        global $wpdb;
        $user_id = $wpdb->get_var($wpdb->prepare(
            "SELECT user_id FROM {$wpdb->prefix}clearmeds_affiliates WHERE affiliate_id = %s",
            $affiliate_id
        ));
        
        if (!$user_id) {
            return;
        }
        
        // Set cookie to track conversion
        setcookie('clearmeds_ref', $affiliate_id, time() + (30 * DAY_IN_SECONDS), '/');
        
        // Track click
        $wpdb->insert(
            $wpdb->prefix . 'clearmeds_link_clicks',
            array(
                'user_id' => $user_id,
                'link_url' => esc_url_raw($_SERVER['REQUEST_URI']),
                'utm_source' => isset($_GET['utm_source']) ? sanitize_text_field($_GET['utm_source']) : null,
                'utm_medium' => isset($_GET['utm_medium']) ? sanitize_text_field($_GET['utm_medium']) : null,
                'utm_campaign' => isset($_GET['utm_campaign']) ? sanitize_text_field($_GET['utm_campaign']) : null,
                'product_id' => isset($_GET['product']) ? intval($_GET['product']) : null
            ),
            array('%d', '%s', '%s', '%s', '%s', '%d')
        );
    }
    
    /**
     * Set affiliate cookie on order
     */
    public function set_affiliate_cookie($order_id) {
        if (isset($_COOKIE['clearmeds_ref'])) {
            $affiliate_id = sanitize_text_field($_COOKIE['clearmeds_ref']);
            update_post_meta($order_id, '_clearmeds_affiliate_id', $affiliate_id);
        }
    }
}

