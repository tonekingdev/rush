<?php
// Only configure session if not already active
if (session_status() !== PHP_SESSION_ACTIVE) {
    ini_set('session.cookie_lifetime', 86400); // 24 hours
    ini_set('session.gc_maxlifetime', 86400); // 24 hours
    
    session_set_cookie_params([
        'lifetime' => 86400,
        'path' => '/',
        'domain' => 'rushhealthc.com', 
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    
    session_name('PHPSESSID');
    session_start();
}
?>