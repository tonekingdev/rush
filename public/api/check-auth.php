<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://rushhealthc.com');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    // Check if user session exists
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        echo json_encode([
            'authenticated' => false,
            'message' => 'No active session'
        ]);
        exit();
    }

    // Load configuration
    $configPath = $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    if (!file_exists($configPath)) {
        throw new Exception("Config file not found");
    }
    
    $config = require_once $configPath;

    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }

    // Verify user still exists and is active in database
    $stmt = $conn->prepare("SELECT id, username, email, role, status FROM admin_users WHERE id = ? AND status = 'active'");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // User no longer exists or is inactive - destroy session
        $_SESSION = [];
        session_destroy();
        
        echo json_encode([
            'authenticated' => false,
            'message' => 'User account no longer active'
        ]);
        exit();
    }

    $user = $result->fetch_assoc();

    // Check session timeout (optional - 24 hours)
    $sessionTimeout = 24 * 60 * 60; // 24 hours in seconds
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $sessionTimeout) {
        // Session expired
        $_SESSION = [];
        session_destroy();
        
        echo json_encode([
            'authenticated' => false,
            'message' => 'Session expired'
        ]);
        exit();
    }

    // Update last activity
    $_SESSION['last_activity'] = time();

    // User is authenticated and active
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log('Check auth error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'authenticated' => false,
        'message' => 'Authentication check failed'
    ]);
}
?>