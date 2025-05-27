// File: js/components/order-items.js
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h1>Order Items</h1>
      </div>
      <div class="card-content">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order</th><th>Medication</th><th>Dosage</th><th>Quantity</th>
              </tr>
            </thead>
            <tbody id="list"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const list = document.getElementById('list');
  list.innerHTML = '';
  const items = await api.list('order-items');
  items.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.order || ''}</td>
      <td>${o.medication}</td>
      <td>${o.dosage}</td>
      <td>${o.quantity}</td>
    `;
    list.appendChild(tr);
  });
}
