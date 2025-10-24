<?php
header('Content-Type: application/json');

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// CORS headers
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
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

try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // GET - Fetch patient surveys
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        
        // Build WHERE clause
        $whereConditions = [];
        $params = [];
        $types = '';
        
        if (!empty($status) && in_array($status, ['pending', 'approved', 'rejected'])) {
            $whereConditions[] = "ps.status = ?";
            $params[] = $status;
            $types .= 's';
        }
        
        if (!empty($search)) {
            $whereConditions[] = "(ps.full_name LIKE ? OR ps.email LIKE ? OR ps.phone_number LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= 'sss';
        }
        
        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
        
        // Get total count
        $countQuery = "SELECT COUNT(*) as total FROM patient_surveys ps $whereClause";
        if (!empty($params)) {
            $countStmt = $conn->prepare($countQuery);
            $countStmt->bind_param($types, ...$params);
            $countStmt->execute();
            $totalResult = $countStmt->get_result();
        } else {
            $totalResult = $conn->query($countQuery);
        }
        $total = $totalResult->fetch_assoc()['total'];
        
        // Get surveys with reviewer info
        $query = "SELECT ps.*, au.username as reviewed_by_name 
                  FROM patient_surveys ps 
                  LEFT JOIN admin_users au ON ps.reviewed_by = au.id 
                  $whereClause 
                  ORDER BY ps.submitted_at DESC 
                  LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        $types .= 'ii';
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $surveys = [];
        while ($row = $result->fetch_assoc()) {
            $surveys[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'surveys' => $surveys,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }
    
    // PUT - Update survey status (approve/reject)
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !isset($input['status'])) {
            throw new Exception('Survey ID and status are required');
        }
        
        $surveyId = intval($input['id']);
        $status = $input['status'];
        
        if (!in_array($status, ['approved', 'rejected'])) {
            throw new Exception('Invalid status');
        }
        
        $conn->begin_transaction();
        
        try {
            // Update survey status
            $stmt = $conn->prepare("UPDATE patient_surveys SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? WHERE id = ?");
            $stmt->bind_param("sii", $status, $_SESSION['user_id'], $surveyId);
            $stmt->execute();
            
            if ($stmt->affected_rows === 0) {
                throw new Exception('Survey not found or already processed');
            }
            
            // If approved, create user record
            if ($status === 'approved') {
                // Get survey data
                $surveyStmt = $conn->prepare("SELECT * FROM patient_surveys WHERE id = ?");
                $surveyStmt->bind_param("i", $surveyId);
                $surveyStmt->execute();
                $surveyData = $surveyStmt->get_result()->fetch_assoc();
                
                if (!$surveyData) {
                    throw new Exception('Survey data not found');
                }
                
                // Check if user already exists
                $checkStmt = $conn->prepare("SELECT id FROM users WHERE survey_id = ?");
                $checkStmt->bind_param("i", $surveyId);
                $checkStmt->execute();
                $existingUser = $checkStmt->get_result()->fetch_assoc();
                
                if (!$existingUser) {
                    // Create new user
                    $userStmt = $conn->prepare("
                        INSERT INTO users (
                            survey_id, full_name, email, phone_number, date_of_birth, zip_code,
                            interest_reasons, anticipated_services, medical_conditions, has_pcp,
                            taking_medications, has_insurance, insurance_provider, 
                            interested_in_payment_plans, accessibility_needs, additional_info,
                            approved_by
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    
                    $userStmt->bind_param("issssssssiiisisssi", 
                        $surveyId,
                        $surveyData['full_name'],
                        $surveyData['email'],
                        $surveyData['phone_number'],
                        $surveyData['date_of_birth'],
                        $surveyData['zip_code'],
                        $surveyData['interest_reasons'],
                        $surveyData['anticipated_services'],
                        $surveyData['medical_conditions'],
                        $surveyData['has_pcp'],
                        $surveyData['taking_medications'],
                        $surveyData['has_insurance'],
                        $surveyData['insurance_provider'],
                        $surveyData['interested_in_payment_plans'],
                        $surveyData['accessibility_needs'],
                        $surveyData['additional_info'],
                        $_SESSION['user_id']
                    );
                    
                    $userStmt->execute();
                }
            }
            
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => "Survey $status successfully" . ($status === 'approved' ? ' and user created' : '')
            ]);
            
        } catch (Exception $e) {
            $conn->rollback();
            throw $e;
        }
    }
    
    $conn->close();
    
} catch (Exception $e) {
    error_log('Patient surveys error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>