// src/composables/useUserPresence.js
import { authService, profileService } from '@/services/supabaseService';

let heartbeatTimer = null;
let lastRecordedTime = 0;
const THROTTLE_MS = 2 * 60 * 1000; // Update at most once every 2 minutes

export function useUserPresence() {
  const touchPresence = async (force = false) => {
    try {
      const user = await authService.getUser();
      if (!user || !user.id) return;

      const now = Date.now();
      if (!force && (now - lastRecordedTime < THROTTLE_MS)) {
        return;
      }

      lastRecordedTime = now;
      await profileService.updateProfile(user.id, {
        updated_at: new Date().toISOString()
      });
    } catch {
      // Non-critical, ignore offline or permission errors
    }
  };

  const handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      touchPresence(true);
    }
  };

  const initPresence = () => {
    if (typeof window === 'undefined') return;

    touchPresence(true);
    if (!heartbeatTimer) {
      heartbeatTimer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          touchPresence();
        }
      }, THROTTLE_MS);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => touchPresence());
  };

  return {
    touchPresence,
    initPresence
  };
}
