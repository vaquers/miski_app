const API = import.meta.env.VITE_API_URL || '';

let _token: string | null = localStorage.getItem('admin_token');

export function getToken() {
  return _token;
}

export function setToken(t: string | null) {
  _token = t;
  if (t) localStorage.setItem('admin_token', t);
  else localStorage.removeItem('admin_token');
}

async function authFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (_token) headers.set('Authorization', `Bearer ${_token}`);

  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (res.status === 401) {
    setToken(null);
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function publicFetch<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function login(password: string) {
  const data = await authFetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  setToken(data.token);
  return data;
}

export type VotingStatus = { defile: boolean; photos: boolean };

export async function getVotingStatus(): Promise<VotingStatus> {
  return authFetch('/api/admin/voting-status');
}

export async function setVotingStatus(
  nomination: 'defile' | 'photos',
  open: boolean,
): Promise<VotingStatus> {
  return authFetch('/api/admin/voting-status', {
    method: 'POST',
    body: JSON.stringify({ nomination, open }),
  });
}

export type MissInfo = { id: string; name: string };

export async function getMisses(): Promise<MissInfo[]> {
  return authFetch('/api/admin/misses');
}

export async function getResults(): Promise<unknown> {
  return authFetch('/api/admin/results');
}

export async function getVoters(): Promise<unknown> {
  return authFetch('/api/admin/voters');
}
