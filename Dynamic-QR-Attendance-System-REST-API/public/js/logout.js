document.addEventListener("DOMContentLoaded", () => {
    const logoutLink = document.querySelector(".log-out a");

    if (logoutLink) {
        logoutLink.addEventListener("click", (event) => {
            event.preventDefault();

            // Remove token from cookies
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

            // Clear localStorage data
            localStorage.removeItem("professorEmail");
            localStorage.removeItem("professorName");
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("userEmail");

            // Redirect to login page
            window.location.href = "./pages/authentication/sign_in.html";
        });
    }
});
