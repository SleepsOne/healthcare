// --- File: js/components/prescriptions.js ---
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Prescriptions</h1>
        <button id="new" class="btn">New</button>
      </\/div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Appointment</th><th>Patient</th><th>Doctor</th><th>Items</th><th>Action</th>
              </tr>
            <\/thead>
            <tbody id="list"><\/tbody>
          <\/table>
        <\/div>
        <div id="form"><\/div>
      <\/div>
    <\/div>
  `;

  const list = document.getElementById('list'); list.innerHTML = '';
  (await api.list('prescriptions')).forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.appointment_id}</td>
      <td>${p.patient_id}</td>
      <td>${p.doctor_id}</td>
      <td>${p.items.map(i => i.medication).join(', ')}</td>
      <td>
        <button class="btn btn-secondary e" data-id="${p.id}">Edit</button>
        <button class="btn btn-danger d" data-id="${p.id}">Delete</button>
      </td>
    `;
    list.append(tr);
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

  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${id ? 'Edit' : 'New'} Prescription</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label>Appointment ID</label>
          <input id="af" type="number" value="${p.appointment_id}">
        <\/div>
        <div class="form-group">
          <label>Patient ID</label>
          <input id="pf" type="number" value="${p.patient_id}">
        <\/div>
        <div class="form-group">
          <label>Doctor ID</label>
          <input id="df" type="number" value="${p.doctor_id}">
        <\/div>
        <div class="form-group">
          <label>Notes</label>
          <textarea id="nf">${p.notes || ''}<\/textarea>
        <\/div>
        <button id="sv" class="btn">Save</button>
      <\/div>
    <\/div>
  `;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      appointment_id: +document.getElementById('af').value,
      patient_id:     +document.getElementById('pf').value,
      doctor_id:      +document.getElementById('df').value,
      notes:          document.getElementById('nf').value,
      items:          p.items
    };
    if (id) await api.update('prescriptions', id, payload);
    else    await api.create('prescriptions', payload);
    c.innerHTML = '';
    render();
  };
}