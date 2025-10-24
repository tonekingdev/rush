<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://rushhealthc.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    if (empty($jsonInput)) {
        throw new Exception('No input data provided');
    }
    
    $input = json_decode($jsonInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON');
    }
    
    $token = $input['token'] ?? '';
    $updates = $input['updates'] ?? [];
    
    if (empty($token)) {
        throw new Exception('Token is required');
    }
    
    if (empty($updates)) {
        throw new Exception('No updates provided');
    }
    
    // Load configuration
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Validate token again
        $stmt = $conn->prepare("SELECT * FROM provider_completion_tokens 
                               WHERE token = ? AND used_at IS NULL AND expires_at > NOW()");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Invalid, expired, or already used token');
        }
        
        $tokenData = $result->fetch_assoc();
        $providerId = $tokenData['provider_id'];
        $missingFields = json_decode($tokenData['missing_fields'], true);
        
        // Build update query for providers table
        $updateFields = [];
        $updateValues = [];
        $updateTypes = '';
        
        foreach ($updates as $field => $value) {
            // Validate that this field was actually missing
            if (!in_array($field, $missingFields)) {
                throw new Exception("Field '$field' was not in the missing fields list");
            }
            
            // Sanitize and validate the field name to prevent SQL injection
            $allowedFields = [
                'license_number', 'license_type', 'license_state', 'specialty',
                'practice_name', 'practice_address', 'practice_phone', 'practice_email',
                'npi_number', 'dea_number', 'phone'
            ];
            
            if (!in_array($field, $allowedFields)) {
                throw new Exception("Field '$field' is not allowed to be updated");
            }
            
            $updateFields[] = "$field = ?";
            $updateValues[] = $value;
            $updateTypes .= 's';
        }
        
        if (!empty($updateFields)) {
            // Update provider data
            $updateQuery = "UPDATE providers SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE provider_id = ?";
            $updateValues[] = $providerId;
            $updateTypes .= 's';
            
            $updateStmt = $conn->prepare($updateQuery);
            $updateStmt->bind_param($updateTypes, ...$updateValues);
            $updateStmt->execute();
            
            if ($updateStmt->affected_rows === 0) {
                throw new Exception('Failed to update provider data');
            }
        }
        
        // Mark token as used
        $markUsedStmt = $conn->prepare("UPDATE provider_completion_tokens SET used_at = NOW() WHERE token = ?");
        $markUsedStmt->bind_param("s", $token);
        $markUsedStmt->execute();
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Application completed successfully',
            'updated_fields' => array_keys($updates)
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        throw $e;
    }
    
    $conn->close();
    
} catch (Exception $e) {
    error_log('Complete application error: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>