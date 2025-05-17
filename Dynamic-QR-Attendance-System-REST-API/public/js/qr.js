 // Function to get URL parameters
 function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

// Get data from URL parameters
const className = getURLParameter('className');
const duration = getURLParameter('duration');
const scheduledDate = getURLParameter('scheduledDate');

// Display Class Details
const detailsDiv = document.getElementById("class-details");
detailsDiv.innerHTML = `
    <h2>Class Details</h2>
    <p><strong>Class Name:</strong> ${className}</p>
    <p><strong>Duration:</strong> ${duration} minutes</p>
    <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
`;

// Listen for QR code updates
window.addEventListener("message", (event) => {
    if (event.data.qrImageUrl) {
        const qrDiv = document.getElementById("qr-code");
        qrDiv.innerHTML = `<img src="${event.data.qrImageUrl}" alt="QR Code">`;
    }
});