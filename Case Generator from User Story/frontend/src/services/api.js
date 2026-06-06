const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // If the server says the token is invalid/expired, clear it and redirect
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}

// ── Auth endpoints (public — no auth header needed) ──────────────────────────

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
}

export async function signupUser(username, password) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
}

// ── Protected endpoints (Bearer token required) ───────────────────────────────

export async function generateTestCases(userStory) {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ userStory }),
  });
  return handleResponse(response);
}

export async function getHistory(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await fetch(`${API_BASE}/history${params}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getHistoryItem(id) {
  const response = await fetch(`${API_BASE}/history/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function deleteHistoryItem(id) {
  const response = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ── Dashboard endpoints ───────────────────────────────────────────────────────

export async function getDashboardStats() {
  const response = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getDashboardRecent() {
  const response = await fetch(`${API_BASE}/dashboard/recent`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}
