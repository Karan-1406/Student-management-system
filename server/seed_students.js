const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';
const STUDENT_URL = 'http://localhost:5000/api/students';

async function seedData() {
  try {
    // 1. Login as Admin (we registered one in previous tests or need to create one)
    // Let's standardise on a test admin
    const adminUser = {
      name: "Principal Admin",
      email: "admin@quantum.edu",
      password: "adminpassword",
      role: "Admin"
    };

    console.log("🔐 Authenticating as Admin...");
    let token;
    try {
      const loginRes = await axios.post(`${BASE_URL}/login`, {
        email: adminUser.email,
        password: adminUser.password
      });
      token = loginRes.data.token;
    } catch (e) {
      // If login fails, try register
      console.log("   Admin not found, registering...");
      await axios.post(`${BASE_URL}/register`, adminUser);
      const loginRes = await axios.post(`${BASE_URL}/login`, {
        email: adminUser.email,
        password: adminUser.password
      });
      token = loginRes.data.token;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Add Dummy Students
    const students = [
      { name: "Anya Sharma", studentId: "S001", course: "Quantum Physics", grade: "A", status: "Active", email: "anya@edu.com" },
      { name: "Kian Patel", studentId: "S002", course: "Cyber Security", grade: "B+", status: "Active", email: "kian@edu.com" },
      { name: "Lena Singh", studentId: "S003", course: "AI & Robotics", grade: "A-", status: "Inactive", email: "lena@edu.com" }
    ];

    console.log("🌱 Seeding Students...");
    for (const s of students) {
      try {
        await axios.post(`${STUDENT_URL}/add`, s, config);
        console.log(`   ✅ Added ${s.name}`);
      } catch (err) {
        console.log(`   ⚠️ Skipped ${s.name} (Duplicate/Error)`);
      }
    }
    console.log("🎉 Seeding Complete!");

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

seedData();
