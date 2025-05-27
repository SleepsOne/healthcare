import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Doctors</h1>
    <button id="new">New</button>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>User ID</th><th>Specialty</th><th>Bio</th><th>Action</th>
        </tr>
      </thead>
      <tbody id="list"></tbody>
    </table>
    <div id="form"></div>
  `;

  const list = document.getElementById('list');
  (await api.list('doctors')).forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.id}</td>
      <td>${d.user_id}</td>
      <td>${d.specialty}</td>
      <td>${d.bio || ''}</td>
      <td>
        <button class="e" data-id="${d.id}">E</button>
        <button class="d" data-id="${d.id}">D</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) {
      api.del('doctors', e.target.dataset.id).then(render);
    }
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let d = { user_id:'', specialty:'', bio:'' };
  if (id) d = await api.get('doctors', id);

  c.innerHTML = `
    <h2>${id? 'Edit':'New'} Doctor</h2>
    <div class="form-group">
      <label>User ID</label>
      <input id="uf" value="${d.user_id}">
    </div>
    <div class="form-group">
      <label>Specialty</label>
      <input id="spf" value="${d.specialty}">
    </div>
    <div class="form-group">
      <label>Bio</label>
      <textarea id="bf">${d.bio || ''}</textarea>
    </div>
    <button id="sv">Save</button>
  `;
  
  document.getElementById('sv').onclick = async () => {
    const payload = {
      user_id: +uf.value,
      specialty: spf.value,
      bio: bf.value
    };
    if (id) await api.update('doctors', id, payload);
    else    await api.create('doctors', payload);
    c.innerHTML = '';
    render();
  };
}
