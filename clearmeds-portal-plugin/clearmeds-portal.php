<?php
/**
 * Plugin Name: ClearMeds Portal
 * Plugin URI: https://clearmeds.com
 * Description: Backend plugin for ClearMeds affiliate portal - manages affiliates, referrals, commissions, and payouts
 * Version: 1.2.0
 * Author: ClearMeds
 * Author URI: https://clearmeds.com
 * License: GPL v2 or later
 * Text Domain: clearmeds-portal
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CLEARMEDS_VERSION', '1.1.0');
define('CLEARMEDS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CLEARMEDS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CLEARMEDS_PLUGIN_FILE', __FILE__);

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'ClearMeds\\';
    $base_dir = CLEARMEDS_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . 'class-' . str_replace('_', '-', strtolower(str_replace('\\', '/', $relative_class))) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Main plugin class
class ClearMeds_Portal {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init();
    }
    
    private function init() {
        // Load dependencies
        require_once CLEARMEDS_PLUGIN_DIR . 'includes/class-database.php';
        require_once CLEARMEDS_PLUGIN_DIR . 'includes/class-jwt.php';
        require_once CLEARMEDS_PLUGIN_DIR . 'includes/class-auth.php';
        require_once CLEARMEDS_PLUGIN_DIR . 'includes/class-utils.php';
        require_once CLEARMEDS_PLUGIN_DIR . 'includes/class-referral.php';
        require_once CLEARMEDS_PLUGIN_DIR . 'includes/class-commission.php';
        require_once CLEARMEDS_PLUGIN_DIR . 'includes/class-rest-api.php';
        require_once CLEARMEDS_PLUGIN_DIR . 'includes/class-woocommerce.php';
        
        if (is_admin()) {
            require_once CLEARMEDS_PLUGIN_DIR . 'admin/class-admin.php';
        }
        
        // Activation/Deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Initialize components
        add_action('plugins_loaded', array($this, 'load_components'));
    }
    
    public function activate() {
        $database = new ClearMeds_Database();
        $database->create_tables();
        
        // Set default options
        add_option('clearmeds_version', CLEARMEDS_VERSION);
        add_option('clearmeds_commission_rates', array(
            'level1' => 15,
            'level2' => 10,
            'level3' => 5
        ));
        add_option('clearmeds_payout_settings', array(
            'frequency' => 'biweekly',
            'minimum_threshold' => 50,
            'day_of_week' => 'monday'
        ));
        
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        flush_rewrite_rules();
    }
    
    public function load_components() {
        // Initialize REST API
        new ClearMeds_REST_API();
        
        // Initialize WooCommerce integration if WooCommerce is active
        if (class_exists('WooCommerce')) {
            new ClearMeds_WooCommerce();
        }
        
        // Initialize admin if in admin area
        if (is_admin()) {
            new ClearMeds_Admin();
        }
    }
}

// Initialize plugin
function clearmeds_portal_init() {
    return ClearMeds_Portal::get_instance();
}

// Start the plugin
clearmeds_portal_init();

