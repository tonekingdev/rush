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

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

// Only super_admin can perform backups
if ($_SESSION['admin_role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit();
}

// Create backup
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $backupDir = $_SERVER['DOCUMENT_ROOT'] . '/backups/';
        
        // Create backup directory if it doesn't exist
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d_H-i-s');
        $backupFile = $backupDir . 'backup_' . $timestamp . '.sql';
        
        // Database backup command
        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s %s > %s',
            escapeshellarg($config['DB_USER']),
            escapeshellarg($config['DB_PASS']),
            escapeshellarg($config['DB_HOST']),
            escapeshellarg($config['DB_NAME']),
            escapeshellarg($backupFile)
        );
        
        // Execute backup
        $output = [];
        $returnVar = 0;
        exec($command, $output, $returnVar);
        
        if ($returnVar === 0 && file_exists($backupFile)) {
            $fileSize = filesize($backupFile);
            
            echo json_encode([
                'success' => true,
                'message' => 'Backup created successfully',
                'filename' => basename($backupFile),
                'size' => $fileSize,
                'created_at' => date('Y-m-d H:i:s')
            ]);
            
            // Log the backup
            if (function_exists('log_error')) {
                log_error([
                    'action' => 'database_backup',
                    'filename' => basename($backupFile),
                    'size' => $fileSize,
                    'created_by' => $_SESSION['admin_username']
                ]);
            }
        } else {
            throw new Exception("Backup failed");
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create backup']);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// List backups
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $backupDir = $_SERVER['DOCUMENT_ROOT'] . '/backups/';
        
        if (!is_dir($backupDir)) {
            echo json_encode([
                'success' => true,
                'backups' => []
            ]);
            exit();
        }
        
        $backups = [];
        $files = glob($backupDir . 'backup_*.sql');
        
        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => filesize($file),
                'created_at' => date('Y-m-d H:i:s', filemtime($file))
            ];
        }
        
        // Sort by creation time (newest first)
        usort($backups, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        echo json_encode([
            'success' => true,
            'backups' => $backups
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to list backups']);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
