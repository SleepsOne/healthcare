import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Appointments</h1>
    <button id="new">New</button>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th><th>Action</th>
        </tr>
      </thead>
      <tbody id="list"></tbody>
    </table>
    <div id="form"></div>
  `;

  const list = document.getElementById('list');
  (await api.list('appointments')).forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.id}</td>
      <td>${a.patient_id}</td>
      <td>${a.doctor_id}</td>
      <td>${new Date(a.scheduled_at).toLocaleString()}</td>
      <td>${a.status}</td>
      <td>
        <button class="e" data-id="${a.id}">E</button>
        <button class="d" data-id="${a.id}">D</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) {
      api.del('appointments', e.target.dataset.id).then(render);
    }
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let d = { patient_id:'', doctor_id:'', scheduled_at:'', status:'pending' };
  if (id) d = await api.get('appointments', id);

  c.innerHTML = `
    <h2>${id? 'Edit':'New'} Appointment</h2>
    <div class="form-group">
      <label>Patient ID</label>
      <input id="pf" value="${d.patient_id}">
    </div>
    <div class="form-group">
      <label>Doctor ID</label>
      <input id="df" value="${d.doctor_id}">
    </div>
    <div class="form-group">
      <label>Scheduled At</label>
      <input id="sf" type="datetime-local" value="${d.scheduled_at?.slice(0,16)||''}">
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="st">
        <option value="pending">pending</option>
        <option value="confirmed">confirmed</option>
        <option value="cancelled">cancelled</option>
      </select>
    </div>
    <button id="sv">Save</button>
  `;
  document.getElementById('st').value = d.status;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      patient_id: +pf.value,
      doctor_id:  +df.value,
      scheduled_at: new Date(sf.value).toISOString(),
      status: st.value,
    };
    if (id) await api.update('appointments', id, payload);
    else   await api.create('appointments', payload);
    c.innerHTML = '';
    render();
  };
}
