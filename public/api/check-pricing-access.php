<?php
// Set proper headers
header('Content-Type: application/json');

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// CORS headers
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

// Database connection
try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    error_log("Database connection error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

try {
    // Check if user has pricing management access
    $stmt = $conn->prepare("SELECT username, role FROM admin_users WHERE id = ? AND status = 'active'");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        // Allow access for super_admin or specific usernames
        $allowedUsers = ['admin', 'slewis', 'tone'];
        $hasAccess = $user['role'] === 'super_admin' || in_array($user['username'], $allowedUsers);
        
        echo json_encode([
            'success' => true,
            'hasAccess' => $hasAccess,
            'username' => $user['username'],
            'role' => $user['role']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'hasAccess' => false,
            'error' => 'User not found or inactive'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Check pricing access error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error occurred'
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>