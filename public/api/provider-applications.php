<?php
// Set proper headers for production
header('Content-Type: application/json');

// Load configuration - add error handling
$configPath = $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
if (!file_exists($configPath)) {
    error_log("Config file not found at: " . $configPath);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Configuration error']);
    exit();
}

try {
    $config = require_once $configPath;
} catch (Exception $e) {
    error_log("Config loading error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Configuration error']);
    exit();
}

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

// Start session with proper configuration
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

// Database connection
try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    error_log("Database connection error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

// Function to ensure required columns exist
function ensureTableColumns($conn) {
    try {
        // Check if updated_at column exists
        $checkColumn = $conn->query("SHOW COLUMNS FROM provider_applications LIKE 'updated_at'");
        
        if ($checkColumn->num_rows == 0) {
            // Add updated_at column if it doesn't exist
            $addColumn = "ALTER TABLE provider_applications ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at";
            
            if ($conn->query($addColumn)) {
                error_log("Successfully added updated_at column to provider_applications table");
            } else {
                error_log("Failed to add updated_at column: " . $conn->error);
            }
        }
        
        // Check if other commonly needed columns exist and add them if missing
        $columnsToCheck = [
            'specialty' => "ALTER TABLE provider_applications ADD COLUMN specialty VARCHAR(100) DEFAULT NULL AFTER license_type",
            'provider_id' => "ALTER TABLE provider_applications ADD COLUMN provider_id VARCHAR(50) DEFAULT NULL AFTER id",
            'citizenship_pdf' => "ALTER TABLE provider_applications ADD COLUMN citizenship_pdf VARCHAR(255) DEFAULT NULL AFTER drug_alcohol_pdf",
            'citizenship_attestation_signed' => "ALTER TABLE provider_applications ADD COLUMN citizenship_attestation_signed TINYINT(1) DEFAULT 0 AFTER drug_alcohol_date",
            'citizenship_signature' => "ALTER TABLE provider_applications ADD COLUMN citizenship_signature LONGTEXT DEFAULT NULL AFTER citizenship_attestation_signed",
            'citizenship_signature_date' => "ALTER TABLE provider_applications ADD COLUMN citizenship_signature_date VARCHAR(50) DEFAULT NULL AFTER citizenship_signature",
            'date_of_birth' => "ALTER TABLE provider_applications ADD COLUMN date_of_birth VARCHAR(50) DEFAULT NULL AFTER citizenship_signature_date",
            'position_applied_for' => "ALTER TABLE provider_applications ADD COLUMN position_applied_for VARCHAR(255) DEFAULT NULL AFTER date_of_birth",
            'citizenship_status' => "ALTER TABLE provider_applications ADD COLUMN citizenship_status VARCHAR(100) DEFAULT NULL AFTER position_applied_for",
            'non_compete_signed' => "ALTER TABLE provider_applications ADD COLUMN non_compete_signed TINYINT(1) DEFAULT 0 AFTER citizenship_status",
            'non_compete_signature' => "ALTER TABLE provider_applications ADD COLUMN non_compete_signature LONGTEXT DEFAULT NULL AFTER non_compete_signed",
            'non_compete_date' => "ALTER TABLE provider_applications ADD COLUMN non_compete_date VARCHAR(50) DEFAULT NULL AFTER non_compete_signature",
            'non_compete_pdf' => "ALTER TABLE provider_applications ADD COLUMN non_compete_pdf VARCHAR(255) DEFAULT NULL AFTER non_compete_date"
        ];
        
        foreach ($columnsToCheck as $columnName => $alterQuery) {
            $checkColumn = $conn->query("SHOW COLUMNS FROM provider_applications LIKE '$columnName'");
            
            if ($checkColumn->num_rows == 0) {
                if ($conn->query($alterQuery)) {
                    error_log("Successfully added $columnName column to provider_applications table");
                } else {
                    error_log("Failed to add $columnName column: " . $conn->error);
                }
            }
        }
        
    } catch (Exception $e) {
        error_log("Error ensuring table columns: " . $e->getMessage());
        // Don't throw exception here - we want the API to continue working even if column additions fail
    }
}

// Ensure required columns exist before processing requests
ensureTableColumns($conn);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            // Check if requesting a specific application
            if (isset($_GET['id'])) {
                $applicationId = intval($_GET['id']);
                
                $sql = "SELECT 
                            id,
                            full_name,
                            email,
                            phone,
                            address,
                            is_cna_hha_caregiver,
                            work_ethic,
                            education,
                            licenses,
                            years_experience,
                            license_type,
                            license_number,
                            malpractice_provider,
                            profile_image,
                            education_image,
                            license_image,
                            work_history,
                            references_data,
                            liability_signed,
                            liability_signature,
                            background_acknowledged,
                            malpractice_acknowledged,
                            exclusion_screening_signed,
                            exclusion_screening_signature,
                            exclusion_screening_date,
                            additional_data,
                            status,
                            created_at,
                            drug_alcohol_signed,
                            drug_alcohol_signature,
                            drug_alcohol_date,
                            drug_alcohol_pdf,
                            liability_pdf,
                            exclusion_pdf,
                            citizenship_pdf,
                            citizenship_attestation_signed,
                            citizenship_signature,
                            citizenship_signature_date,
                            date_of_birth,
                            position_applied_for,
                            citizenship_status,
                            specialty,
                            provider_id,
                            non_compete_signed,
                            non_compete_signature,
                            non_compete_date,
                            non_compete_pdf,
                            updated_at
                        FROM provider_applications 
                        WHERE id = ?";
                
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    throw new Exception("Prepare failed: " . $conn->error);
                }
                
                $stmt->bind_param("i", $applicationId);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($application = $result->fetch_assoc()) {
                    // Parse JSON fields safely
                    if ($application['work_history']) {
                        $decoded = json_decode($application['work_history'], true);
                        $application['work_history'] = $decoded ?: $application['work_history'];
                    }
                    if ($application['references_data']) {
                        $decoded = json_decode($application['references_data'], true);
                        $application['references_data'] = $decoded ?: $application['references_data'];
                    }
                    
                    echo json_encode([
                        'success' => true,
                        'application' => $application
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'error' => 'Application not found'
                    ]);
                }
                
                $stmt->close();
                $conn->close();
                exit();
            }
            
            // Get all provider applications with calculated missing fields and completion status
            $sql = "SELECT 
                        id,
                        full_name as name,
                        email,
                        phone,
                        address,
                        is_cna_hha_caregiver,
                        work_ethic,
                        education,
                        licenses,
                        years_experience,
                        license_type,
                        license_number,
                        malpractice_provider,
                        profile_image,
                        education_image,
                        license_image,
                        work_history,
                        references_data,
                        liability_signed,
                        liability_signature,
                        background_acknowledged,
                        malpractice_acknowledged,
                        exclusion_screening_signed,
                        exclusion_screening_signature,
                        exclusion_screening_date,
                        additional_data,
                        status,
                        created_at,
                        drug_alcohol_signed,
                        drug_alcohol_signature,
                        drug_alcohol_date,
                        drug_alcohol_pdf,
                        liability_pdf,
                        exclusion_pdf,
                        citizenship_pdf,
                        citizenship_attestation_signed,
                        citizenship_signature,
                        citizenship_signature_date,
                        date_of_birth,
                        position_applied_for,
                        citizenship_status,
                        specialty,
                        provider_id,
                        non_compete_signed,
                        non_compete_signature,
                        non_compete_date,
                        non_compete_pdf,
                        updated_at
                    FROM provider_applications 
                    ORDER BY created_at DESC";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            $applications = $result->fetch_all(MYSQLI_ASSOC);
            
            // Process each application to add missing fields and completion status
            foreach ($applications as &$app) {
                $missing_fields = [];
                
                // Required fields check
                if (empty($app['name'])) $missing_fields[] = 'Full Name';
                if (empty($app['email'])) $missing_fields[] = 'Email';
                if (empty($app['phone'])) $missing_fields[] = 'Phone';
                if (empty($app['address'])) $missing_fields[] = 'Address';
                if (empty($app['license_type'])) $missing_fields[] = 'License Type';
                if (empty($app['license_number'])) $missing_fields[] = 'License Number';
                if (empty($app['years_experience'])) $missing_fields[] = 'Years Experience';
                if (empty($app['work_ethic'])) $missing_fields[] = 'Work Ethic';
                if (empty($app['education'])) $missing_fields[] = 'Education';
                if (empty($app['work_history'])) $missing_fields[] = 'Work History';
                if (empty($app['references_data'])) $missing_fields[] = 'References';
                
                // Document checks
                if (empty($app['profile_image'])) $missing_fields[] = 'Profile Image';
                if (empty($app['education_image'])) $missing_fields[] = 'Education Document';
                if (empty($app['license_image'])) $missing_fields[] = 'License Document';
                
                // Signature checks
                if (!$app['liability_signed'] || empty($app['liability_signature'])) $missing_fields[] = 'Liability Agreement';
                if (!$app['background_acknowledged']) $missing_fields[] = 'Background Check';
                if (!$app['malpractice_acknowledged']) $missing_fields[] = 'Malpractice Insurance';
                if (!$app['exclusion_screening_signed'] || empty($app['exclusion_screening_signature'])) $missing_fields[] = 'Exclusion Screening';
                if (!$app['drug_alcohol_signed'] || empty($app['drug_alcohol_signature'])) $missing_fields[] = 'Drug & Alcohol Policy';
                if (!$app['citizenship_attestation_signed'] || empty($app['citizenship_signature'])) $missing_fields[] = 'Citizenship Attestation';
                if (!$app['non_compete_signed'] || empty($app['non_compete_signature'])) $missing_fields[] = 'Non-Compete Clause';
                
                $app['missing_fields'] = $missing_fields;
                $app['is_complete'] = empty($missing_fields);
                
                // Set specialty and provider_id with fallbacks
                $app['specialty'] = $app['specialty'] ?: $app['license_type']; // Use specialty column or fallback to license_type
                $app['provider_id'] = $app['provider_id'] ?: ('APP' . $app['id']); // Use provider_id column or generate one
                
                // Convert numeric fields
                $app['id'] = (int)$app['id'];
                $app['is_cna_hha_caregiver'] = (int)$app['is_cna_hha_caregiver'];
                $app['years_experience'] = (int)$app['years_experience'];
                $app['liability_signed'] = (int)$app['liability_signed'];
                $app['background_acknowledged'] = (int)$app['background_acknowledged'];
                $app['malpractice_acknowledged'] = (int)$app['malpractice_acknowledged'];
                $app['exclusion_screening_signed'] = (int)$app['exclusion_screening_signed'];
                $app['drug_alcohol_signed'] = (int)$app['drug_alcohol_signed'];
                $app['citizenship_attestation_signed'] = (int)$app['citizenship_attestation_signed'];
                $app['non_compete_signed'] = (int)$app['non_compete_signed'];
            }
            
            echo json_encode([
                'success' => true,
                'applications' => $applications,
                'total' => count($applications)
            ]);
            
        } catch(Exception $e) {
            error_log("Provider applications GET error: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                echo json_encode(['success' => false, 'error' => 'Application ID is required']);
                exit;
            }
            
            $applicationId = intval($input['id']);
            
            // Check if this is just a status update (legacy support)
            if (isset($input['status']) && count($input) == 2) {
                $allowed_statuses = ['pending', 'under_review', 'approved', 'rejected'];
                if (!in_array($input['status'], $allowed_statuses)) {
                    echo json_encode(['success' => false, 'error' => 'Invalid status']);
                    exit;
                }
                
                // Check if updated_at column exists before using it
                $checkColumn = $conn->query("SHOW COLUMNS FROM provider_applications LIKE 'updated_at'");
                $updateTimestamp = ($checkColumn->num_rows > 0) ? ", updated_at = NOW()" : "";
                
                $sql = "UPDATE provider_applications SET status = ?" . $updateTimestamp . " WHERE id = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    throw new Exception("Prepare failed: " . $conn->error);
                }
                
                $stmt->bind_param("si", $input['status'], $applicationId);
                $stmt->execute();
                
                if ($stmt->affected_rows > 0) {
                    echo json_encode(['success' => true, 'message' => 'Status updated successfully']);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Application not found or no changes made']);
                }
                
                $stmt->close();
                exit;
            }
            
            // Full application update
            $updateFields = [];
            $updateValues = [];
            $types = '';
            
            // Define allowed fields for update with their database column names
            $allowedFields = [
                'full_name' => 's',
                'email' => 's',
                'phone' => 's',
                'address' => 's',
                'is_cna_hha_caregiver' => 'i',
                'work_ethic' => 's',
                'education' => 's',
                'licenses' => 's',
                'years_experience' => 'i',
                'license_type' => 's',
                'license_number' => 's',
                'malpractice_provider' => 's',
                'work_history' => 's',
                'references_data' => 's',
                'additional_data' => 's',
                'status' => 's',
                'specialty' => 's',
                'provider_id' => 's',
                'date_of_birth' => 's',
                'position_applied_for' => 's',
                'citizenship_status' => 's',
                'non_compete_signed' => 'i',
                'non_compete_signature' => 's',
                'non_compete_date' => 's',
                'non_compete_pdf' => 's'
            ];
            
            // Build update query dynamically
            foreach ($allowedFields as $field => $type) {
                if (isset($input[$field])) {
                    $updateFields[] = "$field = ?";
                    
                    // Handle JSON fields
                    if (in_array($field, ['work_history', 'references_data']) && is_string($input[$field])) {
                        // Already JSON string from frontend
                        $updateValues[] = $input[$field];
                    } else if (in_array($field, ['work_history', 'references_data']) && is_array($input[$field])) {
                        // Convert array to JSON
                        $updateValues[] = json_encode($input[$field]);
                    } else {
                        $updateValues[] = $input[$field];
                    }
                    
                    $types .= $type;
                }
            }
            
            if (empty($updateFields)) {
                echo json_encode(['success' => false, 'error' => 'No valid fields to update']);
                exit;
            }
            
            // Validate status if provided
            if (isset($input['status'])) {
                $allowed_statuses = ['pending', 'under_review', 'approved', 'rejected'];
                if (!in_array($input['status'], $allowed_statuses)) {
                    echo json_encode(['success' => false, 'error' => 'Invalid status']);
                    exit;
                }
            }
            
            // Validate email format if provided
            if (isset($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'error' => 'Invalid email format']);
                exit;
            }
            
            // Add updated_at timestamp only if the column exists
            $checkColumn = $conn->query("SHOW COLUMNS FROM provider_applications LIKE 'updated_at'");
            if ($checkColumn->num_rows > 0) {
                $updateFields[] = "updated_at = NOW()";
            }
            
            $sql = "UPDATE provider_applications SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $updateValues[] = $applicationId;
            $types .= 'i';
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            
            $stmt->bind_param($types, ...$updateValues);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                // Get updated application data
                $getStmt = $conn->prepare("SELECT * FROM provider_applications WHERE id = ?");
                $getStmt->bind_param("i", $applicationId);
                $getStmt->execute();
                $result = $getStmt->get_result();
                $updatedApplication = $result->fetch_assoc();
                
                // Log the update for audit purposes
                error_log("Application updated - ID: $applicationId, Admin: {$_SESSION['username']}, Fields: " . implode(', ', array_keys($allowedFields)));
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Application updated successfully',
                    'application' => $updatedApplication
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Application not found or no changes made']);
            }
            
            $stmt->close();
            
        } catch(Exception $e) {
            error_log("Provider applications PUT error: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                echo json_encode(['success' => false, 'error' => 'Application ID is required']);
                exit;
            }
            
            $applicationId = intval($input['id']);
            
            // First, check if the application exists and get its details
            $checkStmt = $conn->prepare("SELECT id, full_name, email FROM provider_applications WHERE id = ?");
            $checkStmt->bind_param("i", $applicationId);
            $checkStmt->execute();
            $result = $checkStmt->get_result();
            
            if ($result->num_rows === 0) {
                echo json_encode(['success' => false, 'error' => 'Application not found']);
                exit;
            }
            
            $application = $result->fetch_assoc();
            $checkStmt->close();
            
            // Begin transaction for safe deletion
            $conn->begin_transaction();
            
            try {
                // Delete related records first (if any foreign key constraints exist)
                // This is a placeholder - adjust based on your actual database schema
                
                // Delete from providers table if exists
                $deleteProviderStmt = $conn->prepare("DELETE FROM providers WHERE application_id = ?");
                if ($deleteProviderStmt) {
                    $deleteProviderStmt->bind_param("i", $applicationId);
                    $deleteProviderStmt->execute();
                    $deleteProviderStmt->close();
                }
                
                // Delete from application_status_history if exists
                $deleteHistoryStmt = $conn->prepare("DELETE FROM application_status_history WHERE application_id = ?");
                if ($deleteHistoryStmt) {
                    $deleteHistoryStmt->bind_param("i", $applicationId);
                    $deleteHistoryStmt->execute();
                    $deleteHistoryStmt->close();
                }
                
                // Delete the main application record
                $deleteStmt = $conn->prepare("DELETE FROM provider_applications WHERE id = ?");
                $deleteStmt->bind_param("i", $applicationId);
                $deleteStmt->execute();
                
                if ($deleteStmt->affected_rows > 0) {
                    $conn->commit();
                    
                    // Log the deletion for audit purposes
                    error_log("Application deleted - ID: $applicationId, Name: {$application['full_name']}, Email: {$application['email']}, Admin: {$_SESSION['username']}");
                    
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Application deleted successfully',
                        'deleted_application' => [
                            'id' => $applicationId,
                            'name' => $application['full_name'],
                            'email' => $application['email']
                        ]
                    ]);
                } else {
                    $conn->rollback();
                    echo json_encode(['success' => false, 'error' => 'Failed to delete application']);
                }
                
                $deleteStmt->close();
                
            } catch (Exception $e) {
                $conn->rollback();
                throw $e;
            }
            
        } catch(Exception $e) {
            error_log("Provider applications DELETE error: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

$conn->close();
?>