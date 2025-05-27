// --- File: js/components/login.js ---
import { api } from '../api.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card auth-card">
      <div class="card-header auth-header">
        <h1>Login</h1>
      </div>
      <div class="card-content auth-content">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" class="input" placeholder="Enter username" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" class="input" placeholder="Enter password" />
        </div>
        <button id="btnLogin" class="btn btn-primary btn-block">Login</button>
        <p id="msg" class="message"></p>
      </div>
    </div>
  `;

  document.getElementById('btnLogin').onclick = async () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    const msgEl = document.getElementById('msg');
    msgEl.textContent = '';
    try {
      const data = await api.token({ username: u, password: p });
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      location.hash = '/appointments';
    } catch (err) {
      msgEl.textContent = 'Login failed: ' + err.message;
      msgEl.classList.add('error');
    }
  };
}