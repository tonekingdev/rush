-- Add new columns for spam protection to existing email_connections table
ALTER TABLE email_connections 
ADD COLUMN ip_address VARCHAR(45) AFTER email,
ADD COLUMN form_start_time TIMESTAMP NULL AFTER ip_address,
ADD COLUMN submission_time TIMESTAMP NULL AFTER form_start_time,
ADD INDEX idx_email_created (email, created_at),
ADD INDEX idx_ip_created (ip_address, created_at);