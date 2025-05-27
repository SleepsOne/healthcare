// --- File: js/components/medications.js ---
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Medications</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Dosage</th><th>Strength</th><th>Price</th><th>Stock</th><th>Action</th>
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
        <button class="btn btn-secondary e" data-id="${m.id}">Edit</button>
        <button class="btn btn-danger d" data-id="${m.id}">Delete</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) api.del('medications', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let m = { name: '', description: '', dosage_form: '', strength: '', price: '', stock: '' };
  if (id) m = await api.get('medications', id);

  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${id ? 'Edit' : 'New'} Medication</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label>Name</label>
          <input id="nm" value="${m.name}">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="ds">${m.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Dosage Form</label>
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
        <button id="sv" class="btn">Save</button>
      </div>
    </div>
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
