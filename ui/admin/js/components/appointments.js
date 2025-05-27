import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Appointments</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th><th>Action</th>
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
  (await api.list('appointments')).forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.id}</td>
      <td>${a.patient_id}</td>
      <td>${a.doctor_id}</td>
      <td>${new Date(a.scheduled_at).toLocaleString()}</td>
      <td><span class="status ${a.status}">${a.status}</span></td>
      <td>
        <button class="btn btn-secondary e" data-id="${a.id}">Edit</button>
        <button class="btn btn-danger d" data-id="${a.id}">Delete</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) api.del('appointments', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let d = { patient_id: '', doctor_id: '', scheduled_at: '', status: 'pending' };
  if (id) d = await api.get('appointments', id);

  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${id ? 'Edit' : 'New'} Appointment</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label>Patient ID</label>
          <input id="pf" type="number" value="${d.patient_id}">
        </div>
        <div class="form-group">
          <label>Doctor ID</label>
          <input id="df" type="number" value="${d.doctor_id}">
        </div>
        <div class="form-group">
          <label>Scheduled At</label>
          <input id="sf" type="datetime-local" value="${d.scheduled_at?.slice(0,16) || ''}">
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="st">
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <button id="sv" class="btn">Save</button>
      </div>
    </div>
  `;
  document.getElementById('st').value = d.status;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      patient_id: +document.getElementById('pf').value,
      doctor_id:  +document.getElementById('df').value,
      scheduled_at: new Date(document.getElementById('sf').value).toISOString(),
      status: document.getElementById('st').value,
    };
    if (id) await api.update('appointments', id, payload);
    else   await api.create('appointments', payload);
    c.innerHTML = '';
    render();
  };
}