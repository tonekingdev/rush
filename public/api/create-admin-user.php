<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://rushhealthc.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

// Check authentication and super admin role
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id']) || $_SESSION['role'] !== 'super_admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Super admin access required']);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    $input = json_decode($jsonInput, true);
    
    if (!isset($input['username']) || !isset($input['email']) || !isset($input['password']) || !isset($input['role'])) {
        throw new Exception('Username, email, password, and role are required');
    }
    
    $username = trim($input['username']);
    $email = trim($input['email']);
    $password = $input['password'];
    $role = trim($input['role']);
    
    // Validate input
    if (empty($username) || empty($email) || empty($password) || empty($role)) {
        throw new Exception('All fields are required');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    if (strlen($password) < 8) {
        throw new Exception('Password must be at least 8 characters long');
    }
    
    // Validate role
    $validRoles = ['admin', 'super_admin'];
    if (!in_array($role, $validRoles)) {
        throw new Exception('Invalid role');
    }
    
    // Load configuration
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Check if username or email already exists
    $checkStmt = $conn->prepare("SELECT id FROM admin_users WHERE username = ? OR email = ?");
    $checkStmt->bind_param("ss", $username, $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception('Username or email already exists');
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO admin_users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)");
    $stmt->bind_param("ssss", $username, $email, $hashedPassword, $role);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        throw new Exception('Failed to create user');
    }
    
    $newUserId = $conn->insert_id;
    
    // Get the created user data (excluding password)
    $getUserStmt = $conn->prepare("SELECT id, username, email, role, status, created_at FROM admin_users WHERE id = ?");
    $getUserStmt->bind_param("i", $newUserId);
    $getUserStmt->execute();
    $userResult = $getUserStmt->get_result();
    $newUser = $userResult->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'message' => 'Admin user created successfully',
        'user' => $newUser
    ]);
    
    $checkStmt->close();
    $stmt->close();
    $getUserStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>