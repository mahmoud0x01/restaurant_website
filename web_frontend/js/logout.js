import { PageLoader } from './router.js';

export function SetupLogout() {
  var xhr = new XMLHttpRequest();
  var url = "https://{BACKEND_HOSTING}/api/account/logout";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("JWT"));
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // Logout successful
        localStorage.removeItem("JWT");
        redirectToLogin();
      } else {
        // Logout failed
        console.error("Logout failed:", xhr.responseText);
        // Handle failure if necessary
      }
    }
  };
  xhr.send();
}

function redirectToLogin() {
  var fullUrl = new URL(location.origin + '/login');
  PageLoader.loadPage(fullUrl.pathname, "");
}