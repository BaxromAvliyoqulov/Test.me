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

      <!-- Quick Action / Notification (Decorative but premium) -->
      <div class="header-action-btn">
        <i class="fas fa-bell"></i>
        <span class="notification-badge"></span>
      </div>

      <!-- Small User Info -->
      <div class="header-profile" @click="$router.push('/editProfile')">
        <img :src="profileImage" alt="User Image" class="header-avatar" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import defaultUserImage from '../assets/img/user.png';

const emit = defineEmits(['toggle-sidebar']);

const route = useRoute();

const username = ref(null);
const profileImage = ref(defaultUserImage);
const userPoints = ref(0);
let pointsUnsub = null;

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
          if (data.displayName) username.value = data.displayName;
          if (data.photoURL) profileImage.value = data.photoURL;
        }
      });
    } else {
      username.value = null;
      profileImage.value = defaultUserImage;
      if (pointsUnsub) pointsUnsub();
    }
  });
};

onMounted(() => {
  initializeAuth();
  window.addEventListener('profile-updated', handleProfileUpdated);
});

onBeforeUnmount(() => {
  window.removeEventListener('profile-updated', handleProfileUpdated);
  if (pointsUnsub) pointsUnsub();
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
</style>
