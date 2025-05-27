// user-ui/js/components/orders.js
import { api } from '../api.js';

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="card">
      <h2>Đơn hàng của bạn</h2>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="list"></tbody>
        </table>
      </div>
    </section>

    <!-- Modal chi tiết đơn hàng -->
    <div id="orderModal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <h3>Chi tiết đơn hàng</h3>
        <div id="orderDetails"></div>
      </div>
    </div>
  `;

  const list = document.getElementById('list');
  try {
    const orders = await api.getOrders();
    orders.forEach(o => {
      const tr = document.createElement('tr');
      const date = o.created_at ? new Date(o.created_at) : new Date();
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${date.toLocaleDateString('vi-VN')}</td>
        <td><span class="status ${o.status}">${o.status}</span></td>
        <td>
          <button class="btn btn-sm" onclick="viewOrderDetails(${o.id})">Chi tiết</button>
          ${o.status === 'pending' ? 
            `<button class="btn btn-sm btn-danger" onclick="cancelOrder(${o.id})">Hủy</button>` : 
            ''}
        </td>
      `;
      list.append(tr);
    });
  } catch (err) {
    app.innerHTML = `<p class="error">Không thể tải đơn hàng: ${err.message}</p>`;
  }

  // Xử lý modal chi tiết đơn hàng
  const modal = document.getElementById('orderModal');
  const span = document.getElementsByClassName('close')[0];

  span.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}

// Hàm xem chi tiết đơn hàng
window.viewOrderDetails = async (id) => {
  const modal = document.getElementById('orderModal');
  const details = document.getElementById('orderDetails');
  
  try {
    const order = await api.getOrder(id);
    const date = new Date(order.created_at).toLocaleString('vi-VN');
    
    details.innerHTML = `
      <div class="order-info">
        <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
        <p><strong>Ngày tạo:</strong> ${date}</p>
        <p><strong>Trạng thái:</strong> <span class="status ${order.status}">${order.status}</span></p>
      </div>
      <div class="order-items">
        <h4>Danh sách thuốc</h4>
        <table>
          <thead>
            <tr>
              <th>Tên thuốc</th>
              <th>Liều lượng</th>
              <th>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.medication}</td>
                <td>${item.dosage}</td>
                <td>${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    modal.style.display = 'block';
  } catch (err) {
    alert('Không thể tải chi tiết đơn hàng: ' + err.message);
  }
};

// Replace your old cancelOrder call:
window.cancelOrder = async (id) => {
  if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
  try {
    // patch into the /orders/{id}/status/ endpoint
    await api.patchOrderStatus(id, 'cancelled');
    render();
  } catch (err) {
    alert('Không thể hủy đơn hàng: ' + err.message);
  }
};

