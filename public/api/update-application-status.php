<?php
// Set proper headers for production
header('Content-Type: application/json');

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// Use the actual domain in production
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
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

// Check authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Handle POST request to update application status
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $applicationId = $data['applicationId'] ?? 0;
    $status = $data['status'] ?? '';
    $note = $data['note'] ?? '';
    
    if (!$applicationId || !$status) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    
    try {
        $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        // Update application status
        $sql = "UPDATE applications SET status = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $status, $applicationId);
        
        if (!$stmt->execute()) {
            throw new Exception("Error updating application: " . $stmt->error);
        }
        
        // Add note if provided
        if ($note) {
            $sql = "INSERT INTO notes (application_id, content, created_by) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $createdBy = $_SESSION['admin_username'];
            $stmt->bind_param("iss", $applicationId, $note, $createdBy);
            
            if (!$stmt->execute()) {
                throw new Exception("Error adding note: " . $stmt->error);
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Application status updated successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn)) {
            $conn->rollback();
        }
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error',
            'error' => $e->getMessage()
        ]);
    } finally {
        if (isset($conn)) {
            $conn->close();
        }
    }
    
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);