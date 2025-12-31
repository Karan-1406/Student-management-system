const apiBaseUrl = "http://localhost:5000/api"; // Apne backend ka URL yahan rakhein
let isLogin = true;

// GSAP Initial Animation
gsap.from(".auth-container", { duration: 1, opacity: 0, y: -100, ease: "power3.out" });

function toggleAuth() {
    isLogin = !isLogin;
    const title = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const nameField = document.getElementById('name-field');
    const toggleText = document.getElementById('toggle-text');

    if (!isLogin) {
        title.innerText = "Signup";
        submitBtn.innerText = "Register";
        nameField.style.display = "block";
        toggleText.innerHTML = 'Already have an account? <span onclick="toggleAuth()">Login</span>';
        gsap.from("#name-field", { duration: 0.5, opacity: 0, x: -20 });
    } else {
        title.innerText = "Login";
        submitBtn.innerText = "Login";
        nameField.style.display = "none";
        toggleText.innerHTML = 'Don\'t have an account? <span onclick="toggleAuth()">Signup</span>';
    }
}

document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const name = document.getElementById('name').value;

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin ? { email, password } : { name, email, password, role };

    try {
        const response = await fetch(apiBaseUrl + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            if (isLogin) {
                // Login Success
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.role);
                alert("Login Successful!");
                window.location.href = "dashboard.html";
            } else {
                // Register Success
                alert("Registration Successful! Please Login.");
                toggleAuth();
            }
        } else {
            alert(data.message || "Something went wrong");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Server connection failed");
    }
});