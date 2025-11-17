<?php
/**
 * Seed script for ClearMeds Portal (PHP version)
 * Creates test data directly in the database
 * 
 * Usage: php scripts/seed-data.php
 * 
 * This script should be run from the WordPress root directory
 * or with WP_LOAD_PATH set to your WordPress installation
 */

// Load WordPress
$wp_load_path = getenv('WP_LOAD_PATH') ?: dirname(__FILE__) . '/../../wordpress/wp-load.php';
if (file_exists($wp_load_path)) {
    require_once $wp_load_path;
} else {
    // Try common WordPress locations
    $possible_paths = [
        dirname(__FILE__) . '/../../../wp-load.php',
        dirname(__FILE__) . '/../../../../wp-load.php',
        '/var/www/html/wp-load.php',
    ];
    
    $loaded = false;
    foreach ($possible_paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            $loaded = true;
            break;
        }
    }
    
    if (!$loaded) {
        die("Error: Could not find wp-load.php. Please set WP_LOAD_PATH environment variable.\n");
    }
}

// Check if plugin is active
if (!class_exists('ClearMeds_Auth')) {
    die("Error: ClearMeds Portal plugin is not active.\n");
}

echo "🌱 Starting ClearMeds Portal Seed Script (PHP)...\n\n";

global $wpdb;

// Test users data
$test_users = [
    [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe@example.com',
        'phone' => '555-0101',
        'address' => '123 Main St',
        'city' => 'New York',
        'state' => 'NY',
        'zip_code' => '10001',
        'password' => 'password123',
        'referrer_id' => null
    ],
    [
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'email' => 'jane.smith@example.com',
        'phone' => '555-0102',
        'address' => '456 Oak Ave',
        'city' => 'Los Angeles',
        'state' => 'CA',
        'zip_code' => '90001',
        'password' => 'password123',
        'referrer_id' => null
    ],
    [
        'first_name' => 'Bob',
        'last_name' => 'Johnson',
        'email' => 'bob.johnson@example.com',
        'phone' => '555-0103',
        'address' => '789 Pine Rd',
        'city' => 'Chicago',
        'state' => 'IL',
        'zip_code' => '60601',
        'password' => 'password123',
        'referrer_id' => null
    ],
    [
        'first_name' => 'Alice',
        'last_name' => 'Williams',
        'email' => 'alice.williams@example.com',
        'phone' => '555-0104',
        'address' => '321 Elm St',
        'city' => 'Houston',
        'state' => 'TX',
        'zip_code' => '77001',
        'password' => 'password123',
        'referrer_id' => null
    ],
    [
        'first_name' => 'Charlie',
        'last_name' => 'Brown',
        'email' => 'charlie.brown@example.com',
        'phone' => '555-0105',
        'address' => '654 Maple Dr',
        'city' => 'Phoenix',
        'state' => 'AZ',
        'zip_code' => '85001',
        'password' => 'password123',
        'referrer_id' => null
    ]
];

$auth = new ClearMeds_Auth();
$created_users = [];

echo "📝 Step 1: Creating test users...\n";

foreach ($test_users as $index => $user_data) {
    // Set referrer if not first user
    if ($index > 0 && count($created_users) > 0) {
        $referrer_index = $index % 2 === 0 ? 0 : 1;
        if (isset($created_users[$referrer_index])) {
            $user_data['referrer_id'] = $created_users[$referrer_index]['affiliate_id'];
        }
    }
    
    // Check if user already exists
    $existing_user = get_user_by('email', $user_data['email']);
    
    if ($existing_user) {
        echo "  ⚠ User {$user_data['email']} already exists, skipping...\n";
        
        // Get affiliate ID
        $affiliate_id = $wpdb->get_var($wpdb->prepare(
            "SELECT affiliate_id FROM {$wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $existing_user->ID
        ));
        
        if (!$affiliate_id) {
            // Create affiliate record
            $affiliate_id = 'AFF' . str_pad($existing_user->ID, 6, '0', STR_PAD_LEFT);
            $wpdb->insert(
                $wpdb->prefix . 'clearmeds_affiliates',
                [
                    'user_id' => $existing_user->ID,
                    'affiliate_id' => $affiliate_id,
                    'status' => 'active',
                    'created_at' => current_time('mysql')
                ]
            );
        }
        
        $created_users[] = [
            'user_id' => $existing_user->ID,
            'affiliate_id' => $affiliate_id,
            'email' => $user_data['email']
        ];
        continue;
    }
    
    // Register user
    $result = $auth->register($user_data);
    
    if (is_wp_error($result)) {
        echo "  ✗ Failed to create user {$user_data['email']}: {$result->get_error_message()}\n";
        continue;
    }
    
    $created_users[] = $result;
    echo "  ✓ Created user: {$user_data['first_name']} {$user_data['last_name']} (ID: {$result['user_id']}, Affiliate ID: {$result['affiliate_id']})\n";
}

echo "\n✅ Created " . count($created_users) . " users\n\n";

// Create referral relationships
echo "🔗 Step 2: Creating referral relationships...\n";

foreach ($created_users as $index => $user) {
    if ($index === 0) {
        continue; // Skip first user (root)
    }
    
    $referrer_index = $index % 2 === 0 ? 0 : 1;
    if (isset($created_users[$referrer_index])) {
        $referrer = $created_users[$referrer_index];
        
        // Check if relationship already exists
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}clearmeds_referral_network 
             WHERE referrer_id = %d AND referred_id = %d",
            $referrer['user_id'],
            $user['user_id']
        ));
        
        if (!$exists) {
            $wpdb->insert(
                $wpdb->prefix . 'clearmeds_referral_network',
                [
                    'referrer_id' => $referrer['user_id'],
                    'referred_id' => $user['user_id'],
                    'level' => 1,
                    'created_at' => current_time('mysql')
                ]
            );
            echo "  ✓ Created referral: {$referrer['email']} -> {$user['email']}\n";
        }
    }
}

echo "\n✅ Seed script completed!\n\n";
echo "📝 Next steps:\n";
echo "  1. Log in to WordPress admin\n";
echo "  2. Go to WooCommerce > Orders\n";
echo "  3. Create test orders with the test users as customers\n";
echo "  4. Complete the orders to generate commissions\n";
echo "  5. Check the ClearMeds Portal dashboard to see the data\n\n";

