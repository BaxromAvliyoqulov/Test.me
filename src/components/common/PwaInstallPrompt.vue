<template>
  <div>
    <!-- Floating Bottom/Top Smart Install Banner -->
    <transition name="slide-banner">
      <div v-if="showBanner && !isStandalone" class="pwa-install-banner">
        <div class="banner-glass-card">
          <div class="banner-left">
            <div class="app-icon-badge">
              <img src="/pwa-192x192.png" alt="Test.me App" />
            </div>
            <div class="banner-text">
              <h4>{{ isRus ? 'Установить Test.me' : "Test.me ilovasini o'rnatish" }}</h4>
              <p v-if="isIos">
                {{ isRus ? 'Добавьте на экран «Домой» для быстрого запуска как приложение' : "iPhone ekraniga ilova kabi o'rnatib oling" }}
              </p>
              <p v-else-if="isAndroid">
                {{ isRus ? 'Установите как приложение на телефон (без браузера)' : "Telefonga rasmiy app kabi o'rnatib oling" }}
              </p>
              <p v-else>
                {{ isRus ? 'Установите программу на компьютер для быстрого доступа' : "Kompyuterga dastur sifatida yuklab oling" }}
              </p>
            </div>
          </div>

          <div class="banner-right">
            <button class="btn-install-cta" @click="handleInstallClick">
              <i class="fas fa-download"></i>
              <span>{{ isRus ? 'Установить' : "O'rnatish" }}</span>
            </button>
            <button class="btn-dismiss" @click="dismissBanner" aria-label="Yopish">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- iOS Step-by-Step Bottom Sheet Guide -->
    <transition name="sheet-fade">
      <div v-if="showIosGuide" class="ios-sheet-overlay" @click.self="showIosGuide = false">
        <div class="ios-sheet-content">
          <div class="ios-sheet-handle"></div>
          
          <div class="ios-sheet-header">
            <div class="app-icon-mini">
              <img src="/pwa-192x192.png" alt="Test.me" />
            </div>
            <div>
              <h3>{{ isRus ? 'Установка на iPhone / iPad' : "iPhone-ga ilova kabi o'rnatish" }}</h3>
              <p>{{ isRus ? 'Всего 3 простых шага в Safari' : 'Safari brauzerida 3 ta oddiy qadam' }}</p>
            </div>
            <button class="ios-close-btn" @click="showIosGuide = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="ios-steps-list">
            <div class="ios-step-item">
              <div class="step-num">1</div>
              <div class="step-desc">
                <span>{{ isRus ? 'Нажмите кнопку «Поделиться» внизу экрана' : "Safari pastidagi «Ulashish» (Share) tugmasini bosing" }}</span>
                <i class="fas fa-arrow-up-from-bracket icon-accent"></i>
              </div>
            </div>

            <div class="ios-step-item">
              <div class="step-num">2</div>
              <div class="step-desc">
                <span>{{ isRus ? 'Прокрутите меню и выберите «На экран «Домой»' : "Menyudan «Bosh ekranga qo'shish» (Add to Home Screen) bandini tanlang" }}</span>
                <i class="fas fa-plus-square icon-accent"></i>
              </div>
            </div>

            <div class="ios-step-item">
              <div class="step-num">3</div>
              <div class="step-desc">
                <span>{{ isRus ? 'В правом верхнем углу нажмите «Добавить»' : "Yuqori o'ng burchakdagi «Qo'shish» (Add) tugmasini bosing" }}</span>
                <span class="badge-accent">{{ isRus ? 'Готово' : 'Tayyor' }}</span>
              </div>
            </div>
          </div>

          <button class="btn-ios-done" @click="showIosGuide = false">
            {{ isRus ? 'Понятно, спасибо!' : "Tushundim, rahmat!" }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Desktop (PC/Laptop) Step-by-Step Guide Modal -->
    <transition name="sheet-fade">
      <div v-if="showDesktopGuide" class="ios-sheet-overlay" @click.self="showDesktopGuide = false">
        <div class="ios-sheet-content desktop-dialog-content">
          <div class="ios-sheet-header">
            <div class="app-icon-mini">
              <img src="/pwa-192x192.png" alt="Test.me" />
            </div>
            <div>
              <h3>{{ isRus ? 'Установка на компьютер (Windows / Mac)' : "Kompyuterga ilova sifatida o'rnatish" }}</h3>
              <p>{{ isRus ? 'Через браузер Chrome или Edge за 1 секунду' : 'Chrome yoki Edge brauzerida 1 soniyada o\'rnatiladi' }}</p>
            </div>
            <button class="ios-close-btn" @click="showDesktopGuide = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="ios-steps-list">
            <div class="ios-step-item">
              <div class="step-num">1</div>
              <div class="step-desc">
                <span>{{ isRus ? 'Нажмите значок установки в адресной строке Chrome/Edge' : "Brauzer manzil satri (URL) o'ng burchagidagi o'rnatish belgisini bosing" }}</span>
                <i class="fas fa-desktop icon-accent"></i>
              </div>
            </div>

            <div class="ios-step-item">
              <div class="step-num">2</div>
              <div class="step-desc">
                <span>{{ isRus ? 'Или нажмите меню (3 точки) ➔ «Установить приложение Test.me»' : "Yoki brauzer menyusidagi (3 ta nuqta) «Test.me ilovasini o'rnatish» ni tanlang" }}</span>
                <i class="fas fa-ellipsis-vertical icon-accent"></i>
              </div>
            </div>

            <div class="ios-step-item">
              <div class="step-num">3</div>
              <div class="step-desc">
                <span>{{ isRus ? 'Нажмите «Установить» — и значок появится на Рабочем столе' : "«O'rnatish» tugmasini bosing — dastur Ish stoli (Desktop)ga tushadi" }}</span>
                <span class="badge-accent">{{ isRus ? 'Готово' : 'Tayyor' }}</span>
              </div>
            </div>
          </div>

          <button class="btn-ios-done" @click="showDesktopGuide = false">
            {{ isRus ? 'Понятно, спасибо!' : "Tushundim, rahmat!" }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { locale } = useI18n();
const isRus = computed(() => locale.value === 'RUS');

const deferredPrompt = ref(null);
const showBanner = ref(false);
const showIosGuide = ref(false);
const showDesktopGuide = ref(false);
const isStandalone = ref(false);

const isIos = computed(() => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
});

const isAndroid = computed(() => {
  if (typeof window === 'undefined') return false;
  return /android/i.test(window.navigator.userAgent || '');
});

const checkStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

const handleInstallClick = async () => {
  if (isIos.value) {
    showIosGuide.value = true;
    return;
  }

  if (deferredPrompt.value) {
    try {
      deferredPrompt.value.prompt();
      const { outcome } = await deferredPrompt.value.userChoice;
      if (outcome === 'accepted') {
        showBanner.value = false;
      }
      deferredPrompt.value = null;
    } catch (err) {
      console.warn('Native prompt issue, showing desktop guide:', err);
      showDesktopGuide.value = true;
    }
  } else {
    // Native prompt hali trigger bo'lmagan bo'lsa (Desktop / Android)
    if (!isIos.value && !isAndroid.value) {
      showDesktopGuide.value = true;
    } else if (isIos.value) {
      showIosGuide.value = true;
    } else {
      showDesktopGuide.value = true;
    }
  }
};

const dismissBanner = () => {
  showBanner.value = false;
  sessionStorage.setItem('pwa_prompt_dismissed', 'true');
};

onMounted(() => {
  isStandalone.value = checkStandalone();
  if (isStandalone.value) return;

  const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');

  // Chromium / Android / Desktop Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    if (!dismissed) {
      // 1.5 soniyadan keyin mayin chiqadi
      setTimeout(() => {
        showBanner.value = true;
      }, 1500);
    }
  });

  // iOS Safari uchun prompt
  if (isIos.value && !dismissed && !isStandalone.value) {
    setTimeout(() => {
      showBanner.value = true;
    }, 2500);
  }

  // App o'rnatilgach
  window.addEventListener('appinstalled', () => {
    showBanner.value = false;
    deferredPrompt.value = null;
  });

  // Boshqa komponentlar (masalan Header/Sidebar) orqali chaqirish
  window.addEventListener('open-pwa-install', () => {
    handleInstallClick();
  });
});
</script>

<style scoped>
.pwa-install-banner {
  position: fixed;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 540px;
  z-index: 998;
  pointer-events: auto;
}

@media (min-width: 769px) {
  .pwa-install-banner {
    bottom: 24px;
    right: 24px;
    left: auto;
    transform: none;
    width: 440px;
  }
}

.banner-glass-card {
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.2);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.app-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
}

.app-icon-badge img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-text {
  min-width: 0;
}

.banner-text h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-text p {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.banner-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-install-cta {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  padding: 9px 15px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-install-cta:active {
  transform: scale(0.95);
}

.btn-dismiss {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-dismiss:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
}

/* Animations */
.slide-banner-enter-active,
.slide-banner-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-banner-enter-from,
.slide-banner-leave-to {
  opacity: 0;
  transform: translate(-50%, 40px);
}

@media (min-width: 769px) {
  .slide-banner-enter-from,
  .slide-banner-leave-to {
    transform: translateY(40px);
  }
}

/* iOS Guide Bottom Sheet */
.ios-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.ios-sheet-content {
  background: #ffffff;
  width: 100%;
  max-width: 480px;
  border-radius: 28px 28px 0 0;
  padding: 16px 20px calc(24px + env(safe-area-inset-bottom, 0px)) 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@media (min-width: 600px) {
  .ios-sheet-overlay {
    align-items: center !important;
  }
  .desktop-dialog-content {
    border-radius: 28px !important;
    padding: 24px !important;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4) !important;
    animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.ios-sheet-handle {
  width: 40px;
  height: 5px;
  border-radius: 10px;
  background: #cbd5e1;
  align-self: center;
  margin-bottom: 4px;
}

.ios-sheet-header {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.app-icon-mini {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.app-icon-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ios-sheet-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.ios-sheet-header p {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.ios-close-btn {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ios-steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
}

.ios-step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 4px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-desc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  gap: 8px;
}

.icon-accent {
  font-size: 1.25rem;
  color: #3b82f6;
}

.badge-accent {
  background: #dcfce7;
  color: #16a34a;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.btn-ios-done {
  background: #0f172a;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-ios-done:active {
  background: #1e293b;
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
</style>
