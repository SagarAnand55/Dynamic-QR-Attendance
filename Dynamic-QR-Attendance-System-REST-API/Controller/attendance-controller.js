const {CoursesAttendanceModel} = require("../Models/attendance-model");
const {StudentModel} = require("../Models/users-model");
const {ClassSchedulesModel, QRDataModel} = require("../Models/data-model");

const uuid = require('uuid');
const axios = require('axios');

exports.markAttendance = async (req, res) => {
    try {
        const { studentId, status, location } = req.body;
        let {qrData} = req.body;
        qrData = JSON.parse(qrData);

        const scheduleId = qrData.sessionId;
        const qrId = qrData.id;
        console.log(qrData.sessionId);

        let qrInstance = await QRDataModel.findOne({ sessionId: qrData.sessionId });
        const classLocation = {
            longitude: qrInstance.longitude,
            latitude: qrInstance.latitude
        }

        if (qrInstance) {
            if(qrInstance.qrCodeId != qrId){
                return res.status(400).json({ message: "Invalid QR Code. QR Code Expired" });
            }
            console.log("distance: " + haversineDistance(classLocation, location));
            if(haversineDistance(classLocation, location) >2){
                return res.status(400).json({ message: "You are not in the specified region" });
            }
        } else {
            return res.status(400).json({ message: "Invalid QR Code. QR Code Expired."});
        }

        const schedule = await ClassSchedulesModel.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: "Scheduled class not found" });
        }

        console.log(schedule.courseId);
        const courseId = schedule.courseId;

        const student = await StudentModel.findOne({
            studentId: studentId,
            $or: [
                { courses: schedule.courseId },
                { additionalCourses: schedule.courseId }
            ]
        });

        if (!student) {
            return res.status(400).json({ message: "Student not enrolled in this course" });
        }

        const attendance = await CoursesAttendanceModel.findOneAndUpdate(
            { studentId, courseId, scheduleId }, 
            { status: status || 'Absent' },  
            { upsert: true, new: true } 
        );

        res.status(200).json({
            message: "Attendance marked successfully",
            attendance
        });

    } catch (error) {
        console.error("Error marking attendance: ", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.manualAttendance = async (req, res) => {
    try {
        const { studentId, classId, status } = req.body;

        const schedule = await ClassSchedulesModel.findById(classId);
        if (!schedule) {
            return res.status(404).json({ message: "Scheduled class not found" });
        }

        const courseId = schedule.courseId;
        const scheduleId= schedule._id;

        const attendance = await CoursesAttendanceModel.findOneAndUpdate(
            { studentId, courseId,scheduleId }, 
            { status: status || 'Absent' },  
            { upsert: true, new: true } 
        );

        return res.status(200).json({
            message: `Attendance marked successfully with status '${status}'`,
            attendance
        });

    } catch (error) {
        console.error("Error marking attendance: ", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.generateQRCode = async(req, res) => {
    try {
        const { sessionId, location } = req.body;
        const uniqueId = uuid.v4();

        const classData = await ClassSchedulesModel.findById(sessionId);
        if (!classData) {
            return res.status(404).json({ message: "Scheduled class not found" });
        }

        const classStartTime = classData.scheduledDate.toLocaleString();

        const today = new Date();
        const todayString = today.toLocaleDateString();

        const scheduledDateString = classData.scheduledDate.toLocaleDateString();

        if (scheduledDateString != todayString) {
            return res.status(400).send("QR codes can only be generated for classes scheduled today.");
        } 

        const QR_Code_Generation_URL = 'https://qr-generation.onrender.com/generateQrCode';
        const postData = {
            "id": uniqueId,
            "sessionId": sessionId,
            "timestamp": Date.now().toString()
        };
  
        const response = await axios.post(QR_Code_Generation_URL, postData, {
            responseType: 'arraybuffer', 
        });

        let existingSession = await QRDataModel.findOne({ sessionId: sessionId });
        console.log(uniqueId);
  
        if (existingSession) {
            existingSession.qrCodeId = uniqueId;
            await existingSession.save();
        } else {
            const qrSessiondata = {
                qrCodeId: uniqueId,
                sessionId: sessionId,
                classData: classData,
                latitude: location.latitude,
                longitude: location.longitude
            };

            const courseId = classData.courseId;
            const allStudentsRegisteredWithCourse = await StudentModel.find({
                $or: [
                  { courses: courseId },
                  { additionalCourses: courseId }
                ]
              }, 'fullName studentId email mobileNo batchCode');
          
              const studentIds = allStudentsRegisteredWithCourse.map(student => student.studentId);
  
            const qrData = new QRDataModel(qrSessiondata);
            await qrData.save();
            
        }
  
        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', 'inline; filename="qr.png"');
        res.send(Buffer.from(response.data, 'binary'));
  
    } catch (error) {
        console.error('Error generating QR code:', error.message);
        res.status(400).send("Error generating QR code: " + error.message);
    }
};


function haversineDistance(coord1, coord2) {
    const toRad = (value) => (value * Math.PI) / 180;

    const lat1 = coord1.latitude;
    const lon1 = coord1.longitude;
    const lat2 = coord2.latitude;
    const lon2 = coord2.longitude;

    const R = 6371000; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
}