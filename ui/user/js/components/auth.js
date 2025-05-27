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
    const username        = document.getElementById('username').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email           = document.getElementById('email').value.trim();
    const fullName        = document.getElementById('fullName').value.trim();

    if (!username || !password || !email || !fullName) {
      return showError('Vui lòng điền đầy đủ các trường');
    }
    if (password !== confirmPassword) {
      return showError('Mật khẩu và xác nhận không khớp');
    }


    console.log(
      JSON.stringify({
        username,
        password,
        email,
        full_name: fullName
      }, null, 2)
    );

    try {
      // 3️⃣ Gọi API với payload hợp lệ
      const newUser = await api.createUser({
        username,
        password,
        email,
        full_name: fullName
      });

      // 4️⃣ Tạo luôn record Patient (nếu cần)
      await api.createPatient({
        user_id:       newUser.id,
        full_name:     fullName,
        medical_record:'',
        dob:           null,
        address:       '',
        phone:         ''
      });

      // Chuyển về login
      window.location.hash = '/login';
    } catch (err) {
      showError('Lỗi đăng ký: ' + err.message);
    }

    function showError(text) {
      const msgEl = document.getElementById('msg');
      msgEl.textContent = text;
      msgEl.classList.add('error');
    }
  };
}

function handleLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.hash = '/login';
}

