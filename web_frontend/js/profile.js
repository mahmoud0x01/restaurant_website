import { PageLoader } from './router.js';
import { checkAuthorization } from './authorization.js';

export async function SetupProfile() {
    try {
        await checkAuthorization();
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user.auth) {
            console.log("User is not authenticated");
            const fullUrl = new URL(location.origin + '/login');
            await PageLoader.loadPage(fullUrl.pathname, "");  // Await the page load
            return;
        }

        document.getElementById("email").textContent = user.userData.email;
        document.getElementById("name").textContent = user.userData.fullName;
        document.getElementById("birthDate").textContent = user.userData.birthDate.slice(0, 10);
        document.getElementById("gender").textContent = user.userData.gender;
        document.getElementById("address").textContent = user.userData.address;
    } catch (error) {
        console.error('Error in SetupProfile:', error);
        const fullUrl = new URL(location.origin + '/login');
        await PageLoader.loadPage(fullUrl.pathname, "");  // Await the page load
    }
}