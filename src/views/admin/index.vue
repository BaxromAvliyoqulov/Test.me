<template>
  <div class="admin-root">
    <template v-if="loadingAuth">
      <div class="loading-overlay">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Admin huquqlari tekshirilmoqda...</p>
      </div>
    </template>
    <template v-else-if="authenticated && !pinVerified">
      <div class="pin-guard-overlay">
        <div class="pin-card animate-pop-in">
          <div class="pin-icon-wrap">
            <i class="fas fa-shield-halved"></i>
          </div>
          <h2>Admin PIN Xavfsizlik</h2>
          <p>Admin panelga kirish uchun maxfiy PIN kodni kiriting.</p>

          <div class="pin-inputs">
            <input 
              v-for="(_, idx) in 4" 
              :key="idx"
              ref="pinInputRefs"
              type="password"
              maxlength="1"
              inputmode="numeric"
              class="pin-digit-box"
              :class="{ 'pin-error': pinError }"
              v-model="enteredPin[idx]"
              @input="onPinInput(idx, $event)"
              @keydown="onPinKeydown(idx, $event)"
            />
          </div>

          <p v-if="pinError" class="pin-error-text">{{ pinErrorMessage }}</p>

          <div class="pin-actions">
            <button class="pin-back-btn" @click="router.push('/')">
              <i class="fas fa-arrow-left"></i> Bosh sahifa
            </button>
            <button class="pin-verify-btn" :disabled="enteredPin.join('').length < 4" @click="verifyPin">
              Tasdiqlash <i class="fas fa-key"></i>
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="authenticated && pinVerified">
      <!-- Sidebar -->
      <AdminSidebar
        :currentView="currentView"
        :isCollapsed="sidebarCollapsed"
        :adminRole="adminRole"
        @navigate="navigate"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
        @logout="logout"
      />

      <!-- Main area -->
      <div class="admin-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <!-- Top Header Bar -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" @click="sidebarCollapsed = !sidebarCollapsed">
              <i class="fas fa-bars"></i>
            </button>
            <div class="breadcrumb">
              <span class="bc-root" @click="navigate('overview')" title="Bosh sahifaga qaytish">Admin</span>
              <i class="fas fa-chevron-right bc-sep"></i>
              <span class="bc-current">{{ currentViewLabel }}</span>
            </div>
          </div>
          <div class="topbar-right">
            <div class="topbar-time">{{ currentTime }}</div>
            <div class="admin-badge-topbar">
              <i class="fas fa-shield-halved"></i>
              <span>{{ displayRole }}</span>
            </div>
          </div>
        </header>

        <!-- Scrollable Content -->
        <div class="admin-content-wrapper">
          <transition name="page-fade" mode="out-in">
            <component :is="currentComponent" :key="currentView" @navigate="navigate" />
          </transition>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { authService, profileService } from '@/services/supabaseService';

import AdminSidebar from './components/AdminSidebar.vue';
import AdminOverview from './components/AdminOverview.vue';
import AdminUsers from './components/AdminUsers.vue';
import AdminShop from './components/AdminShop.vue';
import AdminSubjects from './components/AdminSubjects.vue';
import AdminNotifications from './components/AdminNotifications.vue';
import AdminSettings from './components/AdminSettings.vue';
import AdminAnalytics from './components/AdminAnalytics.vue';
import AdminFinance from './components/AdminFinance.vue';
import AdminCertificates from './components/AdminCertificates.vue';

import AddAdminComponent from './addAdmin.vue';
import UploadExcelComponent from './uploadExcel.vue';
import AddSubjectComponent from './addSubject.vue';
import AdminSeederComponent from './AdminSeeder.vue';

const VIEW_MAP = {
  overview:      AdminOverview,
  users:         AdminUsers,
  shopItems:     AdminShop,
  addProduct:    AdminShop,
  orders:        AdminShop,
  subjects:      AdminSubjects,
  addSubject:    AddSubjectComponent,
  uploadExcel:   UploadExcelComponent,
  aiSeeder:      AdminSeederComponent,
  addAdmin:      AddAdminComponent,
  notifications: AdminNotifications,
  certificates:  AdminCertificates,
  analytics:     AdminAnalytics,
  finance:       AdminFinance,
  settings:      AdminSettings,
};

const LABELS = {
  overview: "Umumiy Ko'rinish", users: "Foydalanuvchilar", shopItems: "Shop Mahsulotlari",
  addProduct: "Mahsulot Qo'shish", orders: "Buyurtmalar", subjects: "Fanlar",
  addSubject: "Fanlar", uploadExcel: "Excel Yuklash", aiSeeder: "AI Seeder",
  addAdmin: "Admin Qo'shish", notifications: "Bildirishnomalar",
  certificates: "Sertifikatlar", analytics: "Tahlil", finance: "Moliya", settings: "Sozlamalar"
};

const router = useRouter();

const authenticated = ref(false);
const loadingAuth = ref(true);
const sidebarCollapsed = ref(false);
const currentView = ref('overview');
const currentTime = ref('');
const adminRole = ref('admin');

// PIN Code Security State
const pinVerified = ref(sessionStorage.getItem('admin_pin_verified') === 'true');
const enteredPin = ref(['', '', '', '']);
const pinInputRefs = ref([]);
const pinError = ref(false);
const pinErrorMessage = ref('');
const attemptsLeft = ref(5);
let expectedPin = '2026';

let timeInterval = null;

const currentComponent = computed(() => {
  const superViews = ['users', 'addAdmin', 'analytics', 'finance', 'shopItems', 'addProduct', 'orders', 'notifications', 'certificates', 'settings', 'aiSeeder'];
  if (superViews.includes(currentView.value) && adminRole.value !== 'super_admin') {
    return AdminOverview;
  }
  return VIEW_MAP[currentView.value] || AdminOverview;
});

const currentViewLabel = computed(() => LABELS[currentView.value] || currentView.value);

const displayRole = computed(() => {
  if (adminRole.value === 'super_admin') return 'Super Admin';
  if (adminRole.value === 'content_admin') return 'Content Admin';
  if (adminRole.value === 'teacher_admin') return 'Teacher Admin';
  return 'Admin';
});

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
};

const navigate = (view) => {
  currentView.value = view;
};

const logout = async () => {
  try {
    sessionStorage.removeItem('admin_pin_verified');
    await authService.signOut();
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
  authenticated.value = false;
  pinVerified.value = false;
  adminRole.value = null;
  router.push('/');
};

const onPinInput = (idx, event) => {
  pinError.value = false;
  const val = event.target.value.replace(/\D/g, '');
  enteredPin.value[idx] = val;
  if (val && idx < 3 && pinInputRefs.value && pinInputRefs.value[idx + 1]) {
    pinInputRefs.value[idx + 1].focus();
  }
  if (enteredPin.value.join('').length === 4) {
    verifyPin();
  }
};

const onPinKeydown = (idx, event) => {
  if (event.key === 'Backspace' && !enteredPin.value[idx] && idx > 0 && pinInputRefs.value && pinInputRefs.value[idx - 1]) {
    pinInputRefs.value[idx - 1].focus();
  }
};

const verifyPin = () => {
  const pin = enteredPin.value.join('');
  if (pin === expectedPin) {
    pinVerified.value = true;
    sessionStorage.setItem('admin_pin_verified', 'true');
    pinError.value = false;
  } else {
    attemptsLeft.value--;
    pinError.value = true;
    enteredPin.value = ['', '', '', ''];
    if (pinInputRefs.value && pinInputRefs.value[0]) {
      pinInputRefs.value[0].focus();
    }
    if (attemptsLeft.value <= 0) {
      pinErrorMessage.value = "Urinishlar tugadi. Kirish bloklandi!";
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } else {
      pinErrorMessage.value = `Noto'g'ri PIN kod! Qolgan urinishlar: ${attemptsLeft.value}`;
    }
  }
};

const checkAdminAuth = async () => {
  loadingAuth.value = true;
  try {
    const user = await authService.getUser();
    if (!user) {
      authenticated.value = false;
      router.push('/login');
      return;
    }

    const profile = await profileService.getProfile(user.id);
    const hasAdminAccess = Boolean(profile?.is_admin) || ['super_admin', 'admin', 'content_admin', 'teacher_admin'].includes(profile?.admin_role);

    if (hasAdminAccess) {
      authenticated.value = true;
      adminRole.value = profile?.admin_role || (profile?.is_admin ? 'super_admin' : 'admin');
      if (profile?.admin_pin) {
        expectedPin = String(profile.admin_pin);
      }
    } else {
      authenticated.value = false;
      router.push('/');
    }
  } catch (e) {
    console.error('Admin huquqlarini tekshirishda xatolik:', e);
    authenticated.value = false;
    router.push('/');
  } finally {
    loadingAuth.value = false;
  }
};

onMounted(() => {
  checkAdminAuth();
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onBeforeUnmount(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.admin-root {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f1f5f9;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* Top Header */
.admin-topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 50;
}

.topbar-left { display: flex; align-items: center; gap: 16px; }
.mobile-menu-btn { display: none; background: none; border: none; color: #64748b; font-size: 1.2rem; cursor: pointer; padding: 8px; border-radius: 8px; }
.mobile-menu-btn:hover { background: #f1f5f9; }

.breadcrumb { display: flex; align-items: center; gap: 8px; }
.bc-root { font-weight: 700; color: #94a3b8; font-size: 0.9rem; cursor: pointer; transition: color 0.2s; }
.bc-root:hover { color: #3b82f6; }
.bc-sep { color: #cbd5e1; font-size: 0.7rem; }
.bc-current { font-weight: 800; color: #0f172a; font-size: 0.95rem; }

.topbar-right { display: flex; align-items: center; gap: 16px; }
.topbar-time { font-weight: 700; color: #64748b; font-size: 0.9rem; font-variant-numeric: tabular-nums; }
.admin-badge-topbar {
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.82rem;
  font-weight: 700;
}
.admin-badge-topbar i { color: #60a5fa; }

/* Content scroll area */
.admin-content-wrapper {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  overflow-x: hidden;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(241, 245, 249, 0.9);
  z-index: 100;
  color: #3b82f6;
}
.loading-overlay i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.loading-overlay p {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

/* Page Transition */
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.page-fade-enter-from { opacity: 0; transform: translateY(6px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-6px); }

/* PIN Code Guard Styles */
.pin-guard-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1e293b, #0f172a);
  z-index: 9999;
  padding: 16px;
}

.pin-card {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 40px 32px;
  width: 100%;
  max-width: 440px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pin-icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 20px auto;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.35);
}

.pin-card h2 {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.pin-card p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 28px 0;
}

.pin-inputs {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 20px;
}

.pin-digit-box {
  width: 58px;
  height: 64px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  transition: all 0.2s;
  outline: none;
}

.pin-digit-box:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.pin-digit-box.pin-error {
  border-color: #ef4444;
  background: #fef2f2;
  color: #ef4444;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.pin-error-text {
  color: #ef4444 !important;
  font-size: 0.85rem !important;
  font-weight: 700;
  margin-bottom: 20px !important;
}

.pin-actions {
  display: flex;
  gap: 12px;
}

.pin-back-btn {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.pin-back-btn:hover {
  background: #f1f5f9;
}

.pin-verify-btn {
  flex: 1.4;
  padding: 12px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.pin-verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.pin-verify-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-fade-enter-from, .page-fade-leave-to { opacity: 0; transform: translateY(8px); }

/* Mobile */
@media (max-width: 900px) {
  .mobile-menu-btn { display: flex; }
  .topbar-time { display: none; }
  .admin-content-wrapper { padding: 16px; }
}
</style>
