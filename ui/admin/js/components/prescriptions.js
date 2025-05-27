// --- File: js/components/prescriptions.js ---
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Prescriptions</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Appointment</th><th>Patient</th><th>Doctor</th><th>Items</th><th>Action</th>
              </tr>
            </thead>
            <tbody id="list"></tbody>
          </table>
        </div>
        <div id="form"></div>
      </div>
    </div>
  `;

  const list = document.getElementById('list'); list.innerHTML = '';
  (await api.list('prescriptions')).forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.appointment_id}</td>
      <td>${p.patient_id}</td>
      <td>${p.doctor_id}</td>
      <td>
        ${p.items && p.items.length > 0
          ? p.items.map(i => `${i.medication} (${i.dosage}, ${i.duration_days}d)`).join('<br>')
          : ''}
      </td>
      <td>
        <button class="btn btn-secondary e" data-id="${p.id}">Edit</button>
        <button class="btn btn-danger d" data-id="${p.id}">Delete</button>
      </td>
    `;
    list.appendChild(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) api.del('prescriptions', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let p = { appointment_id: '', patient_id: '', doctor_id: '', notes: '', items: [] };
  if (id) p = await api.get('prescriptions', id);

  // tạm clone để user thao tác, không sửa thẳng vào p.items
  let items = Array.isArray(p.items) ? JSON.parse(JSON.stringify(p.items)) : [];

  // Hiển thị form + item list
  renderForm();

  function renderForm() {
    c.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>${id ? 'Edit' : 'New'} Prescription</h2>
        </div>
        <div class="card-content">
          <div class="form-group">
            <label>Appointment ID</label>
            <input id="af" type="number" value="${p.appointment_id}">
          </div>
          <div class="form-group">
            <label>Patient ID</label>
            <input id="pf" type="number" value="${p.patient_id}">
          </div>
          <div class="form-group">
            <label>Doctor ID</label>
            <input id="df" type="number" value="${p.doctor_id}">
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea id="nf">${p.notes || ''}</textarea>
          </div>
          <div class="form-group">
            <label><b>Prescription Items</b></label>
            <div id="item-list">
              ${items.map((item, idx) => `
                <div class="item-row" data-idx="${idx}" style="margin-bottom: 5px;">
                  <input class="med" value="${item.medication}" style="width: 100px;" placeholder="Medication">
                  <input class="dos" value="${item.dosage}" style="width: 90px;" placeholder="Dosage">
                  <input class="dur" type="number" min="1" value="${item.duration_days}" style="width: 60px;" placeholder="Days">
                  <button class="btn btn-danger btn-xs rm" data-idx="${idx}">✕</button>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:8px;">
              <input id="new-med" placeholder="Medication" style="width: 100px;">
              <input id="new-dos" placeholder="Dosage" style="width: 90px;">
              <input id="new-dur" type="number" min="1" placeholder="Days" style="width: 60px;">
              <button id="add-item" class="btn btn-secondary btn-xs">Add Item</button>
            </div>
          </div>
          <button id="sv" class="btn">Save</button>
        </div>
      </div>
    `;

    // Xử lý xóa item
    document.querySelectorAll('.rm').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.idx;
        items.splice(idx, 1);
        renderForm();
      };
    });

    // Thêm item mới
    document.getElementById('add-item').onclick = () => {
      const med = document.getElementById('new-med').value.trim();
      const dos = document.getElementById('new-dos').value.trim();
      const dur = +document.getElementById('new-dur').value;
      if (!med || !dos || isNaN(dur) || dur < 1) {
        alert('Please fill all item fields!');
        return;
      }
      items.push({ medication: med, dosage: dos, duration_days: dur });
      renderForm();
    };

    // Lưu prescription
    document.getElementById('sv').onclick = async () => {
      // cập nhật lại các trường trong items (user có thể edit trực tiếp)
      document.querySelectorAll('.item-row').forEach(row => {
        const idx = +row.dataset.idx;
        items[idx].medication = row.querySelector('.med').value.trim();
        items[idx].dosage = row.querySelector('.dos').value.trim();
        items[idx].duration_days = +row.querySelector('.dur').value;
      });

      const payload = {
        appointment_id: +document.getElementById('af').value,
        patient_id: +document.getElementById('pf').value,
        doctor_id: +document.getElementById('df').value,
        notes: document.getElementById('nf').value,
        items
      };

      if (!payload.appointment_id || !payload.patient_id || !payload.doctor_id) {
        alert('Please fill all required fields!');
        return;
      }
      if (items.length === 0) {
        alert('Prescription must have at least 1 item!');
        return;
      }
      if (id) await api.update('prescriptions', id, payload);
      else    await api.create('prescriptions', payload);
      c.innerHTML = '';
      render();
    };
  }
}
