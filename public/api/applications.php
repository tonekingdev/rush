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

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
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
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit();
}

// Get single application by ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    try {
        $applicationId = intval($_GET['id']);
        
        // Get application with ALL fields
        $sql = "SELECT id, full_name, email, phone, license_number, license_type, 
                       license_state, years_experience, education, certifications,
                       work_history, references, availability, preferred_locations,
                       emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                       background_check_consent, drug_test_consent, terms_accepted,
                       status, created_at, updated_at
                FROM provider_applications WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $applicationId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Application not found']);
            exit();
        }
        
        $row = $result->fetch_assoc();
        
        // Check for missing required fields
        $missingFields = [];
        $requiredFields = [
            'license_number' => 'License Number',
            'license_type' => 'License Type',
            'license_state' => 'License State',
            'years_experience' => 'Years of Experience',
            'education' => 'Education',
            'emergency_contact_name' => 'Emergency Contact Name',
            'emergency_contact_phone' => 'Emergency Contact Phone'
        ];
        
        foreach ($requiredFields as $field => $label) {
            if (empty($row[$field]) || $row[$field] === null) {
                $missingFields[] = $label;
            }
        }
        
        $application = [
            'id' => $row['id'],
            'full_name' => $row['full_name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'license_number' => $row['license_number'],
            'license_type' => $row['license_type'],
            'license_state' => $row['license_state'],
            'years_experience' => $row['years_experience'],
            'education' => $row['education'],
            'certifications' => $row['certifications'],
            'work_history' => $row['work_history'],
            'references' => $row['references'],
            'availability' => $row['availability'],
            'preferred_locations' => $row['preferred_locations'],
            'emergency_contact_name' => $row['emergency_contact_name'],
            'emergency_contact_phone' => $row['emergency_contact_phone'],
            'emergency_contact_relationship' => $row['emergency_contact_relationship'],
            'background_check_consent' => $row['background_check_consent'],
            'drug_test_consent' => $row['drug_test_consent'],
            'terms_accepted' => $row['terms_accepted'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'missing_fields' => $missingFields,
            'is_complete' => empty($missingFields)
        ];
        
        echo json_encode([
            'success' => true,
            'application' => $application
        ]);
        
    } catch (Exception $e) {
        error_log("Application fetch error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch application: ' . $e->getMessage()]);
    }
    exit();
}

// Get all applications with complete details (existing code)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $status = isset($_GET['status']) ? trim($_GET['status']) : '';
        $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : '';
        $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : '';
        
        // Build query for provider_applications table with ALL fields
        $whereConditions = [];
        $params = [];
        $types = "";
        
        if (!empty($search)) {
            $whereConditions[] = "(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR license_number LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= "ssss";
        }
        
        if (!empty($status)) {
            $whereConditions[] = "status = ?";
            $params[] = $status;
            $types .= "s";
        }
        
        if (!empty($dateFrom)) {
            $whereConditions[] = "DATE(created_at) >= ?";
            $params[] = $dateFrom;
            $types .= "s";
        }
        
        if (!empty($dateTo)) {
            $whereConditions[] = "DATE(created_at) <= ?";
            $params[] = $dateTo;
            $types .= "s";
        }
        
        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM provider_applications $whereClause";
        $countStmt = $conn->prepare($countSql);
        
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
        }
        
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
        
        // Get applications with ALL fields
        $sql = "SELECT id, full_name, email, phone, license_number, license_type, 
                       license_state, years_experience, education, certifications,
                       work_history, references, availability, preferred_locations,
                       emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                       background_check_consent, drug_test_consent, terms_accepted,
                       status, created_at, updated_at
                FROM provider_applications $whereClause 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= "ii";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $applications = [];
        while ($row = $result->fetch_assoc()) {
            // Check for missing required fields
            $missingFields = [];
            $requiredFields = [
                'license_number' => 'License Number',
                'license_type' => 'License Type',
                'license_state' => 'License State',
                'years_experience' => 'Years of Experience',
                'education' => 'Education',
                'emergency_contact_name' => 'Emergency Contact Name',
                'emergency_contact_phone' => 'Emergency Contact Phone'
            ];
            
            foreach ($requiredFields as $field => $label) {
                if (empty($row[$field]) || $row[$field] === null) {
                    $missingFields[] = $label;
                }
            }
            
            $applications[] = [
                'id' => $row['id'],
                'name' => $row['full_name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'license_number' => $row['license_number'],
                'license_type' => $row['license_type'],
                'license_state' => $row['license_state'],
                'years_experience' => $row['years_experience'],
                'education' => $row['education'],
                'certifications' => $row['certifications'],
                'work_history' => $row['work_history'],
                'references' => $row['references'],
                'availability' => $row['availability'],
                'preferred_locations' => $row['preferred_locations'],
                'emergency_contact_name' => $row['emergency_contact_name'],
                'emergency_contact_phone' => $row['emergency_contact_phone'],
                'emergency_contact_relationship' => $row['emergency_contact_relationship'],
                'background_check_consent' => $row['background_check_consent'],
                'drug_test_consent' => $row['drug_test_consent'],
                'terms_accepted' => $row['terms_accepted'],
                'specialty' => $row['license_type'] ?: 'Not specified',
                'status' => $row['status'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'missing_fields' => $missingFields,
                'is_complete' => empty($missingFields),
                'provider_id' => 'APP' . $row['id']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'applications' => $applications,
            'pagination' => [
                'total' => (int)$totalCount,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Applications fetch error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch applications: ' . $e->getMessage()]);
    }
    exit();
}

// Update application status with confirmation (existing code)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id']) || !isset($data['status'])) {
            throw new Exception("Application ID and status are required");
        }
        
        $applicationId = intval($data['id']);
        $status = trim($data['status']);
        $adminNotes = isset($data['admin_notes']) ? trim($data['admin_notes']) : '';
        
        // Validate status
        $validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status");
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Get current application details
            $getAppStmt = $conn->prepare("SELECT * FROM provider_applications WHERE id = ?");
            $getAppStmt->bind_param("i", $applicationId);
            $getAppStmt->execute();
            $appResult = $getAppStmt->get_result();
            
            if ($appResult->num_rows === 0) {
                throw new Exception("Application not found");
            }
            
            $app = $appResult->fetch_assoc();
            $oldStatus = $app['status'];
            
            // Update application status
            $stmt = $conn->prepare("UPDATE provider_applications SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->bind_param("si", $status, $applicationId);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to update application status");
            }
            
            // Log status change in application_status_history table (if it exists)
            $tableCheck = $conn->query("SHOW TABLES LIKE 'application_status_history'");
            if ($tableCheck->num_rows > 0) {
                $historyStmt = $conn->prepare("
                    INSERT INTO application_status_history 
                    (application_id, old_status, new_status, admin_id, admin_username, notes, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW())
                ");
                $historyStmt->bind_param("isssss", 
                    $applicationId, 
                    $oldStatus, 
                    $status, 
                    $_SESSION['user_id'], 
                    $_SESSION['username'], 
                    $adminNotes
                );
                $historyStmt->execute();
            }
            
            // If approved, create provider record
            if ($status === 'approved') {
                // Check if providers table exists and if provider already exists
                $tableCheck = $conn->query("SHOW TABLES LIKE 'providers'");
                if ($tableCheck->num_rows > 0) {
                    $checkProviderStmt = $conn->prepare("SELECT id FROM providers WHERE application_id = ?");
                    $checkProviderStmt->bind_param("i", $applicationId);
                    $checkProviderStmt->execute();
                    $providerExists = $checkProviderStmt->get_result()->num_rows > 0;
                    
                    if (!$providerExists) {
                        // Create provider record
                        $insertProviderStmt = $conn->prepare("
                            INSERT INTO providers (
                                application_id, full_name, email, phone, 
                                license_number, license_type, license_state,
                                status, approved_date, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
                        ");
                        
                        $insertProviderStmt->bind_param("issssss", 
                            $applicationId,
                            $app['full_name'],
                            $app['email'],
                            $app['phone'],
                            $app['license_number'],
                            $app['license_type'],
                            $app['license_state']
                        );
                        
                        if (!$insertProviderStmt->execute()) {
                            throw new Exception("Failed to create provider record");
                        }
                    }
                }
            }
            
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => "Application status updated from '$oldStatus' to '$status' successfully",
                'old_status' => $oldStatus,
                'new_status' => $status
            ]);
            
        } catch (Exception $e) {
            $conn->rollback();
            throw $e;
        }
        
    } catch (Exception $e) {
        error_log("Application update error: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
?>