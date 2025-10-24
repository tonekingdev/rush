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

// Database connection
try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    
    // Log the actual error securely
    if (function_exists('log_error')) {
        log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
    }
    exit();
}

// Get activity logs
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $action = isset($_GET['action']) ? trim($_GET['action']) : '';
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
        $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : '';
        $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : '';
        
        // Build query
        $whereConditions = [];
        $params = [];
        $types = "";
        
        if (!empty($search)) {
            $whereConditions[] = "(al.action LIKE ? OR al.details LIKE ? OR au.username LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= "sss";
        }
        
        if (!empty($action)) {
            $whereConditions[] = "al.action = ?";
            $params[] = $action;
            $types .= "s";
        }
        
        if ($userId) {
            $whereConditions[] = "al.user_id = ?";
            $params[] = $userId;
            $types .= "i";
        }
        
        if (!empty($dateFrom)) {
            $whereConditions[] = "DATE(al.created_at) >= ?";
            $params[] = $dateFrom;
            $types .= "s";
        }
        
        if (!empty($dateTo)) {
            $whereConditions[] = "DATE(al.created_at) <= ?";
            $params[] = $dateTo;
            $types .= "s";
        }
        
        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM activity_logs al 
                     LEFT JOIN admin_users au ON al.user_id = au.id 
                     $whereClause";
        $countStmt = $conn->prepare($countSql);
        
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
        }
        
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
        
        // Get activity logs
        $sql = "SELECT al.*, au.username 
                FROM activity_logs al 
                LEFT JOIN admin_users au ON al.user_id = au.id 
                $whereClause 
                ORDER BY al.created_at DESC 
                LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= "ii";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            // Parse JSON details if present
            if (!empty($row['details'])) {
                $row['details'] = json_decode($row['details'], true);
            }
            $logs[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'logs' => $logs,
            'pagination' => [
                'total' => (int)$totalCount,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch activity logs']);
        
        // Log the actual error securely
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
