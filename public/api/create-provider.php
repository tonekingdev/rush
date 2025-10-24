<?php
// Load configuration
$config = require_once '../config.php';

// Configure error handling
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['application_id'])) {
            throw new Exception('Application ID is required');
        }
        
        $applicationId = $input['application_id'];
        
        // Connect to database
        $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
        
        if ($conn->connect_error) {
            throw new Exception('Connection failed: ' . $conn->connect_error);
        }
        
        // First, get the application data
        $sql = "SELECT * FROM provider_applications WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param("i", $applicationId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Application not found');
        }
        
        $application = $result->fetch_assoc();
        $stmt->close();
        
        // Check if provider already exists for this application
        $checkSql = "SELECT id FROM providers WHERE application_id = ?";
        $checkStmt = $conn->prepare($checkSql);
        if (!$checkStmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $checkStmt->bind_param("i", $applicationId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            // Provider already exists, return the existing provider ID
            $existingProvider = $checkResult->fetch_assoc();
            $checkStmt->close();
            $conn->close();
            
            echo json_encode([
                'success' => true,
                'message' => 'Provider already exists',
                'provider_id' => $existingProvider['id'],
                'already_exists' => true
            ]);
            exit;
        }
        $checkStmt->close();
        
        // Generate a unique provider ID if not already set
        $providerId = $application['provider_id'];
        if (empty($providerId)) {
            // Generate a unique provider ID (e.g., RUSH-YYYY-XXXX format)
            $year = date('Y');
            $randomNum = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $providerId = "RUSH-{$year}-{$randomNum}";
            
            // Ensure uniqueness
            $uniqueCheck = "SELECT id FROM providers WHERE provider_id = ?";
            $uniqueStmt = $conn->prepare($uniqueCheck);
            while (true) {
                $uniqueStmt->bind_param("s", $providerId);
                $uniqueStmt->execute();
                $uniqueResult = $uniqueStmt->get_result();
                
                if ($uniqueResult->num_rows === 0) {
                    break; // ID is unique
                }
                
                // Generate a new ID
                $randomNum = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                $providerId = "RUSH-{$year}-{$randomNum}";
            }
            $uniqueStmt->close();
        }
        
        // Extract and map data from application to provider table
        $fullName = $application['full_name'];
        $email = $application['email'];
        $phone = $application['phone'];
        $specialty = $application['license_type'] ?: $application['specialty']; // Use license_type as specialty
        $licenseNumber = $application['license_number'];
        $licenseType = $application['license_type'];
        $licenseState = 'MI'; // Default to Michigan, you can modify this based on your needs
        
        // Map address from application to practice_address in provider table
        $practiceName = null; // Not in application, will be null
        $practiceAddress = $application['address']; // Map address from application to practice_address
        $practicePhone = $phone; // Use phone from application as practice phone
        $practiceEmail = $email; // Use email from application as practice email
        $npiNumber = null; // Not in application, will be null
        $deaNumber = null; // Not in application, will be null
        $status = 'active'; // Set as active since they're approved
        $approvedDate = date('Y-m-d H:i:s');
        
        // Insert into providers table
        $insertSql = "INSERT INTO providers (
            application_id, provider_id, full_name, email, phone, specialty, 
            license_number, license_type, license_state, practice_name, 
            practice_address, practice_phone, practice_email, npi_number, 
            dea_number, status, approved_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $insertStmt = $conn->prepare($insertSql);
        if (!$insertStmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $insertStmt->bind_param(
            "issssssssssssssss",
            $applicationId,
            $providerId,
            $fullName,
            $email,
            $phone,
            $specialty,
            $licenseNumber,
            $licenseType,
            $licenseState,
            $practiceName,
            $practiceAddress,
            $practicePhone,
            $practiceEmail,
            $npiNumber,
            $deaNumber,
            $status,
            $approvedDate
        );
        
        if (!$insertStmt->execute()) {
            throw new Exception('Execute failed: ' . $insertStmt->error);
        }
        
        $newProviderId = $conn->insert_id;
        $insertStmt->close();
        
        // Update the application with the provider_id if it was generated
        if ($application['provider_id'] !== $providerId) {
            $updateAppSql = "UPDATE provider_applications SET provider_id = ? WHERE id = ?";
            $updateAppStmt = $conn->prepare($updateAppSql);
            if ($updateAppStmt) {
                $updateAppStmt->bind_param("si", $providerId, $applicationId);
                $updateAppStmt->execute();
                $updateAppStmt->close();
            }
        }
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Provider created successfully',
            'provider_id' => $newProviderId,
            'provider_code' => $providerId,
            'already_exists' => false
        ]);
        
    } else {
        throw new Exception('Invalid request method');
    }
    
} catch (Exception $e) {
    error_log("Create provider error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>