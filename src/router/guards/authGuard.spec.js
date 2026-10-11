// src/router/guards/authGuard.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authGuard } from './authGuard';
import { authService, profileService } from '@/services/supabaseService';

vi.mock('@/services/supabaseService', () => ({
  authService: {
    getSession: vi.fn(),
  },
  profileService: {
    getProfile: vi.fn(),
  },
}));

describe('AuthGuard (Fail-Secure & RBAC Protection)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows access to public pages without authentication', async () => {
    authService.getSession.mockResolvedValue(null);
    const next = vi.fn();

    await authGuard({ path: '/login', meta: {} }, {}, next);
    expect(next).toHaveBeenCalledWith();

    await authGuard({ path: '/about', meta: {} }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('redirects unauthenticated users to /login when accessing protected routes', async () => {
    authService.getSession.mockResolvedValue(null);
    const next = vi.fn();

    await authGuard({ path: '/dashboard', meta: {} }, {}, next);
    expect(next).toHaveBeenCalledWith('/login');

    await authGuard({ path: '/test', meta: {} }, {}, next);
    expect(next).toHaveBeenCalledWith('/login');
  });

  it('redirects logged-in users from /login to /dashboard', async () => {
    authService.getSession.mockResolvedValue({ user: { id: 'user-123' } });
    const next = vi.fn();

    await authGuard({ path: '/login', meta: {} }, {}, next);
    expect(next).toHaveBeenCalledWith('/dashboard');
  });

  it('blocks non-admin users from accessing admin routes', async () => {
    authService.getSession.mockResolvedValue({ user: { id: 'user-normal' } });
    profileService.getProfile.mockResolvedValue({ id: 'user-normal', is_admin: false, admin_role: 'user' });
    const next = vi.fn();

    await authGuard({ path: '/admin', meta: { requiresAdmin: true } }, {}, next);
    expect(next).toHaveBeenCalledWith('/');
  });

  it('allows admin users with is_admin: true or admin_role: super_admin', async () => {
    authService.getSession.mockResolvedValue({ user: { id: 'admin-123' } });
    profileService.getProfile.mockResolvedValue({ id: 'admin-123', is_admin: true, admin_role: 'super_admin' });
    const next = vi.fn();

    await authGuard({ path: '/admin', meta: { requiresAdmin: true } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('enforces Fail-Secure behavior on session retrieval error', async () => {
    authService.getSession.mockRejectedValue(new Error('Network or Supabase Error'));
    const next = vi.fn();

    // For protected route, error must safely redirect to /login
    await authGuard({ path: '/dashboard', meta: {} }, {}, next);
    expect(next).toHaveBeenCalledWith('/login');

    // For public route, error still allows viewing public page
    await authGuard({ path: '/about', meta: {} }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});
