<?php
// Set proper headers
header('Content-Type: application/json');

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// CORS headers
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

// Start session
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

// Rate limiting function
function checkRateLimit() {
    $rateLimitKey = 'pricing_api_' . $_SESSION['user_id'];
    $rateLimit = $_SESSION[$rateLimitKey] ?? 0;
    if (time() - $rateLimit < 2) { // 2 second minimum between requests
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many requests. Please wait a moment.']);
        exit();
    }
    $_SESSION[$rateLimitKey] = time();
}

// Check if user has pricing management access
function hasPricingAccess($conn, $userId) {
    $stmt = $conn->prepare("SELECT username, role FROM admin_users WHERE id = ? AND status = 'active'");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        // Allow access for super_admin or specific usernames
        $allowedUsers = ['admin', 'slewis', 'tone'];
        return $user['role'] === 'super_admin' || in_array($user['username'], $allowedUsers);
    }
    
    return false;
}

// Input sanitization function
function sanitizeInput($data) {
    if (is_string($data)) {
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
    return $data;
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

// Check pricing access
if (!hasPricingAccess($conn, $_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Access denied. You do not have permission to manage pricing.']);
    exit();
}

// Apply rate limiting (except for GET requests)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    checkRateLimit();
}

// Ensure price_plans table exists
function ensurePricePlansTable($conn) {
    $createTableSQL = "CREATE TABLE IF NOT EXISTS price_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_tier VARCHAR(100) NOT NULL,
        included_services TEXT NOT NULL,
        patient_price DECIMAL(10,2) NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        notes TEXT DEFAULT NULL,
        is_popular BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($createTableSQL)) {
        throw new Exception("Failed to create price_plans table: " . $conn->error);
    }
}

// Validate price input
function validatePrice($price) {
    if (!is_numeric($price) || $price < 0) {
        return false;
    }
    return true;
}

try {
    ensurePricePlansTable($conn);
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get pagination parameters
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = ($page - 1) * $limit;
            
            // Validate pagination
            if ($page < 1) $page = 1;
            if ($limit < 1 || $limit > 100) $limit = 50;
            
            // Get total count
            $countResult = $conn->query("SELECT COUNT(*) as total FROM price_plans");
            $totalCount = $countResult->fetch_assoc()['total'];
            
            // Get paginated results
            $stmt = $conn->prepare("SELECT * FROM price_plans ORDER BY patient_price ASC LIMIT ? OFFSET ?");
            $stmt->bind_param("ii", $limit, $offset);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if (!$result) {
                throw new Exception("Query failed: " . $conn->error);
            }
            
            $plans = [];
            while ($row = $result->fetch_assoc()) {
                $plan = [
                    'id' => (int)$row['id'],
                    'service_tier' => $row['service_tier'],
                    'included_services' => $row['included_services'],
                    'patient_price' => (float)$row['patient_price'],
                    'enabled' => (bool)$row['enabled'],
                    'notes' => $row['notes'],
                    'is_popular' => (bool)$row['is_popular'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
                $plans[] = $plan;
            }
            
            echo json_encode([
                'success' => true,
                'plans' => $plans,
                'total' => (int)$totalCount,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => ceil($totalCount / $limit)
            ]);
            break;
            
        case 'POST':
            // Create new pricing plan
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['service_tier']) || !isset($input['included_services']) || !isset($input['patient_price'])) {
                echo json_encode(['success' => false, 'error' => 'Missing required fields']);
                exit();
            }
            
            // Validate price
            if (!validatePrice($input['patient_price'])) {
                echo json_encode(['success' => false, 'error' => 'Invalid price value. Price must be a positive number.']);
                exit();
            }
            
            // Sanitize inputs
            $service_tier = sanitizeInput($input['service_tier']);
            $included_services = sanitizeInput($input['included_services']);
            $patient_price = (float)$input['patient_price'];
            $enabled = isset($input['enabled']) ? (bool)$input['enabled'] : true;
            $notes = isset($input['notes']) ? sanitizeInput($input['notes']) : null;
            $is_popular = isset($input['is_popular']) ? (bool)$input['is_popular'] : false;
            
            $stmt = $conn->prepare("INSERT INTO price_plans (service_tier, included_services, patient_price, enabled, notes, is_popular) VALUES (?, ?, ?, ?, ?, ?)");
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            $stmt->bind_param("ssdssi", 
                $service_tier,
                $included_services,
                $patient_price,
                $enabled,
                $notes,
                $is_popular
            );
            
            if ($stmt->execute()) {
                $newId = $conn->insert_id;
                
                // Log the action
                error_log("Pricing plan created - ID: $newId, Tier: $service_tier, Admin: {$_SESSION['username']}");
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Pricing plan created successfully',
                    'id' => $newId
                ]);
            } else {
                throw new Exception("Failed to create pricing plan: " . $stmt->error);
            }
            break;
            
        case 'PUT':
            // Update pricing plan
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                echo json_encode(['success' => false, 'error' => 'Plan ID is required']);
                exit();
            }
            
            // Validate price if provided
            if (isset($input['patient_price']) && !validatePrice($input['patient_price'])) {
                echo json_encode(['success' => false, 'error' => 'Invalid price value. Price must be a positive number.']);
                exit();
            }
            
            $planId = (int)$input['id'];
            $updateFields = [];
            $updateValues = [];
            $types = '';
            
            $allowedFields = [
                'service_tier' => 's',
                'included_services' => 's',
                'patient_price' => 'd',
                'enabled' => 'i',
                'notes' => 's',
                'is_popular' => 'i'
            ];
            
            foreach ($allowedFields as $field => $type) {
                if (isset($input[$field])) {
                    $updateFields[] = "$field = ?";
                    
                    if ($type === 'i' && is_bool($input[$field])) {
                        $updateValues[] = $input[$field] ? 1 : 0;
                    } else {
                        // Sanitize string fields
                        if ($type === 's') {
                            $updateValues[] = sanitizeInput($input[$field]);
                        } else {
                            $updateValues[] = $input[$field];
                        }
                    }
                    
                    $types .= $type;
                }
            }
            
            if (empty($updateFields)) {
                echo json_encode(['success' => false, 'error' => 'No valid fields to update']);
                exit();
            }
            
            $sql = "UPDATE price_plans SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $updateValues[] = $planId;
            $types .= 'i';
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$updateValues);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    // Log the action
                    error_log("Pricing plan updated - ID: $planId, Admin: {$_SESSION['username']}");
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Pricing plan updated successfully'
                    ]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Plan not found or no changes made']);
                }
            } else {
                throw new Exception("Failed to update pricing plan: " . $stmt->error);
            }
            break;
            
        case 'DELETE':
            // Delete pricing plan
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                echo json_encode(['success' => false, 'error' => 'Plan ID is required']);
                exit();
            }
            
            $planId = (int)$input['id'];
            
            // Get plan details for logging
            $getStmt = $conn->prepare("SELECT service_tier FROM price_plans WHERE id = ?");
            $getStmt->bind_param("i", $planId);
            $getStmt->execute();
            $result = $getStmt->get_result();
            $plan = $result->fetch_assoc();
            
            if (!$plan) {
                echo json_encode(['success' => false, 'error' => 'Plan not found']);
                exit();
            }
            
            $stmt = $conn->prepare("DELETE FROM price_plans WHERE id = ?");
            $stmt->bind_param("i", $planId);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    // Log the action
                    error_log("Pricing plan deleted - ID: $planId, Tier: {$plan['service_tier']}, Admin: {$_SESSION['username']}");
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Pricing plan deleted successfully'
                    ]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Plan not found']);
                }
            } else {
                throw new Exception("Failed to delete pricing plan: " . $stmt->error);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    error_log("Pricing admin API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error occurred',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>