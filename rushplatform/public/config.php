<?php
define('LOG_FILE', 'error.log');

return [
    'SMTP_HOST' => 'smtp.hostinger.com',
    'SMTP_PORT' => 465,
    'SMTP_USER' => 'noreply@rushhealthc.com',
    'SMTP_PASS' => 'Ru5h0107!n3w',
    'DB_HOST' => 'localhost',
    'DB_USER' => 'u382076499_serviceadmin',
    'DB_PASS' => 'Ru5h0107!n3w',
    'DB_NAME' => 'u382076499_rush_platform'
];

function log_error($error_data) {
  $timestamp = date('Y-m-d H:i:s');
  $error_message = json_encode($error_data);
  file_put_contents(LOG_FILE, "[$timestamp] $error_message\n", FILE_APPEND);
}
?>
