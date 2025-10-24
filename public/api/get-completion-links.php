<?php
header('Content-Type: application/json');

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// Use the actual domain in production
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session with proper configuration
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed');
    }

    // Debug session data
    error_log('Get-completion-links Session ID: ' . session_id());
    error_log('Get-completion-links Session name: ' . session_name());
    error_log('Get-completion-links Session data: ' . print_r($_SESSION, true));

    // Check if user is authenticated - using user_id which matches your admin login system
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        throw new Exception('Unauthorized access');
    }

    // Get application ID from URL parameter
    $applicationId = isset($_GET['application_id']) ? (int)$_GET['application_id'] : 0;
    
    if ($applicationId <= 0) {
        throw new Exception('Invalid application ID');
    }
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Check if provider_completion_tokens table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'provider_completion_tokens'");
    if ($tableCheck->num_rows === 0) {
        echo json_encode([
            'success' => true,
            'links' => []
        ]);
        exit();
    }
    
    // Clean up expired tokens first
    $cleanupStmt = $conn->prepare("DELETE FROM provider_completion_tokens WHERE expires_at < NOW()");
    $cleanupStmt->execute();
    $cleanupStmt->close();
    
    // Get completion links for this application
    $stmt = $conn->prepare("SELECT * FROM provider_completion_tokens WHERE application_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $applicationId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $links = [];
    while ($row = $result->fetch_assoc()) {
        // Parse missing_fields JSON
        if (isset($row['missing_fields'])) {
            $row['missing_fields'] = json_decode($row['missing_fields']);
        }
        
        $links[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'links' => $links
    ]);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log('Get completion links error: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>