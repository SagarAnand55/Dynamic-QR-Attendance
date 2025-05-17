
// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Check if token exists; if not, redirect to the login page
document.addEventListener("DOMContentLoaded", () => {
    const token = getCookie("token");
    if (!token) {
        window.location.href = "./pages/authentication/sign_in.html"; // Redirect to login
    } else {
        // Retrieve the email and name from local storage
        const email = localStorage.getItem("email");
        const name = localStorage.getItem("fullName");
        console.log("Welcome back, " + name + " (" + email + ")");
    }
});
