export interface AppUser {
  email: string;
  name?: string;
}

const KEY = 'djp.user.v1';

export function getUser(): AppUser | null {
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as AppUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AppUser): void {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function userLogin(email: string): boolean {
  if (!email.includes('@')) return false;
  setUser({ email });
  return true;
}

export function userLogout(): void {
  localStorage.removeItem(KEY);
}

