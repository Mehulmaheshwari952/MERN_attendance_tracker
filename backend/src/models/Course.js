const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    instructor: {
        type: String,
        required: true,
    },
    TotalClasses: {
        type: Number,
        required: true,
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    }],
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;