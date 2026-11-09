const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');
const studentController = require('../controllers/studentController');

router.get('/', studentController.getAllStudents);
router.post('/addnew', studentController.addNewStudent);
router.post('/enroll', studentController.enrollStudent);
router.get('/:studentId/courses', studentController.getStudentCourses);
router.get('/:studentId/attendance', studentController.getStudentAttendance);

module.exports = router;