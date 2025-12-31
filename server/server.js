require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const path = require('path');
const publicPath = path.join(__dirname, '../public');
console.log("Serving static files from:", publicPath);
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sms_db')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// 2. Models
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ['Admin', 'Teacher', 'Student'] }
}));

// --- MODELS ---

const Student = mongoose.model('Student', new mongoose.Schema({
    name: { type: String, required: true },
    studentId: { type: String, unique: true, required: true },
    course: String,
    grade: String,
    status: { type: String, enum: ['Active', 'Inactive', 'Alumni'], default: 'Active' },
    email: { type: String, unique: true },
    phone: String,
    studentClass: String,
    rollNo: String
}, { timestamps: true }));

const Teacher = mongoose.model('Teacher', new mongoose.Schema({
    name: { type: String, required: true },
    employeeId: { type: String, unique: true, required: true },
    email: { type: String, unique: true },
    subject: String,
    phone: String
}, { timestamps: true }));

const Course = mongoose.model('Course', new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true },
    credits: Number
}, { timestamps: true }));

const Attendance = mongoose.model('Attendance', new mongoose.Schema({
    studentId: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
    subject: String
}, { timestamps: true }));

// --- AUTH MIDDLEWARE & ROUTES ---

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send({ message: "No token, denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (e) { res.status(401).send({ message: "Invalid token" }); }
};

const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).send({ message: "Forbidden" });
    next();
};

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).send({ message: "User registered" });
    } catch (e) { res.status(400).send({ message: "Email already exists" }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.send({ token, role: user.role });
});

// --- ROUTES ---

// Helper for Uniqueness Errors
const handleErrors = (res, e) => {
    console.error(e);
    if (e.code === 11000) {
        const field = Object.keys(e.keyPattern)[0];
        return res.status(400).send({ error: `Duplicate Value: ${field} already exists.` });
    }
    res.status(500).send({ error: e.message || "Internal Server Error" });
};

// 5. Student Routes
app.get('/api/students/all', auth, async (req, res) => {
    try {
        const students = await Student.find();
        res.send(students);
    } catch (e) { handleErrors(res, e); }
});

app.post('/api/students/add', auth, checkRole(['Admin', 'Teacher']), async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).send(student);
    } catch (e) { handleErrors(res, e); }
});

app.delete('/api/students/:id', auth, checkRole(['Admin']), async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.send({ message: "Deleted" });
    } catch (e) { handleErrors(res, e); }
});

// 6. Teacher Routes
app.get('/api/teachers/all', auth, async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.send(teachers);
    } catch (e) { handleErrors(res, e); }
});

app.post('/api/teachers/add', auth, checkRole(['Admin']), async (req, res) => {
    try {
        const { name, employeeId, subject, email, phone } = req.body;
        const teacher = new Teacher({ name, employeeId, subject, email, phone });
        await teacher.save();
        res.status(201).send(teacher);
    } catch (e) { handleErrors(res, e); }
});

// 7. Course Routes
app.get('/api/courses/all', auth, async (req, res) => {
    try {
        const courses = await Course.find();
        res.send(courses);
    } catch (e) { handleErrors(res, e); }
});

app.post('/api/courses/add', auth, checkRole(['Admin']), async (req, res) => {
    try {
        const { name, code, credits } = req.body;
        const course = new Course({ name, code, credits: Number(credits) }); // Ensure Number type
        await course.save();
        res.status(201).send(course);
    } catch (e) { handleErrors(res, e); }
});

// 8. Attendance Routes
app.get('/api/attendance/all', auth, async (req, res) => {
    try {
        const records = await Attendance.find();
        res.send(records);
    } catch (e) { handleErrors(res, e); }
});

app.post('/api/attendance/add', auth, checkRole(['Admin', 'Teacher']), async (req, res) => {
    try {
        const { studentId, date, status, subject } = req.body;
        const attendance = new Attendance({ studentId, date, status, subject });
        await attendance.save();
        res.status(201).send(attendance);
    } catch (e) { handleErrors(res, e); }
});

// 9. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));