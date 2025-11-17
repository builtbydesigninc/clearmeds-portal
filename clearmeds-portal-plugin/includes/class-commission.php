<?php
/**
 * Commission management class
 * Handles commission calculations and management
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_Commission {
    
    private $wpdb;
    
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }
    
    /**
     * Calculate and create commissions for an order
     */
    public function process_order_commissions($order_id) {
        // CRITICAL: Idempotency check - prevent duplicate commissions
        $existing_commissions = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE order_id = %d",
            $order_id
        ));
        
        if ($existing_commissions > 0) {
            return true; // Already processed, skip to prevent duplicates
        }
        
        // Get order data
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return false;
        }
        
        $order_amount = $order->get_total();
        
        // Get the customer who placed the order
        // NOTE: customer_id can be 0 for guest checkouts
        $customer_id = $order->get_customer_id();
        
        // Priority 1: Check if order was placed via affiliate link (external referral)
        $affiliate_id = get_post_meta($order_id, '_clearmeds_affiliate_id', true);
        
        if ($affiliate_id) {
            // Order was placed via affiliate link - use that affiliate
            $affiliate_user_id = $this->get_user_id_from_affiliate_id($affiliate_id);
            
            // CRITICAL: Prevent own-order commission - affiliate must NOT be the customer
            if ($affiliate_user_id && $affiliate_user_id != $customer_id && $this->is_user_active($affiliate_user_id)) {
                $this->calculate_network_commissions($affiliate_user_id, $order_id, $order_amount);
                return true;
            }
        }
        
        // Priority 2: Check cookie (set when user clicks affiliate link)
        if (isset($_COOKIE['clearmeds_ref'])) {
            $affiliate_id = sanitize_text_field($_COOKIE['clearmeds_ref']);
            $affiliate_user_id = $this->get_user_id_from_affiliate_id($affiliate_id);
            
            // CRITICAL: Prevent own-order commission - affiliate must NOT be the customer
            if ($affiliate_user_id && $affiliate_user_id != $customer_id && $this->is_user_active($affiliate_user_id)) {
                $this->calculate_network_commissions($affiliate_user_id, $order_id, $order_amount);
                return true;
            }
        }
        
        // Priority 3: Find the customer's referrer (if customer is an affiliate)
        // When user 17 places an order, their referrer (user 20) should get the commission
        // NOTE: Skip this for guest orders (customer_id = 0)
        if ($customer_id > 0) {
            $referrer_id = $this->get_referrer_id($customer_id);
            
            if ($referrer_id) {
                // Check if referrer is active - pending users can't earn commissions
                if ($this->is_user_active($referrer_id)) {
                    // Calculate commissions starting from the referrer going up the chain
                    $this->calculate_network_commissions($referrer_id, $order_id, $order_amount);
                    return true;
                }
            }
        }
        
        // No valid affiliate found through any method
        return false;
    }
    
    /**
     * Get affiliate ID from order (legacy method, kept for backward compatibility)
     */
    private function get_order_affiliate($order_id) {
        $affiliate_user_id = $this->get_order_affiliate_user($order_id);
        
        if (!$affiliate_user_id) {
            return null;
        }
        
        // Get affiliate ID from user ID
        return $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT affiliate_id FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $affiliate_user_id
        ));
    }
    
    /**
     * Get user ID from affiliate ID
     */
    private function get_user_id_from_affiliate_id($affiliate_id) {
        return $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT user_id FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE affiliate_id = %s",
            $affiliate_id
        ));
    }
    
    /**
     * Calculate commissions for 3-level network
     * When called with a user_id, it calculates:
     * - Level 1: Commission for that user
     * - Level 2: Commission for that user's referrer
     * - Level 3: Commission for that user's referrer's referrer
     */
    private function calculate_network_commissions($user_id, $order_id, $order_amount) {
        $rates = ClearMeds_Utils::get_commission_rates();
        
        // Check if user is active before creating commission
        if (!$this->is_user_active($user_id)) {
            return false; // Skip commission creation for pending/inactive users
        }
        
        // Use database transaction for atomic commission creation
        $this->wpdb->query('START TRANSACTION');
        
        try {
            // Level 1 - Commission for the user (e.g., user 20 when user 17 places an order)
            $result1 = $this->create_commission($user_id, $order_id, $order_amount, 1, $rates['level1']);
            if (!$result1) {
                throw new Exception('Failed to create Level 1 commission');
            }
            
            // Level 2 - Get referrer for level 2 (e.g., user 20's referrer)
            $referrer_id = $this->get_referrer_id($user_id);
            if ($referrer_id && $this->is_user_active($referrer_id)) {
                $result2 = $this->create_commission($referrer_id, $order_id, $order_amount, 2, $rates['level2']);
                if (!$result2) {
                    throw new Exception('Failed to create Level 2 commission');
                }
                
                // Level 3 - Get referrer for level 3 (e.g., user 20's referrer's referrer)
                $level2_referrer_id = $this->get_referrer_id($referrer_id);
                if ($level2_referrer_id && $this->is_user_active($level2_referrer_id)) {
                    $result3 = $this->create_commission($level2_referrer_id, $order_id, $order_amount, 3, $rates['level3']);
                    if (!$result3) {
                        throw new Exception('Failed to create Level 3 commission');
                    }
                }
            }
            
            // Commit transaction if all commissions created successfully
            $this->wpdb->query('COMMIT');
            return true;
            
        } catch (Exception $e) {
            // Rollback transaction on any failure
            $this->wpdb->query('ROLLBACK');
            error_log('Commission creation failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Check if user has active status
     */
    private function is_user_active($user_id) {
        $status = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT status FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
        
        return $status === 'active';
    }
    
    /**
     * Get referrer ID for user
     */
    private function get_referrer_id($user_id) {
        return $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT referrer_id FROM {$this->wpdb->prefix}clearmeds_referral_network 
             WHERE user_id = %d ORDER BY level ASC LIMIT 1",
            $user_id
        ));
    }
    
    /**
     * Create commission record
     * Returns true on success, false on failure
     */
    private function create_commission($user_id, $order_id, $order_amount, $level, $rate) {
        $commission_amount = ClearMeds_Utils::calculate_commission($order_amount, $level);
        
        $result = $this->wpdb->insert(
            $this->wpdb->prefix . 'clearmeds_commissions',
            array(
                'user_id' => $user_id,
                'order_id' => $order_id,
                'order_amount' => $order_amount,
                'commission_rate' => $rate,
                'commission_amount' => $commission_amount,
                'level' => $level,
                'status' => 'pending'
            ),
            array('%d', '%d', '%f', '%f', '%f', '%d', '%s')
        );
        
        if ($result === false) {
            error_log('Failed to create commission: ' . $this->wpdb->last_error);
            return false;
        }
        
        return true;
    }
    
    /**
     * Get user commissions
     */
    public function get_user_commissions($user_id, $args = array()) {
        $defaults = array(
            'status' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'created_at',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $where = $this->wpdb->prepare("user_id = %d", $user_id);
        
        if (!empty($args['status'])) {
            $where .= $this->wpdb->prepare(" AND status = %s", $args['status']);
        }
        
        $orderby = sanitize_sql_orderby($args['orderby'] . ' ' . $args['order']);
        
        $results = $this->wpdb->get_results($this->wpdb->prepare(
            "SELECT * FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE $where 
             ORDER BY $orderby 
             LIMIT %d OFFSET %d",
            $args['limit'],
            $args['offset']
        ));
        
        return $results;
    }
    
    /**
     * Get commission statistics
     */
    public function get_commission_stats($user_id) {
        $total = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(commission_amount) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND status = 'approved'",
            $user_id
        ));
        
        $pending = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(commission_amount) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND status = 'pending'",
            $user_id
        ));
        
        return array(
            'total' => floatval($total ? $total : 0),
            'pending' => floatval($pending ? $pending : 0)
        );
    }
}

