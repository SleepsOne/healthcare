// --- File: js/components/register.js ---
import { api } from '../api.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card auth-card">
      <div class="card-header auth-header">
        <h1>Register</h1>
      </div>
      <div class="card-content auth-content">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" class="input" placeholder="Choose username" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" class="input" placeholder="Enter password" />
        </div>
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input id="fullName" class="input" placeholder="Your full name" />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" class="input" placeholder="Enter email" />
        </div>
        <button id="btnRegister" class="btn btn-primary btn-block">Register</button>
        <p id="msg" class="message"></p>
      </div>
    </div>
  `;

  document.getElementById('btnRegister').onclick = async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const msgEl = document.getElementById('msg');
    msgEl.textContent = '';

    try {
      const newUser = await api.create('users', { username, password, full_name: fullName, email });
      // Optionally create patient record
      await api.create('patients', { user_id: newUser.id, full_name: fullName, medical_record: '', dob: null, address: '', phone: '' });
      msgEl.textContent = 'Registration successful! Redirecting to login...';
      setTimeout(() => location.hash = '/login', 1500);
    } catch (err) {
      msgEl.textContent = 'Register failed: ' + err.message;
      msgEl.classList.add('error');
    }
  };
}