const API_URL = (import.meta.env.VITE_API_URL || 'https://zosper-job-1.onrender.com').replace(/\/$/, '');

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
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || 'Login failed');
    }
    return res.json();
  } catch (error: any) {
    // Handle network errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server');
    }
    throw error;
  }
}

export async function apiLogout() {
  await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
}

export async function apiMe() {
  try {
    // Try to get token from localStorage as fallback
    const token = localStorage.getItem('admin_token');
    
    const headers: HeadersInit = {};
    // If we have a token in localStorage, send it as Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/api/auth/me`, { 
      credentials: 'include',
      headers
    });
    if (!res.ok) {
      console.log('[API] apiMe failed:', res.status, res.statusText);
      return null;
    }
    return res.json();
  } catch (error: any) {
    console.log('[API] apiMe error:', error);
    // Network errors are expected when not authenticated
    return null;
  }
}

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
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    credentials: 'include',
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
    // Check for both admin_token and regular user token
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/api/analytics/application`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ jobId, jobTitle, company }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      console.error('[Analytics] Track application failed:', errorData);
      throw new Error(errorData.error || 'Failed to track application');
    }
    return res.json();
  },
  getSummary: async () => {
    const token = localStorage.getItem('admin_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/api/analytics/summary`, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || 'Failed to get analytics');
    }
    return res.json();
  },
};

import { Job } from '@/types/job';

