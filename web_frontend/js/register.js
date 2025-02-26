import { PageLoader } from './router.js';

export function SetupRegister() {
document.getElementById("register-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    var fullName = document.getElementById("fullName").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var address = document.getElementById("address").value;
    var birthDate = document.getElementById("birthDate").value;
    var gender = document.getElementById("gender").value;
    var phoneNumber = document.getElementById("phoneNumber").value;

    var xhr = new XMLHttpRequest();
    var url = "https://{BACKEND_HOSTING}/api/account/register";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Request was successful
                var response = JSON.parse(xhr.responseText);
                // Handle success response
                handleSuccess(response);
            } else {
                // Request failed
                var errorResponse = JSON.parse(xhr.responseText);
                // Handle failure response
                handleFailure(errorResponse);
            }
        }
    };
    var data = JSON.stringify({
        "fullName": fullName,
        "email": email,
        "password": password,
        "address": address,
        "birthDate": birthDate,
        "gender": gender,
        "phoneNumber": phoneNumber
    });
    xhr.send(data);
});

    document.getElementById("have-account-btn").addEventListener("click", function(event) {
        event.preventDefault();
        var fullUrl = new URL(location.origin + '/login');
        PageLoader.loadPage(fullUrl.pathname, "");
    });
}
function handleSuccess(response) {
    // Store the JWT token in localStorage
    localStorage.setItem("JWT", response.token);

    // Redirect to the "/profile" page
    var fullUrl = new URL(location.origin + '/profile');
    PageLoader.loadPage(fullUrl.pathname, "");
}

function handleFailure(errorResponse) {
    console.error("Registration failed:", errorResponse);

    // Extract the error message from the errorResponse
    var errorMessage = "Registration failed with a Bad Request error";

    if (errorResponse && errorResponse.errors) {
        // Check for specific error messages
        if (errorResponse.errors.PhoneNumber && errorResponse.errors.PhoneNumber.length > 0) {
            errorMessage = errorResponse.errors.PhoneNumber[0];
        } else if (errorResponse.errors.Password && errorResponse.errors.Password.length > 0) {
            errorMessage = errorResponse.errors.Password[0];
        }
        // Add more conditions for other specific error messages if needed
    }

    // Display error message under the register button
    var errorMessageElement = document.getElementById("error-message");
    errorMessageElement.textContent = errorMessage;
    errorMessageElement.style.color = "red"; // Set text color to red
}
