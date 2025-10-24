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

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session with proper configuration
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Check authentication - Fixed to match your admin login system
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized', 'debug' => 'Session user_id not found']);
    exit();
}

try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Get recent applications from provider_applications table - Extended to 7 days to show more results
    $sql = "SELECT id, full_name as name, 
                   COALESCE(license_type, 'Healthcare Provider') as position, 
                   status, created_at 
            FROM provider_applications 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC 
            LIMIT 10";
    
    $result = $conn->query($sql);
    
    $applications = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $applications[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'position' => $row['position'],
                'status' => $row['status'],
                'created_at' => $row['created_at']
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'applications' => $applications,
        'total' => count($applications)
    ]);
    
    $conn->close();
} catch (Exception $e) {
    error_log('Recent applications error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch recent applications',
        'error' => $e->getMessage()
    ]);
}
?>