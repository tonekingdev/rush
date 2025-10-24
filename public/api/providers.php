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

// Get all providers
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $status = isset($_GET['status']) ? trim($_GET['status']) : '';
        $specialty = isset($_GET['specialty']) ? trim($_GET['specialty']) : '';
        
        // Check if providers table exists
        $tableCheck = $conn->query("SHOW TABLES LIKE 'providers'");
        
        if ($tableCheck->num_rows > 0) {
            // Use providers table with actual field names
            $whereConditions = [];
            $params = [];
            $types = "";
            
            if (!empty($search)) {
                $whereConditions[] = "(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR provider_id LIKE ?)";
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
            
            if (!empty($specialty)) {
                $whereConditions[] = "specialty LIKE ?";
                $params[] = "%$specialty%";
                $types .= "s";
            }
            
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM providers $whereClause";
            $countStmt = $conn->prepare($countSql);
            
            if (!empty($params)) {
                $countStmt->bind_param($types, ...$params);
            }
            
            $countStmt->execute();
            $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
            
            // Get providers using actual field names
            $sql = "SELECT id, provider_id, full_name as name, email, phone, 
                           specialty, license_number, license_type, license_state,
                           practice_name, practice_address, practice_phone, practice_email,
                           npi_number, dea_number, status, approved_date as created_at
                    FROM providers 
                    $whereClause 
                    ORDER BY approved_date DESC 
                    LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            $types .= "ii";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $providers = [];
            while ($row = $result->fetch_assoc()) {
                $providers[] = $row;
            }
            
        } else {
            // Fallback to provider_applications table for approved applications
            $whereConditions = ["status = 'approved'"];
            $params = [];
            $types = "";
            
            if (!empty($search)) {
                $whereConditions[] = "(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
                $searchParam = "%$search%";
                $params[] = $searchParam;
                $params[] = $searchParam;
                $params[] = $searchParam;
                $types .= "sss";
            }
            
            if (!empty($specialty)) {
                $whereConditions[] = "license_type LIKE ?";
                $params[] = "%$specialty%";
                $types .= "s";
            }
            
            $whereClause = "WHERE " . implode(" AND ", $whereConditions);
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM provider_applications $whereClause";
            $countStmt = $conn->prepare($countSql);
            
            if (!empty($params)) {
                $countStmt->bind_param($types, ...$params);
            }
            
            $countStmt->execute();
            $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
            
            // Get providers from applications
            $sql = "SELECT id, full_name as name, email, phone, 
                           license_type as specialty, license_number, 
                           '' as practice_name, status, created_at
                    FROM provider_applications 
                    $whereClause 
                    ORDER BY created_at DESC 
                    LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            $types .= "ii";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $providers = [];
            while ($row = $result->fetch_assoc()) {
                $providers[] = $row;
            }
        }
        
        echo json_encode([
            'success' => true,
            'providers' => $providers,
            'pagination' => [
                'total' => (int)$totalCount,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Providers fetch error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch providers: ' . $e->getMessage()]);
    }
    exit();
}

    // POST method to create a new provider
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (!isset($data['full_name']) || !isset($data['email'])) {
            echo json_encode(['success' => false, 'error' => 'Full name and email are required']);
            exit;
        }

        // Basic email validation
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'error' => 'Invalid email format']);
            exit;
        }

        // Determine which table to insert into
        $tableCheck = $conn->query("SHOW TABLES LIKE 'providers'");
        $useProvidersTable = $tableCheck->num_rows > 0;

        if ($useProvidersTable) {
            // Insert into 'providers' table
            $sql = "INSERT INTO providers (full_name, email, phone, specialty, license_number, license_type, license_state, practice_name, practice_address, practice_phone, practice_email, npi_number, dea_number, status, notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssssssssssssss",
                $data['full_name'],
                $data['email'],
                $data['phone'] ?? null,
                $data['specialty'] ?? null,
                $data['license_number'] ?? null,
                $data['license_type'] ?? null,
                $data['license_state'] ?? null,
                $data['practice_name'] ?? null,
                $data['practice_address'] ?? null,
                $data['practice_phone'] ?? null,
                $data['practice_email'] ?? null,
                $data['npi_number'] ?? null,
                $data['dea_number'] ?? null,
                $data['status'] ?? 'pending',
                $data['notes'] ?? null
            );
        } else {
            // Insert into 'provider_applications' table
            $sql = "INSERT INTO provider_applications (full_name, email, phone, address, license_type, license_number, years_experience, malpractice_provider, work_ethic, education, licenses, status, additional_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssssssissssss",
                $data['full_name'],
                $data['email'],
                $data['phone'] ?? null,
                $data['address'] ?? null,
                $data['license_type'] ?? null,
                $data['license_number'] ?? null,
                $data['years_experience'] ?? null,
                $data['malpractice_provider'] ?? null,
                $data['work_ethic'] ?? null,
                $data['education'] ?? null,
                $data['licenses'] ?? null,
                $data['status'] ?? 'pending',
                $data['additional_data'] ?? null
            );
        }

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Provider created successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error creating provider: ' . $stmt->error]);
        }

        $stmt->close();
    }

// Update provider status OR full provider update
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception("Provider ID is required");
        }
        
        $providerId = intval($data['id']);
        
        // Check if this is just a status update (existing functionality)
        if (isset($data['status']) && count($data) == 2) {
            $status = trim($data['status']);
            
            // Validate status
            $validStatuses = ['active', 'inactive', 'suspended'];
            if (!in_array($status, $validStatuses)) {
                throw new Exception("Invalid status");
            }
            
            // Check if providers table exists
            $tableCheck = $conn->query("SHOW TABLES LIKE 'providers'");
            
            if ($tableCheck->num_rows > 0) {
                // Update provider status in providers table
                $stmt = $conn->prepare("UPDATE providers SET status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->bind_param("si", $status, $providerId);
            } else {
                // Update in provider_applications table
                $stmt = $conn->prepare("UPDATE provider_applications SET status = ? WHERE id = ?");
                $stmt->bind_param("si", $status, $providerId);
            }
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Provider status updated successfully'
                ]);
            } else {
                throw new Exception("Failed to update provider status");
            }
            
            $stmt->close();
            exit();
        }
        
        // Full provider update (new functionality)
        $updateFields = [];
        $updateValues = [];
        $types = '';
        
        // Check which table to update
        $tableCheck = $conn->query("SHOW TABLES LIKE 'providers'");
        $useProvidersTable = $tableCheck->num_rows > 0;
        
        if ($useProvidersTable) {
            // Define allowed fields for providers table
            $allowedFields = [
                'full_name' => 's',
                'email' => 's',
                'phone' => 's',
                'specialty' => 's',
                'license_number' => 's',
                'license_type' => 's',
                'license_state' => 's',
                'practice_name' => 's',
                'practice_address' => 's',
                'practice_phone' => 's',
                'practice_email' => 's',
                'npi_number' => 's',
                'dea_number' => 's',
                'status' => 's'
            ];
        } else {
            // Define allowed fields for provider_applications table
            $allowedFields = [
                'full_name' => 's',
                'email' => 's',
                'phone' => 's',
                'license_type' => 's',
                'license_number' => 's',
                'status' => 's'
            ];
        }
        
        // Build update query dynamically
        foreach ($allowedFields as $field => $type) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                $updateValues[] = $data[$field];
                $types .= $type;
            }
        }
        
        if (empty($updateFields)) {
            echo json_encode(['success' => false, 'error' => 'No valid fields to update']);
            exit();
        }
        
        // Validate email format if provided
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'error' => 'Invalid email format']);
            exit();
        }
        
        // Add updated timestamp if possible
        if ($useProvidersTable) {
            $updateFields[] = "updated_at = NOW()";
            $tableName = "providers";
        } else {
            $tableName = "provider_applications";
        }
        
        $sql = "UPDATE $tableName SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $updateValues[] = $providerId;
        $types .= 'i';
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param($types, ...$updateValues);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            // Get updated provider data
            $getStmt = $conn->prepare("SELECT * FROM $tableName WHERE id = ?");
            $getStmt->bind_param("i", $providerId);
            $getStmt->execute();
            $result = $getStmt->get_result();
            $updatedProvider = $result->fetch_assoc();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Provider updated successfully',
                'provider' => $updatedProvider
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Provider not found or no changes made']);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        error_log("Provider update error: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Delete provider (new functionality)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id'])) {
            echo json_encode(['success' => false, 'error' => 'Provider ID is required']);
            exit();
        }
        
        $providerId = intval($input['id']);
        
        // Check which table to use
        $tableCheck = $conn->query("SHOW TABLES LIKE 'providers'");
        $useProvidersTable = $tableCheck->num_rows > 0;
        $tableName = $useProvidersTable ? 'providers' : 'provider_applications';
        
        // First, check if the provider exists and get details
        $checkStmt = $conn->prepare("SELECT id, full_name, email FROM $tableName WHERE id = ?");
        $checkStmt->bind_param("i", $providerId);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode(['success' => false, 'error' => 'Provider not found']);
            exit();
        }
        
        $provider = $result->fetch_assoc();
        $checkStmt->close();
        
        // Begin transaction for safe deletion
        $conn->begin_transaction();
        
        try {
            // Delete related records first (if any foreign key constraints exist)
            
            // Delete from provider_schedules if exists
            $deleteScheduleStmt = $conn->prepare("DELETE FROM provider_schedules WHERE provider_id = ?");
            if ($deleteScheduleStmt) {
                $deleteScheduleStmt->bind_param("i", $providerId);
                $deleteScheduleStmt->execute();
                $deleteScheduleStmt->close();
            }
            
            // Delete from provider_services if exists
            $deleteServicesStmt = $conn->prepare("DELETE FROM provider_services WHERE provider_id = ?");
            if ($deleteServicesStmt) {
                $deleteServicesStmt->bind_param("i", $providerId);
                $deleteServicesStmt->execute();
                $deleteServicesStmt->close();
            }
            
            // Delete the main provider record
            $deleteStmt = $conn->prepare("DELETE FROM $tableName WHERE id = ?");
            $deleteStmt->bind_param("i", $providerId);
            $deleteStmt->execute();
            
            if ($deleteStmt->affected_rows > 0) {
                $conn->commit();
                
                // Log the deletion for audit purposes
                error_log("Provider deleted - ID: $providerId, Name: {$provider['full_name']}, Email: {$provider['email']}, Admin: {$_SESSION['username']}");
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Provider deleted successfully',
                    'deleted_provider' => [
                        'id' => $providerId,
                        'name' => $provider['full_name'],
                        'email' => $provider['email']
                    ]
                ]);
            } else {
                $conn->rollback();
                echo json_encode(['success' => false, 'error' => 'Failed to delete provider']);
            }
            
            $deleteStmt->close();
            
        } catch (Exception $e) {
            $conn->rollback();
            throw $e;
        }
        
    } catch (Exception $e) {
        error_log("Provider DELETE error: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
?>