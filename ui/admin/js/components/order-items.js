// --- File: js/components/order-items.js ---
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Order Items</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Medication</th><th>Dosage</th><th>Quantity</th><th>Action</th>
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
  (await api.list('order-items')).forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.medication}</td>
      <td>${o.dosage}</td>
      <td>${o.quantity}</td>
      <td>
        <button class="btn btn-secondary e" data-id="${o.id}">Edit</button>
        <button class="btn btn-danger d" data-id="${o.id}">Delete</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) api.del('order-items', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let o = { medication: '', dosage: '', quantity: '' };
  if (id) o = await api.get('order-items', id);

  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${id ? 'Edit' : 'New'} Item</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label>Medication</label>
          <input id="md" value="${o.medication}">
        </div>
        <div class="form-group">
          <label>Dosage</label>
          <input id="dg" value="${o.dosage}">
        </div>
        <div class="form-group">
          <label>Quantity</label>
          <input id="qt" type="number" value="${o.quantity}">
        </div>
        <button id="sv" class="btn">Save</button>
      </div>
    </div>
  `;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      medication: md.value,
      dosage: dg.value,
      quantity: +qt.value
    };
    if (id) await api.update('order-items', id, payload);
    else    await api.create('order-items', payload);
    c.innerHTML = '';
    render();
  };
}