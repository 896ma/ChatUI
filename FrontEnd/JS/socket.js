//get the session phone number
//Get the session number from the server in order to display messages sent by the current user on the right.
var sessionPhoneNumber;
function getSessionPhoneNumber() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/server/php/getSessionNum.php');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      sessionPhoneNumber = response.phoneNumber;
    }
  };
  xhr.send();
}
// Call the function when the page loads or when the user logs in
getSessionPhoneNumber();
//load the messages from the server using an ajax request
//connect to the websocket
const socket = new WebSocket('ws://localhost:8080');
socket.addEventListener('open', function (event) {
    console.log('WebSocket connection established.');
});
//WHEN A NEW MESSAGE IS RECEIVED
socket.addEventListener('message', function (event) {
    const message = JSON.parse(event.data);
    //Booleans to handle a blocked message.
    const blocked = message.blocked;
    if(blocked){
      //show a you are blocked message.
      const information = message.info;
      showWarning(information);

    }else {//if user is not blocked proceed to next step
          //when a message meets all the expected terms of use
          var userName = message.username;
          const GoodMessage = message.good_message;
          if(GoodMessage){
            var messageText = message.message;
            showReceivedMessages(userName, messageText);
          }
          //when a message voilates terms of use.     
          const BadMessage = message.bad_message;
          if(BadMessage){
              const hasBeenBlocked = message.has_been_blocked;
              const youWereBlocked = message.you_were_blocked;
              const cantBeDisplayed = message.cant_be_displayed;
              const warn = message.warning;
              var information = message.message;
              if(hasBeenBlocked){
                showGroupUpdates(information, userName);
              }
              if(youWereBlocked){
                showPersonUpdates(information);
              }
              if(cantBeDisplayed){
                showReceivedMessages(userName, information);
              }
              if(warn){
                warningsNum = message.warnings;
                showWarning(information, parseInt(warningsNum));
              }
          }
    }
    console.log('Received message:', message);
});
//get the current time stamp:
function getCurrentTime() {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0'); // get hours and pad with leading zero if necessary
    const minutes = String(date.getMinutes()).padStart(2, '0'); // get minutes and pad with leading zero if necessary
    const time = `${hours}:${minutes}`; // concatenate hours and minutes with a colon
    return time;
  }//console.log(getCurrentTime()); // output: "19:35" (assuming the current time is 7:35 PM)
//get the message from the user in order to send it.
function submitMessage(){
    const messagebox = document.getElementById('message-body');
    const message = messagebox.value;
    const phone_number = sessionPhoneNumber;
     //TODO: make sure a user does not send a blank message. and color the send button accordingly.
      if(message.trim() === ""){
        messagebox.style.borderColor = "gray";
      }else{
        sendMessage(phone_number, message);
        messagebox.value = "";
        messagebox.style.borderColor = "";
      } 
}
function sendMessage(phone_number, message) {
  var data = {
    phone_number:phone_number,
      message: message
  };
  showSentMessages(message);
  var messageData = JSON.stringify(data);
  socket.send(messageData);
}
function showReceivedMessages(userName, messageBody){
  const messagesDiv = document.getElementById("message-container-div");
  //div that contains the whole message-part.profile and content
      var contentsDiv = document.createElement("div");
          contentsDiv.className = "received-message-container";
      //create the elements to contain the message_body, username, email, and send time
        var JuserNameBOX = document.createElement("strong");
            JuserNameBOX.innerHTML = userName;
            contentsDiv.appendChild(JuserNameBOX);
        var JmessageText = document.createElement("p");
            JmessageText.innerHTML = messageBody;
            contentsDiv.appendChild(JmessageText);
        var JsendTime = document.createElement("mark");
            JsendTime.innerHTML = getCurrentTime();
            contentsDiv.appendChild(JsendTime);
      //put the current message into view
      messagesDiv.appendChild(contentsDiv);
      contentsDiv.scrollIntoView();
}
//diplay the send message.
function showSentMessages(message){
  const messagesDiv = document.getElementById("message-container-div");
       const contentDiv = document.createElement("div");
              contentDiv.className = "sent-message-container";
              messagesDiv.appendChild(contentDiv);
      //create the elements to contain the message_body, username, phone, and send time
        var SmessageText = document.createElement("p");
            SmessageText.innerHTML = message;
            contentDiv.appendChild(SmessageText);
        var SsendTime = document.createElement("mark");
            SsendTime.innerHTML = getCurrentTime();
            contentDiv.appendChild(SsendTime);
      //put the current message into view
      contentDiv.scrollIntoView();
}

//display a warning message.
function showWarning(warning, warningsNum){
  warningsRemain = 3 -  warningsNum; 
  const messagesDiv = document.getElementById("message-container-div");
        var warningDiv = document.createElement("div");
            warningDiv.className = "warning-message-container";
            messagesDiv.appendChild(warningDiv);
            var warnigText = document.createElement("p");
                warnigText.innerHTML = warning +": you have "+ warningsRemain + " warnings remaining;";
                warningDiv.appendChild(warnigText);
    warningDiv.scrollIntoView();
}

//display the icoming updates for everyone.
function showGroupUpdates(information, userName){
  const messagesDiv = document.getElementById("message-container-div");
        var warningDiv = document.createElement("div");
            warningDiv.className = "warning-message-container";
            messagesDiv.appendChild(warningDiv);
            var warnigText = document.createElement("p");
                warnigText.innerHTML = userName + ": "+ information;
                warningDiv.appendChild(warnigText);
    warningDiv.scrollIntoView();
}
//display the personal updates.
function showPersonUpdates(information){
  const messagesDiv = document.getElementById("message-container-div");
        var warningDiv = document.createElement("div");
            warningDiv.className = "warning-message-container";
            messagesDiv.appendChild(warningDiv);
            var warnigText = document.createElement("p");
                warnigText.innerHTML = information;
                warningDiv.appendChild(warnigText);
    warningDiv.scrollIntoView();
}