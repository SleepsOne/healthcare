const BASE = 'http://127.0.0.1/api/v1';

async function request(path, method = 'GET', data) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('accessToken');
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const opts = { method, headers };
  if (data) opts.body = JSON.stringify(data);

  const res = await fetch(BASE + path, opts);
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  list:   e      => request(`/${e}/`),
  get:    (e, id)=> request(`/${e}/${id}/`),
  create: (e, o) => request(`/${e}/`, 'POST', o),
  update: (e,i,o)=> request(`/${e}/${i}/`, 'PUT', o),
  patch:  (e,i,o)=> request(`/${e}/${i}/`, 'PATCH', o),
  del:    (e,i) => request(`/${e}/${i}/`, 'DELETE'),
  token:  creds  => request('/token/', 'POST', creds),  // login
};
