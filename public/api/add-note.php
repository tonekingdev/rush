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

// Handle POST request to add a note
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $applicationId = $data['applicationId'] ?? 0;
    $content = $data['content'] ?? '';
    
    if (!$applicationId || !$content) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    
    try {
        $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        // Add note
        $sql = "INSERT INTO notes (application_id, content, created_by) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $createdBy = $_SESSION['admin_username'];
        $stmt->bind_param("iss", $applicationId, $content, $createdBy);
        
        if (!$stmt->execute()) {
            throw new Exception("Error adding note: " . $stmt->error);
        }
        
        $noteId = $conn->insert_id;
        
        // Get the newly created note
        $sql = "SELECT * FROM notes WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $noteId);
        $stmt->execute();
        $result = $stmt->get_result();
        $note = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Note added successfully',
            'note' => $note
        ]);
        
    } catch (Exception $e) {
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
