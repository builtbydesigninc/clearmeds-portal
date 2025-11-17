<?php
/**
 * Admin class
 * Handles WordPress admin area functionality
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'ClearMeds Portal',
            'ClearMeds',
            'manage_options',
            'clearmeds-portal',
            array($this, 'render_settings_page'),
            'dashicons-groups',
            30
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('clearmeds_settings', 'clearmeds_commission_rates');
        register_setting('clearmeds_settings', 'clearmeds_payout_settings');
        register_setting('clearmeds_settings', 'clearmeds_debug_mode');
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        include_once CLEARMEDS_PLUGIN_DIR . 'admin/views/settings.php';
    }
}

