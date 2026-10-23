// src/services/offlineDb.js
/**
 * ⚡ Sovereign Offline-First IndexedDB Engine for Test.me
 * Internet uzilib qolganda testlar va savollarni to'liq oflayn taqdim etish,
 * natijalarni mahalliy navbatda (queue) saqlash va internet paydo bo'lganda
 * Supabase bilan avtomatik sinxronizatsiya qilish dvigateli.
 */

const DB_NAME = 'TestMe_Offline_DB';
const DB_VERSION = 1;

let dbPromise = null;

const getDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Oflayn savollar ombori (Fan va daraja bo'yicha)
      if (!db.objectStoreNames.contains('questions_cache')) {
        const qStore = db.createObjectStore('questions_cache', { keyPath: 'cacheKey' });
        qStore.createIndex('subject_level', ['subjectId', 'levelId'], { unique: false });
      }

      // 2. Oflayn yechilgan test natijalari navbati (Pending Results Queue)
      if (!db.objectStoreNames.contains('pending_results')) {
        const rStore = db.createObjectStore('pending_results', { keyPath: 'id', autoIncrement: true });
        rStore.createIndex('synced', 'synced', { unique: false });
        rStore.createIndex('created_at', 'created_at', { unique: false });
      }

      // 3. Oflayn test metama'lumotlari (Fanlar va darajalar)
      if (!db.objectStoreNames.contains('metadata_cache')) {
        db.createObjectStore('metadata_cache', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('IndexedDB ochishda xatolik:', request.error);
      resolve(null);
    };
  });

  return dbPromise;
};

export const offlineDb = {
  /**
   * Savollarni IndexedDB keshiga saqlash
   */
  async cacheQuestions(subjectId, levelId, questions) {
    if (!subjectId || !levelId || !Array.isArray(questions) || questions.length === 0) return;
    try {
      const db = await getDB();
      if (!db) return;

      const cacheKey = `${String(subjectId).toLowerCase()}_${String(levelId).toLowerCase()}`;
      const tx = db.transaction('questions_cache', 'readwrite');
      const store = tx.objectStore('questions_cache');

      await new Promise((resolve, reject) => {
        const req = store.put({
          cacheKey,
          subjectId: String(subjectId).toLowerCase(),
          levelId: String(levelId).toLowerCase(),
          questions,
          cachedAt: Date.now(),
        });
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Oflayn savollarni keshga yozishda ogohlantirish:', err);
    }
  },

  /**
   * Keshdagi savollarni olish
   */
  async getCachedQuestions(subjectId, levelId) {
    if (!subjectId || !levelId) return null;
    try {
      const db = await getDB();
      if (!db) return null;

      const cacheKey = `${String(subjectId).toLowerCase()}_${String(levelId).toLowerCase()}`;
      const tx = db.transaction('questions_cache', 'readonly');
      const store = tx.objectStore('questions_cache');

      return await new Promise((resolve) => {
        const req = store.get(cacheKey);
        req.onsuccess = () => {
          if (req.result && Array.isArray(req.result.questions) && req.result.questions.length > 0) {
            resolve(req.result.questions);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  /**
   * Internet bo'lmaganda test natijasini mahalliy navbatga saqlash
   */
  async queuePendingResult(resultData) {
    try {
      const db = await getDB();
      if (!db) return null;

      const tx = db.transaction('pending_results', 'readwrite');
      const store = tx.objectStore('pending_results');

      return await new Promise((resolve, reject) => {
        const req = store.add({
          ...resultData,
          created_at: Date.now(),
          synced: false,
        });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Natijani oflayn navbatga saqlashda xatolik:', err);
      return null;
    }
  },

  /**
   * Barcha sinxronizatsiya qilinmagan oflayn natijalarni olish
   */
  async getPendingResults() {
    try {
      const db = await getDB();
      if (!db) return [];

      const tx = db.transaction('pending_results', 'readonly');
      const store = tx.objectStore('pending_results');

      return await new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const items = req.result || [];
          resolve(items.filter((item) => !item.synced));
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  /**
   * Natija sinxronlangach uni o'chirish yoki belgilash
   */
  async removePendingResult(id) {
    try {
      const db = await getDB();
      if (!db) return;

      const tx = db.transaction('pending_results', 'readwrite');
      const store = tx.objectStore('pending_results');

      await new Promise((resolve) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      // Ignored
    }
  },

  /**
   * Umumiy metama'lumotlarni (Fanlar/Darajalar) keshga saqlash
   */
  async cacheMetadata(key, value) {
    try {
      const db = await getDB();
      if (!db) return;
      const tx = db.transaction('metadata_cache', 'readwrite');
      tx.objectStore('metadata_cache').put({ key, value, updated_at: Date.now() });
    } catch {
      // Ignored
    }
  },

  /**
   * Keshdagi metama'lumotlarni olish
   */
  async getCachedMetadata(key) {
    try {
      const db = await getDB();
      if (!db) return null;
      const tx = db.transaction('metadata_cache', 'readonly');
      return await new Promise((resolve) => {
        const req = tx.objectStore('metadata_cache').get(key);
        req.onsuccess = () => resolve(req.result?.value || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },
};
