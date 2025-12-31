const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testCourse() {
  try {
    // 1. Login as Admin (assuming seeds exist, or we create one)
    console.log('Logging in...');
    let token;
    try {
      const login = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@quantum.edu',
        password: 'admin123@password' // Trying common seed password
      });
      token = login.data.token;
      console.log('Login Success. Token acquired.');
    } catch (e) {
      console.log('Login failed. Registering new admin...');
      await axios.post(`${API_URL}/auth/register`, {
        name: 'Test Admin',
        email: 'testadmin@course.com',
        password: 'password123',
        role: 'Admin'
      });
      const login = await axios.post(`${API_URL}/auth/login`, {
        email: 'testadmin@course.com',
        password: 'password123'
      });
      token = login.data.token;
      console.log('Registered & Logged in.');
    }

    // 2. Add Course
    console.log('Adding Course...');
    const courseRes = await axios.post(`${API_URL}/courses/add`, {
      name: 'Quantum Physics 101',
      code: 'QP101',
      credits: 4
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Course Added:', courseRes.data);

    // 3. fetch
    const allRes = await axios.get(`${API_URL}/courses/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('All Courses:', allRes.data.length);

  } catch (e) {
    console.error('Test Failed:', e.response ? e.response.data : e.message);
  }
}

testCourse();
