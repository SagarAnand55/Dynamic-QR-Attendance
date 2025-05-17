const router = require("express").Router();
const usersController = require("./Controller/user-controller.js");
const AttendanceController = require("./Controller/attendance-controller");
const UtilsController = require("./Controller/utils-controller");
const labLibraryController = require("./Controller/lab-library-controller");

router.post("/api/v1/users/add-student", usersController.studentSignup);
router.post("/api/v1/users/add-professor",usersController.professorSignup);
router.post("/api/v1/users/add-other-user",usersController.otherUserSignup);
router.post("/api/v1/users/login",usersController.login);

router.post("/api/v1/generateQRCode",AttendanceController.generateQRCode);
router.post("/api/v1/students/markAttendance",AttendanceController.markAttendance);

router.get("/api/v1/students/myCourses", UtilsController.getStudentCourses);
router.get("/api/v1/students/getTodaysClasses", UtilsController.getTodaysClasses);
router.get("/api/v1/students/getCourseDetails", UtilsController.getCourseDetails);

router.get("/api/v1/students/getcoursesId", UtilsController.getCoursesWithId);

router.get("/api/v1/professors/getAllStudentsWithCourse",UtilsController.getAllStudentsWithCourse);
router.get("/api/v1/professors/getMyInstructedCourses",UtilsController.getInstructedCourses);
router.post("/api/v1/professors/markAttendance",AttendanceController.manualAttendance);


router.post("/api/v1/course/add-course",UtilsController.addCourse);
router.post("/api/v1/course/add-class",UtilsController.addClass);
router.get("/api/v1/course/scheduledClasses",UtilsController.scheduledClasses);

router.post("/api/v1/lab/add-lab-timing",UtilsController.LabActivity);
router.post("/api/v1/library/add-library-timing",UtilsController.LibraryActivity);

router.get("/api/v1/show/lab-user-to-admin",labLibraryController.showLabUserToAdmin);
router.get("/api/v1/show/library-user-to-admin",labLibraryController.showLibraryUserToAdmin);
router.get("/api/v1/show/library-user/:userId", labLibraryController.showLibraryUser);
router.get("/api/v1/show/lab-user/:userId",labLibraryController.showLabUser);

module.exports = router;