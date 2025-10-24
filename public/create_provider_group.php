<?php
// Display errors for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Load configuration
$config = require __DIR__ . '/../includes/config.php';

// Function to log messages
function logMessage($message) {
    $logFile = __DIR__ . '/provider_group_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
    
    // If this is being included from another script, don't echo
    if (basename($_SERVER['SCRIPT_NAME']) == 'create_provider_group.php') {
        echo "$message<br>";
    }
}

try {
    logMessage("Starting provider group creation process");
    
    // Connect to the database
    $mysqli = new mysqli(
        $config['DB_HOST'],
        $config['DB_USER'],
        $config['DB_PASS'],
        $config['DB_NAME']
    );

    if ($mysqli->connect_error) {
        throw new Exception("Database connection failed: " . $mysqli->connect_error);
    }
    
    logMessage("Database connection successful");
    
    // Create provider_emails table if it doesn't exist
    $createTable = "CREATE TABLE IF NOT EXISTS provider_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!$mysqli->query($createTable)) {
        throw new Exception("Error creating provider_emails table: " . $mysqli->error);
    }
    
    logMessage("provider_emails table created or already exists");
    
    // Check if there are already emails in the provider_emails table
    $checkEmails = $mysqli->query("SELECT COUNT(*) as count FROM provider_emails");
    $emailCount = $checkEmails->fetch_assoc()['count'];
    
    if ($emailCount > 0) {
        logMessage("provider_emails table already has $emailCount emails. Skipping import.");
    } else {
        // Import emails from provider_surveys table
        $providersTableCheck = $mysqli->query("SHOW TABLES LIKE 'provider_surveys'");
        
        if ($providersTableCheck->num_rows > 0) {
            logMessage("Importing emails from provider_surveys table...");
            
            // Check if provider_surveys table has an email column
            $result = $mysqli->query("SHOW COLUMNS FROM provider_surveys LIKE 'email'");
            
            if ($result->num_rows > 0) {
                // Import emails from provider_surveys table using INSERT IGNORE to skip duplicates
                $importQuery = "INSERT IGNORE INTO provider_emails (email, status)
                               SELECT DISTINCT email, 'active' FROM provider_surveys 
                               WHERE email IS NOT NULL AND email != '' AND email LIKE '%@%'";
                
                if ($mysqli->query($importQuery)) {
                    $count = $mysqli->affected_rows;
                    logMessage("Imported $count unique emails from provider_surveys table");
                } else {
                    throw new Exception("Error importing from provider_surveys table: " . $mysqli->error);
                }
            } else {
                logMessage("provider_surveys table exists but has no email column");
            }
        } else {
            logMessage("provider_surveys table does not exist");
        }
    }
    
    // Close database connection
    $mysqli->close();
    
    logMessage("Provider group creation process completed successfully");
    
} catch (Exception $e) {
    logMessage("Error: " . $e->getMessage());
}
?>