import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Medications</h1>
    <button id="new">New</button>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Dosage</th><th>Strength</th><th>Price</th><th>Stock</th><th>Action</th>
        </tr>
      </thead>
      <tbody id="list"></tbody>
    </table>
    <div id="form"></div>
  `;

  const list = document.getElementById('list');
  (await api.list('medications')).forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${m.name}</td>
      <td>${m.dosage_form}</td>
      <td>${m.strength}</td>
      <td>${m.price}</td>
      <td>${m.stock}</td>
      <td>
        <button class="e" data-id="${m.id}">E</button>
        <button class="d" data-id="${m.id}">D</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) {
      api.del('medications', e.target.dataset.id).then(render);
    }
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let m = {
    name:'', description:'', dosage_form:'',
    strength:'', price:'', stock:''
  };
  if (id) m = await api.get('medications', id);

  c.innerHTML = `
    <h2>${id? 'Edit':'New'} Medication</h2>
    <div class="form-group">
      <label>Name</label>
      <input id="nm" value="${m.name}">
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="ds">${m.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Dosage</label>
      <input id="dos" value="${m.dosage_form}">
    </div>
    <div class="form-group">
      <label>Strength</label>
      <input id="stg" value="${m.strength}">
    </div>
    <div class="form-group">
      <label>Price</label>
      <input id="pr" value="${m.price}">
    </div>
    <div class="form-group">
      <label>Stock</label>
      <input id="sk" type="number" value="${m.stock}">
    </div>
    <button id="sv">Save</button>
  `;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      name: nm.value,
      description: ds.value,
      dosage_form: dos.value,
      strength: stg.value,
      price: pr.value,
      stock: +sk.value
    };
    if (id) await api.update('medications', id, payload);
    else    await api.create('medications', payload);
    c.innerHTML = '';
    render();
  };
}
