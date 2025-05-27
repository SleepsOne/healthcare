import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Users</h1>
    <button id="new">New</button>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Username</th><th>Full Name</th><th>Email</th><th>DOB</th><th>Action</th>
        </tr>
      </thead>
      <tbody id="list"></tbody>
    </table>
    <div id="form"></div>
  `;

  const list = document.getElementById('list');
  (await api.list('users')).forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.full_name}</td>
      <td>${u.email}</td>
      <td>${u.dob || ''}</td>
      <td>
        <button class="e" data-id="${u.id}">E</button>
        <button class="d" data-id="${u.id}">D</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) {
      api.del('users', e.target.dataset.id).then(render);
    }
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let u = { username:'', password:'', full_name:'', email:'', dob:'' };
  if (id) u = await api.get('users', id);

  c.innerHTML = `
    <h2>${id? 'Edit':'New'} User</h2>
    <div class="form-group">
      <label>Username</label>
      <input id="un" value="${u.username}">
    </div>
    <div class="form-group">
      <label>Password</label>
      <input id="pw" type="password">
    </div>
    <div class="form-group">
      <label>Full Name</label>
      <input id="fn" value="${u.full_name}">
    </div>
    <div class="form-group">
      <label>Email</label>
      <input id="em" type="email" value="${u.email}">
    </div>
    <div class="form-group">
      <label>DOB</label>
      <input id="db" type="date" value="${u.dob || ''}">
    </div>
    <button id="sv">Save</button>
  `;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      username: un.value,
      password: pw.value || undefined,
      full_name: fn.value,
      email: em.value,
      dob: db.value || null
    };
    if (id) await api.update('users', id, payload);
    else    await api.create('users', payload);
    c.innerHTML = '';
    render();
  };
}
