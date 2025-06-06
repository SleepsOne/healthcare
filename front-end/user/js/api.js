// user-ui/js/api.js
const BASE_URL = 'http://localhost/api/v1';

async function request(path, method = 'GET', data = null) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  const opts = { method, headers };
  if (data) opts.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${path}`, opts);

  if (!res.ok) {
    // clone the response so we can parse it without consuming the body
    const payload = await res.clone().json().catch(() => res.clone().text());
    console.error('API validation error for', path, payload);
    // include the full JSON or text in the thrown message
    const message = typeof payload === 'object'
      ? JSON.stringify(payload)
      : payload;
    throw new Error(
      `${method} ${path} → ${res.status}\n${message}`
    );
    }
  
  return res.status === 204 ? null : res.json();
}

export const api = {
  // ── Auth ─────────────────────────────────────────────────────
  token: data => request('/token/', 'POST', data),
  refreshToken: data => request('/token/refresh/', 'POST', data),

  // ── Users ────────────────────────────────────────────────────
  getCurrentUser: () => request('/users/', 'GET'),
  getUserById:      id => request(`/users/${id}/`, 'GET'),
  createUser:      data => request('/users/', 'POST', data),
  updateCurrentUser: data => request('/users/', 'PATCH', data),

  // ── Patients ─────────────────────────────────────────────────
  getCurrentPatient: () => request('/patients/', 'GET'),
  createPatient: data => request('/patients/', 'POST', data),
  updateCurrentPatient: data => request('/patients/', 'PATCH', data),

  // ── Doctors ──────────────────────────────────────────────────
  getDoctors: () => request('/doctors/', 'GET'),
  getDoctor: id => request(`/doctors/${id}/`, 'GET'),

  // ── Appointments ─────────────────────────────────────────────
  getAppointments: () => request('/appointments/', 'GET'),
  createAppointment: data => request('/appointments/', 'POST', data),
  patchAppointment: (id, data) => request(`/appointments/${id}/`, 'PATCH', data),

  // ── Orders ───────────────────────────────────────────────────
  getOrders: () => request('/orders/', 'GET'),
  getOrder: id => request(`/orders/${id}/`, 'GET'),
  patchOrderStatus: (id, status) => request(`/orders/${id}/status/`, 'PATCH', { status }),
};
