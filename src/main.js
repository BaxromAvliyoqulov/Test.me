import { createApp } from 'vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import App from './App.vue';
import router from './router';
import store from './store';
import { initPwaUpdate } from './services/updateService';
import { offlineSyncService } from './services/offlineSyncService';

// Initialize Auto-Update Engine & Offline Sync
initPwaUpdate();
offlineSyncService.initOfflineSync();

// Enterprise Console Sanitizer: Maxfiy ma'lumotlar (UID, Auth ID, API Keys, Tokens) konsolga sizishini to'sish
if (typeof window !== 'undefined') {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  const isSensitive = (args) => {
    try {
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      return /Firebase Auth User ID|AIzaSy|FCM Token|mockUserToken|apiKey=/i.test(msg);
    } catch {
      return false;
    }
  };

  console.log = (...args) => {
    if (isSensitive(args)) return;
    if (!import.meta.env.PROD) originalLog(...args);
  };

  console.warn = (...args) => {
    if (isSensitive(args)) return;
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (isSensitive(args)) return;
    originalError(...args);
  };
}

const app = createApp(App);

app.use(store);
app.use(router);
app.use(Toast);

router.isReady().then(() => {
  app.mount('#app');
});
