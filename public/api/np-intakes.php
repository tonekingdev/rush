<?php
// Set proper headers
header('Content-Type: application/json');

// Define missing functions FIRST
if (!function_exists('sendJsonResponse')) {
    function sendJsonResponse($success, $message, $data = [], $httpCode = 200) {
        http_response_code($httpCode);
        echo json_encode([
            'success' => $success,
            'message' => $message,
            'data' => $data
        ]);
        exit();
    }
}

if (!function_exists('sanitize_input')) {
    function sanitize_input($data, $conn) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        $data = $conn->real_escape_string($data);
        return $data;
    }
}

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// Use the actual domain in production
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load configuration and ensure utility functions are available
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    sendJsonResponse(false, 'Unauthorized', [], 401);
}

try {
    // Database connection
    $conn = new mysqli(
        $config['DB_HOST'],
        $config['DB_USER'],
        $config['DB_PASS'],
        $config['DB_NAME'],
        $config['DB_PORT']
    );
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Check if an ID is present for detail view
    if (isset($_GET['id'])) {
        // --- DETAIL VIEW LOGIC ---
        $id = sanitize_input($_GET['id'], $conn);
        
        $stmt = $conn->prepare("
            SELECT id, firstName, lastName, email, phone, npi_number, np_license_number, years_experience, status, created_at 
            FROM np_intake 
            WHERE id = ?
        ");
        
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $application = $result->fetch_assoc();
        
        if ($application) {
            // Transform keys for frontend consistency
            $detailData = [
                'id' => (int)$application['id'],
                'firstName' => $application['firstName'],
                'lastName' => $application['lastName'],
                'email' => $application['email'],
                'phone' => $application['phone'],
                'npi' => $application['npi_number'],
                'license' => $application['np_license_number'],
                'experience' => (int)$application['years_experience'],
                'status' => $application['status'],
                'submitted_at' => $application['created_at'], // Use submitted_at for detail view
            ];
            
            sendJsonResponse(true, 'Application details fetched successfully', ['application' => $detailData]);
        } else {
            sendJsonResponse(false, 'Application not found', [], 404);
        }
        
        $stmt->close();
        
    } else {
        // --- LIST VIEW LOGIC ---
        
        // Fetch all NP intake applications (limit 50 by default, order by date)
        $sql = "SELECT id, firstName, lastName, email, phone, npi_number, np_license_number, years_experience, status, created_at 
                FROM np_intake 
                ORDER BY created_at DESC
                LIMIT 50"; 
                
        $result = $conn->query($sql);
        
        $applications = [];
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $applications[] = [
                    'id' => (int)$row['id'],
                    'firstName' => $row['firstName'],
                    'lastName' => $row['lastName'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'npi' => $row['npi_number'], // Changed from npi_number to npi
                    'license' => $row['np_license_number'], // Changed from np_license_number to license
                    'experience' => (int)$row['years_experience'],
                    'status' => $row['status'],
                    'created_at' => $row['created_at']
                ];
            }
        }
        
        sendJsonResponse(true, 'In-takes list fetched successfully', [
            'applications' => $applications,
            'total' => count($applications)
        ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    error_log('NP Intake API error: ' . $e->getMessage());
    sendJsonResponse(false, 'A server error occurred: ' . $e->getMessage(), [], 500);
}