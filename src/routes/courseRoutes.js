const router = require('express').Router();
const courseController = require('../controllers/courseController');

// Create a new course
router.post('/', courseController.createCourse);

router.get('/', courseController.getCourses);

// Get a specific course by ID
router.get('/:courseId', courseController.getCourseById);

// Update a specific course by ID
router.put('/:courseId', courseController.updateCourse);

// Delete a specific course by ID
router.delete('/:courseId', courseController.deleteCourse);

module.exports = router;