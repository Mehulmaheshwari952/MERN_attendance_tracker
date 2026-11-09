const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

const app = express();

app.use(express.json());
app.get("/", (req, res) => {
    res.send("Welcome to the Attendance Tracker API");
});
app.use("/api/attendance", require('./routes/attendanceRoutes'));
app.use("/api/courses", require('./routes/courseRoutes'));
app.use("/api/students", require('./routes/studentRoutes'));

module.exports = {app, connectDB};