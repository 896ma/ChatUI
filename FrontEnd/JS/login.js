
 $(document).ready(function() {
  const loginform = document.querySelector('#loginForm');
  const loginsubmitbutton = document.querySelector('#loginSubmitButton');
  loginsubmitbutton.addEventListener('click', function(event) {
    event.preventDefault();
     let loginphone = $('#login-phone-no').val();
     let loginpassword = $('#login-password').val();
     let loginphoneerror = $('#login-phone-error-message');
     let loginpassworderror = $('#login-password-error-message');
     //confirm there is no empty field.
     if(loginphone.trim() === ""){
      loginphoneerror.text("please enter your phone number");
     }else {
      loginphoneerror.text("");
      $.ajax({
        url: "/server/php/checkPhone.php",
        method: "POST",
        data: { number: loginphone },
        dataType: "json",
        success: function(response) {
          if (response.success) {//response success is when the number is not registered
            loginphoneerror.text(response.success);
          } else {
            loginphoneerror.text("");
            //when the phone number is okay check the password
            if(loginpassword.trim() === ""){
              loginpassworderror.text("please enter your password");
             }else{//submit the data to check if password is valid on the database.     
              $.ajax({
                url: "/server/php/login.php",
                method: "POST",
                data: { phone_no: loginphone, password : loginpassword },
                dataType: "json",
                success: function(response) {
                  if (response.success) {
                    loginpassworderror.text(response.success);//to do fix a bug here
                    loginform.submit();
                  } else {
                    loginpassworderror.text(response.error);
                  }
                },//for password
                error: function() {//to do fix a bug here
                  loginpassworderror.text("");
                  loginform.submit();
                  disableLoginSubmitButton();
                }
              });
             }
          }
        },//for phone number
        error: function() {
          $("#login-phone-error-message").text("Error checking number. Please try again later.");
          disableLoginSubmitButton();
        }
      });
     }
  });
function enableLoginSubmitButton() {
    $("#loginSubmitButton").attr("disabled", false);
}
function disableLoginSubmitButton() {
    $("#loginSubmitButton").attr("disabled", true);
}

});//END LOGIN
