import type { DashboardResponse, HealthResponse } from './types';

const BASE = '/api';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getHealth: () => fetch(`${BASE}/health`).then((r) => handle<HealthResponse>(r)),
  getDashboard: () => fetch(`${BASE}/analytics/dashboard`).then((r) => handle<DashboardResponse>(r)),
};
