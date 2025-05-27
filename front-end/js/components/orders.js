import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Orders</h1>
    <button id="new">New</button>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Patient</th><th>Doctor</th><th>Items</th><th>Status</th><th>Action</th>
        </tr>
      </thead>
      <tbody id="list"></tbody>
    </table>
    <div id="form"></div>
  `;

  const list = document.getElementById('list');
  (await api.list('orders')).forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.patient_id}</td>
      <td>${o.doctor_id}</td>
      <td>${o.items.map(i => i.medication).join(', ')}</td>
      <td>${o.status}</td>
      <td>
        <button class="e" data-id="${o.id}">E</button>
        <button class="d" data-id="${o.id}">D</button>
      </td>
    `;
    list.append(tr);
  });

  document.getElementById('new').onclick = () => showForm();
  list.onclick = e => {
    if (e.target.classList.contains('e')) showForm(e.target.dataset.id);
    if (e.target.classList.contains('d')) {
      api.del('orders', e.target.dataset.id).then(render);
    }
  };
}

async function showForm(id) {
  const c = document.getElementById('form');
  let o = {
    patient_id:'', doctor_id:'', prescription_id:'',
    status:'pending', items:[]
  };
  if (id) o = await api.get('orders', id);

  c.innerHTML = `
    <h2>${id? 'Edit':'New'} Order</h2>
    <div class="form-group">
      <label>Patient ID</label>
      <input id="pf" value="${o.patient_id}">
    </div>
    <div class="form-group">
      <label>Doctor ID</label>
      <input id="df" value="${o.doctor_id}">
    </div>
    <div class="form-group">
      <label>Prescription ID</label>
      <input id="prf" value="${o.prescription_id}">
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="st">
        <option value="pending">pending</option>
        <option value="filled">filled</option>
        <option value="cancelled">cancelled</option>
      </select>
    </div>
    <button id="sv">Save</button>
  `;
  document.getElementById('st').value = o.status;

  document.getElementById('sv').onclick = async () => {
    const payload = {
      patient_id: +pf.value,
      doctor_id:  +df.value,
      prescription_id: +prf.value,
      status: st.value,
      items: o.items
    };
    if (id) await api.update('orders', id, payload);
    else    await api.create('orders', payload);
    c.innerHTML = '';
    render();
  };
}
