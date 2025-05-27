// Repeat the above pattern for each component:
// File: js/components/doctors.js
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Doctors</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>User ID</th><th>Specialty</th><th>Bio</th><th>Action</th>
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
  (await api.list('doctors')).forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.id}</td>
      <td>${d.user_id}</td>
      <td>${d.specialty}</td>
      <td>${d.bio || ''}</td>
      <td>
        <button class="btn btn-secondary e" data-id="${d.id}">Edit</button>
        <button class="btn btn-danger d" data-id="${d.id}">Delete</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) api.del('doctors', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let d = { user_id: '', specialty: '', bio: '' };
  if (id) d = await api.get('doctors', id);

  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${id ? 'Edit' : 'New'} Doctor</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label>User ID</label>
          <input id="uf" type="number" value="${d.user_id}">
        </div>
        <div class="form-group">
          <label>Specialty</label>
          <input id="spf" value="${d.specialty}">
        </div>
        <div class="form-group">
          <label>Bio</label>
          <textarea id="bf">${d.bio || ''}</textarea>
        </div>
        <button id="sv" class="btn">Save</button>
      </div>
    </div>
  `;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      user_id: +document.getElementById('uf').value,
      specialty: document.getElementById('spf').value,
      bio: document.getElementById('bf').value
    };
    if (id) await api.update('doctors', id, payload);
    else    await api.create('doctors', payload);
    c.innerHTML = '';
    render();
  };
}