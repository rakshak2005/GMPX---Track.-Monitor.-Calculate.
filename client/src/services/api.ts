const BASE = import.meta.env.VITE_API_URL || '';

export function getAuthToken(): string | null {
  return localStorage.getItem('gmpulse_token');
}

export function setAuthToken(token: string | null): void {
  if (token) localStorage.setItem('gmpulse_token', token);
  else localStorage.removeItem('gmpulse_token');
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  return (body as { data?: T }).data ?? (body as T);
}

export const api = {
  health: () => req<{ provider: string; demoMode: boolean; refreshIntervalSec: number }>('/api/health'),
  register: (payload: { email: string; password: string; name?: string }) =>
    req<{ user: any; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    req<{ user: any; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => req<any>('/api/auth/me'),
  updatePreferences: (preferences: Record<string, unknown>) =>
    req<any>('/api/auth/preferences', { method: 'PUT', body: JSON.stringify({ preferences }) }),
  listIpos: (q = '') => req<import('../types/ipo.js').Ipo[]>(`/api/ipos${q}`),
  getIpo: (id: string) => req<import('../types/ipo.js').Ipo>(`/api/ipos/${id}`),
  createIpo: (payload: unknown) => req<import('../types/ipo.js').Ipo>('/api/ipos', { method: 'POST', body: JSON.stringify(payload) }),
  updateIpo: (id: string, payload: unknown) =>
    req<import('../types/ipo.js').Ipo>(`/api/ipos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteIpo: (id: string) => req<{ ok: boolean }>(`/api/ipos/${id}`, { method: 'DELETE' }),
  setStatus: (id: string, status: string) =>
    req<import('../types/ipo.js').Ipo>(`/api/ipos/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  setSubscription: (id: string, payload: unknown) =>
    req<import('../types/ipo.js').Ipo>(`/api/ipos/${id}/subscription`, { method: 'PUT', body: JSON.stringify(payload) }),
  gmp: (id: string) =>
    req<{ gmp: number | null; gmpPct: number | null; estListing: number | null; estProfit: number | null; previousGmp: number | null; change: number | null; change24h: number | null; source: string | null; lastUpdated: string | null; stale: boolean }>(`/api/ipos/${id}/gmp`),
  gmpHistory: (id: string, range = 'ALL') =>
    req<{ data: import('../types/ipo.js').GmpPoint[]; stats: import('../types/ipo.js').GmpStats | null }>(
      `/api/ipos/${id}/gmp/history?range=${range}`
    ),
  subHistory: (id: string) =>
    req<{ retail?: number | null; nii?: number | null; qib?: number | null; employee?: number | null; total?: number | null; label?: string; timestamp: string }[]>(`/api/ipos/${id}/subscription/history`),
  summary: () => req<import('../types/ipo.js').Summary>('/api/dashboard/summary'),
  calendar: (month: string) => req<{ ipoId: string; ipoName: string; type: string; date: string }[]>(`/api/calendar?month=${month}`),
  apply: (id: string, applied: boolean, lotsApplied = 1, issuePrice?: number) =>
    req<import('../types/ipo.js').Ipo>(`/api/ipos/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify({ applied, lotsApplied, issuePrice }),
    }),
  syncLive: () => req<{ totalScraped: number; created: number; updated: number; errors: string[] }>('/api/ipos/sync', { method: 'POST' }),
  importBackup: (data: unknown[]) =>
    req<{ imported: number; errors: string[] }>('/api/import', { method: 'POST', body: JSON.stringify({ data }) }),
};
