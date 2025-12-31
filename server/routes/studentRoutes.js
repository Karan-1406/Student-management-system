const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all students (Sab dekh sakte hain)
router.get('/all', protect, async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

// Add Student (Admin aur Teacher)
router.post('/add', protect, authorize('Admin', 'Teacher'), async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.status(201).json({ message: "Student Added" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Student (Sirf Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student Deleted" });
});

module.exports = router;