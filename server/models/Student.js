const mongoose = require('mongoose');
const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    studentClass: { type: String, required: true },
    rollNo: { type: String, unique: true, required: true },
    phone: { type: String, required: true }
});
module.exports = mongoose.model('Student', StudentSchema);