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

header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session with secure settings
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Check authentication - Updated to use user_id instead of admin_logged_in
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Only super_admin can access settings - Updated to use role instead of admin_role
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
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

// Get settings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Check if system_settings table exists
        $tableCheck = $conn->query("SHOW TABLES LIKE 'system_settings'");
        if ($tableCheck->num_rows === 0) {
            // Return default settings if table doesn't exist
            $defaultSettings = [
                'site_name' => ['value' => 'RUSH Healthcare', 'description' => 'Site name displayed in the application'],
                'admin_email' => ['value' => 'admin@rushhealthc.com', 'description' => 'Primary admin email address'],
                'support_email' => ['value' => 'support@rushhealthc.com', 'description' => 'Support email address'],
                'application_auto_approve' => ['value' => 'false', 'description' => 'Automatically approve applications'],
                'email_notifications' => ['value' => 'true', 'description' => 'Send email notifications'],
                'max_file_size' => ['value' => '5242880', 'description' => 'Maximum file upload size in bytes (5MB)'],
                'allowed_file_types' => ['value' => 'pdf,doc,docx,jpg,jpeg,png', 'description' => 'Allowed file types for uploads']
            ];
            
            echo json_encode([
                'success' => true,
                'settings' => $defaultSettings
            ]);
            exit();
        }
        
        $stmt = $conn->prepare("SELECT setting_key, setting_value, description FROM system_settings ORDER BY setting_key");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $settings = [];
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = [
                'value' => $row['setting_value'],
                'description' => $row['description']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'settings' => $settings
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch settings']);
        
        // Log the actual error securely
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Update settings
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data)) {
            throw new Exception("No settings data provided");
        }
        
        // Create system_settings table if it doesn't exist
        $createTable = "CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value TEXT,
            description TEXT,
            updated_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $conn->query($createTable);
        
        $conn->begin_transaction();
        
        foreach ($data as $key => $value) {
            // Validate setting key
            if (empty($key) || !is_string($key)) {
                throw new Exception("Invalid setting key");
            }
            
            // Update or insert setting - Updated to use username instead of admin_username
            $stmt = $conn->prepare("INSERT INTO system_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by), updated_at = NOW()");
            $updatedBy = $_SESSION['username'] ?? 'admin';
            $stmt->bind_param("sss", $key, $value, $updatedBy);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to update setting: $key");
            }
        }
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);
        
        // Log the action
        if (function_exists('log_error')) {
            log_error([
                'action' => 'update_settings',
                'updated_by' => $_SESSION['username'] ?? 'admin',
                'settings_updated' => array_keys($data)
            ]);
        }
        
    } catch (Exception $e) {
        $conn->rollback();
        
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Initialize default settings
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'initialize') {
    try {
        // Create system_settings table if it doesn't exist
        $createTable = "CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value TEXT,
            description TEXT,
            updated_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $conn->query($createTable);
        
        $defaultSettings = [
            'site_name' => ['value' => 'RUSH Healthcare', 'description' => 'Site name displayed in the application'],
            'admin_email' => ['value' => 'admin@rushhealthc.com', 'description' => 'Primary admin email address'],
            'support_email' => ['value' => 'support@rushhealthc.com', 'description' => 'Support email address'],
            'application_auto_approve' => ['value' => 'false', 'description' => 'Automatically approve applications'],
            'email_notifications' => ['value' => 'true', 'description' => 'Send email notifications'],
            'max_file_size' => ['value' => '5242880', 'description' => 'Maximum file upload size in bytes (5MB)'],
            'allowed_file_types' => ['value' => 'pdf,doc,docx,jpg,jpeg,png', 'description' => 'Allowed file types for uploads'],
            'session_timeout' => ['value' => '3600', 'description' => 'Session timeout in seconds (1 hour)'],
            'password_min_length' => ['value' => '8', 'description' => 'Minimum password length'],
            'password_require_uppercase' => ['value' => 'true', 'description' => 'Require uppercase letter in password'],
            'password_require_number' => ['value' => 'true', 'description' => 'Require number in password'],
            'password_require_special' => ['value' => 'true', 'description' => 'Require special character in password'],
            'maintenance_mode' => ['value' => 'false', 'description' => 'Enable maintenance mode'],
            'backup_frequency' => ['value' => 'daily', 'description' => 'Database backup frequency'],
            'log_retention_days' => ['value' => '90', 'description' => 'Number of days to retain log files']
        ];
        
        $conn->begin_transaction();
        
        foreach ($defaultSettings as $key => $setting) {
            $stmt = $conn->prepare("INSERT IGNORE INTO system_settings (setting_key, setting_value, description, updated_by) VALUES (?, ?, ?, ?)");
            $updatedBy = $_SESSION['username'] ?? 'admin';
            $stmt->bind_param("ssss", $key, $setting['value'], $setting['description'], $updatedBy);
            $stmt->execute();
        }
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Default settings initialized successfully'
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to initialize settings']);
        
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