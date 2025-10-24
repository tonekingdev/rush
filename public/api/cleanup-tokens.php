<?php
// Cleanup script for expired password reset tokens
// This can be run as a cron job or called periodically

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://rushhealthc.com');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    // Load configuration
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Count expired tokens before cleanup
    $countStmt = $conn->prepare("SELECT COUNT(*) as expired_count FROM password_resets WHERE expires_at < NOW()");
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $expiredCount = $countResult->fetch_assoc()['expired_count'];
    
    // Delete expired tokens
    $cleanupStmt = $conn->prepare("DELETE FROM password_resets WHERE expires_at < NOW()");
    $cleanupStmt->execute();
    $deletedCount = $cleanupStmt->affected_rows;
    
    error_log("Token cleanup completed. Found: {$expiredCount}, Deleted: {$deletedCount}");
    
    echo json_encode([
        'success' => true,
        'message' => "Cleanup completed. Deleted {$deletedCount} expired tokens.",
        'expired_found' => $expiredCount,
        'deleted' => $deletedCount
    ]);
    
    $countStmt->close();
    $cleanupStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log('Token cleanup error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>