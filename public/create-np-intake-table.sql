-- Create table for Nurse practitioner (NP) Intake Applications
CREATE TABLE IF NOT EXISTS np_intake (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    npi_number VARCHAR(20) DEFAULT NULL,
    np_license_number VARCHAR(100) DEFAULT NULL,
    years_experience VARCHAR(50) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for faster lookups and filtering
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);