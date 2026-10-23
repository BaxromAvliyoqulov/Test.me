// src/services/offlineDb.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { offlineDb } from './offlineDb';
import { offlineSyncService } from './offlineSyncService';
import { resultService, profileService } from './supabaseService';

vi.mock('./supabaseService', () => ({
  resultService: {
    saveResult: vi.fn().mockResolvedValue({ id: 'res_123' }),
  },
  profileService: {
    addPoints: vi.fn().mockResolvedValue(true),
  },
}));

describe('Offline-First Architecture & IndexedDB Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('offlineDb Question Caching', () => {
    it('returns null gracefully when window.indexedDB is unavailable', async () => {
      const origIndexedDb = global.window ? global.window.indexedDB : undefined;
      if (global.window) global.window.indexedDB = undefined;

      const questions = await offlineDb.getCachedQuestions('matematika', 'sinf_5');
      expect(questions).toBeNull();

      if (global.window) global.window.indexedDB = origIndexedDb;
    });

    it('safely handles empty or missing subject/level in cacheQuestions', async () => {
      await expect(offlineDb.cacheQuestions('', 'sinf_5', [{ id: 1 }])).resolves.not.toThrow();
      await expect(offlineDb.cacheQuestions('matematika', '', [{ id: 1 }])).resolves.not.toThrow();
      await expect(offlineDb.cacheQuestions('matematika', 'sinf_5', [])).resolves.not.toThrow();
    });
  });

  describe('offlineDb Pending Results Queue', () => {
    it('handles queuePendingResult safely when DB is unavailable', async () => {
      const result = await offlineDb.queuePendingResult({
        user_id: 'user_1',
        score: 10,
        total: 10,
      });
      // In non-browser vitest environment, resolves null without crash
      expect(result).toBeNull();
    });

    it('returns empty array for getPendingResults when DB is empty or unavailable', async () => {
      const pending = await offlineDb.getPendingResults();
      expect(Array.isArray(pending)).toBe(true);
      expect(pending).toHaveLength(0);
    });
  });

  describe('offlineSyncService', () => {
    it('syncPendingResults does nothing if navigator.onLine is false', async () => {
      global.navigator = { onLine: false };
      await offlineSyncService.syncPendingResults();
      expect(resultService.saveResult).not.toHaveBeenCalled();
    });

    it('syncPendingResults processes pending items when online', async () => {
      global.navigator = { onLine: true };
      vi.spyOn(offlineDb, 'getPendingResults').mockResolvedValueOnce([
        {
          id: 1,
          user_id: 'u_101',
          score: 15,
          total: 20,
          subject_id: 'ona_tili',
          test_level: 'sinf_7',
          coinsEarned: 15,
          duration_seconds: 45,
        },
      ]);
      const removeSpy = vi.spyOn(offlineDb, 'removePendingResult').mockResolvedValueOnce(true);

      await offlineSyncService.syncPendingResults();

      expect(resultService.saveResult).toHaveBeenCalledWith({
        user_id: 'u_101',
        score: 15,
        total: 20,
        subject_id: 'ona_tili',
        test_level: 'sinf_7',
        duration_seconds: 45,
      });
      expect(profileService.addPoints).toHaveBeenCalledWith('u_101', 15, expect.any(String));
      expect(removeSpy).toHaveBeenCalledWith(1);
    });
  });
});
