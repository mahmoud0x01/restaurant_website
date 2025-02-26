export async function checkAuthorization() {
    const token = localStorage.getItem("JWT");
    if (!token) {
        const user = {
            auth: false,
            userData: {}
        };
        console.log("user not authorized");
        localStorage.setItem("user", JSON.stringify(user));
        return;
    }

    try {
        const response = await fetch("https://{BACKEND_HOSTING}/api/account/profile", {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            // User is authorized, save user data
            console.log("saving user data");
            const user = {
                auth: true,
                userData: {
                    id: data.id,
                    fullName: data.fullName,
                    birthDate: data.birthDate,
                    gender: data.gender,
                    address: data.address,
                    email: data.email,
                    phoneNumber: data.phoneNumber
                }
            };
            localStorage.setItem("user", JSON.stringify(user));
        } else if (response.status === 401) {
            console.log("user is unauth");
            // User is unauthorized
            const user = {
                auth: false,
                userData: {}
            };
            localStorage.setItem("user", JSON.stringify(user));
            throw new Error("Unauthorized");
        } else {
            throw new Error("Unexpected response from server");
        }
    } catch (error) {
        console.error("Error checking authorization:", error);
        throw error; // Ensure the error is propagated
    }
}