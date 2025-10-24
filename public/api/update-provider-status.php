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

// Check authentication - using user_id instead of admin_logged_in
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    $input = json_decode($jsonInput, true);
    
    if (!isset($input['provider_id']) || !isset($input['status'])) {
        throw new Exception('Provider ID and status are required');
    }
    
    $providerId = (int)$input['provider_id'];
    $status = trim($input['status']);
    
    // Validate status
    $validStatuses = ['pending', 'active', 'suspended', 'inactive'];
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
    
    // Update provider status
    $stmt = $conn->prepare("UPDATE provider_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->bind_param("si", $status, $providerId);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        throw new Exception('Provider not found or status unchanged');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Provider status updated successfully'
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