<?php 
$phone = "1";
$conn = new mysqli("localhost", "root", "", "chatui");
$sql = $conn->prepare("SELECT blocked FROM users where user_phone = '$phone'");
$sql->execute();
$result = $sql->get_result();         
            if(!$result){
            die("failed to connect to database". $sql . ", " . mysqli_error($conn));
            }
            $sender = $result->fetch_assoc();
           $blocked = $sender["blocked"];
    echo $blocked;
?>