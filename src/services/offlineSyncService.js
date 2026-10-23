// src/services/offlineSyncService.js
/**
 * ⚡ Sovereign Background Offline-to-Supabase Sync Engine
 * Internet uzilgan paytda yechilgan testlarni tarmoq tiklanganda
 * Supabase bilan avtomatik sinxronlashtiradi.
 */
import { offlineDb } from './offlineDb';
import { resultService, profileService } from './supabaseService';

let isSyncing = false;
let isInitialized = false;

export const offlineSyncService = {
  async syncPendingResults() {
    if (isSyncing || typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    isSyncing = true;
    try {
      const pending = await offlineDb.getPendingResults();
      if (!pending || pending.length === 0) {
        return;
      }

      for (const item of pending) {
        try {
          // 1. Supabase results jadvaliga yozish
          await resultService.saveResult({
            user_id: item.user_id,
            score: item.score,
            total: item.total,
            subject_id: item.subject_id || item.subject,
            test_level: item.test_level || item.level,
            duration_seconds: item.duration_seconds || 0,
          });

          // 2. TP Coin ballarini berish
          if (item.coinsEarned && item.coinsEarned > 0) {
            await profileService.addPoints(
              item.user_id,
              item.coinsEarned,
              `Oflayn test mukofoti (${item.subject_id || 'Test'})`
            );
          }

          // 3. Mahalliy ombordan o'chirish
          await offlineDb.removePendingResult(item.id);
        } catch (itemErr) {
          console.warn('Oflayn natijani sinxronlashda xatolik:', itemErr.message);
          // Agar sessiya yoki tarmoq xatosi bo'lsa, keyingi safarga qoldiramiz
          break;
        }
      }
    } catch (err) {
      console.warn('Sync pending results failed:', err.message);
    } finally {
      isSyncing = false;
    }
  },

  initOfflineSync() {
    if (isInitialized || typeof window === 'undefined') return;
    isInitialized = true;

    // Tarmoq qayta ulanganda zudlik bilan sinxronlash
    window.addEventListener('online', () => {
      this.syncPendingResults();
    });

    // Ilova yuklanganda ham tekshirish
    setTimeout(() => {
      this.syncPendingResults();
    }, 2000);
  },
};
