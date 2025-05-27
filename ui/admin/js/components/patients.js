// --- File: js/components/patients.js ---
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Patients</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>User ID</th><th>MRN</th><th>Name</th><th>DOB</th><th>Phone</th><th>Action</th>
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
  (await api.list('patients')).forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.user_id || ''}</td>
      <td>${p.medical_record}</td>
      <td>${p.full_name}</td>
      <td>${p.dob}</td>
      <td>${p.phone}</td>
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
    if (e.target.classList.contains('d')) api.del('patients', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let p = { user_id: '', medical_record: '', full_name: '', dob: '', address: '', phone: '' };
  if (id) p = await api.get('patients', id);

  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${id ? 'Edit' : 'New'} Patient</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label>User ID</label>
          <input id="uf" type="number" value="${p.user_id || ''}">
        </div>
        <div class="form-group">
          <label>MRN</label>
          <input id="mf" value="${p.medical_record}">
        </div>
        <div class="form-group">
          <label>Name</label>
          <input id="nf" value="${p.full_name}">
        </div>
        <div class="form-group">
          <label>DOB</label>
          <input id="df" type="date" value="${p.dob}">
        </div>
        <div class="form-group">
          <label>Address</label>
          <input id="af" value="${p.address || ''}">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input id="phf" value="${p.phone}">
        </div>
        <button id="sv" class="btn">Save</button>
      </div>
    </div>
  `;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      user_id: uf.value || null,
      medical_record: mf.value,
      full_name: nf.value,
      dob: df.value,
      address: af.value,
      phone: phf.value
    };
    if (id) await api.update('patients', id, payload);
    else    await api.create('patients', payload);
    c.innerHTML = '';
    render();
  };
}