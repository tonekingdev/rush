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

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

// Check if user is authenticated - Updated to match your auth system
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
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

// Get all admin users
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Only super_admin can view all users
        if ($_SESSION['role'] !== 'super_admin') {
            // Regular admins can only view their own info
            $stmt = $conn->prepare("SELECT id, username, email, role, created_at, last_login, status FROM admin_users WHERE id = ?");
            $stmt->bind_param("i", $_SESSION['user_id']);
        } else {
            // Super admins can view all users
            $stmt = $conn->prepare("SELECT id, username, email, role, created_at, last_login, status FROM admin_users");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $users = [];
        while ($row = $result->fetch_assoc()) {
            // Never send password hashes
            $users[] = $row;
        }
        
        echo json_encode(['success' => true, 'users' => $users]);
        $stmt->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error']);
        
        // Log the actual error securely
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Create new admin user
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Only super_admin can create users
        if ($_SESSION['role'] !== 'super_admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            exit();
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $requiredFields = ['username', 'email', 'password'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                throw new Exception("Missing required field: $field");
            }
        }
        
        $username = trim($data['username']);
        $email = trim($data['email']);
        $password = $data['password'];
        $role = isset($data['role']) ? trim($data['role']) : 'admin';
        
        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }
        
        // Validate password strength
        if (strlen($password) < 8) {
            throw new Exception("Password must be at least 8 characters long");
        }
        
        // Check if username or email already exists
        $stmt = $conn->prepare("SELECT id FROM admin_users WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            throw new Exception("Username or email already exists");
        }
        
        // Create new user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO admin_users (username, email, password, role) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $username, $email, $hashedPassword, $role);
        
        if ($stmt->execute()) {
            $userId = $conn->insert_id;
            
            // Log the action
            if (function_exists('log_error')) {
                log_error([
                    'action' => 'create_admin_user',
                    'created_by' => $_SESSION['username'],
                    'new_user' => $username,
                    'role' => $role
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Admin user created successfully',
                'user_id' => $userId
            ]);
        } else {
            throw new Exception("Failed to create admin user");
        }
        
        $stmt->close();
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Update admin user
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id']) || empty($data['id'])) {
            throw new Exception("User ID is required");
        }
        
        $userId = intval($data['id']);
        
        // Check permissions
        $canEdit = ($_SESSION['role'] === 'super_admin' || $_SESSION['user_id'] == $userId);
        
        if (!$canEdit) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            exit();
        }
        
        // Build update query
        $updates = [];
        $params = [];
        $types = "";
        
        // Email update
        if (isset($data['email']) && !empty(trim($data['email']))) {
            $email = trim($data['email']);
            
            // Validate email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid email format");
            }
            
            // Check if email is already used by another user
            $stmt = $conn->prepare("SELECT id FROM admin_users WHERE email = ? AND id != ?");
            $stmt->bind_param("si", $email, $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                throw new Exception("Email is already in use");
            }
            
            $updates[] = "email = ?";
            $params[] = $email;
            $types .= "s";
        }
        
        // Password update
        if (isset($data['password']) && !empty($data['password'])) {
            $password = $data['password'];
            
            // Validate password strength
            if (strlen($password) < 8) {
                throw new Exception("Password must be at least 8 characters long");
            }
            
            $updates[] = "password = ?";
            $params[] = password_hash($password, PASSWORD_DEFAULT);
            $types .= "s";
        }
        
        // Only super_admin can change roles and status
        if ($_SESSION['role'] === 'super_admin') {
            if (isset($data['role']) && !empty(trim($data['role']))) {
                $role = trim($data['role']);
                $validRoles = ['admin', 'super_admin'];
                
                if (!in_array($role, $validRoles)) {
                    throw new Exception("Invalid role");
                }
                
                $updates[] = "role = ?";
                $params[] = $role;
                $types .= "s";
            }
            
            if (isset($data['status']) && !empty(trim($data['status']))) {
                $status = trim($data['status']);
                $validStatuses = ['active', 'inactive'];
                
                if (!in_array($status, $validStatuses)) {
                    throw new Exception("Invalid status");
                }
                
                $updates[] = "status = ?";
                $params[] = $status;
                $types .= "s";
            }
        }
        
        if (empty($updates)) {
            throw new Exception("No fields to update");
        }
        
        // Add user ID to params
        $params[] = $userId;
        $types .= "i";
        
        // Execute update
        $query = "UPDATE admin_users SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            // Log the action
            if (function_exists('log_error')) {
                log_error([
                    'action' => 'update_admin_user',
                    'updated_by' => $_SESSION['username'],
                    'user_id' => $userId,
                    'fields_updated' => array_keys($data)
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Admin user updated successfully'
            ]);
        } else {
            throw new Exception("Failed to update admin user");
        }
        
        $stmt->close();
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Delete admin user
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        // Only super_admin can delete users
        if ($_SESSION['role'] !== 'super_admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            exit();
        }
        
        if (!isset($_GET['id']) || empty($_GET['id'])) {
            throw new Exception("User ID is required");
        }
        
        $userId = intval($_GET['id']);
        
        // Prevent deleting your own account
        if ($userId == $_SESSION['user_id']) {
            throw new Exception("Cannot delete your own account");
        }
        
        // Check if user exists
        $stmt = $conn->prepare("SELECT username FROM admin_users WHERE id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("User not found");
        }
        
        $username = $result->fetch_assoc()['username'];
        
        // Delete the user
        $stmt = $conn->prepare("DELETE FROM admin_users WHERE id = ?");
        $stmt->bind_param("i", $userId);
        
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            // Log the action
            if (function_exists('log_error')) {
                log_error([
                    'action' => 'delete_admin_user',
                    'deleted_by' => $_SESSION['username'],
                    'deleted_user' => $username,
                    'user_id' => $userId
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Admin user deleted successfully'
            ]);
        } else {
            throw new Exception("Failed to delete admin user");
        }
        
        $stmt->close();
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
?>