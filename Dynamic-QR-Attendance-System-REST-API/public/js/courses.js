const URL = "/api/v1/professors/getMyInstructedCourses?email=";
const searchInput = document.querySelector(".search-input");
const btn = document.querySelector("#submit");
const select = document.querySelector(".search-select");
const optionsContainer = document.querySelector(".options");

async function initializePage() {
    try {
        email = localStorage.getItem("email");
        // Fetch course data
        const response = await fetch(URL + email);
        const data = await response.json();
        console.log("API Response:", data); // Debug log
        
        // Sort courses alphabetically by course name
        const sortedCourses = data.courses.sort((a, b) => 
            a.courseName.localeCompare(b.courseName)
        );
        
        // Clear existing options except 'All'
        select.innerHTML = '<option value="All">All</option>';

        // First, clear all existing boxes
        optionsContainer.innerHTML = '';

        // Add sorted course names to dropdown
        sortedCourses.forEach(course => {
            const newOption = document.createElement("option");
            newOption.textContent = course.courseName;
            newOption.value = course.subject;
            select.appendChild(newOption);
        });

        // Create boxes dynamically based on sorted courses
        sortedCourses.forEach(course => {
            // Create box for each course
            const courseBox = document.createElement('div');
            courseBox.className = `${course.subject} box`;
            courseBox.innerHTML = `
                <h2>${course.courseName}</h2>
                <div class="list">
                    <div class="course-code option">
                        <ul>
                            <li id="title"><p>Code</p></li>
                            <li id="data"><p>${course.courseCode}</p></li>
                        </ul>
                    </div>
                    <div class="batch option">
                        <ul>
                            <li id="title"><p>Batch</p></li>
                            <li id="data"><p>${course.batch}</p></li>
                        </ul>
                    </div>
                    <div class="course-details option">
                            <button id="detail"><a href="attendance.html?courseId=${course.courseId}" id="detail">Details</a></button>
                    </div>
                </div>
            `;
            // <a href="attendance.html?courseId=${course.courseId}" id="detail">Details</a>
            optionsContainer.appendChild(courseBox);
        });

        // Make all boxes visible initially
        const allBoxes = document.querySelectorAll('.box');
        allBoxes.forEach(box => {
            box.style.display = 'block';
        });

    } catch (error) {
        console.error("Error fetching course data:", error);
        optionsContainer.innerHTML = '<p>Error loading course data. Please try again later.</p>';
    }
}


function redirectToAttendance(courseId) {
    console.log("hijo");
    window.location.href = `attendance.html?courseId=${courseId}`;
}

// Update input placeholder and filter boxes when dropdown changes
select.addEventListener("change", function() {
    const selectedValue = this.value;
    const selectedOption = this.options[this.selectedIndex];
    searchInput.placeholder = selectedOption.textContent;
    searchInput.value = ''; // Clear search input when changing dropdown
    
    filterCourses(selectedValue, '');
});

// Handle search button click
btn.addEventListener("click", (evt) => {
    evt.preventDefault();
    const searchTerm = searchInput.value.trim();
    const selectedSubject = select.value;
    
    filterCourses(selectedSubject, searchTerm);
});

function filterCourses(selectedSubject, searchTerm) {
    const allBoxes = document.querySelectorAll('.box');
    const searchTermUpper = searchTerm.toUpperCase();

    allBoxes.forEach(box => {
        const courseName = box.querySelector('h2').textContent.trim();
        const courseCode = box.querySelector('.course-code.option #data p').textContent.trim();

        const matchesSearch = 
            courseName.toUpperCase().includes(searchTermUpper) ||
            courseCode.toUpperCase().includes(searchTermUpper);
        
        if (selectedSubject === 'All') {
            box.style.display = matchesSearch || !searchTerm ? 'block' : 'none';
        } else {
            box.style.display = 
                box.classList.contains(selectedSubject) && (matchesSearch || !searchTerm) 
                ? 'block' : 'none';
        }
    });
}

// Add search input event listener for real-time filtering
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim();
    const selectedSubject = select.value;
    filterCourses(selectedSubject, searchTerm);
});

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);