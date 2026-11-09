const Student = require('../models/Student');
const Course = require('../models/Course');

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({ students });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

const addNewStudent = async (req, res) => {
    try {
        const { name, email, rollNumber } = req.body;
        const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }] });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this email or roll number already exists' });
        }
        const newStudent = new Student({ name, email, rollNumber });
        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        res.status(500).json({ message: 'Error adding student', error: error.message });
    }
};

const enrollStudent = async (req, res) => {
    const { studentId, courseId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }
    if (student.courses.includes(courseId)) {
        return res.status(400).json({ message: 'Student already enrolled in this course' });
    }
    course.students.push(studentId);
    await course.save();
    student.courses.push(courseId);
    await student.save();
    res.status(200).json({ message: 'Student enrolled in course successfully' });
};

const getStudentCourses = async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate('courses', 'name code');
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ courses: student.courses });
};

const getStudentAttendance = async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }
    const attendanceRecords = await Attendance.find({ studentId }).populate('courseId', 'name code');
    res.status(200).json({ attendance: attendanceRecords });
};

module.exports = {
    getAllStudents,
    addNewStudent,
    enrollStudent,
    getStudentCourses,
    getStudentAttendance
};