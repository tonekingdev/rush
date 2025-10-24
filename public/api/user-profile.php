<?php
// Set proper headers for production
header('Content-Type: application/json');

// Load configuration and utilities
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/security.php';

// Use the actual domain in production
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
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

// Check if session is expired
if (is_session_expired()) {
    // Clear session and return unauthorized
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Session expired']);
    exit();
}

// Update session activity timestamp
update_session_activity();

// Check if user is authenticated as admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
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

// Get user profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $userId = $_SESSION['admin_id'];
        
        $stmt = $conn->prepare("SELECT id, username, email, role, created_at, last_login, status FROM admin_users WHERE id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("User not found");
        }
        
        $user = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
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

// Update user profile
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['admin_id'];
        
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
                    'action' => 'update_profile',
                    'user_id' => $userId,
                    'username' => $_SESSION['admin_username'],
                    'fields_updated' => array_keys($data)
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } else {
            throw new Exception("Failed to update profile");
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