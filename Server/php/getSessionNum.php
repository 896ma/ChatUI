<?php
session_start();
$phoneNumber = $_SESSION['phone_number'];
header('Content-Type: application/json');
echo json_encode(array("phoneNumber" => $phoneNumber));
?>
