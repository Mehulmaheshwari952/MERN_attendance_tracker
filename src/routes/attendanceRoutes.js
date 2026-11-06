const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');

// Create a new attendance record
router.post('/mark',attendanceController.markAttendance);

// Get attendance records for a specific student
router.get('/student/:studentId',attendanceController.getStudentAttendance);

// Get attendance records for a specific course
router.get('/course/:courseId',attendanceController.getCourseAttendance);

module.exports = router;