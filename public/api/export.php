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

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

// Check authentication - using user_id instead of admin_logged_in
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
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
    exit();
}

// Export applications
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['type']) && $_GET['type'] === 'applications') {
    try {
        $format = isset($_GET['format']) ? trim($_GET['format']) : 'csv';
        $status = isset($_GET['status']) ? trim($_GET['status']) : '';
        $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : '';
        $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : '';
        
        // Build query
        $whereConditions = [];
        $params = [];
        $types = "";
        
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
        
        // Get applications
        $sql = "SELECT * FROM applications $whereClause ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $applications = [];
        while ($row = $result->fetch_assoc()) {
            $applications[] = $row;
        }
        
        if ($format === 'csv') {
            // Generate CSV
            $filename = 'applications_export_' . date('Y-m-d_H-i-s') . '.csv';
            
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
            
            $output = fopen('php://output', 'w');
            
            // CSV headers
            if (!empty($applications)) {
                fputcsv($output, array_keys($applications[0]));
                
                // CSV data
                foreach ($applications as $application) {
                    fputcsv($output, $application);
                }
            }
            
            fclose($output);
            exit();
        } else {
            // Return JSON
            echo json_encode([
                'success' => true,
                'data' => $applications,
                'count' => count($applications)
            ]);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to export applications']);
    }
    exit();
}

// Export providers
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['type']) && $_GET['type'] === 'providers') {
    try {
        $format = isset($_GET['format']) ? trim($_GET['format']) : 'csv';
        $status = isset($_GET['status']) ? trim($_GET['status']) : '';
        $specialty = isset($_GET['specialty']) ? trim($_GET['specialty']) : '';
        
        // Build query
        $whereConditions = [];
        $params = [];
        $types = "";
        
        if (!empty($status)) {
            $whereConditions[] = "status = ?";
            $params[] = $status;
            $types .= "s";
        }
        
        if (!empty($specialty)) {
            $whereConditions[] = "specialty = ?";
            $params[] = $specialty;
            $types .= "s";
        }
        
        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        // Get providers
        $sql = "SELECT * FROM provider_applications $whereClause ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $providers = [];
        while ($row = $result->fetch_assoc()) {
            $providers[] = $row;
        }
        
        if ($format === 'csv') {
            // Generate CSV
            $filename = 'providers_export_' . date('Y-m-d_H-i-s') . '.csv';
            
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
            
            $output = fopen('php://output', 'w');
            
            // CSV headers
            if (!empty($providers)) {
                fputcsv($output, array_keys($providers[0]));
                
                // CSV data
                foreach ($providers as $provider) {
                    fputcsv($output, $provider);
                }
            }
            
            fclose($output);
            exit();
        } else {
            // Return JSON
            echo json_encode([
                'success' => true,
                'data' => $providers,
                'count' => count($providers)
            ]);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to export providers']);
    }
    exit();
}

// Export communications
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['type']) && $_GET['type'] === 'communications') {
    try {
        $format = isset($_GET['format']) ? trim($_GET['format']) : 'csv';
        $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : '';
        $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : '';
        
        // Build query
        $whereConditions = [];
        $params = [];
        $types = "";
        
        if (!empty($dateFrom)) {
            $whereConditions[] = "DATE(sent_at) >= ?";
            $params[] = $dateFrom;
            $types .= "s";
        }
        
        if (!empty($dateTo)) {
            $whereConditions[] = "DATE(sent_at) <= ?";
            $params[] = $dateTo;
            $types .= "s";
        }
        
        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
        
        // Get communications
        $sql = "SELECT * FROM provider_communications $whereClause ORDER BY sent_at DESC";
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $communications = [];
        while ($row = $result->fetch_assoc()) {
            $communications[] = $row;
        }
        
        if ($format === 'csv') {
            // Generate CSV
            $filename = 'communications_export_' . date('Y-m-d_H-i-s') . '.csv';
            
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
            
            $output = fopen('php://output', 'w');
            
            // CSV headers
            if (!empty($communications)) {
                fputcsv($output, array_keys($communications[0]));
                
                // CSV data
                foreach ($communications as $communication) {
                    fputcsv($output, $communication);
                }
            }
            
            fclose($output);
            exit();
        } else {
            // Return JSON
            echo json_encode([
                'success' => true,
                'data' => $communications,
                'count' => count($communications)
            ]);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to export communications']);
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
?>