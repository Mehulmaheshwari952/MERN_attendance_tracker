const Course = require('../models/Course');


const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json({ courses });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
};

// Create a new course

const createCourse = async (req, res) => {
    try {
        const { name, code, instructor, TotalClasses } = req.body;
        if(!name || !code || !instructor || !TotalClasses) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingCourse = await Course.findOne({$or : [{ code }, { name }] });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course with this code or name already exists' });
        }
        const newCourse = new Course({ name, code, instructor, TotalClasses });
        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
}

const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ course });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
}

const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { name, code, instructor, TotalClasses } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(courseId, { name, code, instructor, TotalClasses }, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
}

const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
}

module.exports = {
    getCourses,
    createCourse,
    getCourseById,
    updateCourse,
    deleteCourse
};  

