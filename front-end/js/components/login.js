import { api } from '../api.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Login</h1>
    <div class="form-group">
      <label>Username</label>
      <input id="username" />
    </div>
    <div class="form-group">
      <label>Password</label>
      <input id="password" type="password" />
    </div>
    <button id="btnLogin">Login</button>
    <div id="msg"></div>
  `;

  document.getElementById('btnLogin').onclick = async () => {
    const u = username.value;
    const p = password.value;
    try {
      const data = await api.token({ username: u, password: p });
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      msg.textContent = 'Login successful!';
      location.hash = '/appointments';
    } catch (err) {
      msg.textContent = 'Login failed: ' + err.message;
    }
  };
}
