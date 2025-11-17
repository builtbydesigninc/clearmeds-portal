<?php
/**
 * Admin settings page view
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1>ClearMeds Portal Settings</h1>
    
    <form method="post" action="options.php">
        <?php settings_fields('clearmeds_settings'); ?>
        
        <h2>Commission Rates</h2>
        <table class="form-table">
            <tr>
                <th scope="row">Level 1 Commission</th>
                <td>
                    <input type="number" name="clearmeds_commission_rates[level1]" 
                           value="<?php echo esc_attr(get_option('clearmeds_commission_rates')['level1'] ?? 15); ?>" 
                           step="0.1" min="0" max="100" /> %
                </td>
            </tr>
            <tr>
                <th scope="row">Level 2 Commission</th>
                <td>
                    <input type="number" name="clearmeds_commission_rates[level2]" 
                           value="<?php echo esc_attr(get_option('clearmeds_commission_rates')['level2'] ?? 10); ?>" 
                           step="0.1" min="0" max="100" /> %
                </td>
            </tr>
            <tr>
                <th scope="row">Level 3 Commission</th>
                <td>
                    <input type="number" name="clearmeds_commission_rates[level3]" 
                           value="<?php echo esc_attr(get_option('clearmeds_commission_rates')['level3'] ?? 5); ?>" 
                           step="0.1" min="0" max="100" /> %
                </td>
            </tr>
        </table>
        
        <h2>Payout Settings</h2>
        <table class="form-table">
            <tr>
                <th scope="row">Frequency</th>
                <td>
                    <select name="clearmeds_payout_settings[frequency]">
                        <option value="weekly" <?php selected(get_option('clearmeds_payout_settings')['frequency'] ?? 'biweekly', 'weekly'); ?>>Weekly</option>
                        <option value="biweekly" <?php selected(get_option('clearmeds_payout_settings')['frequency'] ?? 'biweekly', 'biweekly'); ?>>Bi-weekly</option>
                        <option value="monthly" <?php selected(get_option('clearmeds_payout_settings')['frequency'] ?? 'biweekly', 'monthly'); ?>>Monthly</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th scope="row">Minimum Threshold</th>
                <td>
                    <input type="number" name="clearmeds_payout_settings[minimum_threshold]" 
                           value="<?php echo esc_attr(get_option('clearmeds_payout_settings')['minimum_threshold'] ?? 50); ?>" 
                           step="0.01" min="0" /> $
                </td>
            </tr>
        </table>
        
        <h2>Debug Settings</h2>
        <table class="form-table">
            <tr>
                <th scope="row">Debug Mode</th>
                <td>
                    <label>
                        <input type="checkbox" name="clearmeds_debug_mode" value="1" 
                               <?php checked(get_option('clearmeds_debug_mode'), '1'); ?> />
                        Enable debug mode (logs API requests and responses)
                    </label>
                    <p class="description">When enabled, detailed debug information will be logged to help troubleshoot API issues.</p>
                </td>
            </tr>
        </table>
        
        <?php submit_button(); ?>
    </form>
</div>

