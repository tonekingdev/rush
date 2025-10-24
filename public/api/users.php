<?php
header('Content-Type: application/json');

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// CORS headers
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // GET - Fetch users/patients
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        
        // Build WHERE clause
        $whereConditions = [];
        $params = [];
        $types = '';
        
        if (!empty($status) && in_array($status, ['active', 'inactive', 'suspended'])) {
            $whereConditions[] = "u.status = ?";
            $params[] = $status;
            $types .= 's';
        }
        
        if (!empty($search)) {
            $whereConditions[] = "(u.full_name LIKE ? OR u.email LIKE ? OR u.user_id LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= 'sss';
        }
        
        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
        
        // Get total count
        $countQuery = "SELECT COUNT(*) as total FROM users u $whereClause";
        if (!empty($params)) {
            $countStmt = $conn->prepare($countQuery);
            $countStmt->bind_param($types, ...$params);
            $countStmt->execute();
            $totalResult = $countStmt->get_result();
        } else {
            $totalResult = $conn->query($countQuery);
        }
        $total = $totalResult->fetch_assoc()['total'];
        
        // Get users with approver info
        $query = "SELECT u.*, au.username as approved_by_name 
                  FROM users u 
                  LEFT JOIN admin_users au ON u.approved_by = au.id 
                  $whereClause 
                  ORDER BY u.created_at DESC 
                  LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        $types .= 'ii';
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'users' => $users,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }
    
    // PUT - Update user status
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !isset($input['status'])) {
            throw new Exception('User ID and status are required');
        }
        
        $userId = intval($input['id']);
        $status = $input['status'];
        
        if (!in_array($status, ['active', 'inactive', 'suspended'])) {
            throw new Exception('Invalid status');
        }
        
        $stmt = $conn->prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->bind_param("si", $status, $userId);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception('User not found');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'User status updated successfully'
        ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    error_log('Users error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>