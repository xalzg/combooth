const API_BASE = '/api/session';

export async function registerSession(email) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to register session');
  return data;
}

export async function validateSession(token) {
  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to validate session');
  return data;
}

export async function completeSession(token) {
  const res = await fetch(`${API_BASE}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to complete session');
  return data;
}
