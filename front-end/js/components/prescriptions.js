import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Prescriptions</h1>
    <button id="new">New</button>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Appointment</th><th>Patient</th><th>Doctor</th><th>Items</th><th>Action</th>
        </tr>
      </thead>
      <tbody id="list"></tbody>
    </table>
    <div id="form"></div>
  `;

  const list = document.getElementById('list');
  (await api.list('prescriptions')).forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.appointment_id}</td>
      <td>${p.patient_id}</td>
      <td>${p.doctor_id}</td>
      <td>${p.items.map(i => i.medication).join(', ')}</td>
      <td>
        <button class="e" data-id="${p.id}">E</button>
        <button class="d" data-id="${p.id}">D</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) {
      api.del('prescriptions', e.target.dataset.id).then(render);
    }
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let p = { appointment_id:'', patient_id:'', doctor_id:'', notes:'', items:[] };
  if (id) p = await api.get('prescriptions', id);

  c.innerHTML = `
    <h2>${id? 'Edit':'New'} Prescription</h2>
    <div class="form-group">
      <label>Appointment ID</label>
      <input id="af" value="${p.appointment_id}">
    </div>
    <div class="form-group">
      <label>Patient ID</label>
      <input id="pf" value="${p.patient_id}">
    </div>
    <div class="form-group">
      <label>Doctor ID</label>
      <input id="df" value="${p.doctor_id}">
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="nf">${p.notes || ''}</textarea>
    </div>
    <button id="sv">Save</button>
  `;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      appointment_id: +af.value,
      patient_id:     +pf.value,
      doctor_id:      +df.value,
      notes:          nf.value,
      items:          p.items
    };
    if (id) await api.update('prescriptions', id, payload);
    else    await api.create('prescriptions', payload);
    c.innerHTML = '';
    render();
  };
}
