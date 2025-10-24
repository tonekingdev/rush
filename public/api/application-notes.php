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

// Start session with proper configuration
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Check authentication - Fixed to match your admin login system
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized', 'debug' => 'Session user_id not found']);
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

// Check if application_notes table exists
$tableCheck = $conn->query("SHOW TABLES LIKE 'application_notes'");
if ($tableCheck->num_rows === 0) {
    // Create the table if it doesn't exist
    $createTable = "CREATE TABLE application_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        content TEXT NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (application_id)
    )";
    
    if (!$conn->query($createTable)) {
        error_log("Failed to create application_notes table: " . $conn->error);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to initialize notes system']);
        exit();
    }
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            $applicationId = isset($_GET['application_id']) ? (int)$_GET['application_id'] : 0;
            
            if ($applicationId <= 0) {
                throw new Exception("Invalid application ID");
            }
            
            $sql = "SELECT * FROM application_notes WHERE application_id = ? ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $applicationId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $notes = [];
            while ($row = $result->fetch_assoc()) {
                $notes[] = [
                    'id' => (int)$row['id'],
                    'content' => $row['content'],
                    'created_by' => $row['created_by'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }
            
            echo json_encode([
                'success' => true,
                'notes' => $notes
            ]);
            
            $stmt->close();
        } catch (Exception $e) {
            error_log("Error fetching notes: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['application_id']) || !isset($data['content']) || !isset($data['created_by'])) {
                throw new Exception("Missing required fields");
            }
            
            $applicationId = (int)$data['application_id'];
            $content = trim($data['content']);
            $createdBy = $data['created_by'];
            
            if ($applicationId <= 0) {
                throw new Exception("Invalid application ID");
            }
            
            if (empty($content)) {
                throw new Exception("Note content cannot be empty");
            }
            
            $sql = "INSERT INTO application_notes (application_id, content, created_by) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iss", $applicationId, $content, $createdBy);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Note added successfully',
                    'note_id' => $stmt->insert_id
                ]);
            } else {
                throw new Exception("Failed to add note");
            }
            
            $stmt->close();
        } catch (Exception $e) {
            error_log("Error adding note: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'PUT':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id']) || !isset($data['content'])) {
                throw new Exception("Missing required fields");
            }
            
            $noteId = (int)$data['id'];
            $content = trim($data['content']);
            
            if ($noteId <= 0) {
                throw new Exception("Invalid note ID");
            }
            
            if (empty($content)) {
                throw new Exception("Note content cannot be empty");
            }
            
            $sql = "UPDATE application_notes SET content = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $content, $noteId);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Note updated successfully'
                ]);
            } else {
                throw new Exception("Note not found or no changes made");
            }
            
            $stmt->close();
        } catch (Exception $e) {
            error_log("Error updating note: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case 'DELETE':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                throw new Exception("Missing note ID");
            }
            
            $noteId = (int)$data['id'];
            
            if ($noteId <= 0) {
                throw new Exception("Invalid note ID");
            }
            
            $sql = "DELETE FROM application_notes WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $noteId);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Note deleted successfully'
                ]);
            } else {
                throw new Exception("Note not found");
            }
            
            $stmt->close();
        } catch (Exception $e) {
            error_log("Error deleting note: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}

$conn->close();
?>