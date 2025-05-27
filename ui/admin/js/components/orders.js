import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Orders</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Patient</th><th>Doctor</th><th>Items</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody id="list"></tbody>
          </table>
        </div>
        <div id="form"></div>
      </div>
    </div>
  `;

  const list = document.getElementById('list');
  list.innerHTML = '';
  (await api.list('orders')).forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.patient_id}</td>
      <td>${o.doctor_id}</td>
      <td>
        ${o.items && o.items.length > 0
          ? o.items.map(i => `${i.medication} (${i.dosage}) x${i.quantity}`).join('<br>')
          : ''}
      </td>
      <td><span class="status ${o.status}">${o.status}</span></td>
      <td>
        <button class="btn btn-secondary e" data-id="${o.id}">Edit</button>
        <button class="btn btn-danger d" data-id="${o.id}">Delete</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) api.del('orders', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let o = { patient_id: '', doctor_id: '', prescription_id: '', status: 'pending', items: [] };
  if (id) {
    o = await api.get('orders', id);
    renderOrderForm(c, o, true);
  } else {
    renderOrderForm(c, o, false);
  }
}

async function renderOrderForm(container, order, isEdit) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${isEdit ? 'Edit' : 'New'} Order</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label>Prescription ID</label>
          <input id="prf" type="number" value="${order.prescription_id}">
          ${isEdit ? '' : '<button id="fetchPrescription" class="btn">Fetch Prescription</button>'}
        </div>
        <div class="form-group">
          <label>Patient ID</label>
          <input id="pf" type="number" value="${order.patient_id}">
        </div>
        <div class="form-group">
          <label>Doctor ID</label>
          <input id="df" type="number" value="${order.doctor_id}">
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="st">
            <option value="pending">pending</option>
            <option value="filled">filled</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div id="order-items"></div>
        <button id="sv" class="btn">Save</button>
      </div>
    </div>
  `;

  document.getElementById('st').value = order.status;

  // Khi tạo mới, phải fetch prescription để hiển thị items
  if (!isEdit) {
    document.getElementById('fetchPrescription').onclick = async () => {
      const prescriptionId = document.getElementById('prf').value;
      if (!prescriptionId) return alert("Nhập Prescription ID trước!");

      // Đảm bảo đúng domain/port service prescription của bạn
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://127.0.0.1/api/v1/prescriptions/${prescriptionId}/`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) {
        alert("Prescription ID không tồn tại hoặc không truy cập được.");
        return;
      }
      const presc = await res.json();

      // Gợi ý số lượng mặc định = duration_days, hoặc cho user nhập lại
      order.items = (presc.items || []).map(i => ({
        medication: i.medication,
        dosage: i.dosage,
        quantity: i.duration_days // bạn có thể cho user sửa field quantity
      }));
      // cũng fill luôn patient_id, doctor_id nếu muốn
      order.patient_id = presc.patient_id || order.patient_id;
      order.doctor_id = presc.doctor_id || order.doctor_id;
      renderOrderForm(container, order, false);
    };
  }

  renderOrderItems(order.items);

  document.getElementById('sv').onclick = async () => {
    // cập nhật quantity từ input (user có thể sửa lại trước khi save)
    order.items.forEach((it, idx) => {
      const el = document.querySelector(`#qty_${idx}`);
      it.quantity = Number(el.value) || 0;
    });

    const payload = {
      patient_id: +document.getElementById('pf').value,
      doctor_id: +document.getElementById('df').value,
      prescription_id: +document.getElementById('prf').value,
      status: document.getElementById('st').value,
      items: order.items.map(it => ({
        medication: it.medication,
        dosage: it.dosage,
        quantity: Number(it.quantity) || 1
      }))
    };

    // validate
    if (!payload.prescription_id || !payload.patient_id || !payload.doctor_id || !payload.items.length) {
      alert('Điền đủ Prescription, Patient, Doctor và ít nhất 1 item!');
      return;
    }
    // quantity phải >=1
    if (payload.items.some(i => !i.medication || !i.dosage || i.quantity < 1)) {
      alert('Điền đủ thông tin các thuốc và số lượng lớn hơn 0!');
      return;
    }

    try {
      if (isEdit) await api.update('orders', order.id, payload);
      else await api.create('orders', payload);
      container.innerHTML = '';
      render();
    } catch (err) {
      alert(err.message);
    }
  };
}

function renderOrderItems(items) {
  const itemsContainer = document.getElementById('order-items');
  itemsContainer.innerHTML = (items || []).map((i, idx) => `
    <div class="form-group">
      <label>${i.medication} (${i.dosage})</label>
      <input id="qty_${idx}" type="number" min="1" class="quantity" placeholder="Quantity" value="${i.quantity || 1}">
    </div>
  `).join('');
}
