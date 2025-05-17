const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://itzshubhamofficial:Shubham%401166@qrcluster.rh3p7.mongodb.net/?retryWrites=true&w=majority&appName=QRCLUSTER/QR_Attendance");
        console.log("Database Connected");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1); 
    }
};

module.exports = connectDB;
