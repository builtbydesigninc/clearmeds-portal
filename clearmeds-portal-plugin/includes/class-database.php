<?php
/**
 * Database management class
 * Handles table creation and migrations
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_Database {
    
    private $wpdb;
    private $charset_collate;
    
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->charset_collate = $wpdb->get_charset_collate();
    }
    
    /**
     * Create all custom tables
     */
    public function create_tables() {
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        $this->create_affiliates_table();
        $this->create_referral_network_table();
        $this->create_commissions_table();
        $this->create_payouts_table();
        $this->create_link_clicks_table();
        $this->create_checklist_items_table();
        $this->create_user_settings_table();
    }
    
    /**
     * Drop all custom tables
     */
    public function drop_all_tables() {
        $tables = array(
            'clearmeds_affiliates',
            'clearmeds_referral_network',
            'clearmeds_commissions',
            'clearmeds_payouts',
            'clearmeds_link_clicks',
            'clearmeds_checklist_items',
            'clearmeds_user_settings'
        );
        
        $dropped = array();
        $errors = array();
        
        foreach ($tables as $table) {
            $table_name = $this->wpdb->prefix . $table;
            $result = $this->wpdb->query("DROP TABLE IF EXISTS $table_name");
            
            if ($result !== false) {
                $dropped[] = $table;
            } else {
                $errors[] = array(
                    'table' => $table,
                    'error' => $this->wpdb->last_error
                );
            }
        }
        
        return array(
            'success' => empty($errors),
            'dropped' => $dropped,
            'errors' => $errors
        );
    }
    
    /**
     * Rebuild all tables (drop and recreate)
     */
    public function rebuild_tables() {
        $drop_result = $this->drop_all_tables();
        
        if (!$drop_result['success']) {
            return array(
                'success' => false,
                'message' => 'Failed to drop some tables',
                'drop_result' => $drop_result
            );
        }
        
        // Recreate tables
        $this->create_tables();
        
        // Check for errors during creation
        if ($this->wpdb->last_error) {
            return array(
                'success' => false,
                'message' => 'Failed to create tables',
                'error' => $this->wpdb->last_error,
                'drop_result' => $drop_result
            );
        }
        
        return array(
            'success' => true,
            'message' => 'Tables rebuilt successfully',
            'dropped' => $drop_result['dropped']
        );
    }
    
    /**
     * Create wp_clearmeds_affiliates table
     */
    private function create_affiliates_table() {
        $table_name = $this->wpdb->prefix . 'clearmeds_affiliates';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            affiliate_id varchar(50) NOT NULL,
            referrer_id bigint(20) UNSIGNED NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            payment_details text NULL,
            tax_id_type varchar(20) NULL,
            tax_id varchar(100) NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY user_id (user_id),
            UNIQUE KEY affiliate_id (affiliate_id),
            KEY referrer_id (referrer_id),
            KEY status (status)
        ) $this->charset_collate;";
        
        dbDelta($sql);
        
        // Add status column if it doesn't exist (for existing installations)
        $column_exists = $this->wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'status'");
        if (empty($column_exists)) {
            $this->wpdb->query("ALTER TABLE $table_name ADD COLUMN status varchar(20) NOT NULL DEFAULT 'pending' AFTER referrer_id");
            $this->wpdb->query("ALTER TABLE $table_name ADD INDEX status (status)");
        }
    }
    
    /**
     * Create wp_clearmeds_referral_network table
     */
    private function create_referral_network_table() {
        $table_name = $this->wpdb->prefix . 'clearmeds_referral_network';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            referrer_id bigint(20) UNSIGNED NOT NULL,
            level tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
            path varchar(255) NOT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY referrer_id (referrer_id),
            KEY level (level),
            KEY path (path(191))
        ) $this->charset_collate;";
        
        dbDelta($sql);
    }
    
    /**
     * Create wp_clearmeds_commissions table
     */
    private function create_commissions_table() {
        $table_name = $this->wpdb->prefix . 'clearmeds_commissions';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            order_id bigint(20) UNSIGNED NOT NULL,
            order_amount decimal(10,2) NOT NULL,
            commission_rate decimal(5,2) NOT NULL,
            commission_amount decimal(10,2) NOT NULL,
            level tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
            status varchar(20) NOT NULL DEFAULT 'pending',
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            paid_at datetime NULL,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY order_id (order_id),
            KEY status (status),
            KEY level (level)
        ) $this->charset_collate;";
        
        dbDelta($sql);
    }
    
    /**
     * Create wp_clearmeds_payouts table
     */
    private function create_payouts_table() {
        $table_name = $this->wpdb->prefix . 'clearmeds_payouts';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            amount decimal(10,2) NOT NULL,
            payment_method varchar(50) NOT NULL,
            payment_details text NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            reference varchar(100) NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            processed_at datetime NULL,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY status (status),
            KEY reference (reference)
        ) $this->charset_collate;";
        
        dbDelta($sql);
    }
    
    /**
     * Create wp_clearmeds_link_clicks table
     */
    private function create_link_clicks_table() {
        $table_name = $this->wpdb->prefix . 'clearmeds_link_clicks';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            link_url text NOT NULL,
            utm_source varchar(100) NULL,
            utm_medium varchar(100) NULL,
            utm_campaign varchar(100) NULL,
            product_id bigint(20) UNSIGNED NULL,
            clicked_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            converted tinyint(1) NOT NULL DEFAULT 0,
            order_id bigint(20) UNSIGNED NULL,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY converted (converted),
            KEY order_id (order_id),
            KEY clicked_at (clicked_at)
        ) $this->charset_collate;";
        
        dbDelta($sql);
    }
    
    /**
     * Create wp_clearmeds_checklist_items table
     */
    private function create_checklist_items_table() {
        $table_name = $this->wpdb->prefix . 'clearmeds_checklist_items';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            item_key varchar(50) NOT NULL,
            completed tinyint(1) NOT NULL DEFAULT 0,
            completed_at datetime NULL,
            PRIMARY KEY (id),
            UNIQUE KEY user_item (user_id, item_key),
            KEY user_id (user_id)
        ) $this->charset_collate;";
        
        dbDelta($sql);
    }
    
    /**
     * Create wp_clearmeds_user_settings table
     */
    private function create_user_settings_table() {
        $table_name = $this->wpdb->prefix . 'clearmeds_user_settings';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            setting_key varchar(100) NOT NULL,
            setting_value text NULL,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY user_setting (user_id, setting_key),
            KEY user_id (user_id)
        ) $this->charset_collate;";
        
        dbDelta($sql);
    }
}

