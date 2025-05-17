document.addEventListener("DOMContentLoaded", () => {
    // Get form elements
    const forgotPasswordForm = document.querySelector("form");
    const passwordInput = document.getElementById("password");
    // const submitButton = document.getElementById("submit");

    // Message container
    const msgContainer = document.querySelector(".msg");
    const msgTitle = document.querySelector(".msg-title");

    // Handle form submission
    forgotPasswordForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission

        const newPassword = passwordInput.value.trim();

        // Basic validation for empty password field
        if (!newPassword) {
            alert("Please enter a new password.");
            return;
        }

        // Display success message
        msgTitle.textContent = "Password is submitted!";
        msgContainer.classList.add("show"); // Display the success message
        msgTitle.style.color = "green";

        // Simulate saving the new password (this is just a mock, no real backend)
        setTimeout(() => {
            // Redirect to sign-in page after 2 seconds
            window.location.href = "sign_in.html";
        }, 2000);
    });
});
