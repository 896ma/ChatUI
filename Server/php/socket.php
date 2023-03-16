<?php
session_start();
require_once 'vendor/autoload.php';
require_once 'messages.php';
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
class ChatServer implements MessageComponentInterface {
    protected $clients;
    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }
    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "connection established ({$conn->resourceId})\n";
        $query = $conn->httpRequest->getUri()->getQuery();
        parse_str($query, $params);
    }
    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg);
        $phone = $data->phone_number;
        $conn = new mysqli("localhost", "root", "", "chatui");
        $sql = $conn->prepare("SELECT blocked FROM users where user_phone = '$phone'");
        $sql->execute();
        $result = $sql->get_result();         
            if(!$result){
            die("failed to connect to database". $sql . ", " . mysqli_error($conn));
            }
            $sender = $result->fetch_assoc();
           $status = $sender["blocked"];
            $blocked = intval($status);
    if  ($blocked){
        echo "this user has been blocked";
        $error = "You can no longer send messages because You have been blocked!";
        $data = json_decode($msg);
        $data->info = $error;
        $data->blocked = true; #boolean for a blocked user.
        $msg = json_encode($data);
        foreach ($this->clients as $client) {
            if ($client == $from) {                                                              
                $client->send($msg);
            }
        }
        #if the user is not blocked proceed to check the message.
    }   else {
        echo "message recieved: {$msg}\n";
        $data = json_decode($msg);
        $phone_number = $data->phone_number;
        $message = $data->message;
        //get the sender id from the database.
            $sql = $conn->prepare("SELECT * FROM users WHERE user_phone = ?");
            $sql->bind_param("s", $phone_number);
            $sql->execute();
            $result = $sql->get_result();         
            if(!$result){
            die("failed to connect to database". $sql . ", " . mysqli_error($conn));
            }
            $sender = $result->fetch_assoc();
            $sender_id = $sender["user_id"];
            $userName = $sender["user_name"];                           
    if(sendNewMessage($sender_id, $message)){
            $data->username = $userName;
            $data->good_message = true; #boolean for a good message.
            $new_msg = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client !== $from) {                                                              
                    $client->send($new_msg);
                }
            }
    }  else{#when the message contains vulgar words.
            //update the number of times the user has been warned.
            $data = json_decode($msg);
            $data->bad_message = true; #bolean for bad message.
            //update the user blocked status
            $sql = $conn->prepare("UPDATE users SET warning_count = warning_count + 1 WHERE user_id = ?");
            $sql->bind_param("s", $sender_id);
            $sql->execute();
            //check the number of warnings that the user has been given.
            $sql = $conn->prepare("SELECT warning_count FROM users WHERE user_id = ?");
            $sql->bind_param("s", $sender_id);
            $sql->execute();
            $result = $sql->get_result(); 
            if ($result->num_rows == 1) {
                $user = $result->fetch_assoc();
                $warnings_num = $user["warning_count"];
                //if the number of warnigs the user has been given is greater than 2(two) block them immedietly.
                if($warnings_num > 2){
                    $sql = $conn->prepare("UPDATE users SET blocked = true WHERE user_id = ?");
                    $sql->bind_param("s", $sender_id);
                    $sql->execute();
                    $_SESSION["blocked"] = true;
                    $data->username = $userName;
                    foreach ($this->clients as $client) {
                        // inform the users that this user has been blocked.
                        if ($client !== $from) {      
                            $data->has_been_blocked = true;#boolean for when a person has been blocked.
                            $data-> you_were_blocked = false;
                            $data->message = "Was blocked because of violating our terms of service!";
                            $bad_msg = json_encode($data);                                                         
                            $client->send($bad_msg);
                        }else{
                            //inform the user that he was blocked for violating the terms of service
                            $data-> you_were_blocked = true;#boolean for when you have been blocked.
                            $data->has_been_blocked = false;
                            $data->warnings = $warnings_num;
                            $data->message = "you were blocked because you violated our terms of service!";
                            $warn_msg = json_encode($data);  
                            $client->send($warn_msg);
                        }
                    } 
                }else { 
                    //if the number of warnings is less than maximum. 
                        foreach ($this->clients as $client) {
                            // inform the other users that this message violates our terms of service.
                            if ($client !== $from) {
                                $data->cant_be_displayed = true;#boolean for an undisplayable message      
                                $data->warning = false;
                                $data->username = $userName;
                                $data->message = "This message violates  our terms of use! It cannot be displayed.";
                                $bad_msg = json_encode($data);                                                         
                                $client->send($bad_msg);
                            }else{
                                $data->warning = true;#boolean for a warning message.
                                $data->cant_be_displayed = false;
                                $data->warnings = $warnings_num;
                                $data->username = "admin";
                                $data->message = "Warning! your message contains words that terms and conditions";
                                $warn_msg = json_encode($data);  
                                $client->send($warn_msg);
                            }
                        }    
                    }
            }
        }
        }
        $conn->close();
    }
    //when someone disconects from the web socket.
    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "connection closed \n";
    }
    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}
//creating the server socket
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ChatServer()
        )
    ),
    8080
);
echo "WebSocket server running on port 8080...\n";
$server->run();
?>