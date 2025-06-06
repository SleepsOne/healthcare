// user-ui/js/components/profile.js
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="card profile-card">
      <h2>Thông tin cá nhân</h2>
      <div class="card-content">
        <form id="profileForm">
          <div class="form-section">
            <h3>Thông tin tài khoản</h3>
            <div class="form-group">
              <label for="username">Tên đăng nhập</label>
              <input id="username" type="text" readonly>
            </div>
            <div class="form-group">
              <label for="fullName">Họ và tên</label>
              <input id="fullName" type="text" placeholder="Nhập họ và tên" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" placeholder="Nhập email" required>
            </div>
          </div>

          <div class="form-section">
            <h3>Thông tin bệnh nhân</h3>
            <div class="form-group">
              <label for="medicalRecord">Mã hồ sơ bệnh án</label>
              <input id="medicalRecord" type="text" readonly>
            </div>
            <div class="form-group">
              <label for="phone">Số điện thoại</label>
              <input id="phone" type="tel" placeholder="Nhập số điện thoại" pattern="[0-9]{10}" required>
            </div>
            <div class="form-group">
              <label for="dob">Ngày sinh</label>
              <input id="dob" type="date" required>
            </div>
            <div class="form-group">
              <label for="address">Địa chỉ</label>
              <input id="address" type="text" placeholder="Nhập địa chỉ" required>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            <button type="button" class="btn btn-secondary" onclick="window.location.hash = '/appointments'">Xem lịch hẹn</button>
          </div>
        </form>
      </div>
    </section>
  `;

  try {
    // Lấy thông tin user
    const userData = await api.getCurrentUser();
    document.getElementById('username').value = userData.username || '';
    document.getElementById('fullName').value = userData.full_name || '';
    document.getElementById('email').value = userData.email || '';
    
    // Lấy thông tin patient
    const patientData = await api.getCurrentPatient();
    document.getElementById('medicalRecord').value = patientData.medical_record || '';
    document.getElementById('phone').value = patientData.phone || '';
    document.getElementById('dob').value = patientData.dob || '';
    document.getElementById('address').value = patientData.address || '';

    // Xử lý form submit
    document.getElementById('profileForm').onsubmit = async (e) => {
      e.preventDefault();
      
      try {
        // Cập nhật thông tin user
        const userData = {
          full_name: document.getElementById('fullName').value.trim(),
          email: document.getElementById('email').value.trim()
        };
        await api.updateCurrentUser(userData);

        // Cập nhật thông tin patient
        const patientData = {
          phone: document.getElementById('phone').value.trim(),
          dob: document.getElementById('dob').value,
          address: document.getElementById('address').value.trim()
        };
        await api.updateCurrentPatient(patientData);

        // Hiển thị thông báo thành công
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success';
        successMsg.textContent = 'Cập nhật thông tin thành công!';
        document.querySelector('.form-actions').prepend(successMsg);
        
        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => successMsg.remove(), 3000);
      } catch (err) {
        // Hiển thị thông báo lỗi
        const errorMsg = document.createElement('div');
        errorMsg.className = 'alert alert-error';
        errorMsg.textContent = 'Cập nhật thất bại: ' + err.message;
        document.querySelector('.form-actions').prepend(errorMsg);
        
        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => errorMsg.remove(), 3000);
      }
    };
  } catch (err) {
    app.innerHTML = `
      <div class="alert alert-error">
        <p>Không thể tải thông tin cá nhân: ${err.message}</p>
        <button class="btn" onclick="window.location.reload()">Thử lại</button>
      </div>
    `;
  }
}
