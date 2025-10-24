<?php
/**
 * Security functions for Rush Healthcare Admin
 */

/**
 * Generate a secure random token
 * 
 * @param int $length Length of the token
 * @return string The generated token
 */
function generate_token($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Encrypt sensitive data
 * 
 * @param string $data Data to encrypt
 * @param string $key Optional encryption key (uses config key if not provided)
 * @return string Encrypted data
 */
function encrypt_data($data, $key = null) {
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    $key = $key ?? $config['ENCRYPTION_KEY'];
    
    $ivlen = openssl_cipher_iv_length($cipher = 'AES-256-CBC');
    $iv = openssl_random_pseudo_bytes($ivlen);
    $encrypted = openssl_encrypt($data, $cipher, $key, 0, $iv);
    
    return base64_encode($iv . $encrypted);
}

/**
 * Decrypt sensitive data
 * 
 * @param string $data Encrypted data
 * @param string $key Optional encryption key (uses config key if not provided)
 * @return string|false Decrypted data or false on failure
 */
function decrypt_data($data, $key = null) {
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    $key = $key ?? $config['ENCRYPTION_KEY'];
    
    $data = base64_decode($data);
    $ivlen = openssl_cipher_iv_length($cipher = 'AES-256-CBC');
    $iv = substr($data, 0, $ivlen);
    $encrypted = substr($data, $ivlen);
    
    return openssl_decrypt($encrypted, $cipher, $key, 0, $iv);
}

/**
 * Validate password strength
 * 
 * @param string $password Password to validate
 * @return array Array with 'valid' boolean and 'message' string
 */
function validate_password_strength($password) {
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    $errors = [];
    
    // Check minimum length
    if (strlen($password) < $config['PASSWORD_MIN_LENGTH']) {
        $errors[] = "Password must be at least {$config['PASSWORD_MIN_LENGTH']} characters long";
    }
    
    // Check for uppercase letter
    if ($config['PASSWORD_REQUIRE_UPPERCASE'] && !preg_match('/[A-Z]/', $password)) {
        $errors[] = "Password must contain at least one uppercase letter";
    }
    
    // Check for number
    if ($config['PASSWORD_REQUIRE_NUMBER'] && !preg_match('/[0-9]/', $password)) {
        $errors[] = "Password must contain at least one number";
    }
    
    // Check for special character
    if ($config['PASSWORD_REQUIRE_SPECIAL'] && !preg_match('/[^a-zA-Z0-9]/', $password)) {
        $errors[] = "Password must contain at least one special character";
    }
    
    return [
        'valid' => empty($errors),
        'message' => empty($errors) ? 'Password is valid' : implode('. ', $errors)
    ];
}

/**
 * Sanitize user input
 * 
 * @param string $input Input to sanitize
 * @return string Sanitized input
 */
function sanitize_input($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Check if current user has required role
 * 
 * @param string|array $requiredRoles Required role(s)
 * @return bool True if user has required role
 */
function has_role($requiredRoles) {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        return false;
    }
    
    $userRole = $_SESSION['admin_role'] ?? '';
    
    if (empty($userRole)) {
        return false;
    }
    
    if (is_array($requiredRoles)) {
        return in_array($userRole, $requiredRoles);
    }
    
    return $userRole === $requiredRoles;
}

/**
 * Verify CSRF token
 * 
 * @param string $token Token to verify
 * @return bool True if token is valid
 */
function verify_csrf_token($token) {
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Generate CSRF token
 * 
 * @return string Generated token
 */
function generate_csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = generate_token();
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Check if session is expired
 * 
 * @return bool True if session is expired
 */
function is_session_expired() {
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    if (!isset($_SESSION['last_activity'])) {
        return true;
    }
    
    $inactive = time() - $_SESSION['last_activity'];
    
    return $inactive >= $config['SESSION_TIMEOUT'];
}

/**
 * Update session activity timestamp
 */
function update_session_activity() {
    $_SESSION['last_activity'] = time();
}