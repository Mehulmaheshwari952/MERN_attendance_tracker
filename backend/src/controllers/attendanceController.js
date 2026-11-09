const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');


const markAttendance = async (req, res) => {
    try {
        const { studentId, courseId, status } = req.body;
        const date = req.body.date ? new Date(req.body.date) : new Date();
        const exists = await Attendance.findOne({ studentId, courseId, date });
        if (exists) {
            return res.status(400).json({ message: 'Attendance already marked for this student and course on this date' });
        }
        const newAttendance = new Attendance({ studentId, courseId, date, status });
        await newAttendance.save();
        res.status(201).json({ message: 'Attendance marked successfully', attendance: newAttendance });
    }   
    catch (error) {
        res.status(500).json({ message: 'Error marking attendance', error: error.message });
    }
}

const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const attendanceRecords = await Attendance.find({ studentId }).populate('courseId', 'name code');
        if (!attendanceRecords.length) {
            return res.status(404).json({ message: 'No attendance records found for this student' });
        }
        res.status(200).json({ attendance: attendanceRecords });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student attendance', error: error.message });
    }
}

const getCourseAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;
        const attendanceRecords = await Attendance.find({ courseId }).populate('studentId', 'name email');
        if (!attendanceRecords.length) {
            return res.status(404).json({ message: 'No attendance records found for this course' });
        }
        res.status(200).json({ attendance: attendanceRecords });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course attendance', error: error.message });
    }
}

module.exports = {
    markAttendance,
    getStudentAttendance,
    getCourseAttendance
};