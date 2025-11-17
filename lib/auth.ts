/**
 * Authentication utilities
 * Handles auth checks and role-based access
 */

import { api } from './api';

export async function requireAuth() {
  try {
    const user = await api.getCurrentUser();
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    return user;
  } catch (error) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user) {
    return null;
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
    return null;
  }

  return user;
}

export async function requireNonSuperAdmin() {
  const user = await requireAuth();
  if (!user) {
    return null;
  }

  // Redirect super_admin to admin dashboard
  if (user.role === 'super_admin') {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard/admin';
    }
    return null;
  }

  return user;
}

