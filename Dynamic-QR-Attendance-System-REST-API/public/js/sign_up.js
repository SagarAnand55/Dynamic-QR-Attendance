document.addEventListener("DOMContentLoaded", () => {
    const signUpForm = document.getElementById("signUpForm");
    const continueButton = document.getElementById("continue");
    const backButton = document.getElementById("back");
    const userInfoSection = document.getElementById("user-info");
    const courseSelectionSection = document.getElementById("course-selection");
    const coursesContainer = document.getElementById("courses-container");
    const courseSearch = document.getElementById("course-search");
    
    // Show course selection and hide user info
    continueButton.addEventListener("click", () => {
        userInfoSection.style.display = "none";
        courseSelectionSection.style.display = "flex";
        loadCourses(); // Load courses when switching to course selection
    });

    // Back button to show user info and hide course selection
    backButton.addEventListener("click", () => {
        userInfoSection.style.display = "flex";
        courseSelectionSection.style.display = "none";
    });

    // Fetch and display courses with checkboxes
    async function loadCourses() {
        try {
            const response = await fetch("/api/v1/students/getcoursesId");
            const courses = await response.json();
            
            // Clear the container
            coursesContainer.innerHTML = '';
            
            // Display each course with a checkbox
            courses.forEach(course => {
                const courseCheckbox = document.createElement("input");
                courseCheckbox.type = "checkbox";
                courseCheckbox.value = course.courseId;
                courseCheckbox.name = "courses";
                
                const label = document.createElement("label");
                label.textContent = `${course.courseCode} - ${course.courseName}`;

                const div = document.createElement("div");
                div.classList.add("course-item");
                div.appendChild(courseCheckbox);
                div.appendChild(label);

                coursesContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Error loading courses:", error);
        }
    }

    // Filter courses based on search input
    courseSearch.addEventListener("input", () => {
        const searchQuery = courseSearch.value.toLowerCase();
        document.querySelectorAll(".course-item").forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchQuery) ? "block" : "none";
        });
    });

    // Handle form submission
    signUpForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userData = {
            prefix: document.getElementById("prefix").value.trim(),
            fullName: document.getElementById("fullName").value.trim(),
            email: document.getElementById("email").value.trim(),
            mobile: document.getElementById("mobile").value.trim(),
            password: document.getElementById("password").value.trim(),
            instructedCourses: Array.from(document.querySelectorAll("input[name='courses']:checked")).map(checkbox => Number(checkbox.value))
        };

        // Validate if required fields are filled
        if (!userData.fullName || !userData.email || !userData.password) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const response = await fetch("/api/v1/users/add-professor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
            const result = await response.json();
            alert(result.message || "Signup successful!");
            window.location.href = "sign_in.html";
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    });
});
