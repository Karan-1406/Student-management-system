const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole');

// Check if user is logged in
if (!token) {
    window.location.href = 'index.html';
}

document.getElementById('user-display').innerText = `Role: ${userRole}`;

// Admin/Teacher check for "Add Student" button
if (userRole === 'Admin' || userRole === 'Teacher') {
    document.getElementById('add-std-btn').style.display = 'block';
}

async function fetchStudents() {
    try {
        const res = await fetch('http://localhost:5000/api/students/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const students = await res.json();
        
        if (res.ok) {
            displayStudents(students);
        } else {
            alert("Session expired. Please login again.");
            logout();
        }
    } catch (err) {
        console.error("Error fetching data", err);
    }
}

function displayStudents(students) {
    const grid = document.getElementById('student-grid');
    document.getElementById('total-count').innerText = students.length;
    grid.innerHTML = '';

    students.forEach(s => {
        const card = document.createElement('div');
        card.className = 'student-card';
        
        // Role-based Buttons logic
        let actionButtons = '';
        if (userRole === 'Admin') {
            actionButtons = `
                <button class="edit-btn" onclick="editStudent('${s._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteStudent('${s._id}')">Delete</button>
            `;
        } else if (userRole === 'Teacher') {
            actionButtons = `<button class="edit-btn" onclick="editStudent('${s._id}')">Edit</button>`;
        } else {
            actionButtons = `<span class="view-only">View Only</span>`;
        }

        card.innerHTML = `
            <h3>${s.name}</h3>
            <p><strong>Class:</strong> ${s.studentClass}</p>
            <p><strong>Roll No:</strong> ${s.rollNo}</p>
            <p><strong>Phone:</strong> ${s.phone}</p>
            <div class="card-actions">
                ${actionButtons}
            </div>
        `;
        grid.appendChild(card);
    });

    // Animate cards on load
    gsap.from(".student-card", { duration: 0.8, opacity: 0, scale: 0.9, stagger: 0.1 });
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete?")) return;
    
    const res = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
        alert("Deleted Successfully");
        fetchStudents();
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

fetchStudents();