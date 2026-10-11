// src/services/supabaseService.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, profileService, shopService, goalService } from './supabaseService';
import { supabase } from '@/config/supabase';

vi.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  },
}));

describe('Unified Supabase Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.window = { location: { origin: 'http://localhost:5173' } };
  });

  describe('Auth Service', () => {
    it('calls supabase signInWithOAuth with google provider and redirect', async () => {
      supabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: 'https://oauth.google.com' }, error: null });
      const result = await authService.signInWithGoogle();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/dashboard'),
        },
      });
      expect(result).toHaveProperty('url');
    });

    it('calls resetPasswordForEmail with target redirect url', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
      await authService.resetPasswordForEmail('test@example.com');
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/editProfile') })
      );
    });
  });

  describe('Profile & Points Service', () => {
    it('returns null if userId is empty for getProfile', async () => {
      const res = await profileService.getProfile('');
      expect(res).toBeNull();
    });

    it('prevents addPoints if userId or amount is missing', async () => {
      const res = await profileService.addPoints(null, 100);
      expect(res).toBeNull();
    });
  });

  describe('Shop Service', () => {
    it('throws error when user points are insufficient for buying an item', async () => {
      // Mock profileService.getProfile to return low points
      vi.spyOn(profileService, 'getProfile').mockResolvedValue({ id: 'u1', points: 20 });
      await expect(
        shopService.buyItem('u1', { id: 'item1', price: 100, title: 'VIP Badge' })
      ).rejects.toThrow('Mablag\' yetarli emas');
    });
  });
});
