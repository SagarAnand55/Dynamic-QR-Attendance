const { CoursesAttendanceModel } = require("../Models/attendance-model");
const {CoursesModel, LabDataModel, LibraryModel, ClassSchedulesModel} = require("../Models/data-model");
const {StudentModel,ProfessorsModel, OtherUsersModel} = require("../Models/users-model");


exports.addCourse = async(req,res) => {
    try {
        const newCourse = new CoursesModel(req.body);
        await newCourse.save();
        res.status(201).send("Course Saved successfully!");
    } catch (error) {
            res.status(400).send("Error saving course: " + error.message);
    }
}

exports.getStudentCourses = async (req, res) => {
    try {
      const { studentId } = req.query; 
        
      const student = await StudentModel.findOne({ studentId: studentId });
      if (!student) {
          return res.status(404).send("Student not found");
      }

      const studentCoursesIds = [...student.courses, ...student.additionalCourses];

      const courses = await CoursesModel.find({ courseId: { $in: studentCoursesIds } });

      const courseDetailsWithProfessors = [];

        for (let course of courses) {
            const professor = await ProfessorsModel.findOne({ instructedCourses: course.courseId }, 'fullName');
            
            courseDetailsWithProfessors.push({
                courseId: course.courseId,
                courseCode: course.courseCode,
                courseName: course.courseName,
                batch: course.batch,
                professorName: professor ? professor.fullName : "No professor assigned"
            });
        }

      res.status(200).json({
          studentId: student.studentId,
          fullName: student.fullName,
          courses: courseDetailsWithProfessors
      });

    } catch (error) {
      res.status(400).send("Error fetching courses: " + error.message);
    }
}

exports.getCourseDetails = async (req, res) => {
  try {
    const { studentId, courseId } = req.query; 
      
    const student = await StudentModel.findOne({
        studentId: studentId,
        $or: [
            { courses: courseId },
            { additionalCourses: courseId }
        ]
    });

    if (!student) {
        return res.status(400).json({ message: "Student not enrolled in this course" });
    }

    const course = await CoursesModel.findOne({ courseId: courseId });
    const professor = await ProfessorsModel.findOne({ instructedCourses: course.courseId }, 'fullName');
    course['professor'] = professor ? professor.fullName : "No professor assigned"

    const allAttendanceWithSchedules = await CoursesAttendanceModel.find({
      studentId: studentId,
      courseId: courseId
    }, 'scheduleId status').populate('scheduleId', 'scheduledDate duration classTopic');

    const formattedAttendance = allAttendanceWithSchedules.map(attendanceItem => ({
        classSchedule: attendanceItem.scheduleId,
        status: attendanceItem.status,
    }));

    res.status(200).json({
        studentId: student.studentId,
        fullName: student.fullName,
        course: course,
        attendance: formattedAttendance
    });

  } catch (error) {
    res.status(400).send("Error fetching courses: " + error.message);
  }
}

exports.getCoursesWithId = async (req,  res) => {
  try {
    const allCourses = await CoursesModel.find();
    return res.status(200).json(allCourses);
  } catch(error){
    console.log(error);
    return res.status(400).json({
      "status":  "error",
      "message": "Error fetching courses: " + error.message
    });
  }
}

exports.getInstructedCourses = async (req,  res) => {
  try {
    const {email} = req.query;
    if(!email){
      return res.status(401).json({
        message: "Professor Email is Required",
        courses: []
      });
    }

    const professor = await ProfessorsModel.findOne({email});
    const instructedCourses = professor.instructedCourses;

    const courses = await CoursesModel.find({ courseId: { $in: instructedCourses } });

    return res.status(200).json({
          professorEmail: email,
          courses: courses
      });
  } catch(error){
    console.log(error);
    return res.status(400).json({
      "status":  "error",
      "message": "Error fetching courses: " + error.message
    });
  }
}


exports.getAllStudentsWithCourse = async (req, res) => {
  try {
    const { courseId } = req.query;

    const course = await CoursesModel.findOne({ courseId: courseId });

    const allStudentsRegisteredWithCourse = await StudentModel.find({
      $or: [
        { courses: courseId },
        { additionalCourses: courseId }
      ]
    }, 'fullName studentId email mobileNo batchCode');

    const studentIds = allStudentsRegisteredWithCourse.map(student => student.studentId);

    const attendanceRecords = await CoursesAttendanceModel.find({
      studentId: { $in: studentIds },
      courseId: courseId
    }, 'studentId scheduleId status').populate('scheduleId', 'scheduledDate duration classTopic');

    const attendanceByStudent = attendanceRecords.reduce((acc, record) => {
      if (!acc[record.studentId]) acc[record.studentId] = [];
      acc[record.studentId].push({
        classSchedule: record.scheduleId,
        status: record.status,
      });
      return acc;
    }, {});

    const studentsWithAttendances = allStudentsRegisteredWithCourse.map(student => ({
      studentData: student,
      attendance: attendanceByStudent[student.studentId] || []
    }));

    res.status(200).json({
      course: course,
      students: studentsWithAttendances
    });

  } catch (error) {
    res.status(400).send("Error fetching courses: " + error.message);
  }
};


exports.getTodaysClasses = async (req, res) => {
  try {
      const { studentId } = req.query;

      const student = await StudentModel.findOne({ studentId });
      if (!student) {
          return res.status(404).send("Student not found");
      }

      const studentCoursesIds = [...student.courses, ...student.additionalCourses];

      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todaysClasses = await ClassSchedulesModel.find({
          courseId: { $in: studentCoursesIds },
          scheduledDate: {$gte: today, $lte: tomorrow}
      }).populate({
        path: 'courseId',      
        model: 'Courses',     
        localField: 'courseId', 
        foreignField: 'courseId',
        select: 'courseCode courseName'
      });

      const formattedClasses = todaysClasses.map(classItem => ({
          _id: classItem._id,
          courseDetails: classItem.courseId,
          scheduledDate: classItem.scheduledDate,
          duration: classItem.duration,
          classTopic: classItem.classTopic,
      }));

      res.status(200).json({
          studentId: student.studentId,
          fullName: student.fullName,
          classes: formattedClasses
      });

  } catch (error) {
      res.status(400).send("Error fetching today's classes: " + error.message);
  }
};



exports.addClass = async(req,res) => {
    try {
        const {courseId, duration, classTopic, scheduledDateTime} = req.body;
        const scheduledDate = new Date(scheduledDateTime);
        const newCourse = new ClassSchedulesModel({courseId, duration, classTopic, scheduledDate});
        await newCourse.save();
        res.status(201).send("Course Saved successfully!");
    } catch (error) {
        res.status(400).send("Error saving course: " + error.message);
    }
}

exports.scheduledClasses = async(req,res) => {
  try {
    const { courseId } = req.query;
    const classes = await ClassSchedulesModel.find({ courseId });
    res.status(200).json({"courseId": courseId, "classes": classes})
  } catch (error) {
      res.status(400).send("Error fetching course: " + error.message);
  }
}

exports.LabActivity = async(req,res) => {
    try {
        const newLabTiming = new LabDataModel(req.body);
        await newLabTiming.save();
        res.status(201).send("Lab timing recorded successfully!");
    } catch (error) {
        res.status(400).send("Error recording lab timing: " + error.message);
    }
}

exports.LibraryActivity = async(req,res)=>{
    try {
        const newLibraryTiming = new LibraryModel(req.body);
        await newLibraryTiming.save();
        res.status(201).send("Library timing recorded successfully!");
    } catch (error) {
        res.status(400).send("Error recording library timing: " + error.message);
    }
}