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

// Start session
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Debug session information
error_log('Send-completion-link Session ID: ' . session_id());
error_log('Send-completion-link Session name: ' . session_name());
error_log('Send-completion-link Session data: ' . print_r($_SESSION, true));

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    // Check if user is authenticated and is admin (any admin role)
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        error_log('Session user_id not set. Full session: ' . print_r($_SESSION, true));
        throw new Exception('Unauthorized access - Session user_id not set');
    }

    // Load configuration
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

    // Connect to database to verify admin status
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }

    // Verify user is an admin (any admin role)
    $stmt = $conn->prepare("SELECT id, username, role FROM admin_users WHERE id = ? AND status = 'active'");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        error_log('Admin account not found for user_id: ' . $_SESSION['user_id']);
        throw new Exception('Unauthorized access - admin account not found');
    }

    $adminUser = $result->fetch_assoc();
    $adminId = $adminUser['id'];
    $adminUsername = $adminUser['username'];
    $adminRole = $adminUser['role'];

    // Check if user has admin role (admin or super_admin)
    if (!in_array($adminRole, ['admin', 'super_admin'])) {
        error_log('Insufficient privileges for user: ' . $adminUsername . ' with role: ' . $adminRole);
        throw new Exception('Unauthorized access - insufficient privileges');
    }

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    if (empty($jsonInput)) {
        throw new Exception('No input data provided');
    }
    
    $input = json_decode($jsonInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }
    
    // Validate required fields
    $requiredFields = ['provider_id', 'application_id', 'provider_email', 'missing_fields'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }
    
    $providerId = $input['provider_id'];
    $applicationId = (int)$input['application_id'];
    $providerEmail = trim($input['provider_email']);
    $missingFields = $input['missing_fields'];
    
    // Validate email format
    if (!filter_var($providerEmail, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Validate missing fields is an array
    if (!is_array($missingFields) || empty($missingFields)) {
        throw new Exception('Missing fields must be a non-empty array');
    }
    
    // Verify the provider and application exist
    $stmt = $conn->prepare("SELECT full_name, email FROM provider_applications WHERE id = ?");
    $stmt->bind_param("i", $applicationId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Provider application not found');
    }
    
    $provider = $result->fetch_assoc();
    $providerName = $provider['full_name'];
    
    // Clean up expired tokens first
    $cleanupStmt = $conn->prepare("DELETE FROM provider_completion_tokens WHERE expires_at < NOW()");
    $cleanupStmt->execute();
    $cleanupStmt->close();
    
    // Check if there's already an active token for this provider
    $checkStmt = $conn->prepare("SELECT id FROM provider_completion_tokens 
                                WHERE provider_id = ? AND used_at IS NULL AND expires_at > NOW()");
    $checkStmt->bind_param("s", $providerId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception('An active completion link already exists for this provider. Please wait for it to expire before sending a new one.');
    }
    
    // Generate secure token
    $token = bin2hex(random_bytes(32));
    
    // Set expiration to 72 hours from now
    $expires = date('Y-m-d H:i:s', strtotime('+72 hours'));
    
    // Store token in database
    $stmt = $conn->prepare("INSERT INTO provider_completion_tokens 
                           (token, provider_id, application_id, provider_email, missing_fields, admin_id, admin_username, expires_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $missingFieldsJson = json_encode($missingFields);
    $stmt->bind_param("ssississ", $token, $providerId, $applicationId, $providerEmail, $missingFieldsJson, $adminId, $adminUsername, $expires);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        throw new Exception('Failed to create completion token');
    }
    
    // Create completion URL
    $completionUrl = "https://rushhealthc.com/complete-application?token=" . $token;
    
    // Prepare missing fields list for email
    $missingFieldsList = '';
    foreach ($missingFields as $field) {
        $fieldName = ucwords(str_replace('_', ' ', $field));
        $missingFieldsList .= "<li>{$fieldName}</li>";
    }
    
    // Send email
    $subject = 'Complete Your Provider Application - RUSH Healthcare';
    $message = "
    <html>
    <head>
        <title>Complete Your Provider Application</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #1586D6;'>Complete Your Provider Application</h2>
            <p>Dear {$providerName},</p>
            <p>We have reviewed your provider application and noticed that some information is missing or incomplete. To proceed with your application, please complete the following:</p>
            
            <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                <h3 style='color: #dc3545; margin-top: 0;'>Missing Information:</h3>
                <ul style='margin-bottom: 0;'>
                    {$missingFieldsList}
                </ul>
            </div>
            
            <p>Please click the button below to complete your application:</p>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{$completionUrl}' style='background-color: #1586D6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>Complete Application</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style='word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;'>{$completionUrl}</p>
            
            <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                <p style='margin: 0; color: #856404;'><strong>Important:</strong></p>
                <ul style='margin: 5px 0 0 0; color: #856404;'>
                    <li>This link will expire in 72 hours</li>
                    <li>You can only use this link once</li>
                    <li>If you need assistance, please contact our support team</li>
                </ul>
            </div>
            
            <p>If you did not expect this email or have any questions, please contact us immediately.</p>
            
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
            <p style='font-size: 12px; color: #666;'>
                This email was sent from RUSH Healthcare<br>
                If you have any questions, please contact us at support@rushhealthc.com<br>
                Request sent by: {$adminUsername} ({$adminRole})
            </p>
        </div>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: RUSH Healthcare <noreply@rushhealthc.com>" . "\r\n";
    
    // Send email
    if (mail($providerEmail, $subject, $message, $headers)) {
        echo json_encode([
            'success' => true,
            'message' => 'Completion link sent successfully to ' . $providerEmail,
            'expires_at' => $expires,
            'missing_fields' => $missingFields,
            'sent_by' => $adminUsername . ' (' . $adminRole . ')'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log('Send completion link error: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>