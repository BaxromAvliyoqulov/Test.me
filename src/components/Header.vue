<template>
  <header class="app-header">
    <div class="header-left">
      <button class="mobile-toggle-btn" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <span class="page-title">{{ currentRouteName }}</span>
    </div>

    <div class="header-right" v-if="username">
      <!-- TP Coin Display Capsule -->
      <div class="coins-capsule" @click="$router.push('/points')">
        <img src="../assets/img/tpCoin.png" alt="TP Coin" class="coin-icon animate-pulse" />
        <span class="coin-amount">{{ userPoints }}</span>
        <span class="coin-label">TP</span>
      </div>

      <!-- Quick Action: Shop -->
      <div class="header-action-btn" @click="$router.push('/shop')" title="Do'kon">
        <i class="fas fa-cart-shopping text-blue-500"></i>
      </div>

      <!-- Quick Action: Admin -->
      <div class="header-action-btn admin-action-btn" v-if="isAdmin || adminRole === 'super_admin'" @click="$router.push('/admin')" title="Admin Panel">
        <i class="fas fa-shield-halved text-amber-500"></i>
      </div>

      <!-- Bell Button -->
      <div class="header-action-btn" @click="openNotifModal">
        <i class="fas fa-bell"></i>
        <span class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
      </div>

      <!-- Small User Info -->
      <div class="header-profile" @click="$router.push('/editProfile')">
        <img :src="profileImage" alt="User Image" class="header-avatar" />
      </div>
    </div>
  </header>

  <!-- Notifications Modal via Teleport -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showNotifModal" class="notif-modal-overlay" @click.self="closeNotifModal">
        <div class="notif-modal">

          <!-- Modal Header -->
          <div class="notif-modal-header">
            <div class="notif-modal-title">
              <div class="notif-modal-icon-wrap">
                <i class="fas fa-bell"></i>
              </div>
              <div>
                <h3>Bildirishnomalar</h3>
                <p>{{ filteredNotifications.length }} ta xabar</p>
              </div>
            </div>
            <button class="notif-modal-close" @click="closeNotifModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Unread count banner -->
          <div class="notif-modal-banner" v-if="unreadCount > 0">
            <i class="fas fa-circle-dot"></i>
            {{ unreadCount }} ta o'qilmagan xabar bor
          </div>

          <!-- Notifications List -->
          <div class="notif-modal-body">
            <div v-if="loadingNotifs" class="notif-modal-empty">
              <div class="notif-spinner"></div>
              <p>Yuklanmoqda...</p>
            </div>

            <div v-else-if="filteredNotifications.length === 0" class="notif-modal-empty">
              <i class="fas fa-bell-slash"></i>
              <p>Hozircha sizga xabarlar yo'q</p>
            </div>

            <div
              v-else
              v-for="notif in filteredNotifications"
              :key="notif.id"
              :class="['notif-modal-item', { unread: !readNotifications.includes(notif.id) }]"
              @click="openNotifDetail(notif)"
            >
              <div class="notif-modal-item-icon" :class="'type-' + notif.type">
                <i :class="getNotifIcon(notif.type)"></i>
              </div>
              <div class="notif-modal-item-body">
                <div class="notif-modal-item-top">
                  <h5>{{ notif.title }}</h5>
                  <span v-if="!readNotifications.includes(notif.id)" class="unread-dot"></span>
                </div>
                <p>{{ notif.body }}</p>
                <span class="notif-modal-time">{{ formatTime(notif.createdAt) }}</span>
              </div>
              <i class="fas fa-chevron-right notif-chevron"></i>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Notification Detail Modal -->
    <Transition name="modal-slide">
      <div v-if="selectedNotif" class="notif-detail-overlay" @click.self="selectedNotif = null">
        <div class="notif-detail-modal">
          <button class="notif-detail-back" @click="selectedNotif = null">
            <i class="fas fa-arrow-left"></i> Orqaga
          </button>
          <div class="notif-detail-icon" :class="'type-' + selectedNotif.type">
            <i :class="getNotifIcon(selectedNotif.type)"></i>
          </div>
          <h2 class="notif-detail-title">{{ selectedNotif.title }}</h2>
          <p class="notif-detail-body">{{ selectedNotif.body }}</p>
          <div class="notif-detail-meta">
            <span><i class="fas fa-clock"></i> {{ formatTime(selectedNotif.createdAt) }}</span>
            <span class="notif-type-badge" :class="'badge-' + selectedNotif.type">{{ getTypeName(selectedNotif.type) }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/config/firebase';
import defaultUserImage from '../assets/img/user.png';

const emit = defineEmits(['toggle-sidebar']);

const route = useRoute();

const username = ref(null);
const profileImage = ref(defaultUserImage);
const userPoints = ref(0);
let pointsUnsub = null;

// Notifications State
const readNotifications = ref([]);
const notifications = ref([]);
const showNotifModal = ref(false);
const selectedNotif = ref(null);
const loadingNotifs = ref(true);
let notifsUnsub = null;
let currentUserId = null;

// Admin state
const isAdmin = ref(false);
const adminRole = ref(null);

const filteredNotifications = computed(() => {
  return notifications.value.filter(n => {
    if (n.target === 'all') return true;
    if (n.target === 'active' && userPoints.value > 100) return true;
    if (n.target === 'new' && userPoints.value <= 100) return true;
    return false;
  });
});

const unreadCount = computed(() => {
  return filteredNotifications.value.filter(n => !readNotifications.value.includes(n.id)).length;
});

const getNotifIcon = (type) => {
  const icons = {
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    update: 'fas fa-arrow-up',
    promo: 'fas fa-gift'
  };
  return icons[type] || 'fas fa-bell';
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
};

const getTypeName = (type) => {
  const names = { info: "Ma'lumot", success: 'Muvaffaqiyat', warning: 'Ogohlantirish', update: 'Yangilik', promo: 'Aksiya' };
  return names[type] || type;
};

const openNotifModal = async () => {
  showNotifModal.value = true;
  document.body.style.overflow = 'hidden';
  // Mark all as read when opening
  if (unreadCount.value > 0 && currentUserId) {
    const unreadIds = filteredNotifications.value
      .filter(n => !readNotifications.value.includes(n.id))
      .map(n => n.id);
    if (unreadIds.length > 0) {
      try {
        await updateDoc(doc(db, 'users', currentUserId), {
          readNotifications: arrayUnion(...unreadIds)
        });
      } catch (e) {
        console.error('Error marking as read:', e);
      }
    }
  }
};

const closeNotifModal = () => {
  showNotifModal.value = false;
  selectedNotif.value = null;
  document.body.style.overflow = '';
};

const openNotifDetail = (notif) => {
  selectedNotif.value = notif;
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape') closeNotifModal();
};

const currentRouteName = computed(() => {
  const pathMap = {
    '/': 'Bosh sahifa',
    '/points': 'Ballar & Coinlar',
    '/shop': 'Do\'kon',
    '/badges': 'Yutuqlar',
    '/certificates': 'Sertifikatlar',
    '/dashboard': 'Statistika',
    '/friends': 'Do\'stlar',
    '/about': 'Biz haqimizda',
    '/contactUs': 'Aloqa & Yordam',
    '/editProfile': 'Profilni tahrirlash',
  };
  return route.path ? (pathMap[route.path] || '') : '';
});

const handleProfileUpdated = (event) => {
  const { displayName, photoURL } = event.detail;
  if (displayName) username.value = displayName;
  if (photoURL) profileImage.value = photoURL;
};

const initializeAuth = () => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      username.value = user.displayName || user.email || 'User';
      profileImage.value = user.photoURL || defaultUserImage;

      if (pointsUnsub) pointsUnsub();
      pointsUnsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          userPoints.value = data.points || 0;
          isAdmin.value = data.isAdmin || false;
          adminRole.value = data.adminRole || null;
          
          if (user.email === 'avliyoqulovbaxrom99@gmail.com') {
            isAdmin.value = true;
            adminRole.value = 'super_admin';
          }

          if (data.displayName) username.value = data.displayName;
          if (data.photoURL) profileImage.value = data.photoURL;
          readNotifications.value = data.readNotifications || [];
        }
      });

      // Fetch notifications in real-time
      currentUserId = user.uid;
      if (notifsUnsub) notifsUnsub();
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      notifsUnsub = onSnapshot(q, (snapshot) => {
        notifications.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        loadingNotifs.value = false;
      });
    } else {
      username.value = null;
      profileImage.value = defaultUserImage;
      if (pointsUnsub) pointsUnsub();
      if (notifsUnsub) notifsUnsub();
      currentUserId = null;
    }
  });
};

onMounted(() => {
  initializeAuth();
  window.addEventListener('profile-updated', handleProfileUpdated);
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('profile-updated', handleProfileUpdated);
  window.removeEventListener('keydown', handleKeyDown);
  if (pointsUnsub) pointsUnsub();
  if (notifsUnsub) notifsUnsub();
  document.body.style.overflow = '';
});
</script>

<style scoped>
.app-header {
  height: 70px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  margin: 16px 30px;
  border-radius: 20px;
  position: relative;
  z-index: 99;
  box-shadow: 0 10px 40px -10px rgba(37, 99, 235, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .app-header {
    margin: 12px 16px;
    padding: 0 16px;
    height: 64px;
    border-radius: 16px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mobile-toggle-btn {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #0f172a;
  cursor: pointer;
  padding: 5px;
}

@media (max-width: 768px) {
  .mobile-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.page-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* TP Coins Capsule */
.coins-capsule {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde047;
  padding: 6px 14px;
  border-radius: 99px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(253, 224, 71, 0.2);
  transition: all 0.2s;
}

.coins-capsule:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(253, 224, 71, 0.35);
}

.coin-icon {
  width: 20px;
  height: 20px;
}

.coin-amount {
  font-size: 1.05rem;
  font-weight: 800;
  color: #b45309;
}

.coin-label {
  font-size: 0.75rem;
  font-weight: 800;
  background: #f59e0b;
  color: white;
  padding: 2px 6px;
  border-radius: 99px;
}

/* Header Notification Bell */
.header-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  position: relative;
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.header-action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.admin-action-btn {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.admin-action-btn:hover {
  background: rgba(245, 158, 11, 0.2);
  color: #d97706;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-amber-500 {
  color: #f59e0b;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
}

/* Profile Avatar */
.header-profile {
  cursor: pointer;
  transition: transform 0.2s;
}

.header-profile:hover {
  transform: scale(1.05);
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .8; transform: scale(1.05); }
}

/* Notification Dropdown */
.notif-container {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 99px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  line-height: 1;
}

.notifications-dropdown {
  position: absolute;
  top: 55px;
  right: -10px;
  width: 340px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15), 0 4px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.notif-header {
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.notif-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.notif-count {
  font-size: 0.72rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 3px 9px;
  border-radius: 99px;
  font-weight: 600;
}

.notif-body {
  max-height: 360px;
  overflow-y: auto;
}

.notif-empty {
  padding: 32px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.88rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.notif-empty i {
  font-size: 1.8rem;
  opacity: 0.5;
}

.notif-item {
  padding: 14px 18px;
  border-bottom: 1px solid #f8fafc;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: background 0.15s;
  cursor: default;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item:hover {
  background: #f8fafc;
}

.notif-item.unread {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  padding-left: 15px;
}

.notif-item.unread:hover {
  background: #dbeafe;
}

.notif-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.notif-icon.type-info { background: #e0f2fe; color: #0ea5e9; }
.notif-icon.type-success { background: #dcfce7; color: #22c55e; }
.notif-icon.type-warning { background: #fef3c7; color: #f59e0b; }
.notif-icon.type-update { background: #ede9fe; color: #8b5cf6; }
.notif-icon.type-promo { background: #fce7f3; color: #ec4899; }

.notif-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.notif-title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-text {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-time {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 2px;
}

/* Dropdown animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* ===== NOTIFICATION MODAL ===== */
.notif-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 9998;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 90px 24px 0 0;
}

.notif-modal {
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 110px);
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notif-modal-header {
  padding: 22px 22px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.notif-modal-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.notif-modal-icon-wrap {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.notif-modal-title h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.notif-modal-title p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #64748b;
}

.notif-modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.notif-modal-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.notif-modal-banner {
  margin: 12px 16px 0;
  padding: 10px 14px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  color: #1d4ed8;
  font-size: 0.82rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.notif-modal-empty {
  padding: 48px 20px;
  text-align: center;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.notif-modal-empty i {
  font-size: 2.5rem;
  opacity: 0.4;
}

.notif-modal-empty p {
  margin: 0;
  font-size: 0.9rem;
}

.notif-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.notif-modal-item {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f8fafc;
}

.notif-modal-item:last-child { border-bottom: none; }

.notif-modal-item:hover {
  background: #f8fafc;
}

.notif-modal-item.unread {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  padding-left: 17px;
}

.notif-modal-item.unread:hover {
  background: #dbeafe;
}

.notif-modal-item-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.notif-modal-item-icon.type-info { background: #e0f2fe; color: #0ea5e9; }
.notif-modal-item-icon.type-success { background: #dcfce7; color: #22c55e; }
.notif-modal-item-icon.type-warning { background: #fef3c7; color: #f59e0b; }
.notif-modal-item-icon.type-update { background: #ede9fe; color: #8b5cf6; }
.notif-modal-item-icon.type-promo { background: #fce7f3; color: #ec4899; }

.notif-modal-item-body {
  flex: 1;
  min-width: 0;
}

.notif-modal-item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notif-modal-item-top h5 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

.notif-modal-item-body p {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-modal-time {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 5px;
  display: block;
}

.notif-chevron {
  color: #cbd5e1;
  font-size: 0.8rem;
  flex-shrink: 0;
}

/* ===== NOTIFICATION DETAIL MODAL ===== */
.notif-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.notif-detail-modal {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 30px 100px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  position: relative;
}

.notif-detail-back {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.notif-detail-back:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.notif-detail-icon {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-top: 16px;
}

.notif-detail-icon.type-info { background: #e0f2fe; color: #0ea5e9; }
.notif-detail-icon.type-success { background: #dcfce7; color: #22c55e; }
.notif-detail-icon.type-warning { background: #fef3c7; color: #f59e0b; }
.notif-detail-icon.type-update { background: #ede9fe; color: #8b5cf6; }
.notif-detail-icon.type-promo { background: #fce7f3; color: #ec4899; }

.notif-detail-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.notif-detail-body {
  margin: 0;
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.65;
}

.notif-detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.78rem;
  color: #94a3b8;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
  width: 100%;
}

.notif-type-badge {
  padding: 4px 12px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.72rem;
}

.badge-info { background: #e0f2fe; color: #0ea5e9; }
.badge-success { background: #dcfce7; color: #22c55e; }
.badge-warning { background: #fef3c7; color: #f59e0b; }
.badge-update { background: #ede9fe; color: #8b5cf6; }
.badge-promo { background: #fce7f3; color: #ec4899; }

/* Modal Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .notif-modal,
.modal-fade-leave-to .notif-modal {
  transform: translateX(30px) scale(0.97);
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
}

.modal-slide-enter-from .notif-detail-modal,
.modal-slide-leave-to .notif-detail-modal {
  transform: scale(0.92) translateY(20px);
}

@media (max-width: 480px) {
  .notif-modal-overlay {
    padding: 80px 0 0 0;
    align-items: flex-start;
    justify-content: center;
  }
  .notif-modal {
    width: 100%;
    border-radius: 24px 24px 0 0;
    max-height: 85vh;
  }
}
</style>
