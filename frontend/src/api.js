const BASE = 'http://localhost:5000';

async function request(path, method = 'GET', body) {
  let token = '';
  try { token = JSON.parse(localStorage.getItem('user'))?.token || ''; } catch { /* no user */ }
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/users/login') {
    // session expired (e.g. the server restarted): force a fresh login
    localStorage.removeItem('user');
    window.location.href = '/users';
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, 'POST', b),
  put: (p, b) => request(p, 'PUT', b),
  del: (p) => request(p, 'DELETE'),
};
