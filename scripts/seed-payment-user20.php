<?php
/**
 * Seed payment methods for user ID 20
 * 
 * Usage: php scripts/seed-payment-user20.php
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
if (!function_exists('get_user_meta')) {
    die("Error: WordPress is not loaded properly.\n");
}

$user_id = 20;

// Check if user exists
$user = get_user_by('ID', $user_id);
if (!$user) {
    die("Error: User ID $user_id does not exist.\n");
}

echo "🌱 Seeding payment methods for user ID $user_id ({$user->user_email})...\n\n";

// Payment methods to seed
$payment_methods = [
    [
        'type' => 'Bank Account',
        'bankName' => 'Chase Bank',
        'accountHolder' => $user->display_name ?: 'Test User',
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
update_user_meta($user_id, 'clearmeds_primary_payment_method', 0); // First method (Bank Account) is primary

echo "✅ Successfully seeded " . count($payment_methods) . " payment methods:\n\n";

foreach ($payment_methods as $index => $method) {
    $method_index = count($existing_methods) + $index;
    $primary_badge = isset($method['isPrimary']) && $method['isPrimary'] ? ' (PRIMARY)' : '';
    echo "  " . ($index + 1) . ". {$method['type']}{$primary_badge}\n";
    
    if ($method['type'] === 'Bank Account') {
        echo "      Bank: {$method['bankName']}\n";
        echo "      Account Holder: {$method['accountHolder']}\n";
        echo "      Account Type: {$method['accountType']}\n";
        echo "      Last 4: ****{$method['last4']}\n";
    } else if ($method['type'] === 'PayPal') {
        echo "      Email: {$method['email']}\n";
    } else {
        echo "      Email: " . ($method['email'] ?? 'N/A') . "\n";
        echo "      Phone: " . ($method['phone'] ?? 'N/A') . "\n";
    }
    echo "\n";
}

echo "📊 Total payment methods for user ID $user_id: " . count($updated_methods) . "\n";
echo "✅ Seed script completed!\n\n";

