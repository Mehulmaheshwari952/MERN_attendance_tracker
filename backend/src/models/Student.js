const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true,
    },
});

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;