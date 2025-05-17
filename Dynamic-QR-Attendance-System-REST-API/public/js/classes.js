const API_URL = "/api/v1/course/scheduledClasses?courseId=";
const QR_API = "/api/v1/generateQRCode";
const ADD_CLASS_API = "/api/v1/course/add-class";
let qrCodeInterval; // Variable to hold the interval ID

function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("courseId"); // Retrieves the 'courseId' parameter value
}

async function fetchTimetable(courseId) {
    try {
        const response = await fetch(API_URL + courseId);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.classes || !Array.isArray(data.classes)) throw new Error("Unexpected data format");

        const timetableBody = document.getElementById("timetable-body");
        timetableBody.innerHTML = ""; // Clear previous timetable data
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const pastClasses = [], todayClasses = [], upcomingClasses = [];
        data.classes.forEach((classData) => {
            const classDate = new Date(classData.scheduledDate);
            classDate.setHours(0, 0, 0, 0);

            if (classDate < currentDate) pastClasses.push(classData);
            else if (classDate.getTime() === currentDate.getTime()) todayClasses.push(classData);
            else upcomingClasses.push(classData);
        });

        const renderClassRow = (classData, isPastClass = false) => {
            const row = document.createElement("tr");
            const date = new Date(classData.scheduledDate);

            row.innerHTML = `
                <td>${date.toDateString()}</td>
                <td>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${classData.duration}</td>
                <td>${classData.classTopic}</td>
                <td>
                    <button id="generateButton-${classData._id}" 
                            class="button-class" 
                            ${isPastClass ? "disabled" : ""}
                            onclick="${!isPastClass ? `startGeneratingQRCode('${classData._id}', '${QR_API}', '${classData.classTopic}', '${classData.duration}', '${classData.scheduledDate}')` : ''}">
                        ${isPastClass ? "Class Ended" : "Start Generating QR Code"}
                    </button>
                </td>
            `;

            timetableBody.appendChild(row);
        };

        // Render today's and upcoming classes with QR button enabled
        todayClasses.forEach(classData => renderClassRow(classData, false));
        upcomingClasses.forEach(classData => renderClassRow(classData, false));

        // Render past classes with "Class Ended" text
        if (pastClasses.length > 0) {
            const separatorRow = document.createElement("tr");
            separatorRow.innerHTML = `<td colspan="5"><strong>Past Classes</strong></td>`;
            timetableBody.appendChild(separatorRow);
            pastClasses.forEach(classData => renderClassRow(classData, true));
        }
    } catch (error) {
        console.log("Failed to fetch or display timetable data: " + error.message);
    }
}


function openQrModal(className, duration, scheduledDate) {
    const qrModal = document.getElementById("qrModal");
    const classInfo = document.getElementById("classInfo");
    qrModal.style.display = "flex";
    classInfo.textContent = `${className} - ${scheduledDate} (${duration} minutes)`;
}

function closeQrModal() {
    document.getElementById("qrModal").style.display = "none";
    stopGeneratingQRCode();
}

document.getElementById("closeModal").onclick = closeQrModal;

function startGeneratingQRCode(sessionID, API, className, duration, scheduledDate) {
    clearInterval(qrCodeInterval);
    openQrModal(className, duration, scheduledDate);

    generateQRCode(sessionID, API);
    qrCodeInterval = setInterval(() => {
        generateQRCode(sessionID, API);
    }, 10000);

    document.getElementById("stopButton").style.display = "inline-block";
}

function stopGeneratingQRCode() {
    clearInterval(qrCodeInterval);
    qrCodeInterval = null;
    document.getElementById("stopButton").style.display = "none";
}

async function generateQRCode(sessionID, API) {
    async function getCurrentLocation() {
        if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported by this browser.");
        }

        // Check geolocation permission
        const permissionStatus = await navigator.permissions.query({ name: "geolocation" });

        if (permissionStatus.state === "denied") {
            throw new Error("Location access denied. Please enable location permissions in your browser.");
        }

        // Get current location
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    const errorMessages = {
                        1: "Permission denied. Please enable location services.",
                        2: "Position unavailable. Please check your device.",
                        3: "Timeout. Unable to fetch location."
                    };
                    reject(new Error(errorMessages[error.code] || "Unknown location error."));
                },
                { timeout: 10000 } // Set a timeout for location fetching
            );
        });
    }

    const requestData = { "sessionId": sessionID };

    try {
        requestData.location = await getCurrentLocation();

        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error(await response.text());

        const imageBlob = await response.blob();
        const qrImageUrl = URL.createObjectURL(imageBlob);

        const qrImage = document.getElementById("qrImage");
        qrImage.style.opacity = 0;
        setTimeout(() => {
            qrImage.src = qrImageUrl;
            qrImage.style.opacity = 1;
        }, 500);
    } catch (error) {
        console.error("Error generating QR code:", error.message);
        alert("Error: " + error.message);
    }
}


// function getCurrentLocation() {
//     return new Promise((resolve, reject) => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     resolve({
//                         latitude: position.coords.latitude,
//                         longitude: position.coords.longitude
//                     });
//                 },
//                 (error) => {
//                     reject(error);
//                 }
//             );
//         } else {
//             reject(new Error("Geolocation is not supported by this browser."));
//         }
//     });
// }

function openAddClassModal() {
    document.getElementById("addClassModal").style.display = "flex";
}

function closeAddClassModal() {
    document.getElementById("addClassModal").style.display = "none";
}

async function addClass(event) {
    event.preventDefault(); // Prevents form from submitting traditionally

    const classTopic = document.getElementById("classTopic").value;
    const scheduledDate = document.getElementById("scheduledDate").value;
    const scheduledTime = document.getElementById("scheduledTime").value;
    const duration = document.getElementById("duration").value;
    const courseId = getCourseIdFromURL();

    const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;

    const requestData = {
        courseId,
        duration,
        classTopic,
        scheduledDateTime
    };

    try {
        const response = await fetch(ADD_CLASS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error("Failed to add class");

        const result = response.text;
        alert(result || "Class added successfully!");

        closeAddClassModal();
        fetchTimetable(courseId); // Refresh timetable to include new class

    } catch (error) {
        console.log("Error adding class: " + error.message);
    }
}

// Attach addClass function to the form submission
document.getElementById("addClassForm").addEventListener("submit", addClass);

const courseId = getCourseIdFromURL();
fetchTimetable(courseId);
