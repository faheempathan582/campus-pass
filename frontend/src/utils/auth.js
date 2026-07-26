export const ALLOWED_DOMAIN = '@srit.ac.in';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function isValidCollegeEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-change'));
}

export function isAuthority(role) {
  return ['Advisor', 'HOD', 'Warden', 'Principal'].includes(role);
}

export function getDashboardPath(role) {
  return role === 'Student' ? '/student-dashboard' : '/authority-dashboard';
}
