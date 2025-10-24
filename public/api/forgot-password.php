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
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    // Load configuration
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    if (empty($jsonInput)) {
        throw new Exception('No input data provided');
    }
    
    $input = json_decode($jsonInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON');
    }
    
    if (!isset($input['email'])) {
        throw new Exception('Email is required');
    }
    
    $email = trim($input['email']);
    
    if (empty($email)) {
        throw new Exception('Email cannot be empty');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Clean up expired tokens first
    $cleanupStmt = $conn->prepare("DELETE FROM password_resets WHERE expires_at < NOW()");
    $cleanupStmt->execute();
    $cleanupStmt->close();
    error_log('Cleaned up expired tokens');
    
    // Check if user exists
    $stmt = $conn->prepare("SELECT id, email, username FROM admin_users WHERE email = ? AND status = 'active'");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Don't reveal if email exists or not for security
        echo json_encode([
            'success' => true,
            'message' => 'If an account with that email exists, password reset instructions have been sent.'
        ]);
        exit();
    }
    
    $user = $result->fetch_assoc();
    
    // Generate reset token
    $token = bin2hex(random_bytes(32));
    
    // Set expiration to 24 hours from now (much more reasonable)
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    error_log('Generated token for email: ' . $email);
    error_log('Token expires at: ' . $expires);
    error_log('Current time: ' . date('Y-m-d H:i:s'));
    
    // Store reset token in database (replace any existing token for this email)
    $stmt = $conn->prepare("INSERT INTO password_resets (email, token, expires_at, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = NOW()");
    $stmt->bind_param("sss", $email, $token, $expires);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        throw new Exception('Failed to store reset token');
    }
    
    error_log('Token stored successfully in database');
    
    // Create reset URL
    $resetUrl = $config['APP_URL'] . '/admin/reset-password?token=' . $token;
    
    // Send email
    $subject = 'Password Reset Request - ' . $config['APP_NAME'];
    $message = "
    <html>
    <head>
        <title>Password Reset Request</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #1586D6;'>Password Reset Request</h2>
            <p>Hello {$user['username']},</p>
            <p>You have requested to reset your password for your {$config['APP_NAME']} admin account.</p>
            <p>Click the button below to reset your password:</p>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{$resetUrl}' style='background-color: #1586D6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style='word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;'>{$resetUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
            <p style='font-size: 12px; color: #666;'>
                This email was sent from {$config['APP_NAME']}<br>
                If you have any questions, please contact us at {$config['SUPPORT_EMAIL']}
            </p>
        </div>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: " . $config['SMTP_FROM_NAME'] . " <" . $config['SMTP_USER'] . ">" . "\r\n";
    
    // Send email
    if (mail($email, $subject, $message, $headers)) {
        echo json_encode([
            'success' => true,
            'message' => 'Password reset instructions have been sent to your email address.'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log('Forgot password error: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>