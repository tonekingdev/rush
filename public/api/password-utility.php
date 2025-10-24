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
    
    $action = $input['action'] ?? '';
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    switch ($action) {
        case 'check_password':
            if (!isset($input['email']) || !isset($input['password'])) {
                throw new Exception('Email and password are required');
            }
            
            $email = $input['email'];
            $password = $input['password'];
            
            // Get user data
            $stmt = $conn->prepare("SELECT id, username, email, password FROM admin_users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                throw new Exception('User not found');
            }
            
            $user = $result->fetch_assoc();
            $storedHash = $user['password'];
            
            // Test password verification
            $isValid = password_verify($password, $storedHash);
            
            // Generate new hash for comparison
            $newHash = password_hash($password, PASSWORD_DEFAULT);
            
            echo json_encode([
                'success' => true,
                'user_id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'stored_hash' => $storedHash,
                'stored_hash_length' => strlen($storedHash),
                'password_verify_result' => $isValid,
                'new_hash_example' => $newHash,
                'password_info' => password_get_info($storedHash),
                'test_password' => $password,
                'test_password_length' => strlen($password)
            ]);
            break;
            
        case 'update_password':
            if (!isset($input['email']) || !isset($input['new_password'])) {
                throw new Exception('Email and new_password are required');
            }
            
            $email = $input['email'];
            $newPassword = $input['new_password'];
            
            // Hash the new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            // Update the password
            $stmt = $conn->prepare("UPDATE admin_users SET password = ? WHERE email = ?");
            $stmt->bind_param("ss", $hashedPassword, $email);
            $stmt->execute();
            
            if ($stmt->affected_rows === 0) {
                throw new Exception('Failed to update password - user not found');
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Password updated successfully',
                'email' => $email,
                'new_hash' => $hashedPassword
            ]);
            break;
            
        case 'list_users':
            // List all admin users (without passwords)
            $stmt = $conn->query("SELECT id, username, email, role, status, created_at, last_login FROM admin_users");
            $users = [];
            
            while ($row = $stmt->fetch_assoc()) {
                $users[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'users' => $users
            ]);
            break;
            
        default:
            throw new Exception('Invalid action. Use: check_password, update_password, or list_users');
    }
    
    $conn->close();
    
} catch (Exception $e) {
    error_log('Password utility error: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>