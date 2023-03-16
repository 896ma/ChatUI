<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $phoneNumber = $_POST['phone_no'];
    $password = $_POST['password'];
    $mysqli = new mysqli("localhost", "root", "", "chatui");
    // Query the database for the user with the specified username
    $stmt = $mysqli->prepare("SELECT * FROM users WHERE user_phone = ?");  
    $stmt->bind_param("s", $phoneNumber);    
    $stmt->execute();           
    $result = $stmt->get_result();                     
    if ($result->num_rows == 1)  {    
        $user = $result->fetch_assoc();        
            // Login successful
         echo json_encode(array("success" => true));       
            $_SESSION["phone_number"] = $phoneNumber;    
            $_SESSION["logged_in"] = true;   
           header("Location: /FrontEnd/chatpage.html");
       
           
    } else {      
        // User not found
        echo json_encode(array("error" => "phone number not found"));
    }   
    $stmt->close();
    $mysqli->close(); 
  } 
?>
