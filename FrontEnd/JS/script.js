/**
 * REGISTRATION FORM VALIDATION
 */
//uses an event listener to prevent submiting the form is any of the inputs is invalid
const form = document.querySelector('#myForm');
const submitButton = document.querySelector('#submitButton');
submitButton.addEventListener('click', function(event) {
        // Prevent the default form submission
        event.preventDefault();
    // Get form inputs
    const name = document.getElementById("user-name").value;
    const phone = document.getElementById("phone-no").value;
    const password = document.getElementById("password").value;
    //create variables to store the errors
    var nameError = document.getElementById('name-error-message');
    var phoneError = document.getElementById('phone-error-message');
    var passwordError = document.getElementById('password-error-message');
    // Regular expression patterns for validation
    const namePattern = /^[a-zA-Z ]+$/;
    const phonePattern = /^\d+$/;
    const passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[@$!%*#?&])[a-zA-Z\d@$!%*#?&]{8,}$/;
    //check that the fields are not empty
    if (name.trim() === "" && phone.trim() === "" && password.trim() === "") {
        alert("Please fill in all fields.");
        return false;
    }  else {
        //validating the user name
        //Check the name if the name field is empty
       if (name.trim() === "") {
            nameError.innerHTML =  "Please enter your name.";
            document.getElementById('user-name').style.borderColor = "red";
            return false;
            //else check that the format of the name is valid
        }   else if (!name.match(namePattern)) {
            nameError.innerHTML = "Name should contain only letters and spaces.";
            document.getElementById('user-name').style.borderColor = "red";
            return false;
        }   else{
            //when everything is okay continue to the next step
            document.getElementById('user-name').style.borderColor = "green";
            nameError.innerHTML =  "";
        }
        //validating the phone number
        if (phone.trim() === "") {
            phoneError.innerHTML =  "Please enter your phone Number.";
            document.getElementById('phone-no').style.borderColor = "red";
            return false;
        }   else  if (!phone.match(phonePattern)) {
            phoneError.innerHTML = "Phone number should contain only numbers.";
            document.getElementById('phone-no').style.borderColor = "red";
            return false;
        }   else{
            phoneError.innerHTML =  "";
            document.getElementById('phone-no').style.borderColor = "green";
        }
        //validating the user password
        if (password.trim() === "") {
            passwordError.innerHTML = "Please enter your password.";
            document.getElementById('password').style.borderColor = "red";
            return false;
        }   else  if (!password.match(passwordPattern)) {
            document.getElementById('password').style.borderColor = "red";
            passwordError.innerHTML ="Password should contain at least one letter, one number, and one special character and be at least 8 characters long.";
            return false;
        }   else{
            passwordError.innerHTML =  "";
            document.getElementById('password').style.borderColor = "green";
        }
    }
    // If all inputs are valid, return true
    nameError.innerHTML = "";
    phoneError.innerHTML = "";
    passwordError.innerHTML = "";
    form.submit();
    disableSubmitButton();
});
// function to enable login for a registered user.
function openAccountActionPage(){
  loginPage =  document.getElementById('login-page');
  createAccPage =  document.getElementById('register-page');
  if(loginPage.style.display === 'none' && createAccPage.style.display === 'block'){
    loginPage.style.display = "block";
    createAccPage.style.display = "none";
  }else{
    loginPage.style.display = "none";
    createAccPage.style.display = "block";
  }
}
//JQUERY code to incoporate with ajax.
//this function checks for a number that is already registered
//SERVER file== /Server_Scripts/checkPhone.php
$(document).ready(function(){
$("#phone-no").on("blur", function() {
  var number = $(this).val();
  if(number==""){
    $("#phone-error-message").text("Phone number cannot be empty!");
    disableSubmitButton();
  }else{
  $.ajax({
    url: "/server/php/checkPhone.php",
    method: "POST",
    data: { number: number },
    dataType: "json",
    success: function(response) {
      if (response.error) {
        $("#phone-error-message").text(response.error);
        disableSubmitButton();
      } else {
        $("#phone-error-message").text("");
        enableSubmitButton();
      }
    },
    error: function() {
      $("#phone-error-message").text("Error checking number. Please try again later.");
      disableSubmitButton();
    }
  });
}
});
function enableSubmitButton() {
  if ($("#phone-error-message").text() == "") {
    $("#submitButton").attr("disabled", false);
  }
}
function disableSubmitButton() {
  if( $("#submitButton").attr("disabled", false)){
    $("#submitButton").attr("disabled", true);
  }
}

});//END REGISTRATION

