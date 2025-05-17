const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const batchCodeEnum = {
    values: [30,29,28,27,26,25,24,23,22,21,20,19],
    message: '{VALUE} is not a valid batch code'
};

const departmentEnum = {
    values: [
      { id: 1, name: "Lab 1"},
      { id: 2, name: "Lab 2"},
      { id: 3, name: "Lab 3"},
      { id: 4, name: "Lab 4"},
      { id: 5, name: "Library"},
      { id: 6, name: "Developer"}
    ],
    message: '{VALUE} is not a valid Department'
  };

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobileNo: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    batchCode: {
        type: Number,
        required: true,
        enum: batchCodeEnum
    },
    courses: {
        type: [Number],
        default: []
    },
    additionalCourses: {
        type: [Number],
        default: []
    }
});

const professorSchema = new mongoose.Schema({
    prefix: {
        type: String,
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true
    },
    instructedCourses : {
        type: [Number],
        default: []
    }
});

const otherUsersSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    department: {
        type: Object,
        required: true,
        enum: departmentEnum
    }
});

async function saveUser(user) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashpass = await bcrypt.hash(user.password, salt);
      user.password = hashpass;
    } catch (error) {
      throw error;
    }   
}
  
studentSchema.pre('save', async function(next) {
    await saveUser(this);
    next();
});

professorSchema.pre('save', async function(next) {
    await saveUser(this);
    next(); 
});

otherUsersSchema.pre('save', async function(next) {
    await saveUser(this);
    next();
});

studentSchema.methods.comparePassword = async function(userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

professorSchema.methods.comparePassword = async function(userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

otherUsersSchema.methods.comparePassword = async function(userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

const StudentModel = mongoose.model("Students", studentSchema);
const ProfessorsModel = mongoose.model("Professors", professorSchema);
const OtherUsersModel = mongoose.model("Other Users", otherUsersSchema);

module.exports = {
    StudentModel,
    ProfessorsModel,
    OtherUsersModel
};