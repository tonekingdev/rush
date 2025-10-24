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

// Get documents
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $applicationId = isset($_GET['application_id']) ? intval($_GET['application_id']) : null;
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $status = isset($_GET['status']) ? trim($_GET['status']) : '';
        $type = isset($_GET['type']) ? trim($_GET['type']) : '';
        
        // First check if application_documents table exists
        $tableCheck = $conn->query("SHOW TABLES LIKE 'application_documents'");
        
        if ($tableCheck->num_rows === 0) {
            // If application_documents doesn't exist, return empty result
            echo json_encode([
                'success' => true,
                'documents' => [],
                'pagination' => [
                    'total' => 0,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => 0
                ]
            ]);
            exit();
        }
        
        // Check if provider_applications table exists
        $appTableCheck = $conn->query("SHOW TABLES LIKE 'provider_applications'");
        
        // Build query using application_documents table
        $whereConditions = [];
        $params = [];
        $types = "";
        
        if ($applicationId) {
            $whereConditions[] = "ad.application_id = ?";
            $params[] = $applicationId;
            $types .= "i";
        }
        
        if (!empty($search)) {
            $whereConditions[] = "(ad.file_name LIKE ? OR pa.full_name LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= "ss";
        }
        
        if (!empty($type)) {
            $whereConditions[] = "ad.document_type = ?";
            $params[] = $type;
            $types .= "s";
        }
        
        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total 
                     FROM application_documents ad 
                     LEFT JOIN provider_applications pa ON ad.application_id = pa.id 
                     $whereClause";
        $countStmt = $conn->prepare($countSql);
        
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
        }
        
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
        
        // Get documents using actual field names
        $sql = "SELECT ad.id, ad.application_id, ad.document_type, 
                       ad.file_name as filename, ad.file_name as original_name,
                       ad.file_path, ad.file_size, ad.mime_type, 
                       ad.uploaded_by, ad.uploaded_at,
                       pa.full_name as applicant_name 
                FROM application_documents ad 
                LEFT JOIN provider_applications pa ON ad.application_id = pa.id 
                $whereClause 
                ORDER BY ad.uploaded_at DESC 
                LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= "ii";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $documents = [];
        while ($row = $result->fetch_assoc()) {
            // Add status field if it doesn't exist
            $row['status'] = 'uploaded'; // Default status since the table doesn't have this field
            $row['notes'] = '';
            $row['reviewed_by'] = '';
            $row['reviewed_at'] = null;
            $documents[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'documents' => $documents,
            'pagination' => [
                'total' => (int)$totalCount,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Documents fetch error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch documents: ' . $e->getMessage()]);
    }
    exit();
}

// Upload document
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check if file was uploaded
        if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("No file uploaded or upload error");
        }
        
        $applicationId = isset($_POST['application_id']) ? intval($_POST['application_id']) : 0;
        $documentType = isset($_POST['document_type']) ? trim($_POST['document_type']) : '';
        
        if (!$applicationId) {
            throw new Exception("Application ID is required");
        }
        
        if (empty($documentType)) {
            throw new Exception("Document type is required");
        }
        
        $file = $_FILES['document'];
        $originalName = $file['name'];
        $tmpName = $file['tmp_name'];
        $fileSize = $file['size'];
        
        // Validate file size (5MB max)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($fileSize > $maxSize) {
            throw new Exception("File size exceeds 5MB limit");
        }
        
        // Validate file type
        $allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
        $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        
        if (!in_array($fileExtension, $allowedTypes)) {
            throw new Exception("File type not allowed. Allowed types: " . implode(', ', $allowedTypes));
        }
        
        // Create upload directory if it doesn't exist
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/uploads/documents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $filename = uniqid() . '_' . time() . '.' . $fileExtension;
        $filePath = $uploadDir . $filename;
        $relativePath = '/uploads/documents/' . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($tmpName, $filePath)) {
            throw new Exception("Failed to save uploaded file");
        }
        
        // Save to application_documents table using actual field names
        $stmt = $conn->prepare("INSERT INTO application_documents (application_id, document_type, file_name, file_path, file_size, mime_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $mimeType = mime_content_type($filePath);
        $uploadedBy = $_SESSION['user_id'];
        $stmt->bind_param("isssisi", $applicationId, $documentType, $filename, $relativePath, $fileSize, $mimeType, $uploadedBy);
        
        if ($stmt->execute()) {
            $documentId = $conn->insert_id;
            
            echo json_encode([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'document_id' => $documentId
            ]);
        } else {
            // Delete the uploaded file if database insert fails
            unlink($filePath);
            throw new Exception("Failed to save document information");
        }
        
    } catch (Exception $e) {
        error_log("Document upload error: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Update document status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id']) || empty($data['id'])) {
            throw new Exception("Document ID is required");
        }
        
        $documentId = intval($data['id']);
        $status = isset($data['status']) ? trim($data['status']) : '';
        $notes = isset($data['notes']) ? trim($data['notes']) : '';
        
        if (empty($status)) {
            throw new Exception("Status is required");
        }
        
        $validStatuses = ['pending', 'approved', 'rejected'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status");
        }
        
        // Update document in application_documents table
        $stmt = $conn->prepare("UPDATE application_documents SET status = ?, notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?");
        $reviewedBy = $_SESSION['username'] ?? 'admin';
        $stmt->bind_param("sssi", $status, $notes, $reviewedBy, $documentId);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Document status updated successfully'
            ]);
        } else {
            throw new Exception("Failed to update document status");
        }
        
    } catch (Exception $e) {
        error_log("Document status update error: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Delete document
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        if (!isset($_GET['id']) || empty($_GET['id'])) {
            throw new Exception("Document ID is required");
        }
        
        $documentId = intval($_GET['id']);
        
        // Get document info from application_documents table
        $stmt = $conn->prepare("SELECT file_name, file_path FROM application_documents WHERE id = ?");
        $stmt->bind_param("i", $documentId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Document not found");
        }
        
        $document = $result->fetch_assoc();
        $filename = $document['file_name'];
        $filePath = $document['file_path'];
        
        // Delete from database
        $stmt = $conn->prepare("DELETE FROM application_documents WHERE id = ?");
        $stmt->bind_param("i", $documentId);
        
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            // Delete physical file
            $fullPath = $_SERVER['DOCUMENT_ROOT'] . $filePath;
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } else {
            throw new Exception("Failed to delete document");
        }
        
    } catch (Exception $e) {
        error_log("Document delete error: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
?>