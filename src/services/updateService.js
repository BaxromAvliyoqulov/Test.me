import { registerSW } from 'virtual:pwa-register';
import { ref } from 'vue';

export const needRefresh = ref(false);
export const isOfflineReady = ref(false);
export const isCheckingUpdate = ref(false);
export const lastCheckedTime = ref(null);

let updateSWFn = null;

export function initPwaUpdate() {
  updateSWFn = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('🚀 PWA: Yangi yangilanish (update) topildi!');
      needRefresh.value = true;
    },
    onOfflineReady() {
      console.log('✅ PWA: Barcha fayllar keshlandi, offline tayyor!');
      isOfflineReady.value = true;
    },
    onRegistered(registration) {
      if (registration) {
        // Har 30 daqiqada avtomatik tekshirib turish
        setInterval(() => {
          registration.update().catch((err) => {
            console.debug('Background PWA check:', err);
          });
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('PWA ro\'yxatdan o\'tishda ogohlantirish:', error);
    }
  });
}

/**
 * Yangilanishni qabul qilish va sahifani yangilash
 */
export async function acceptUpdate() {
  if (updateSWFn) {
    await updateSWFn(true);
  } else {
    window.location.reload();
  }
}

/**
 * Qo'lda yangilanishlarni tekshirish
 */
export async function checkForUpdates() {
  isCheckingUpdate.value = true;
  lastCheckedTime.value = new Date().toLocaleTimeString();

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
      }
    } catch (err) {
      console.warn('Update check failed:', err);
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      isCheckingUpdate.value = false;
      resolve({ hasUpdate: needRefresh.value });
    }, 1200);
  });
}

import { APP_VERSION } from '@/config/version';

export const updateService = {
  version: APP_VERSION,
  needRefresh,
  isOfflineReady,
  isCheckingUpdate,
  lastCheckedTime,
  initPwaUpdate,
  acceptUpdate,
  checkForUpdates,
};

export default updateService;
