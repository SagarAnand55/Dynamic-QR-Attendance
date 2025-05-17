const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseId: {
        type: Number,
        required: true,
        unique: true
    },
    batch: {
        type: Number,
    },
    courseCode: {
        type: String,
        required: true,
    },
    courseName: {
        type: String,
        required: true,
        unique: true
    }
});

const classScheduleSchema = new mongoose.Schema({
    courseId: {
        type: Number,
        ref:  "Courses",
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        default: 60
    },
    classTopic: {
        type: String,
        default: "Topic Not Specified"
    }
});


const qrSessionData = new mongoose.Schema({
    qrCodeId: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    classData: {
        type: mongoose.Schema.Types.Mixed
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    }
});

const labEnum = {
    values: ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4'],
    message: '{VALUE} is not a valid lab'
};

const labTiming = new mongoose.Schema({
    studentId:{
        type: String,
        required:true
    },
    labName: {
        type: String,
        required: true,
        enum: labEnum
    },
    checkIn:{
        type: Date,
        default: Date.now()
    },
    checkOut:{
        type: Date,   
    },
    status: {
        type: String,
        enum: ['Checked In', 'Checked Out'],
        default: 'Checked In'
    },
});


const libraryTiming = new mongoose.Schema({
    studentId:{
        type: String,
        required:true
    },
    checkIn:{
        type: Date,
        default: Date.now()
    },
    checkOut:{
        type: Date,   
    },
    status: {
        type: String,
        enum: ['Checked In', 'Checked Out'],
        default: 'Checked In'
    },
});


const CoursesModel=  mongoose.model('Courses', courseSchema);
const ClassSchedulesModel=  mongoose.model('Class Schedules', classScheduleSchema);
const QRDataModel= mongoose.model('QR Session Data', qrSessionData);

const LabDataModel= mongoose.model('Lab Data', labTiming); 
const LibraryModel= mongoose.model('Library Data', libraryTiming);

module.exports = {
    CoursesModel,
    ClassSchedulesModel,
    QRDataModel,
    LabDataModel,
    LibraryModel
}