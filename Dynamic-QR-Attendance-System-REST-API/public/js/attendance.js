const STUDENT_DATA_API = "/api/v1/professors/getAllStudentsWithCourse?courseId=";
const searchInput = document.querySelector(".search-input");
const btn = document.querySelector("#submit");
const select = document.querySelector(".search-select");

function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("courseId"); // Retrieves the 'courseId' parameter value
}

function findBestMatch(searchText, options) {
    for (let i = 1; i < options.length; i++) {
        const option = options[i];
        if (option.text.toLowerCase().includes(searchText.toLowerCase())) {
            return option.value;
        }
    }
    return 'All';
}

function filterTable() {
    const searchText = searchInput.value.toLowerCase();
    
    if (searchText) {
        const matchedValue = findBestMatch(searchText, select.options);
        select.value = matchedValue;
    }
    
    const selectedValue = select.value;
    const tableBody = document.getElementById('attendance-data');
    const rows = tableBody.getElementsByTagName('tr');
    
    for (let row of rows) {
        if (!row.classList.contains('details-row')) {
            const studentName = row.children[0].textContent.toLowerCase();
            const studentId = row.children[1].textContent;
            const studentEmail = row.children[2].textContent.toLowerCase();
            const studentMobile = row.children[3].textContent;
            
            const matchesSearch = searchText === '' || 
                                studentName.includes(searchText) || 
                                studentId.includes(searchText) || 
                                studentEmail.includes(searchText) || 
                                studentMobile.includes(searchText);
            
            const matchesDropdown = selectedValue === 'All' || studentId === selectedValue;
            
            if (matchesSearch && matchesDropdown) {
                row.style.display = '';
                const nextRow = row.nextElementSibling;
                if (nextRow && nextRow.classList.contains('details-row') && 
                    nextRow.style.display === 'table-row') {
                    nextRow.style.display = 'table-row';
                }
            } else {
                row.style.display = 'none';
                const nextRow = row.nextElementSibling;
                if (nextRow && nextRow.classList.contains('details-row')) {
                    nextRow.style.display = 'none';
                }
            }
        }
    }
}

async function fetchAndDisplayStudentData(courseId) {
    try {
        const response = await fetch(STUDENT_DATA_API + courseId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        select.innerHTML = '<option value="All">All</option>';
        
        const apiData = await response.json();
        
        // Sort students alphabetically by name
        const students = apiData.students.sort((a, b) => 
            a.studentData.fullName.localeCompare(b.studentData.fullName)
        );

        const courseData = apiData.course;

        populateCourseInfo(courseData);

        // Add sorted student names to dropdown
        students.forEach(studentObj => {
            const student = studentObj.studentData;
            const option = document.createElement("option");
            option.value = student.studentId;
            option.textContent = student.fullName;
            select.appendChild(option);
        });

        const tableBody = document.getElementById('attendance-data');
        tableBody.innerHTML = '';

        students.forEach((studentObj, index) => {
            const student = studentObj.studentData;  

            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = student.fullName;
            
            const idCell = document.createElement('td');
            idCell.textContent = student.studentId;
            
            const emailCell = document.createElement('td');
            emailCell.textContent = student.email;
            
            const mobileCell = document.createElement('td');
            mobileCell.textContent = student.mobileNo;
            
            const actionCell = document.createElement('td');
            const button = document.createElement('button');
            button.textContent = "Attendance Details";
            button.setAttribute('data-index', index);  

            button.addEventListener('click', function () {
                const studentIndex = this.getAttribute('data-index');
                const currentRow = this.closest('tr');
                const allDetailRows = document.querySelectorAll('.details-row');
                
                allDetailRows.forEach(row => {
                    if (row !== currentRow.nextElementSibling) {
                        row.style.display = 'none';
                    }
                });

                let detailsRow = currentRow.nextElementSibling;
                if (!detailsRow || !detailsRow.classList.contains('details-row')) {
                    detailsRow = document.createElement('tr');
                    detailsRow.className = 'details-row';
                    currentRow.parentNode.insertBefore(detailsRow, currentRow.nextSibling);
                }

                if (detailsRow.style.display === 'none' || detailsRow.style.display === '') {
                    detailsRow.style.display = 'table-row';
                    
                    const totalClasses = studentObj.attendance.length;
                    const presentClasses = studentObj.attendance.filter(att => att.status.toLowerCase() === 'present').length;
                    const attendancePercentage = ((presentClasses / totalClasses) * 100).toFixed(1);

                    detailsRow.innerHTML = `
                        <td colspan="5">
                            <div class="attendance-details-container">
                                <div class="attendance-summary">
                                    <div class="summary-item">
                                        <span class="summary-value">${totalClasses}</span>
                                        <span class="summary-label">Total Classes</span>
                                    </div>
                                    <div class="summary-item">
                                        <span class="summary-value">${presentClasses}</span>
                                        <span class="summary-label">Present</span>
                                    </div>
                                    <div class="summary-item">
                                        <span class="summary-value">${attendancePercentage}%</span>
                                        <span class="summary-label">Attendance Rate</span>
                                    </div>
                                </div>
                                <div class="attendance-records">
                                    ${studentObj.attendance.map((att, attIndex) => `
                                        <div class="record-item ${att.status.toLowerCase()}">
                                            <span class="record-date">
                                                ${new Date(att.classSchedule.scheduledDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span class="record-topic">${att.classSchedule.classTopic}</span>
                                            <span class="record-duration">${att.classSchedule.duration} mins</span>
                                            <span class="record-status ${att.status.toLowerCase()}">
                                                ${att.status}
                                                <i class="fa-solid fa-pen edit-icon" data-index="${attIndex}" class-id="${att.classSchedule._id}" data-student-id="${student.studentId}"></i>
                                            </span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </td>
                    `;

                } else {
                    detailsRow.style.display = 'none';
                }
            });
            
            actionCell.appendChild(button);
            
            row.appendChild(nameCell);
            row.appendChild(idCell);
            row.appendChild(emailCell);
            row.appendChild(mobileCell);
            row.appendChild(actionCell);
            
            tableBody.appendChild(row);
        });

        // Add event listeners for filtering
        select.addEventListener('change', filterTable);
        searchInput.addEventListener('input', filterTable);
        btn.addEventListener('click', filterTable);

    } catch (error) {
        console.error("Error fetching or displaying the data: ", error);
    }
}

function populateCourseInfo(course) {
    const classInfoDiv = document.getElementById('classInfo');
    
    // Create HTML content for the course information
    const courseInfoHTML = `
        <h2>Course Information</h2>
        <p><strong>Course Name:</strong> ${course.courseName}</p>
        <p><strong>Course Code:</strong> ${course.courseCode}</p>
        <p><strong>Batch:</strong> ${course.batch}</p>
        <p><strong>Course ID:</strong> ${course.courseId}</p>
    `;
    
    // Insert the course information into the div
    classInfoDiv.innerHTML = courseInfoHTML;
}

document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-icon')) {
        const classId = event.target.getAttribute('class-id');
        const studentId = event.target.getAttribute('data-student-id');
        const recordItem = event.target.closest('.record-item');

        // Remove any existing editor to avoid multiple dropdowns
        const existingEditor = document.querySelector('.attendance-editor');
        if (existingEditor) existingEditor.remove();

        // Create a dropdown editor
        const editor = document.createElement('div');
        editor.className = 'attendance-editor';
        editor.innerHTML = `
            <select class="status-dropdown">
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
            </select>
            <button class="submit-edit">OK</button>
        `;

        recordItem.appendChild(editor);

        // Handle the submission
        const submitButton = editor.querySelector('.submit-edit');
        submitButton.addEventListener('click', async function () {
            const selectedStatus = editor.querySelector('.status-dropdown').value;

            // Call the API to update attendance
            try {
                const response = await fetch('/api/v1/professors/markAttendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: studentId,
                        classId: classId,
                        status: selectedStatus,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const statusSpan = recordItem.querySelector('.record-status');
                statusSpan.textContent = selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);
                statusSpan.className = `record-status ${selectedStatus.toLowerCase()}`;
                
                editor.remove(); 
            } catch (error) {
                console.error('Error updating attendance:', error);
                alert('Failed to update attendance. Please try again.');
            }
        });
    }
});


const courseId = getCourseIdFromURL();
const timetableAnchor = document.getElementById("timetableAnchor");
timetableAnchor.href = `classes.html?courseId=${courseId}`
fetchAndDisplayStudentData(courseId);

