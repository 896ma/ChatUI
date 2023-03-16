<?php
function sendNewMessage($sender_id, $message_body){
  $conn = new mysqli("localhost", "root", "", "chatui");
      if ($conn->connect_error) {
          die("Connection failed: " . $conn->connect_error);
      }
      #check if the message contains vulgar words.
      $bad_message = false;
      $vulgar_word = array(); 
      $bad_words = file('server/lib/vulgar_words.txt', FILE_IGNORE_NEW_LINES);
      foreach ($bad_words as $bad_word) {
          if(strpos(strtolower($message_body), $bad_word)){
            $bad_message = true;
            $vulgar_word = $bad_word;
          }
      }
      if($bad_message){# if the message is bad warn the user.
          return false;      
      } else{ #if the message is fine add it to messages
          $sql = $conn->prepare("INSERT INTO messages(sender_id, message_text) VALUES(?, ?)");
          $sql->bind_param("is",$sender_id, $message_body);
          try{
            if ($sql->execute() === TRUE) {
              echo "message sent successifully<br>";
              createXML();           
             }
          } catch(Exception $e){
            if ($e->getCode() == 1062) {
              echo "Error 123: " . $e->getMessage();
            } else {
              echo "An error occurred: " . $e->getMessage();
            }
          }
        }
  $conn->close();
  return true;
}

function createXML(){
    $conn = new mysqli("localhost", "root", "", "chatui");
      if ($conn->connect_error) {
          die("Connection failed: " . $conn->connect_error);
      }
    $sql = "SELECT * FROM messages JOIN users ON users.user_id = messages.sender_id;";
    $result = $conn->query($sql);
    if(mysqli_num_rows($result) > 0){
       // Create new DOMDocument object
      $doc = new DOMDocument('1.0', 'UTF-8');
      // Create root element 'messages'
      $root = $doc->createElement('messages');
      $doc->appendChild($root);
        // Create message element and add child elements
        while($row = mysqli_fetch_assoc($result)){
        $message = $doc->createElement('message');
        $root->appendChild($message);
        $message_id = $doc->createElement('message_id', $row["message_id"]);
        $message->appendChild($message_id);
        $user_name = $doc->createElement('user_name', $row["user_name"]);
        $message->appendChild($user_name);
        $email = $doc->createElement('phone_number', $row["user_phone"]);
        $message->appendChild($email);
        $message_body = $doc->createElement('message_body', $row["message_text"]);
        $message->appendChild($message_body);
        $send_time = $doc->createElement('send_time', $row["send_date"]);
        $message->appendChild($send_time);
        // Set header content type to XML
        #header('Content-type: application/xml');
        }
  }
    $doc->formatOutput = true;
    $doc->save('server\xml\messages.xml');
    $conn->close();

}
?>