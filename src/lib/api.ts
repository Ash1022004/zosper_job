const API_URL = import.meta.env.VITE_API_URL || 'https://zosper-job-1.onrender.com/';

export async function apiRegister(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('register failed');
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('login failed');
  return res.json();
}

export async function apiLogout() {
  await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
}

export async function apiMe() {
  const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

const API_BASE = '/api';

export interface ApiUser {
  id: number;
  email: string;
  name?: string;
  mobile?: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export const authApi = {
  register: async (email: string, password: string, name: string, mobile: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name, mobile }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || 'Registration failed');
    }
    return res.json();
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || 'Login failed');
    }
    return res.json();
  },
};

export const jobsApi = {
  getAll: () => api<Job[]>('/jobs'),
  create: (job: Job) => api<Job>('/jobs', { method: 'POST', body: JSON.stringify(job) }),
  update: (id: string, job: Job) => api<Job>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(job) }),
  delete: (id: string) => api<{ success: boolean }>(`/jobs/${id}`, { method: 'DELETE' }),
};

export const feedbackApi = {
  submit: (email: string | undefined, message: string) =>
    api<{ success: boolean }>('/feedback', {
      method: 'POST',
      body: JSON.stringify({ email, message }),
    }),
};

export const analyticsApi = {
  trackApplication: async (jobId: string, jobTitle: string, company: string) => {
    const res = await fetch(`${API_URL}/api/analytics/application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ jobId, jobTitle, company }),
    });
    if (!res.ok) throw new Error('Failed to track application');
    return res.json();
  },
  getSummary: async () => {
    const res = await fetch(`${API_URL}/api/analytics/summary`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to get analytics');
    return res.json();
  },
};

import { Job } from '@/types/job';

