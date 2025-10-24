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
ini_set('session.cookie_secure', 1); // Requires HTTPS
ini_set('session.use_only_cookies', 1);
session_start();

// Check authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Database connection
try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    
    // Log the actual error securely
    if (function_exists('log_error')) {
        log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
    }
    exit();
}

// Get communications
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $type = isset($_GET['type']) ? trim($_GET['type']) : '';
        $status = isset($_GET['status']) ? trim($_GET['status']) : '';
        
        // Build query
        $whereConditions = [];
        $params = [];
        $types = "";
        
        if (!empty($search)) {
            $whereConditions[] = "(c.recipient_name LIKE ? OR c.recipient_email LIKE ? OR c.subject LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= "sss";
        }
        
        if (!empty($type)) {
            $whereConditions[] = "c.communication_type = ?";
            $params[] = $type;
            $types .= "s";
        }
        
        if (!empty($status)) {
            $whereConditions[] = "c.status = ?";
            $params[] = $status;
            $types .= "s";
        }
        
        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM provider_communications c $whereClause";
        $countStmt = $conn->prepare($countSql);
        
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
        }
        
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
        
        // Get communications
        $sql = "SELECT c.*, a.name as applicant_name 
                FROM provider_communications c 
                LEFT JOIN applications a ON c.application_id = a.id 
                $whereClause 
                ORDER BY c.sent_at DESC 
                LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= "ii";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $communications = [];
        while ($row = $result->fetch_assoc()) {
            $communications[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'communications' => $communications,
            'pagination' => [
                'total' => (int)$totalCount,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch communications']);
        
        // Log the actual error securely
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Send communication
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Include email functionality
        require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/email.php';
        require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/email-templates.php';
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $requiredFields = ['recipient_email', 'subject', 'message'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                throw new Exception("Missing required field: $field");
            }
        }
        
        $applicationId = isset($data['application_id']) ? intval($data['application_id']) : null;
        $recipientName = isset($data['recipient_name']) ? trim($data['recipient_name']) : '';
        $recipientEmail = trim($data['recipient_email']);
        $subject = trim($data['subject']);
        $message = trim($data['message']);
        $template = isset($data['template']) ? trim($data['template']) : 'custom';
        $communicationType = isset($data['communication_type']) ? trim($data['communication_type']) : 'email';
        $sentBy = $_SESSION['admin_username'];
        
        // Validate email
        if (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }
        
        // Prepare email content based on template
        $htmlContent = '';
        $replacements = [
            '{APPLICANT_NAME}' => $recipientName,
            '{RECIPIENT_NAME}' => $recipientName,
            '{EMAIL_SUBJECT}' => $subject,
            '{EMAIL_CONTENT}' => nl2br($message),
            '{YEAR}' => date('Y')
        ];
        
        switch ($template) {
            case 'application_received':
                $htmlContent = process_email_template(get_applicant_thank_you_template(), $replacements);
                break;
                
            case 'application_approved':
                $replacements['{APPLICATION_STATUS}'] = 'Approved';
                $replacements['{STATUS_DETAILS}'] = nl2br($message);
                $htmlContent = process_email_template(get_application_status_template(), $replacements);
                break;
                
            case 'application_rejected':
                $replacements['{APPLICATION_STATUS}'] = 'Not Approved';
                $replacements['{STATUS_DETAILS}'] = nl2br($message);
                $htmlContent = process_email_template(get_application_status_template(), $replacements);
                break;
                
            case 'documents_required':
                $replacements['{DOCUMENT_LIST}'] = nl2br($message);
                $htmlContent = process_email_template(get_document_request_template(), $replacements);
                break;
                
            case 'custom':
            default:
                $htmlContent = process_email_template(get_custom_email_template(), $replacements);
                break;
        }
        
        // Create plain text version
        $plainTextContent = strip_tags(str_replace('<br>', "\n", $htmlContent));
        
        // Send email
        $result = send_email($recipientEmail, $subject, $htmlContent, $plainTextContent);
        
        if ($result['success']) {
            // Log the communication in the database
            $stmt = $conn->prepare("INSERT INTO provider_communications (application_id, recipient_name, recipient_email, subject, message, communication_type, template_used, sent_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent')");
            $stmt->bind_param("isssssss", $applicationId, $recipientName, $recipientEmail, $subject, $message, $communicationType, $template, $sentBy);
            
            if ($stmt->execute()) {
                $communicationId = $conn->insert_id;
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Communication sent successfully',
                    'communication_id' => $communicationId
                ]);
            } else {
                throw new Exception("Failed to log communication");
            }
        } else {
            throw new Exception("Failed to send email: " . $result['message']);
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Update communication status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id']) || empty($data['id'])) {
            throw new Exception("Communication ID is required");
        }
        
        $communicationId = intval($data['id']);
        $status = isset($data['status']) ? trim($data['status']) : '';
        
        if (empty($status)) {
            throw new Exception("Status is required");
        }
        
        $validStatuses = ['sent', 'delivered', 'read', 'failed'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status");
        }
        
        // Update communication
        $stmt = $conn->prepare("UPDATE provider_communications SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $communicationId);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Communication status updated successfully'
            ]);
        } else {
            throw new Exception("Failed to update communication status");
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

// Delete communication
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        if (!isset($_GET['id']) || empty($_GET['id'])) {
            throw new Exception("Communication ID is required");
        }
        
        $communicationId = intval($_GET['id']);
        
        // Check if communication exists
        $stmt = $conn->prepare("SELECT id FROM provider_communications WHERE id = ?");
        $stmt->bind_param("i", $communicationId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Communication not found");
        }
        
        // Delete the communication
        $stmt = $conn->prepare("DELETE FROM provider_communications WHERE id = ?");
        $stmt->bind_param("i", $communicationId);
        
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Communication deleted successfully'
            ]);
        } else {
            throw new Exception("Failed to delete communication");
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        
        // Log the error
        if (function_exists('log_error')) {
            log_error(['message' => $e->getMessage(), 'file' => __FILE__, 'line' => __LINE__]);
        }
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
