document.addEventListener("DOMContentLoaded", () => {
    const signInForm = document.querySelector("form");
    const userEmailInput = document.getElementById("userEmail");
    const passwordInput = document.getElementById("password");
    const rememberCheckbox = document.getElementById("remember-checkbox");
    const submitButton = document.getElementById("submit");

    const msgContainer = document.querySelector(".msg");
    const msgTitle = document.querySelector(".msg-title");

    signInForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userEmail = userEmailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!userEmail || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const payload = {
            email: userEmail,
            password: password,
            role: "professor"
        };

        try {
            const response = await fetch("/api/v1/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;
                document.cookie = `token=${data.token}; path=/;`;

                const decodedToken = jwt_decode(token);
                const email = decodedToken.email;
                const name = decodedToken.fullName;

                // Store professor email and name for later access
                localStorage.setItem("email", email);
                localStorage.setItem("fullName", name);

                window.location.href = "../../index.html";
            } else {
                const errorData = await response.json();
                msgContainer.classList.add("show"); 
                msgTitle.textContent = errorData.message || "Login failed. Please try again.";
                msgTitle.style.color = "red";
            }
        } catch (error) {
            console.error("Error during login:", error);
            msgContainer.classList.add("show"); 
            msgTitle.textContent = "An error occurred. Please try again later.";
            msgTitle.style.color = "red";
        }

        rememberCheckbox.addEventListener("change", () => {
            if (rememberCheckbox.checked) {
                localStorage.setItem("rememberMe", true);
                localStorage.setItem("userEmail", userEmailInput.value);
            } else {
                localStorage.removeItem("rememberMe");
                localStorage.removeItem("userEmail");
            }
        });

        if (localStorage.getItem("rememberMe")) {
            userEmailInput.value = localStorage.getItem("userEmail");
            rememberCheckbox.checked = true;
        }
    });
});
