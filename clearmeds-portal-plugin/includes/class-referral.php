<?php
/**
 * Referral management class
 * Handles referral network, relationships, and tracking
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_Referral {
    
    private $wpdb;
    
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }
    
    /**
     * Create referral relationship
     */
    public function create_referral_relationship($user_id, $referrer_id) {
        // Validate: user cannot refer themselves
        if ($user_id == $referrer_id) {
            return new WP_Error('self_referral', 'Cannot refer yourself', array('status' => 400));
        }
        
        // Validate: referrer must exist
        if (!get_userdata($referrer_id)) {
            return new WP_Error('invalid_referrer', 'Referrer does not exist', array('status' => 400));
        }
        
        // Validate: check for circular reference
        // If referrer is already in this user's downline, creating this relationship would create a cycle
        $is_circular = $this->would_create_circular_reference($user_id, $referrer_id);
        if ($is_circular) {
            return new WP_Error('circular_reference', 'Cannot create circular referral relationship', array('status' => 400));
        }
        
        // Validate: user cannot already have a referrer
        $existing_referrer = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT referrer_id FROM {$this->wpdb->prefix}clearmeds_referral_network WHERE user_id = %d LIMIT 1",
            $user_id
        ));
        
        if ($existing_referrer) {
            return new WP_Error('already_referred', 'User already has a referrer', array('status' => 400));
        }
        
        // Get referrer's path
        $referrer_path = $this->get_user_path($referrer_id);
        $level = $this->calculate_level($referrer_path);
        
        // Limit to 3 levels (but still allow joining at any level)
        // Level is informational; we don't reject based on it in MLM
        // This just tracks how deep the referrer is in the network
        
        $new_path = $referrer_path ? $referrer_path . '/' . $user_id : (string)$referrer_id . '/' . $user_id;
        
        $result = $this->wpdb->insert(
            $this->wpdb->prefix . 'clearmeds_referral_network',
            array(
                'user_id' => $user_id,
                'referrer_id' => $referrer_id,
                'level' => $level + 1,
                'path' => $new_path
            ),
            array('%d', '%d', '%d', '%s')
        );
        
        if ($result === false) {
            return new WP_Error('db_error', 'Failed to create referral relationship: ' . $this->wpdb->last_error, array('status' => 500));
        }
        
        return true;
    }
    
    /**
     * Check if creating a referral relationship would create a circular reference
     * Returns true if referrer_id is in user_id's downline
     */
    private function would_create_circular_reference($user_id, $referrer_id) {
        // Check if referrer is in user's downline (path contains referrer)
        // If user_id doesn't have a network yet, no circular reference is possible
        $user_path = $this->get_user_path($user_id);
        
        if (empty($user_path)) {
            return false; // No network yet, no circularity possible
        }
        
        // Check if referrer_id appears in user's path
        $path_ids = explode('/', $user_path);
        return in_array((string)$referrer_id, $path_ids, true);
    }
    
    /**
     * Get user's referral path
     */
    private function get_user_path($user_id) {
        $result = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT path FROM {$this->wpdb->prefix}clearmeds_referral_network WHERE user_id = %d ORDER BY level ASC LIMIT 1",
            $user_id
        ));
        
        return $result ? $result : '';
    }
    
    /**
     * Calculate level from path
     */
    private function calculate_level($path) {
        if (empty($path)) {
            return 0;
        }
        
        return count(explode('/', $path));
    }
    
    /**
     * Get referral network tree (3 levels)
     */
    public function get_network_tree($user_id) {
        $network = $this->build_network_tree($user_id, 1);
        return $network;
    }
    
    /**
     * Build network tree recursively
     */
    private function build_network_tree($user_id, $current_level, $max_level = 3) {
        if ($current_level > $max_level) {
            return null;
        }
        
        $user = get_userdata($user_id);
        $affiliate = $this->get_affiliate_data($user_id);
        
        // Get user stats
        $stats = $this->get_user_stats($user_id);
        
        $node = array(
            'id' => (string)$user_id,
            'name' => $user ? $user->display_name : 'Unknown',
            'initials' => $this->get_initials($user ? $user->display_name : ''),
            'earnings' => floatval($stats['total_earnings']),
            'referrals' => intval($stats['referral_count']),
            'level' => $current_level,
            'children' => array()
        );
        
        // Get direct referrals - find all users where this user is the referrer
        // Don't filter by level since level is absolute in the network, not relative to tree root
        $referrals = $this->wpdb->get_results($this->wpdb->prepare(
            "SELECT DISTINCT user_id FROM {$this->wpdb->prefix}clearmeds_referral_network 
             WHERE referrer_id = %d",
            $user_id
        ));
        
        // Check for query errors
        if ($this->wpdb->last_error) {
            error_log('Network tree query error: ' . $this->wpdb->last_error);
        }
        
        foreach ($referrals as $referral) {
            $child = $this->build_network_tree($referral->user_id, $current_level + 1, $max_level);
            if ($child) {
                $node['children'][] = $child;
            }
        }
        
        return $node;
    }
    
    /**
     * Get user stats
     */
    private function get_user_stats($user_id) {
        $referral_count = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network WHERE referrer_id = %d",
            $user_id
        ));
        
        // Include both pending and approved commissions in earnings
        // This shows total earnings including pending commissions
        $total_earnings = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COALESCE(SUM(commission_amount), 0) FROM {$this->wpdb->prefix}clearmeds_commissions 
             WHERE user_id = %d AND status IN ('pending', 'approved')",
            $user_id
        ));
        
        return array(
            'referral_count' => intval($referral_count),
            'total_earnings' => floatval($total_earnings ? $total_earnings : 0)
        );
    }
    
    /**
     * Get initials from name
     */
    private function get_initials($name) {
        $words = explode(' ', $name);
        $initials = '';
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }
        return substr($initials, 0, 3);
    }
    
    /**
     * Get affiliate data
     */
    private function get_affiliate_data($user_id) {
        return $this->wpdb->get_row($this->wpdb->prepare(
            "SELECT * FROM {$this->wpdb->prefix}clearmeds_affiliates WHERE user_id = %d",
            $user_id
        ));
    }
    
    /**
     * Get direct referrals list
     * Returns all users who were directly referred by the given user
     */
    public function get_direct_referrals($user_id, $search = '') {
        // Only get direct referrals (where referrer_id matches)
        // Don't filter by level since level is absolute in network, not relative
        $where = $this->wpdb->prepare("rn.referrer_id = %d", $user_id);
        
        if (!empty($search)) {
            $search_like = '%' . $this->wpdb->esc_like($search) . '%';
            $where .= $this->wpdb->prepare(" AND (u.display_name LIKE %s OR u.user_email LIKE %s)", $search_like, $search_like);
        }
        
        $results = $this->wpdb->get_results("
            SELECT 
                u.ID as id,
                u.display_name as name,
                u.user_email as email,
                a.affiliate_id,
                rn.created_at as join_date,
                (SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network WHERE referrer_id = u.ID) as referrals,
                (SELECT SUM(order_amount) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = u.ID AND status = 'approved') as sales,
                (SELECT SUM(commission_amount) FROM {$this->wpdb->prefix}clearmeds_commissions WHERE user_id = u.ID AND status = 'approved') as commission,
                a.status as status
            FROM {$this->wpdb->prefix}clearmeds_referral_network rn
            INNER JOIN {$this->wpdb->prefix}users u ON rn.user_id = u.ID
            LEFT JOIN {$this->wpdb->prefix}clearmeds_affiliates a ON u.ID = a.user_id
            WHERE $where
            ORDER BY rn.created_at DESC
        ");
        
        return $results;
    }
    
    /**
     * Get network statistics with percent changes
     */
    public function get_network_stats($user_id) {
        // Count all affiliates in the network (path starts with user_id/)
        $total_affiliates = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(DISTINCT user_id) FROM {$this->wpdb->prefix}clearmeds_referral_network 
             WHERE path LIKE %s OR path LIKE %s",
            $user_id . '/%',
            '%/' . $user_id . '/%'
        ));
        
        // Count direct referrals (where this user is the direct referrer)
        $direct_referrals = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network 
             WHERE referrer_id = %d",
            $user_id
        ));
        
        // Count indirect referrals (total - direct)
        $total_affiliates_int = intval($total_affiliates);
        $direct_referrals_int = intval($direct_referrals);
        $indirect_referrals = $total_affiliates_int - $direct_referrals_int;
        
        // Get network sales (from all affiliates in the network)
        $network_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(c.order_amount) 
             FROM {$this->wpdb->prefix}clearmeds_commissions c
             INNER JOIN {$this->wpdb->prefix}clearmeds_referral_network rn ON c.user_id = rn.user_id
             WHERE (rn.path LIKE %s OR rn.path LIKE %s) AND c.status = 'approved'",
            $user_id . '/%',
            '%/' . $user_id . '/%'
        ));
        
        // Period comparisons (30-60 days ago vs last 30 days)
        $current_start = date('Y-m-d', strtotime('-30 days'));
        $previous_start = date('Y-m-d', strtotime('-60 days'));
        $previous_end = date('Y-m-d', strtotime('-30 days'));
        
        // Previous period stats
        $prev_total = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(DISTINCT user_id) FROM {$this->wpdb->prefix}clearmeds_referral_network 
             WHERE (path LIKE %s OR path LIKE %s) AND created_at >= %s AND created_at < %s",
            $user_id . '/%',
            '%/' . $user_id . '/%',
            $previous_start,
            $previous_end
        ));
        
        $prev_direct = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->wpdb->prefix}clearmeds_referral_network 
             WHERE referrer_id = %d AND created_at >= %s AND created_at < %s",
            $user_id,
            $previous_start,
            $previous_end
        ));
        
        $prev_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(c.order_amount) 
             FROM {$this->wpdb->prefix}clearmeds_commissions c
             INNER JOIN {$this->wpdb->prefix}clearmeds_referral_network rn ON c.user_id = rn.user_id
             WHERE (rn.path LIKE %s OR rn.path LIKE %s) AND c.status = 'approved'
             AND c.created_at >= %s AND c.created_at < %s",
            $user_id . '/%',
            '%/' . $user_id . '/%',
            $previous_start,
            $previous_end
        ));
        
        $prev_indirect = max(0, intval($prev_total) - intval($prev_direct));
        
        return array(
            'totalAffiliates' => $total_affiliates_int,
            'directReferrals' => $direct_referrals_int,
            'indirectReferrals' => max(0, $indirect_referrals),
            'networkSales' => floatval($network_sales ? $network_sales : 0),
            'changes' => array(
                'totalAffiliates' => $this->calculate_percent_change($prev_total, $total_affiliates_int),
                'directReferrals' => $this->calculate_percent_change($prev_direct, $direct_referrals_int),
                'indirectReferrals' => $this->calculate_percent_change($prev_indirect, max(0, $indirect_referrals)),
                'networkSales' => $this->calculate_percent_change($prev_sales, $network_sales)
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
     * Get commission breakdown by referral level
     * Level 2 = Direct referrals (you referred them)
     * Level 3 = Indirect referrals (your referrals referred them)
     * Extended = All network combined
     */
    public function get_commission_breakdown($user_id) {
        $rates = ClearMeds_Utils::get_commission_rates();
        
        // Level 2 - Direct Referrals (where referrer_id = user_id)
        $direct_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(c.order_amount) 
             FROM {$this->wpdb->prefix}clearmeds_commissions c
             INNER JOIN {$this->wpdb->prefix}clearmeds_referral_network rn ON c.user_id = rn.user_id
             WHERE rn.referrer_id = %d AND c.status = 'approved'",
            $user_id
        ));
        
        $direct_earned = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(c.commission_amount) 
             FROM {$this->wpdb->prefix}clearmeds_commissions c
             INNER JOIN {$this->wpdb->prefix}clearmeds_referral_network rn ON c.user_id = rn.user_id
             WHERE rn.referrer_id = %d AND c.status = 'approved'",
            $user_id
        ));
        
        // Level 3 - Indirect Referrals (in network but NOT direct)
        $indirect_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(c.order_amount) 
             FROM {$this->wpdb->prefix}clearmeds_commissions c
             INNER JOIN {$this->wpdb->prefix}clearmeds_referral_network rn ON c.user_id = rn.user_id
             WHERE (rn.path LIKE %s OR rn.path LIKE %s) 
             AND rn.referrer_id != %d 
             AND c.status = 'approved'",
            $user_id . '/%',
            '%/' . $user_id . '/%',
            $user_id
        ));
        
        $indirect_earned = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(c.commission_amount) 
             FROM {$this->wpdb->prefix}clearmeds_commissions c
             INNER JOIN {$this->wpdb->prefix}clearmeds_referral_network rn ON c.user_id = rn.user_id
             WHERE (rn.path LIKE %s OR rn.path LIKE %s) 
             AND rn.referrer_id != %d 
             AND c.status = 'approved'",
            $user_id . '/%',
            '%/' . $user_id . '/%',
            $user_id
        ));
        
        // Extended network (all levels combined)
        $extended_sales = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(c.order_amount) 
             FROM {$this->wpdb->prefix}clearmeds_commissions c
             INNER JOIN {$this->wpdb->prefix}clearmeds_referral_network rn ON c.user_id = rn.user_id
             WHERE (rn.path LIKE %s OR rn.path LIKE %s) AND c.status = 'approved'",
            $user_id . '/%',
            '%/' . $user_id . '/%'
        ));
        
        $extended_earned = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT SUM(c.commission_amount) 
             FROM {$this->wpdb->prefix}clearmeds_commissions c
             INNER JOIN {$this->wpdb->prefix}clearmeds_referral_network rn ON c.user_id = rn.user_id
             WHERE (rn.path LIKE %s OR rn.path LIKE %s) AND c.status = 'approved'",
            $user_id . '/%',
            '%/' . $user_id . '/%'
        ));
        
        return array(
            'level2' => array(
                'commissionRate' => $rates['level1'],
                'totalSales' => floatval($direct_sales ? $direct_sales : 0),
                'earned' => floatval($direct_earned ? $direct_earned : 0)
            ),
            'level3' => array(
                'commissionRate' => $rates['level2'],
                'totalSales' => floatval($indirect_sales ? $indirect_sales : 0),
                'earned' => floatval($indirect_earned ? $indirect_earned : 0)
            ),
            'extended' => array(
                'commissionRate' => $rates['level1'],
                'totalSales' => floatval($extended_sales ? $extended_sales : 0),
                'earned' => floatval($extended_earned ? $extended_earned : 0)
            )
        );
    }
}

