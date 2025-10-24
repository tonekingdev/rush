<?php
// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

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

// Get document ID
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Document ID is required']);
    exit();
}

$documentId = intval($_GET['id']);

// Database connection
try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    exit();
}

try {
    // Get document info
    $stmt = $conn->prepare("SELECT filename, original_name, mime_type FROM documents WHERE id = ?");
    $stmt->bind_param("i", $documentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Document not found']);
        exit();
    }
    
    $document = $result->fetch_assoc();
    $filename = $document['filename'];
    $originalName = $document['original_name'];
    $mimeType = $document['mime_type'];
    
    // Check if file exists
    $filePath = $_SERVER['DOCUMENT_ROOT'] . '/uploads/documents/' . $filename;
    
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
        exit();
    }
    
    // Set headers for file download
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . $originalName . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    
    // Output file
    readfile($filePath);
    
    // Log the download
    if (function_exists('log_error')) {
        log_error([
            'action' => 'document_download',
            'document_id' => $documentId,
            'filename' => $originalName,
            'downloaded_by' => $_SESSION['admin_username']
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to download document']);
    
    // Log the error
    if (function_exists('log_error')) {
        log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
    }
}

$conn->close();