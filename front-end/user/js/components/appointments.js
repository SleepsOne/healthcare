// user-ui/js/components/appointments.js
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('Không tìm thấy element #app');
    return;
  }

  app.innerHTML = `
    <section class="card">
      <div class="card-header">
        <h2>Lịch hẹn của bạn</h2>
        <button id="newAppointmentBtn" class="btn">Đặt lịch mới</button>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày giờ</th>
              <th>Bác sĩ</th>
              <th>Chuyên khoa</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="list"></tbody>
        </table>
      </div>
    </section>

    <!-- Modal đặt lịch -->
    <div id="appointmentModal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <h3>Đặt lịch hẹn mới</h3>
        <form id="appointmentForm">
          <div class="form-group">
            <label for="doctorId">Bác sĩ</label>
            <select id="doctorId" required>
              <option value="">Chọn bác sĩ</option>
            </select>
          </div>
          <div class="form-group">
            <label for="scheduledAt">Ngày giờ hẹn</label>
            <input id="scheduledAt" type="datetime-local" required>
          </div>
          <div class="form-group">
            <label for="reason">Lý do khám</label>
            <textarea id="reason" rows="3" required></textarea>
          </div>
          <button type="submit" class="btn">Đặt lịch</button>
        </form>
      </div>
    </div>
  `;

  // Đợi DOM được render xong
  await new Promise(resolve => setTimeout(resolve, 0));

  // Load danh sách lịch hẹn
  const list = document.getElementById('list');
  if (!list) {
    console.error('Không tìm thấy element #list');
    return;
  }

  try {
    const appointments = await api.getAppointments();
    for (const a of appointments) {
      try {
        // Lấy thông tin bác sĩ
        const doctor = await api.getDoctor(a.doctor_id);
        // Lấy thông tin user của bác sĩ từ user service
        const doctorUser = await api.getUserById(doctor.user_id);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${a.id}</td>
          <td>${new Date(a.scheduled_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
          <td>${doctorUser.full_name}</td>
          <td>${doctor.specialty}</td>
          <td><span class="status ${a.status}">${a.status}</span></td>
          <td>
            ${a.status === 'pending' ? 
              `<button class="btn btn-sm btn-danger" onclick="cancelAppointment(${a.id})">Hủy</button>` : 
              ''}
          </td>
        `;
        list.append(tr);
      } catch (err) {
        console.error(`Lỗi khi tải thông tin lịch hẹn ${a.id}:`, err);
        // Vẫn hiển thị lịch hẹn với thông tin cơ bản
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${a.id}</td>
          <td>${new Date(a.scheduled_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
          <td>Đang tải...</td>
          <td>Đang tải...</td>
          <td><span class="status ${a.status}">${a.status}</span></td>
          <td>
            ${a.status === 'pending' ? 
              `<button class="btn btn-sm btn-danger" onclick="cancelAppointment(${a.id})">Hủy</button>` : 
              ''}
          </td>
        `;
        list.append(tr);
      }
    }
  } catch (err) {
    app.innerHTML = `
      <div class="alert alert-error">
        <p>Không thể tải lịch hẹn: ${err.message}</p>
        <button class="btn" onclick="window.location.reload()">Thử lại</button>
      </div>
    `;
    return;
  }

  // Xử lý modal đặt lịch
  const modal = document.getElementById('appointmentModal');
  const btn = document.getElementById('newAppointmentBtn');
  const span = document.getElementsByClassName('close')[0];

  if (!modal || !btn || !span) {
    console.error('Không tìm thấy các element của modal');
    return;
  }

  btn.onclick = () => {
    modal.style.display = 'block';
    loadDoctors();
  };

  span.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  // Load danh sách bác sĩ
  async function loadDoctors() {
    const select = document.getElementById('doctorId');
    if (!select) {
      console.error('Không tìm thấy element #doctorId');
      return;
    }

    try {
      const doctors = await api.getDoctors();
      select.innerHTML = '<option value="">Chọn bác sĩ</option>';
      
      // Lấy thông tin user cho từng bác sĩ
      for (const doctor of doctors) {
        try {
          // Lấy thông tin user của bác sĩ từ user service
          const doctorUser = await api.getUserById(doctor.user_id);
          const option = document.createElement('option');
          option.value = doctor.id;
          option.textContent = `${doctorUser.full_name} - ${doctor.specialty}`;
          select.appendChild(option);
        } catch (err) {
          console.error(`Lỗi khi tải thông tin bác sĩ ${doctor.id}:`, err);
          // Vẫn hiển thị bác sĩ với thông tin cơ bản
          const option = document.createElement('option');
          option.value = doctor.id;
          option.textContent = `Bác sĩ #${doctor.id} - ${doctor.specialty}`;
          select.appendChild(option);
        }
      }
    } catch (err) {
      alert('Không thể tải danh sách bác sĩ: ' + err.message);
    }
  }

  // Xử lý đặt lịch
  const form = document.getElementById('appointmentForm');
  if (!form) {
    console.error('Không tìm thấy element #appointmentForm');
    return;
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
  
    const doctorId   = parseInt(document.getElementById('doctorId')?.value, 10);
    const scheduledAt = document.getElementById('scheduledAt')?.value;
    const reason      = document.getElementById('reason')?.value;
  
    if (!doctorId || !scheduledAt || !reason) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
  
    // B-strategy: unwrap the patient array
    const patients = await api.getCurrentPatient();
    const patient = Array.isArray(patients) ? patients[0] : patients;
    if (!patient || !patient.id) {
      alert('Không tìm thấy hồ sơ bệnh nhân!');
      return;
    }
  
    // ensure datetime-local has seconds
    let scheduled = scheduledAt;
    if (/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(scheduled)) {
      scheduled += ':00';
    }
  
    try {
      await api.createAppointment({
        doctor_id:    doctorId,
        patient_id:   patient.id,
        scheduled_at: scheduled,
        status:       'pending'
      });
  
      modal.style.display = 'none';
      form.reset();
      render();
    } catch (err) {
      alert('Không thể đặt lịch: ' + err.message);
    }
  };
}
  

window.cancelAppointment = async (id) => {
  if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
  try {
    // patch only the status field
    await api.patchAppointment(id, { status: 'cancelled' });
    render(); 
  } catch (err) {
    alert('Không thể hủy lịch hẹn: ' + err.message);
  }
};
