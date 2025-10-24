<?php
// Display errors for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Load configuration
$config = require __DIR__ . '/../includes/config.php';

echo "<h1>Provider Table Check</h1>";

try {
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
    
    echo "<p>Database connection successful</p>";
    
    // Check if provider_emails table exists
    $tableCheck = $mysqli->query("SHOW TABLES LIKE 'provider_emails'");
    
    if ($tableCheck->num_rows > 0) {
        echo "<p style='color:green'>✓ provider_emails table exists</p>";
        
        // Check table structure
        $result = $mysqli->query("DESCRIBE provider_emails");
        echo "<h2>Table Structure:</h2>";
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "<td>" . $row['Extra'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Check table content
        $result = $mysqli->query("SELECT * FROM provider_emails LIMIT 10");
        $count = $mysqli->query("SELECT COUNT(*) as total FROM provider_emails")->fetch_assoc()['total'];
        
        echo "<h2>Table Content (First 10 rows, Total: $count):</h2>";
        
        if ($result->num_rows > 0) {
            echo "<table border='1' cellpadding='5'>";
            
            // Get field names
            $fields = $result->fetch_fields();
            echo "<tr>";
            foreach ($fields as $field) {
                echo "<th>" . $field->name . "</th>";
            }
            echo "</tr>";
            
            // Reset result pointer
            $result->data_seek(0);
            
            // Output data
            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                foreach ($row as $value) {
                    echo "<td>" . htmlspecialchars($value) . "</td>";
                }
                echo "</tr>";
            }
            
            echo "</table>";
        } else {
            echo "<p>No data in table</p>";
        }
        
    } else {
        echo "<p style='color:red'>✗ provider_emails table does not exist</p>";
        
        // Try to manually create the table
        echo "<h2>Attempting to create table manually:</h2>";
        
        $createTable = "CREATE TABLE IF NOT EXISTS provider_emails (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        if ($mysqli->query($createTable)) {
            echo "<p style='color:green'>✓ Table created successfully</p>";
        } else {
            echo "<p style='color:red'>✗ Error creating table: " . $mysqli->error . "</p>";
        }
    }
    
    // Close connection
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>