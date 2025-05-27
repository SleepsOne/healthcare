// --- File: js/components/users.js ---
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Users</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Username</th><th>Full Name</th><th>Email</th><th>DOB</th><th>Action</th>
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
  (await api.list('users')).forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.full_name}</td>
      <td>${u.email}</td>
      <td>${u.dob || ''}</td>
      <td>
        <button class="btn btn-secondary e" data-id="${u.id}">Edit</button>
        <button class="btn btn-danger d" data-id="${u.id}">Delete</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) api.del('users', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let u = { username: '', password: '', full_name: '', email: '', dob: '' };
  if (id) u = await api.get('users', id);

  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${id ? 'Edit' : 'New'} User</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label for="un">Username</label>
          <input id="un" class="input" value="${u.username}">
        </div>
        <div class="form-group">
          <label for="pw">Password</label>
          <input id="pw" type="password" class="input" placeholder="${id ? 'Leave blank to keep current' : 'Enter password'}">
        </div>
        <div class="form-group">
          <label for="fn">Full Name</label>
          <input id="fn" class="input" value="${u.full_name}">
        </div>
        <div class="form-group">
          <label for="em">Email</label>
          <input id="em" type="email" class="input" value="${u.email}">
        </div>
        <div class="form-group">
          <label for="db">DOB</label>
          <input id="db" type="date" class="input" value="${u.dob || ''}">
        </div>
        <button id="sv" class="btn btn-primary btn-block">Save</button>
      </div>
    </div>
  `;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      username: document.getElementById('un').value,
      full_name: document.getElementById('fn').value,
      email: document.getElementById('em').value,
      dob: document.getElementById('db').value || null,
    };
    const pw = document.getElementById('pw').value;
    if (pw) payload.password = pw;

    if (id) await api.update('users', id, payload);
    else    await api.create('users', payload);

    c.innerHTML = '';
    render();
  };
}
