<?php
// Set proper headers for production
header('Content-Type: application/json');

// Load configuration and utilities
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/security.php';

// Include email functionality
require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/email.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/email-templates.php';

// Use the actual domain in production
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session with secure settings
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1); // Requires HTTPS
ini_set('session.use_only_cookies', 1);
session_start();

// Check if session is expired
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
    // Clear session and return unauthorized
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Session expired']);
    exit();
}

// Update session activity timestamp
$_SESSION['last_activity'] = time();

// Check if user is authenticated as admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Database connection
try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    
    // Log the actual error securely
    if (function_exists('log_error')) {
        log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
    }
    exit();
}

// Define the send_password_reset_email function if it doesn't exist
if (!function_exists('send_password_reset_email')) {
    /**
     * Send a password reset email
     * 
     * @param string $email User email
     * @param string $resetToken Reset token
     * @param string $username Username
     * @return array Result with success status and message
     */
    function send_password_reset_email($email, $resetToken, $username) {
        global $config;
        
        // Base URL for the application
        $appUrl = isset($config['APP_URL']) ? $config['APP_URL'] : 
                 (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
        
        $resetUrl = $appUrl . '/admin/reset-password.php?token=' . urlencode($resetToken) . '&email=' . urlencode($email);
        
        $subject = 'Password Reset Request - RUSH Healthcare';
        
        // Get the password reset email template
        $template = get_application_status_template();
        
        // Process the template with the required replacements
        $body = process_email_template($template, [
            '{APPLICANT_NAME}' => $username,
            '{APPLICATION_STATUS}' => 'Password Reset Requested',
            '{STATUS_DETAILS}' => '
                <p>We received a request to reset your password for your RUSH Healthcare admin account.</p>
                <p>To reset your password, please click the button below:</p>
                <p style="text-align: center;">
                    <a href="' . $resetUrl . '" style="display: inline-block; padding: 10px 20px; background-color: #1586D6; color: #ffffff; text-decoration: none; border-radius: 4px;">Reset Password</a>
                </p>
                <p>If you did not request a password reset, please ignore this email or contact the administrator.</p>
                <p>This link will expire in 24 hours.</p>
            '
        ]);
        
        // Send the email
        return send_email($email, $subject, $body);
    }
}

// Generate a secure token
if (!function_exists('generate_token')) {
    function generate_token($length = 32) {
        return bin2hex(random_bytes($length / 2));
    }
}

// Validate password strength
if (!function_exists('validate_password_strength')) {
    function validate_password_strength($password) {
        // Password must be at least 8 characters
        if (strlen($password) < 8) {
            return [
                'valid' => false,
                'message' => 'Password must be at least 8 characters long'
            ];
        }
        
        // Password must contain at least one uppercase letter
        if (!preg_match('/[A-Z]/', $password)) {
            return [
                'valid' => false,
                'message' => 'Password must contain at least one uppercase letter'
            ];
        }
        
        // Password must contain at least one lowercase letter
        if (!preg_match('/[a-z]/', $password)) {
            return [
                'valid' => false,
                'message' => 'Password must contain at least one lowercase letter'
            ];
        }
        
        // Password must contain at least one number
        if (!preg_match('/[0-9]/', $password)) {
            return [
                'valid' => false,
                'message' => 'Password must contain at least one number'
            ];
        }
        
        // Password must contain at least one special character
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            return [
                'valid' => false,
                'message' => 'Password must contain at least one special character'
            ];
        }
        
        return [
            'valid' => true,
            'message' => 'Password meets all requirements'
        ];
    }
}

// Check if session is expired
if (!function_exists('is_session_expired')) {
    function is_session_expired() {
        return isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800);
    }
}

// Update session activity timestamp
if (!function_exists('update_session_activity')) {
    function update_session_activity() {
        $_SESSION['last_activity'] = time();
    }
}

// Request to initiate password reset
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'reset-password') {
    try {
        // Only super_admin can reset passwords for others
        if ($_SESSION['admin_role'] !== 'super_admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            exit();
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['email']) || empty($data['email'])) {
            throw new Exception("Email is required");
        }
        
        $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
        
        if (!$email) {
            throw new Exception("Invalid email format");
        }
        
        // Check if user exists
        $stmt = $conn->prepare("SELECT id, username FROM admin_users WHERE email = ? AND status = 'active'");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            // Don't reveal if email exists or not for security
            echo json_encode([
                'success' => true,
                'message' => 'If the email exists, a password reset link will be sent'
            ]);
            exit();
        }
        
        $user = $result->fetch_assoc();
        $userId = $user['id'];
        $username = $user['username'];
        
        // Generate reset token
        $resetToken = generate_token();
        $tokenExpiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Store reset token in database
        $stmt = $conn->prepare("UPDATE admin_users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?");
        $stmt->bind_param("ssi", $resetToken, $tokenExpiry, $userId);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to generate reset token");
        }
        
        // Send password reset email
        $emailResult = send_password_reset_email($email, $resetToken, $username);
        
        if (!$emailResult['success']) {
            throw new Exception("Failed to send password reset email: " . $emailResult['message']);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Password reset email sent successfully'
        ]);
        
        // Log the action
        if (function_exists('log_error')) {
            log_error([
                'action' => 'password_reset_request',
                'initiated_by' => $_SESSION['admin_username'],
                'for_user' => $username,
                'user_id' => $userId
            ]);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Request to verify password reset token
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'verify-token') {
    try {
        if (!isset($_GET['token']) || empty($_GET['token']) || !isset($_GET['email']) || empty($_GET['email'])) {
            throw new Exception("Token and email are required");
        }
        
        $token = $_GET['token'];
        $email = filter_var($_GET['email'], FILTER_VALIDATE_EMAIL);
        
        if (!$email) {
            throw new Exception("Invalid email format");
        }
        
        // Check if token is valid
        $stmt = $conn->prepare("SELECT id FROM admin_users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW() AND status = 'active'");
        $stmt->bind_param("ss", $email, $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Invalid or expired token");
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Token is valid'
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Request to complete password reset
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'complete-reset') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['token']) || empty($data['token']) || 
            !isset($data['email']) || empty($data['email']) || 
            !isset($data['password']) || empty($data['password'])) {
            throw new Exception("Token, email, and password are required");
        }
        
        $token = $data['token'];
        $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
        $password = $data['password'];
        
        if (!$email) {
            throw new Exception("Invalid email format");
        }
        
        // Validate password strength
        $passwordValidation = validate_password_strength($password);
        
        if (!$passwordValidation['valid']) {
            throw new Exception($passwordValidation['message']);
        }
        
        // Check if token is valid
        $stmt = $conn->prepare("SELECT id, username FROM admin_users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW() AND status = 'active'");
        $stmt->bind_param("ss", $email, $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Invalid or expired token");
        }
        
        $user = $result->fetch_assoc();
        $userId = $user['id'];
        
        // Update password and clear token
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE admin_users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?");
        $stmt->bind_param("si", $hashedPassword, $userId);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update password");
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Password has been reset successfully'
        ]);
        
        // Log the action
        if (function_exists('log_error')) {
            log_error([
                'action' => 'password_reset_completed',
                'user_id' => $userId,
                'username' => $user['username']
            ]);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Request to change own password
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'change-password') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['current_password']) || empty($data['current_password']) || 
            !isset($data['new_password']) || empty($data['new_password'])) {
            throw new Exception("Current password and new password are required");
        }
        
        $currentPassword = $data['current_password'];
        $newPassword = $data['new_password'];
        $userId = $_SESSION['admin_id'];
        
        // Validate password strength
        $passwordValidation = validate_password_strength($newPassword);
        
        if (!$passwordValidation['valid']) {
            throw new Exception($passwordValidation['message']);
        }
        
        // Verify current password
        $stmt = $conn->prepare("SELECT password FROM admin_users WHERE id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("User not found");
        }
        
        $user = $result->fetch_assoc();
        
        if (!password_verify($currentPassword, $user['password'])) {
            throw new Exception("Current password is incorrect");
        }
        
        // Update password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE admin_users SET password = ? WHERE id = ?");
        $stmt->bind_param("si", $hashedPassword, $userId);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update password");
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Password has been changed successfully'
        ]);
        
        // Log the action
        if (function_exists('log_error')) {
            log_error([
                'action' => 'password_change',
                'user_id' => $userId,
                'username' => $_SESSION['admin_username']
            ]);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Request to get user activity logs
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'activity-logs') {
    try {
        // Only super_admin can view activity logs
        if ($_SESSION['admin_role'] !== 'super_admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            exit();
        }
        
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
        
        // Limit the maximum number of records
        $limit = min($limit, 100);
        
        // Build query based on filters
        $query = "SELECT al.*, au.username FROM activity_logs al 
                  LEFT JOIN admin_users au ON al.user_id = au.id 
                  WHERE 1=1";
        $params = [];
        $types = "";
        
        if ($userId) {
            $query .= " AND al.user_id = ?";
            $params[] = $userId;
            $types .= "i";
        }
        
        $query .= " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= "ii";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        
        // Get total count for pagination
        $countQuery = "SELECT COUNT(*) as total FROM activity_logs WHERE 1=1";
        $countParams = [];
        $countTypes = "";
        
        if ($userId) {
            $countQuery .= " AND user_id = ?";
            $countParams[] = $userId;
            $countTypes .= "i";
        }
        
        $countStmt = $conn->prepare($countQuery);
        
        if (!empty($countParams)) {
            $countStmt->bind_param($countTypes, ...$countParams);
        }
        
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
        
        echo json_encode([
            'success' => true,
            'logs' => $logs,
            'total' => $totalCount,
            'limit' => $limit,
            'offset' => $offset
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error']);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
