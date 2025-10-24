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

// Start session with secure settings
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Check authentication and super admin role
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id']) || $_SESSION['role'] !== 'super_admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Super admin access required']);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    $input = json_decode($jsonInput, true);
    
    if (!isset($input['user_id']) || !isset($input['status'])) {
        throw new Exception('User ID and status are required');
    }
    
    $userId = (int)$input['user_id'];
    $status = trim($input['status']);
    
    // Validate status
    $validStatuses = ['active', 'inactive'];
    if (!in_array($status, $validStatuses)) {
        throw new Exception('Invalid status');
    }
    
    // Load configuration
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Update user status
    $stmt = $conn->prepare("UPDATE admin_users SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $userId);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        throw new Exception('User not found or status unchanged');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'User status updated successfully'
    ]);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>