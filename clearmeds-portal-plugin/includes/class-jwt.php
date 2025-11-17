<?php
/**
 * JWT Authentication class
 * Handles JWT token generation and validation
 */

if (!defined('ABSPATH')) {
    exit;
}

class ClearMeds_JWT {
    
    /**
     * Get JWT secret key
     */
    private static function get_secret() {
        $secret = get_option('clearmeds_jwt_secret');
        if (!$secret) {
            // Generate a secure random secret
            $secret = bin2hex(random_bytes(32));
            update_option('clearmeds_jwt_secret', $secret);
        }
        return $secret;
    }
    
    /**
     * Base64 URL encode
     */
    private static function base64url_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private static function base64url_decode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * Generate JWT token
     */
    public static function generate_token($user_id, $email, $role = 'affiliate') {
        $header = array(
            'typ' => 'JWT',
            'alg' => 'HS256'
        );
        
        $now = time();
        $exp = $now + (7 * 24 * 60 * 60); // 7 days expiration
        
        $payload = array(
            'user_id' => $user_id,
            'email' => $email,
            'role' => $role,
            'iat' => $now,
            'exp' => $exp
        );
        
        $secret = self::get_secret();
        
        $header_encoded = self::base64url_encode(json_encode($header));
        $payload_encoded = self::base64url_encode(json_encode($payload));
        
        $signature = hash_hmac('sha256', $header_encoded . '.' . $payload_encoded, $secret, true);
        $signature_encoded = self::base64url_encode($signature);
        
        return $header_encoded . '.' . $payload_encoded . '.' . $signature_encoded;
    }
    
    /**
     * Verify and decode JWT token
     */
    public static function verify_token($token) {
        if (empty($token)) {
            return false;
        }
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header_encoded, $payload_encoded, $signature_encoded) = $parts;
        
        $secret = self::get_secret();
        
        // Verify signature
        $signature = self::base64url_decode($signature_encoded);
        $expected_signature = hash_hmac('sha256', $header_encoded . '.' . $payload_encoded, $secret, true);
        
        if (!hash_equals($signature, $expected_signature)) {
            return false;
        }
        
        // Decode payload
        $payload = json_decode(self::base64url_decode($payload_encoded), true);
        
        if (!$payload) {
            return false;
        }
        
        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Get user ID from token
     */
    public static function get_user_id_from_token($token) {
        $payload = self::verify_token($token);
        if ($payload && isset($payload['user_id'])) {
            return intval($payload['user_id']);
        }
        return false;
    }
    
    /**
     * Extract token from Authorization header
     */
    public static function extract_token_from_header($request) {
        $auth_header = $request->get_header('Authorization');
        
        if (empty($auth_header)) {
            return null;
        }
        
        // Check for "Bearer " prefix
        if (strpos($auth_header, 'Bearer ') === 0) {
            return substr($auth_header, 7);
        }
        
        return $auth_header;
    }
}

