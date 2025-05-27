// user-ui/js/components/auth.js
import { api } from '../api.js';

/**
 * Hiển thị form đăng nhập
 */
export function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="card">
      <h2>Đăng nhập</h2>
      <div class="form-group">
        <label for="username">Tên đăng nhập</label>
        <input id="username" type="text" placeholder="Nhập tên đăng nhập" />
      </div>
      <div class="form-group">
        <label for="password">Mật khẩu</label>
        <input id="password" type="password" placeholder="Nhập mật khẩu" />
      </div>
      <button id="btnLogin" class="btn">Đăng nhập</button>
      <p class="message" id="msg"></p>
    </section>
  `;

  document.getElementById('btnLogin').onclick = async () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    try {
      const data = await api.token({ username: u, password: p });
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      window.location.hash = '/profile';
    } catch (err) {
      const msgEl = document.getElementById('msg');
      msgEl.textContent = 'Lỗi đăng nhập: ' + err.message;
      msgEl.classList.add('error');
    }
  };
}

/**
 * Hiển thị form đăng ký
 */
export function renderRegister() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="card">
      <h2>Đăng ký</h2>
      <div class="form-group">
        <label for="username">Tên đăng nhập</label>
        <input id="username" type="text" placeholder="Chọn tên đăng nhập" />
      </div>
      <div class="form-group">
        <label for="password">Mật khẩu</label>
        <input id="password" type="password" placeholder="Nhập mật khẩu" />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Xác nhận mật khẩu</label>
        <input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" placeholder="Nhập email" />
      </div>
      <div class="form-group">
        <label for="fullName">Họ và tên</label>
        <input id="fullName" type="text" placeholder="Nhập họ và tên" />
      </div>
      <button id="btnRegister" class="btn">Đăng ký</button>
      <p class="message" id="msg"></p>
    </section>
  `;

  document.getElementById('btnRegister').onclick = async () => {
    // … collect username, password, email, fullName …

    try {
      // 1) create the user
      const userData = { username, password, email, full_name: fullName };
      const newUser = await api.createUser(userData);

      // 2) immediately create a patient record for them
      await api.createPatient({
        user_id: newUser.id,
        full_name: fullName,
        medical_record: '',  // or generate on backend
        dob: null,
        address: '',
        phone: ''
      });

      // then send them to login
      window.location.hash = '/login';
    } catch (err) {
      const msgEl = document.getElementById('msg');
      msgEl.textContent = 'Lỗi đăng ký: ' + err.message;
      msgEl.classList.add('error');
    }
  };
}

function handleLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.hash = '/login';
}

