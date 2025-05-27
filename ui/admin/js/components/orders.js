import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Orders</h1>
        <button id="new" class="btn">New</button>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Patient</th><th>Doctor</th><th>Items</th><th>Status</th><th>Action</th>
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
  (await api.list('orders')).forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.patient_id}</td>
      <td>${o.doctor_id}</td>
      <td>${o.items.map(i => `${i.medication} x${i.quantity}`).join(', ')}</td>
      <td><span class="status ${o.status}">${o.status}</span></td>
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
    if (e.target.classList.contains('d')) api.del('orders', e.target.dataset.id).then(render);
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let o = { patient_id: '', doctor_id: '', prescription_id: '', status: 'pending', items: [] };
  if (id) {
    o = await api.get('orders', id);
    renderOrderForm(c, o, true);
  } else {
    renderOrderForm(c, o, false);
  }
}

async function renderOrderForm(container, order, isEdit) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>${isEdit ? 'Edit' : 'New'} Order</h2>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label>Prescription ID</label>
          <input id="prf" type="number" value="${order.prescription_id}">
          ${isEdit ? '' : '<button id="fetchPrescription" class="btn">Fetch Prescription</button>'}
        </div>
        <div class="form-group">
          <label>Patient ID</label>
          <input id="pf" type="number" value="${order.patient_id}">
        </div>
        <div class="form-group">
          <label>Doctor ID</label>
          <input id="df" type="number" value="${order.doctor_id}">
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="st">
            <option value="pending">pending</option>
            <option value="filled">filled</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div id="order-items"></div>
        <button id="sv" class="btn">Save</button>
      </div>
    </div>
  `;

  document.getElementById('st').value = order.status;

  if (!isEdit) {
    document.getElementById('fetchPrescription').onclick = fetchPrescriptionItems;
  } else {
    renderOrderItems(order.items, true);
  }

  document.getElementById('sv').onclick = async () => {
    const payload = {
      patient_id: +document.getElementById('pf').value,
      doctor_id: +document.getElementById('df').value,
      prescription_id: +document.getElementById('prf').value,
      status: document.getElementById('st').value,
      items: Array.from(document.querySelectorAll('.item')).map(el => ({
        medication: el.dataset.medication,
        dosage: el.dataset.dosage,
        quantity: +el.querySelector('.quantity').value
      }))
    };
    if (isEdit) await api.update('orders', order.id, payload);
    else await api.create('orders', payload);

    container.innerHTML = '';
    render();
  };
}

async function fetchPrescriptionItems() {
  const prescriptionId = document.getElementById('prf').value;
  const token = localStorage.getItem('accessToken');

  const res = await fetch(`http://localhost/api/v1/prescriptions/${prescriptionId}/`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  if (!res.ok) {
    alert("Invalid prescription ID");
    return;
  }

  const presc = await res.json();
  renderOrderItems(presc.items, false);
}

function renderOrderItems(items, isEdit) {
  const itemsContainer = document.getElementById('order-items');
  itemsContainer.innerHTML = items.map(i => `
    <div class="form-group item" data-medication="${i.medication}" data-dosage="${i.dosage}">
      <label>${i.medication} (${i.dosage})</label>
      <input type="number" class="quantity" placeholder="Quantity" value="${isEdit ? i.quantity : ''}">
    </div>
  `).join('');
}
