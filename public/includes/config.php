<?php
/**
 * Configuration file for Rush Healthcare
 */

// Prevent direct access
if (!defined('RUSH_HEALTHCARE_CONFIG')) {
    define('RUSH_HEALTHCARE_CONFIG', true);
}

// Define log file constant
define('LOG_FILE', 'error.log');

// Environment configuration
define('ENVIRONMENT', 'production'); // Change to 'development' for local testing

// Main configuration array
$config = [
    // Database configuration (your existing settings)
    'DB_HOST' => 'localhost',
    'DB_USER' => 'u382076499_serviceadmin',
    'DB_PASS' => 'Ru5h0107!n3w',
    'DB_NAME' => 'u382076499_rush_platform',
    'DB_CHARSET' => 'utf8mb4',
    'DB_PORT' => 3306,

    // SMTP configuration (your existing settings)
    'SMTP_HOST' => 'smtp.hostinger.com',
    'SMTP_PORT' => 465,
    'SMTP_USER' => 'noreply@rushhealthc.com',
    'SMTP_PASS' => 'Ru5h0107!n3w',
    'SMTP_SECURE' => 'ssl',
    'SMTP_FROM_NAME' => 'RUSH Healthcare',

    // Stripe configuration (your existing settings)
    'STRIPE_PUBLISHABLE_KEY' => 'pk_live_51QbSGYGBXcslzN0XhSJcdKQiVRylxyaBjIxnKhrev7SrtcfK5ACCqN9Nffj77NRpkS9c7Re0jaoDwFrRtbiiPr4k00xvzHUTcn',

    // Application settings
    'APP_NAME' => 'RUSH Healthcare',
    'APP_URL' => 'https://rushhealthc.com',
    'ADMIN_EMAIL' => 'admin@rushhealthc.com',
    'SUPPORT_EMAIL' => 'customerservice@rushhealthc.com',

    // Security settings
    'SESSION_TIMEOUT' => 3600, // 1 hour in seconds
    'PASSWORD_MIN_LENGTH' => 8,
    'PASSWORD_REQUIRE_UPPERCASE' => true,
    'PASSWORD_REQUIRE_NUMBER' => true,
    'PASSWORD_REQUIRE_SPECIAL' => true,
    'MAX_LOGIN_ATTEMPTS' => 5,
    'LOCKOUT_TIME' => 1800, // 30 minutes in seconds

    // File upload settings
    'MAX_FILE_SIZE' => 5242880, // 5MB in bytes
    'ALLOWED_FILE_TYPES' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    'UPLOAD_PATH' => $_SERVER['DOCUMENT_ROOT'] . '/uploads/',

    // CORS settings
    'ALLOWED_DOMAINS' => [
        'https://rushhealthc.com',
        'https://www.rushhealthc.com'
    ],

    // Error handling and logging (your existing settings enhanced)
    'DISPLAY_ERRORS' => false,
    'ERROR_REPORTING' => E_ALL,
    'LOG_ERRORS' => true,
    'LOG_PATH' => $_SERVER['DOCUMENT_ROOT'] . '/logs/',

    // Encryption key for sensitive data (generate a new 32-character key for production)
    'ENCRYPTION_KEY' => 'RushHealthcare2024AdminSecureKey!',

    // Admin panel specific settings
    'ITEMS_PER_PAGE' => 25,
    'BACKUP_RETENTION_DAYS' => 30,
    'ACTIVITY_LOG_RETENTION_DAYS' => 90,
];

// Configure error reporting based on environment
if (ENVIRONMENT === 'development') {
    $config['DISPLAY_ERRORS'] = true;
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Prevent function redeclaration - your existing functions preserved
if (!function_exists('log_error')) {
    function log_error($error_data) {
        global $config;
        $timestamp = date('Y-m-d H:i:s');
        
        // Enhanced logging with more detail
        if (is_array($error_data) || is_object($error_data)) {
            $error_message = json_encode($error_data);
        } else {
            $error_message = $error_data;
        }
        
        // Log to both the simple log file and detailed application log
        file_put_contents(LOG_FILE, "[$timestamp] $error_message\n", FILE_APPEND);
        
        // Also log to application log if path exists
        if (isset($config['LOG_PATH'])) {
            $logDir = $config['LOG_PATH'];
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
            
            $logFile = $logDir . 'application.log';
            $logEntry = [
                'timestamp' => $timestamp,
                'data' => $error_data,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
                'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown'
            ];
            
            $logLine = json_encode($logEntry) . PHP_EOL;
            file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
        }
    }
}

// Function to get only the publishable key for client-side use (your existing function)
if (!function_exists('get_stripe_public_config')) {
    function get_stripe_public_config() {
        global $config;
        return [
            'STRIPE_PUBLISHABLE_KEY' => $config['STRIPE_PUBLISHABLE_KEY']
        ];
    }
}

// Enhanced error handling configuration (your existing function enhanced)
if (!function_exists('configure_error_handling')) {
    function configure_error_handling() {
        global $config;
        
        // Set error reporting level
        error_reporting($config['ERROR_REPORTING']);
        
        // Control display of errors
        ini_set('display_errors', $config['DISPLAY_ERRORS'] ? '1' : '0');
        ini_set('display_startup_errors', $config['DISPLAY_ERRORS'] ? '1' : '0');
        
        // Enable error logging if configured
        if ($config['LOG_ERRORS']) {
            ini_set('log_errors', '1');
            ini_set('error_log', LOG_FILE);
            
            // Create logs directory if it doesn't exist
            $logDir = $config['LOG_PATH'];
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
        }
    }
}

// New helper functions for admin panel
if (!function_exists('get_db_connection')) {
    function get_db_connection() {
        global $config;
        
        try {
            $dsn = "mysql:host={$config['DB_HOST']};port={$config['DB_PORT']};dbname={$config['DB_NAME']};charset={$config['DB_CHARSET']}";
            $pdo = new PDO($dsn, $config['DB_USER'], $config['DB_PASS'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            return $pdo;
        } catch (PDOException $e) {
            log_error(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
            throw new Exception('Database connection failed');
        }
    }
}

if (!function_exists('is_admin_logged_in')) {
    function is_admin_logged_in() {
        return isset($_SESSION['admin_user_id']) && isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    }
}

if (!function_exists('require_admin_login')) {
    function require_admin_login() {
        if (!is_admin_logged_in()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }
        
        // Check session timeout
        global $config;
        if (isset($_SESSION['admin_last_activity']) && 
            (time() - $_SESSION['admin_last_activity']) > $config['SESSION_TIMEOUT']) {
            session_destroy();
            http_response_code(401);
            echo json_encode(['error' => 'Session expired']);
            exit;
        }
        
        $_SESSION['admin_last_activity'] = time();
    }
}

if (!function_exists('sanitize_input')) {
    function sanitize_input($input) {
        if (is_array($input)) {
            return array_map('sanitize_input', $input);
        }
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('validate_file_upload')) {
    function validate_file_upload($file) {
        global $config;
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'File upload error'];
        }
        
        if ($file['size'] > $config['MAX_FILE_SIZE']) {
            return ['success' => false, 'message' => 'File too large'];
        }
        
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $config['ALLOWED_FILE_TYPES'])) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }
        
        return ['success' => true];
    }
}

// Initialize error handling
configure_error_handling();

// Set timezone
date_default_timezone_set('America/New_York');

// Start session if not already started with enhanced security
if (session_status() === PHP_SESSION_NONE) {
    // Configure session settings for security
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', 1); // Requires HTTPS
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_lifetime', 0); // Session cookie
    ini_set('session.gc_maxlifetime', $config['SESSION_TIMEOUT']);
    ini_set('session.cookie_samesite', 'Strict');
    
    session_start();
}

return $config;
