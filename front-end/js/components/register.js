import { api } from '../api.js';

export function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Register</h1>
    <div class="form-group">
      <label>Username</label>
      <input id="username" />
    </div>
    <div class="form-group">
      <label>Password</label>
      <input id="password" type="password" />
    </div>
    <div class="form-group">
      <label>Full Name</label>
      <input id="fullName" />
    </div>
    <div class="form-group">
      <label>Email</label>
      <input id="email" type="email" />
    </div>
    <button id="btnRegister">Register</button>
    <div id="msg"></div>
  `;

  document.getElementById('btnRegister').onclick = async () => {
    const payload = {
      username: username.value,
      password: password.value,
      full_name: fullName.value,
      email:    email.value,
    };
    try {
      await api.create('users', payload);
      msg.textContent = 'Registration successful! Please log in.';
      location.hash = '/login';
    } catch (err) {
      msg.textContent = 'Register failed: ' + err.message;
    }
  };
}
