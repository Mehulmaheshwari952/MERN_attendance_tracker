const mongoose = require('mongoose');
const express = require('express');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

const app = express();

module.exports = {app, connectDB};