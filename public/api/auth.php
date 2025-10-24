<?php
// Set proper headers for JSON response first
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://rushhealthc.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Prevent any HTML output before headers
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    // Load configuration
    $configPath = $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    if (!file_exists($configPath)) {
        throw new Exception("Config file not found");
    }
    
    $config = require_once $configPath;

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    
    if (empty($jsonInput)) {
        throw new Exception('No input data provided');
    }
    
    $input = json_decode($jsonInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON');
    }
    
    // Check for usernameOrEmail and password
    if (!isset($input['usernameOrEmail']) || !isset($input['password'])) {
        throw new Exception('Username/Email and password are required');
    }
    
    $usernameOrEmail = trim($input['usernameOrEmail']);
    $password = $input['password'];
    
    // Validate input
    if (empty($usernameOrEmail) || empty($password)) {
        throw new Exception('Username/Email and password cannot be empty');
    }
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Determine if input is email or username
    $isEmail = filter_var($usernameOrEmail, FILTER_VALIDATE_EMAIL);
    
    // Find user by email or username
    if ($isEmail) {
        $stmt = $conn->prepare("SELECT id, username, email, password, role, status FROM admin_users WHERE email = ? AND status = 'active'");
    } else {
        $stmt = $conn->prepare("SELECT id, username, email, password, role, status FROM admin_users WHERE username = ? AND status = 'active'");
    }
    
    if (!$stmt) {
        throw new Exception('Query preparation failed');
    }
    
    $stmt->bind_param("s", $usernameOrEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Invalid credentials');
    }
    
    $user = $result->fetch_assoc();
    
    // Get the stored hash and trim any whitespace
    $storedHash = trim($user['password']);
    
    // Verify password
    $passwordMatch = password_verify($password, $storedHash);
    
    if (!$passwordMatch) {
        throw new Exception('Invalid credentials');
    }
    
    // Start session with proper configuration
    require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['last_activity'] = time();
    
    // Update last login
    $updateStmt = $conn->prepare("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
    $updateStmt->bind_param("i", $user['id']);
    $updateStmt->execute();
    
    // Also update the password hash if it had whitespace (to fix it permanently)
    if ($storedHash !== $user['password']) {
        $fixHashStmt = $conn->prepare("UPDATE admin_users SET password = ? WHERE id = ?");
        $fixHashStmt->bind_param("si", $storedHash, $user['id']);
        $fixHashStmt->execute();
        $fixHashStmt->close();
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
    
    $stmt->close();
    $updateStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>