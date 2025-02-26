import { PageLoader } from './router.js';
import { SetupProfile } from './profile.js'
export function SetupLogin() {
    document.getElementById("login-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission
        
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        var xhr = new XMLHttpRequest();
        var url = "https://{BACKEND_HOSTING}/api/account/login";
        xhr.open("POST", url, true);
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
        var data = JSON.stringify({ "email": email, "password": password });
        xhr.send(data);
    });

    document.getElementById("create-account-btn").addEventListener("click", function(event) {
        event.preventDefault();
        var fullUrl = new URL(location.origin + '/register');
        PageLoader.loadPage(fullUrl.pathname, "");
    });
}

async function handleSuccess(response) {
    console.log("login success");
    // Store the JWT token in localStorage
    localStorage.setItem("JWT", response.token);
    // Redirect to the "/" page
    await SetupProfile(); // Mark this function as async and use await
    window.location.href = "/";
}

function handleFailure(errorResponse) {
    console.error("Login failed:", errorResponse.message);
    // Display error message under the login button
    var errorMessageElement = document.getElementById("error-message");
    errorMessageElement.textContent = "Wrong email or password";
    errorMessageElement.style.color = "red"; // Set text color to red
}