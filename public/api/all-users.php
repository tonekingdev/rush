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
    
    // GET - Fetch all platform users (admins + patients + providers)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $role = isset($_GET['role']) ? $_GET['role'] : '';
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        
        $allUsers = [];
        
        // Fetch Admin Users
        if (empty($role) || $role === 'admin') {
            $adminQuery = "SELECT 
                            id, 
                            CONCAT('ADM', LPAD(id, 6, '0')) as identifier, 
                            username as full_name, 
                            email, 
                            '' as phone, 
                            CASE 
                                WHEN role = 'super_admin' THEN 'Super Admin'
                                ELSE 'Admin'
                            END as role, 
                            status, 
                            created_at,
                            last_login,
                            'admin' as user_type,
                            id as original_id
                          FROM admin_users";
            
            $whereConditions = [];
            if (!empty($search)) {
                $whereConditions[] = "(username LIKE '%$search%' OR email LIKE '%$search%')";
            }
            if (!empty($status) && in_array($status, ['active', 'inactive'])) {
                $whereConditions[] = "status = '$status'";
            }
            
            if (!empty($whereConditions)) {
                $adminQuery .= " WHERE " . implode(" AND ", $whereConditions);
            }
            
            $adminResult = $conn->query($adminQuery);
            if ($adminResult) {
                while ($row = $adminResult->fetch_assoc()) {
                    $allUsers[] = $row;
                }
            }
        }
        
        // Fetch Patients (Users table)
        if (empty($role) || $role === 'patient') {
            $patientQuery = "SELECT 
                                id, 
                                user_id as identifier, 
                                full_name, 
                                email, 
                                phone_number as phone, 
                                'Patient' as role, 
                                status, 
                                created_at,
                                NULL as last_login,
                                'patient' as user_type,
                                id as original_id
                              FROM users";
            
            $whereConditions = [];
            if (!empty($search)) {
                $whereConditions[] = "(full_name LIKE '%$search%' OR email LIKE '%$search%' OR user_id LIKE '%$search%')";
            }
            if (!empty($status) && in_array($status, ['active', 'inactive', 'suspended'])) {
                $whereConditions[] = "status = '$status'";
            }
            
            if (!empty($whereConditions)) {
                $patientQuery .= " WHERE " . implode(" AND ", $whereConditions);
            }
            
            $patientResult = $conn->query($patientQuery);
            if ($patientResult) {
                while ($row = $patientResult->fetch_assoc()) {
                    $allUsers[] = $row;
                }
            }
        }
        
        // Fetch Providers
        if (empty($role) || $role === 'provider') {
            $providerQuery = "SELECT 
                                id, 
                                provider_id as identifier, 
                                full_name, 
                                email, 
                                phone, 
                                'Provider' as role, 
                                status, 
                                created_at,
                                NULL as last_login,
                                'provider' as user_type,
                                id as original_id
                              FROM providers";
            
            $whereConditions = [];
            if (!empty($search)) {
                $whereConditions[] = "(full_name LIKE '%$search%' OR email LIKE '%$search%' OR provider_id LIKE '%$search%')";
            }
            if (!empty($status) && in_array($status, ['active', 'inactive', 'suspended'])) {
                $whereConditions[] = "status = '$status'";
            }
            
            if (!empty($whereConditions)) {
                $providerQuery .= " WHERE " . implode(" AND ", $whereConditions);
            }
            
            $providerResult = $conn->query($providerQuery);
            if ($providerResult) {
                while ($row = $providerResult->fetch_assoc()) {
                    $allUsers[] = $row;
                }
            }
        }
        
        // Sort by created_at descending
        usort($allUsers, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        $total = count($allUsers);
        
        // Apply pagination
        $paginatedUsers = array_slice($allUsers, $offset, $limit);
        
        echo json_encode([
            'success' => true,
            'users' => $paginatedUsers,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }
    
    // PUT - Update user status
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !isset($input['user_type']) || !isset($input['status'])) {
            throw new Exception('User ID, user type, and status are required');
        }
        
        $userId = intval($input['id']);
        $userType = $input['user_type'];
        $status = $input['status'];
        
        if (!in_array($status, ['active', 'inactive', 'suspended'])) {
            throw new Exception('Invalid status');
        }
        
        if ($userType === 'patient') {
            // Update users table
            $stmt = $conn->prepare("UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->bind_param("si", $status, $userId);
        } elseif ($userType === 'provider') {
            // Update providers table
            $stmt = $conn->prepare("UPDATE providers SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->bind_param("si", $status, $userId);
        } elseif ($userType === 'admin') {
            // Update admin_users table (only allow active/inactive for admins)
            if (!in_array($status, ['active', 'inactive'])) {
                throw new Exception('Invalid status for admin users');
            }
            $stmt = $conn->prepare("UPDATE admin_users SET status = ? WHERE id = ?");
            $stmt->bind_param("si", $status, $userId);
        } else {
            throw new Exception('Invalid user type');
        }
        
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception('User not found or no changes made');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'User status updated successfully'
        ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    error_log('All users error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>