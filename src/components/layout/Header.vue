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
        <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="coin-icon animate-pulse" />
        <span class="coin-amount">{{ userPoints }}</span>
        <span class="coin-label">TP</span>
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

  <!-- Modular Notifications Modal Component -->
  <HeaderNotificationModal
    :show="showNotifModal"
    :notifications="filteredNotifications"
    :readNotifications="readNotifications"
    :unreadCount="unreadCount"
    :loading="loadingNotifs"
    @close="closeNotifModal"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { authService, profileService, notificationService } from '@/services/supabaseService';
import defaultUserImage from '@/assets/img/user.png';
import HeaderNotificationModal from '@/components/layout/HeaderNotificationModal.vue';
import { useNotifications } from '@/composables/useNotifications';
import { useI18n } from '@/utils/i18n';

const emit = defineEmits(['toggle-sidebar']);

const route = useRoute();
const { locale: currentLocale } = useI18n();

const username = ref(null);
const profileImage = ref(defaultUserImage);
const userPoints = ref(0);
let authListener = null;

// Notifications Centralized State
const { 
  broadcastNotifications: notifications, 
  readNotificationIds: readNotifications, 
  totalUnreadCount,
  loading: loadingNotifs,
  currentUserId
} = useNotifications();

const showNotifModal = ref(false);

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

const unreadCount = totalUnreadCount;

const openNotifModal = async () => {
  showNotifModal.value = true;
  document.body.style.overflow = 'hidden';
  // Mark all as read when opening
  if (unreadCount.value > 0 && currentUserId?.value) {
    const unreadIds = filteredNotifications.value
      .filter(n => !readNotifications.value.includes(n.id))
      .map(n => n.id);
    if (unreadIds.length > 0) {
      try {
        await notificationService.markAsRead(currentUserId.value, unreadIds);
        readNotifications.value.push(...unreadIds);
      } catch (e) {
        console.error('Error marking as read:', e);
      }
    }
  }
};

const closeNotifModal = () => {
  showNotifModal.value = false;
  document.body.style.overflow = '';
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape') closeNotifModal();
};

const currentRouteName = computed(() => {
  const isRu = currentLocale.value === 'RUS';
  const pathMap = {
    '/': isRu ? 'Главная' : 'Bosh sahifa',
    '/points': isRu ? 'Баллы & Коины' : 'Ballar & Coinlar',
    '/shop': isRu ? 'Магазин' : "Do'kon",
    '/badges': isRu ? 'Достижения' : 'Yutuqlar',
    '/certificates': isRu ? 'Сертификаты' : 'Sertifikatlar',
    '/dashboard': isRu ? 'Статистика' : 'Statistika',
    '/friends': isRu ? 'Друзья' : "Do'stlar",
    '/about': isRu ? 'О нас' : 'Biz haqimizda',
    '/contactUs': isRu ? 'Контакты & Помощь' : 'Aloqa & Yordam',
    '/editProfile': isRu ? 'Настройки профиля' : 'Profilni tahrirlash',
    '/notifications': isRu ? 'Уведомления' : 'Bildirishnomalar',
  };
  return route.path ? (pathMap[route.path] || '') : '';
});

const handleProfileUpdated = (event) => {
  const { displayName, photoURL } = event.detail;
  if (displayName) username.value = displayName;
  if (photoURL) profileImage.value = photoURL;
};

const syncUserData = async (user) => {
  if (user) {
    username.value = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    profileImage.value = user.user_metadata?.avatar_url || defaultUserImage;

    const profile = await profileService.getProfile(user.id);
    if (profile) {
      userPoints.value = profile.points || 0;
      isAdmin.value = profile.is_admin || false;
      adminRole.value = profile.admin_role || null;
      if (profile.full_name) username.value = profile.full_name;
      if (profile.avatar_url) profileImage.value = profile.avatar_url;
      readNotifications.value = profile.read_notifications || [];
    }

    if (user.email === 'avliyoqulovbaxrom99@gmail.com') {
      isAdmin.value = true;
      adminRole.value = 'super_admin';
    }
  } else {
    username.value = null;
    profileImage.value = defaultUserImage;
  }
};

const initializeAuth = () => {
  authService.getUser().then(syncUserData);
  const { data } = authService.onAuthStateChange((_event, session) => {
    syncUserData(session?.user || null);
  });
  authListener = data?.subscription;
};

onMounted(() => {
  initializeAuth();
  window.addEventListener('profile-updated', handleProfileUpdated);
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('profile-updated', handleProfileUpdated);
  window.removeEventListener('keydown', handleKeyDown);
  if (authListener?.unsubscribe) authListener.unsubscribe();
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

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}

.mobile-toggle-btn {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.3rem;
  color: #0f172a;
  cursor: pointer;
  padding: 6px;
  border-radius: 10px;
  transition: background 0.2s;
}

.mobile-toggle-btn:active {
  background: #f1f5f9;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .app-header {
    margin: 8px 10px 14px 10px;
    padding: 0 12px;
    height: 56px;
    border-radius: 16px;
  }

  .header-left {
    gap: 8px;
  }

  .mobile-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #f1f5f9;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .page-title {
    font-size: 1rem;
    max-width: 110px;
  }

  .header-right {
    gap: 8px;
  }

  .coins-capsule {
    padding: 4px 10px;
    gap: 5px;
  }

  .coin-icon {
    width: 18px;
    height: 18px;
  }

  .coin-amount {
    font-size: 0.9rem;
  }

  .coin-label {
    display: none;
  }

  .header-action-btn {
    width: 36px;
    height: 36px;
  }

  .header-profile .header-avatar {
    width: 36px;
    height: 36px;
  }
}
</style>
