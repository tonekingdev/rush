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

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
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

try {
    // Check if price_plans table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'price_plans'");
    
    if ($tableCheck->num_rows === 0) {
        // Table doesn't exist, return empty array
        echo json_encode([
            'success' => true,
            'plans' => [],
            'message' => 'Pricing table not found'
        ]);
        exit();
    }
    
    // Check if required columns exist and add them if missing
    $columnsToCheck = [
        'notes' => "ALTER TABLE price_plans ADD COLUMN notes TEXT DEFAULT NULL",
        'is_popular' => "ALTER TABLE price_plans ADD COLUMN is_popular BOOLEAN DEFAULT FALSE"
    ];
    
    foreach ($columnsToCheck as $columnName => $alterQuery) {
        $checkColumn = $conn->query("SHOW COLUMNS FROM price_plans LIKE '$columnName'");
        
        if ($checkColumn->num_rows == 0) {
            if ($conn->query($alterQuery)) {
                error_log("Successfully added $columnName column to price_plans table");
            } else {
                error_log("Failed to add $columnName column: " . $conn->error);
            }
        }
    }
    
    // Fetch all enabled pricing plans
    $sql = "SELECT 
                id,
                service_tier,
                included_services,
                patient_price,
                enabled,
                notes,
                is_popular,
                created_at,
                updated_at
            FROM price_plans 
            WHERE enabled = TRUE 
            ORDER BY patient_price ASC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $plans = [];
    while ($row = $result->fetch_assoc()) {
        // Convert database values to appropriate types
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
        'total' => count($plans)
    ]);
    
} catch (Exception $e) {
    error_log("Pricing API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Failed to fetch pricing data',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>