<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://rushhealthc.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    // Log the request
    error_log('Reset password request received - Method: ' . $_SERVER['REQUEST_METHOD']);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    // Load configuration
    $configPath = $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    error_log('Looking for config at: ' . $configPath);
    
    if (!file_exists($configPath)) {
        throw new Exception("Config file not found at: " . $configPath);
    }
    
    $config = require_once $configPath;
    error_log('Config loaded successfully');

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    error_log('Raw input: ' . $jsonInput);
    
    if (empty($jsonInput)) {
        throw new Exception('No input data provided');
    }
    
    $input = json_decode($jsonInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }
    
    error_log('Parsed input: ' . print_r($input, true));
    
    if (!isset($input['token']) || !isset($input['password'])) {
        throw new Exception('Token and password are required');
    }
    
    $token = trim($input['token']);
    $password = $input['password'];
    
    error_log('Token: ' . substr($token, 0, 10) . '...');
    error_log('Password length: ' . strlen($password));
    
    if (empty($token) || empty($password)) {
        throw new Exception('Token and password cannot be empty');
    }
    
    if (strlen($password) < 8) {
        throw new Exception('Password must be at least 8 characters long');
    }
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        error_log('DB connection error: ' . $conn->connect_error);
        throw new Exception('Database connection failed');
    }
    
    error_log('Database connected successfully');
    
    // Verify reset token (simplified query)
    $stmt = $conn->prepare("SELECT email, expires_at FROM password_resets WHERE token = ?");
    if (!$stmt) {
        error_log('Query prep error: ' . $conn->error);
        throw new Exception('Query preparation failed');
    }
    
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    error_log('Token query executed, rows found: ' . $result->num_rows);
    
    if ($result->num_rows === 0) {
        error_log('No matching token found in database');
        throw new Exception('Invalid reset token - token not found');
    }
    
    $resetData = $result->fetch_assoc();
    $email = $resetData['email'];
    $expiresAt = $resetData['expires_at'];
    $currentTime = date('Y-m-d H:i:s');
    
    error_log('Token found for email: ' . $email);
    error_log('Token expires at: ' . $expiresAt);
    error_log('Current time: ' . $currentTime);
    
    // Check if token is expired
    if (strtotime($expiresAt) <= strtotime($currentTime)) {
        error_log('Token is expired');
        throw new Exception('Reset token has expired');
    }
    
    // Hash the new password - ensure no whitespace in the hash
    $hashedPassword = trim(password_hash($password, PASSWORD_DEFAULT));
    error_log('Password hashed successfully');
    
    // Update user password
    $updateStmt = $conn->prepare("UPDATE admin_users SET password = ? WHERE email = ?");
    if (!$updateStmt) {
        error_log('Update query prep error: ' . $conn->error);
        throw new Exception('Update query preparation failed');
    }
    
    $updateStmt->bind_param("ss", $hashedPassword, $email);
    $updateStmt->execute();
    
    error_log('Update query executed, affected rows: ' . $updateStmt->affected_rows);
    
    if ($updateStmt->affected_rows === 0) {
        error_log('No rows affected - user might not exist');
        throw new Exception('Failed to update password - user not found');
    }
    
    // Delete the used reset token
    $deleteStmt = $conn->prepare("DELETE FROM password_resets WHERE token = ?");
    $deleteStmt->bind_param("s", $token);
    $deleteStmt->execute();
    
    error_log('Token deleted, affected rows: ' . $deleteStmt->affected_rows);
    
    // Log the password change
    error_log("Password reset successful for email: " . $email);
    
    echo json_encode([
        'success' => true,
        'message' => 'Password has been reset successfully'
    ]);
    
    $stmt->close();
    $updateStmt->close();
    $deleteStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log('Reset password error: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>