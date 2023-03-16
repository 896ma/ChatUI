/**
 * THE MESSAGE SENDING PART
 */
//Get the session number from the server in order to display messages sent by the current user on the right.
var sessionNumber;
function getSessionNumber() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/server/php/getSessionNum.php');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      sessionNumber = response.phoneNumber;
    }
  };
  xhr.send();
}
getSessionNumber();
//load the messages from the server using an ajax request  
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {loadMessagesFunction(this);}
  xhttp.open("POST", "/server/xml/messages.xml");
  xhttp.send();
//Display the messages on the page by loading the xml document returned from the server.
function loadMessagesFunction(xml) {
  const xmlDoc = xml.responseXML;
  const messages = xmlDoc.getElementsByTagName("message");
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const messageId = message.getElementsByTagName("message_id")[0].textContent;
    const xmluserName = message.getElementsByTagName("user_name")[0].textContent;
    const xmlphoneNumber = message.getElementsByTagName("phone_number")[0].textContent;
    const xmlmessageBody = message.getElementsByTagName("message_body")[0].textContent;
    const xmlsendTime = message.getElementsByTagName("send_time")[0].textContent;
    // Display the message information on a web page.
    //display messages sent by curent user differently.
    console.log(messageId);
    if(xmlphoneNumber === sessionNumber){//when message was sent by me
      showSentMessages(xmlmessageBody,  xmlsendTime);
    } else {//when message was sent by others
      showReceivedMessages(xmluserName, xmlsendTime, xmlmessageBody);
    }
    //put the current message into view
    var currrenMessage = document.getElementById(messageId, xmlsendTime);
    if (currrenMessage) {
        currrenMessage.scrollIntoView();
    }
  }
}
function showReceivedMessages(userName, sentAt, messageBody){
  const messagesDiv = document.getElementById("message-container-div");
  //div that contains the whole message-part.profile and content
      var contentsDiv = document.createElement("div");
          contentsDiv.className = "received-message-container";
      //create the elements to contain the message_body, username, email, and send time
        var userNameBOX = document.createElement("strong");
            userNameBOX.innerHTML = userName;
            contentsDiv.appendChild(userNameBOX);
        var messageText = document.createElement("p");
            messageText.innerHTML = messageBody;
            contentsDiv.appendChild(messageText);
        var sendTime = document.createElement("mark");
            sendTime.innerHTML = sentAt;
            contentsDiv.appendChild(sendTime);
      //put the current message into view
      messagesDiv.appendChild(contentsDiv);
      contentsDiv.scrollIntoView();
}
//diplay the send message.
function showSentMessages(message, sentAt){
  const messagesDiv = document.getElementById("message-container-div");
       const contentDiv = document.createElement("div");
              contentDiv.className = "sent-message-container";
              messagesDiv.appendChild(contentDiv);
      //create the elements to contain the message_body, username, phone, and send time
        const messageText = document.createElement("p");
            messageText.innerHTML = message;
            contentDiv.appendChild(messageText);
        const sendTime = document.createElement("mark");
            sendTime.innerHTML = sentAt;
            contentDiv.appendChild(sendTime);
      //put the current message into view
      contentDiv.scrollIntoView();
}