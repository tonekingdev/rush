<?php
header('Content-Type: application/json');
require_once 'config.php';
echo json_encode(get_stripe_public_config());

