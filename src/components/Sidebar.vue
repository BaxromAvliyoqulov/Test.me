<template>
  <aside :class="['app-sidebar', { collapsed: isCollapsed }]">
    <!-- Brand / Logo Area -->
    <div class="sidebar-brand" @click="$emit('toggle-sidebar')" title="Menyuni ochish/yopish">
      <div class="brand-icon">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <transition name="fade-slide">
        <span v-if="!isCollapsed" class="brand-text">Test.me</span>
      </transition>
    </div>

    <!-- User Profile Details -->
    <div class="sidebar-user" v-if="username" @click="navigateTo('/editProfile')">
      <div class="user-avatar-wrapper">
        <img :src="profileImage" class="user-avatar" alt="Avatar" />
        <div class="avatar-ring"></div>
      </div>
      <transition name="fade-slide">
        <div class="user-details" v-if="!isCollapsed">
          <div class="user-name">{{ username }}</div>
          <div class="user-rank-badge" :class="getRankClass(userPoints)">
            <i :class="getRankIcon(userPoints)"></i>
            <span>{{ getRankName(userPoints, currentLocale) }}</span>
          </div>
          <div class="user-id-badge" v-if="shortId" @click.stop="copyId" title="Nusxalash / Copy">
            ID: {{ shortId }} <i class="fas fa-copy"></i>
          </div>
        </div>
      </transition>
    </div>

    <!-- Language Section -->
    <div class="sidebar-lang" v-if="!isCollapsed">
      <div class="lang-dropdown" @click="toggleLang">
        <div class="lang-left">
          <i class="fas fa-globe"></i>
          <span class="lang-divider"></span>
          <span class="lang-text">{{ currentLocale === 'UZB' ? 'UZ' : 'RU' }}</span>
        </div>
        <i class="fas fa-chevron-down"></i>
      </div>
    </div>

    <!-- Navigation Menu Links -->
    <nav class="sidebar-nav">
      
      <!-- ASOSIY SECTION -->
      <div class="nav-section-title" v-if="!isCollapsed">{{ currentLocale === 'RUS' ? 'ГЛАВНАЯ' : 'ASOSIY' }}</div>
      <div class="nav-links-list">
        <router-link to="/" class="sidebar-link home-link" v-tooltip="t('home')">
          <div class="link-icon"><i class="fas fa-home"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('home') }}</span>
          </transition>
        </router-link>

        <router-link to="/dashboard" class="sidebar-link dash-link" v-tooltip="t('dashboard')">
          <div class="link-icon"><i class="fas fa-chart-line"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('dashboard') }}</span>
          </transition>
        </router-link>

        
      </div>

      <!-- YUTUQLAR & PROGRES SECTION -->
      <div class="nav-section-title mt-sec" v-if="!isCollapsed">{{ currentLocale === 'RUS' ? 'ДОСТИЖЕНИЯ И ПРОГРЕСС' : 'YUTUQLAR & PROGRES' }}</div>
      <div class="nav-links-list">
        <router-link to="/certificates" class="sidebar-link certs-link" v-tooltip="t('certificates')">
          <div class="link-icon"><i class="fas fa-award"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('certificates') }}</span>
          </transition>
        </router-link>

        <router-link to="/points" class="sidebar-link points-link" v-tooltip="t('points')">
          <div class="link-icon"><i class="fas fa-coins"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('points') }}</span>
          </transition>
        </router-link>

        <router-link to="/badges" class="sidebar-link badges-link" v-tooltip="t('badges')">
          <div class="link-icon"><i class="fas fa-trophy"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('badges') }}</span>
          </transition>
        </router-link>

        <router-link to="/friends" class="sidebar-link friends-link" v-tooltip="'Friends'">
          <div class="link-icon"><i class="fas fa-user-group"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ currentLocale === 'RUS' ? 'Друзья' : "Do'stlar" }}</span>
          </transition>
        </router-link>
      </div>

      <!-- DO'KON SECTION -->
      <div class="nav-section-title mt-sec" v-if="!isCollapsed">{{ currentLocale === 'RUS' ? 'МАГАЗИН' : "DO'KON" }}</div>
      <div class="nav-links-list">
        <router-link to="/shop" class="sidebar-link shop-link" v-tooltip="'Shop'">
          <div class="link-icon"><i class="fas fa-cart-shopping"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">Shop</span>
          </transition>
        </router-link>
      </div>

      <!-- INFO SECTION -->
      <div class="nav-section-title mt-sec" v-if="!isCollapsed">INFO</div>
      <div class="nav-links-list footer-links">
        <router-link to="/stats" class="sidebar-link stats-link" v-tooltip="'Umumiy Statistika'">
          <div class="link-icon"><i class="fas fa-chart-pie"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">Umumiy Statistika</span>
          </transition>
        </router-link>

        
        <router-link to="/about" class="sidebar-link about-link" v-tooltip="t('about')">
          <div class="link-icon"><i class="fas fa-circle-info"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('about') }}</span>
          </transition>
        </router-link>

        <router-link to="/contactUs" class="sidebar-link contact-link" v-tooltip="t('contact')">
          <div class="link-icon"><i class="fas fa-headset"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('contact') }}</span>
          </transition>
        </router-link>
      </div>

    </nav>

    <!-- LOGOUT SECTION (Fixed at bottom) -->
    <div class="sidebar-footer">
      <div class="logout-container" v-if="!isCollapsed">
        <a href="#" @click.prevent="logout" class="sidebar-link logout-link">
          <div class="link-icon"><i class="fas fa-arrow-right-from-bracket"></i></div>
          <span class="link-text">{{ t('logout') }}</span>
        </a>
      </div>
      <div class="logout-container-collapsed" v-else>
        <a href="#" @click.prevent="logout" class="sidebar-link logout-link">
          <div class="link-icon"><i class="fas fa-arrow-right-from-bracket"></i></div>
        </a>
      </div>
    </div>
  </aside>
</template>

<script>
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import defaultUserImage from '../assets/img/user.png';
import { useI18n } from '@/utils/i18n';
import { getRankName, getRankClass, getRankIcon } from '@/utils/ranks';
import { useToast } from 'vue-toastification';

export default {
  emits: ['toggle-sidebar'],
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { locale, t, setLocale } = useI18n();
    const toast = useToast();
    return {
      currentLocale: locale,
      t,
      setLocale,
      toast
    };
  },
  data() {
    return {
      username: null,
      profileImage: null,
      userPoints: 0,
      shortId: null,
      pointsUnsub: null,
    };
  },

  created() {
    this.initializeAuth();
    window.addEventListener('profile-updated', this.handleProfileUpdated);
    this.profileImage = defaultUserImage;
  },
  beforeUnmount() {
    window.removeEventListener('profile-updated', this.handleProfileUpdated);
    if (this.pointsUnsub) this.pointsUnsub();
  },
  methods: {
    handleProfileUpdated(event) {
      const { displayName, photoURL } = event.detail;
      if (displayName) this.username = displayName;
      if (photoURL) this.profileImage = photoURL;
    },
    changeLocale(lang) {
      this.setLocale(lang);
    },
    initializeAuth() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.handleUserAuthenticated(user);
        } else {
          this.handleUserNotAuthenticated();
        }
      });
    },
    async handleUserAuthenticated(user) {

      const userAgent = navigator.userAgent || '';
      let os = 'Unknown';
      if (/Windows/i.test(userAgent)) os = 'Windows';
      else if (/Mac/i.test(userAgent)) os = 'macOS';
      else if (/Android/i.test(userAgent)) os = 'Android';
      else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
      else if (/Linux/i.test(userAgent)) os = 'Linux';

      this.username = user.displayName || user.email || 'User';
      this.profileImage = user.photoURL || defaultUserImage;

      // Realtime listener for points and profile info
      if (this.pointsUnsub) this.pointsUnsub();
      this.pointsUnsub = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.userPoints = data.points || 0;
          if (data.displayName) this.username = data.displayName;
          if (data.photoURL) this.profileImage = data.photoURL;
          
          if (!data.shortId) {
            const newShortId = user.uid.slice(0, 8).toUpperCase();
            await updateDoc(doc(db, 'users', user.uid), { shortId: newShortId, deviceOS: os });
            this.shortId = newShortId;
          } else {
            this.shortId = data.shortId;
          }
          if (data.deviceOS !== os) {
            await updateDoc(doc(db, 'users', user.uid), { deviceOS: os });
          }
        }
      });
    },
    handleUserNotAuthenticated() {
      this.username = null;
      this.profileImage = defaultUserImage;
      if (this.pointsUnsub) this.pointsUnsub();
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    async logout() {
      try {
        const auth = getAuth();
        await signOut(auth);
        this.handleUserNotAuthenticated();
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
    getRankName(pts, loc) { return getRankName(pts, loc); },
    getRankClass(pts) { return getRankClass(pts); },
    getRankIcon(pts) { return getRankIcon(pts); },
    getRankIcon(pts) { return getRankIcon(pts); },
    copyId() {
      if (this.shortId) {
        navigator.clipboard.writeText(this.shortId);
        this.toast.success(this.currentLocale === 'RUS' ? 'ID скопирован!' : 'ID nusxalandi!');
      }
    },
    toggleLang() {
      const newLang = this.currentLocale === 'UZB' ? 'RUS' : 'UZB';
      this.changeLocale(newLang);
    }
  },
  directives: {
    tooltip: {
      mounted(el, binding) {
        el.setAttribute('title', binding.value || '');
      },
      updated(el, binding) {
        el.setAttribute('title', binding.value || '');
      }
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app-sidebar {
  width: 280px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  z-index: 1000;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
}

.app-sidebar.collapsed {
  width: 80px;
  padding: 24px 0;
}

/* Brand Section */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  cursor: pointer;
  margin-bottom: 30px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  letter-spacing: -1px;
}

/* User Section */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.sidebar-user:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.user-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  z-index: 2;
  position: relative;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  opacity: 0.7;
  z-index: 1;
  animation: rotateRing 6s linear infinite;
}

.avatar-frame-svg {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 90px;
  height: 90px;
  z-index: 3;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-frame-svg :deep(svg) {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 8px rgba(0,0,0,0.5));
}

@keyframes rotateRing {
  100% { transform: rotate(360deg); }
}

.user-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-weight: 800;
  color: white;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.user-rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  background: transparent;
  color: #64748b;
  padding: 0;
  border-radius: 0;
  align-self: flex-start;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}
.user-rank-badge i {
  color: inherit;
  font-size: 0.8rem;
}

/* Rank specific colors (optimized for dark sidebar) */
.user-rank-badge.rank-newbie { color: #94a3b8; text-shadow: 0 0 10px rgba(148, 163, 184, 0.4); }
.user-rank-badge.rank-bronze { color: #d97706; text-shadow: 0 0 10px rgba(217, 119, 6, 0.4); }
.user-rank-badge.rank-silver { color: #cbd5e1; text-shadow: 0 0 10px rgba(203, 213, 225, 0.4); }
.user-rank-badge.rank-gold { color: #facc15; text-shadow: 0 0 10px rgba(250, 204, 21, 0.4); }
.user-rank-badge.rank-platinum { color: #2dd4bf; text-shadow: 0 0 10px rgba(45, 212, 191, 0.4); }
.user-rank-badge.rank-diamond { color: #60a5fa; text-shadow: 0 0 10px rgba(96, 165, 250, 0.4); }
.user-rank-badge.rank-master { color: #a78bfa; text-shadow: 0 0 10px rgba(167, 139, 250, 0.4); }
.user-rank-badge.rank-grandmaster { color: #f472b6; text-shadow: 0 0 10px rgba(244, 114, 182, 0.4); }
.user-rank-badge.rank-legendary { color: #fb7185; text-shadow: 0 0 10px rgba(251, 113, 133, 0.4); }
.user-rank-badge.rank-mythic { color: #34d399; text-shadow: 0 0 10px rgba(52, 211, 153, 0.4); }

.user-id-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  align-self: flex-start;
  cursor: pointer;
  transition: all 0.2s;
}
.user-id-badge:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

/* Language Switcher */
.sidebar-lang {
  margin-bottom: 10px;
}

.lang-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}
.lang-dropdown:hover {
  background: rgba(255, 255, 255, 0.05);
}

.lang-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lang-left i {
  color: #60a5fa;
  font-size: 1.1rem;
}
.lang-divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.2);
}
.lang-text {
  font-weight: 700;
  font-size: 0.9rem;
}

/* Navigation Links */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.nav-section-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  font-weight: 800;
  padding-left: 12px;
  margin-bottom: 8px;
}
.mt-sec {
  margin-top: 16px;
}

.nav-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  border-radius: 12px;
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.link-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #94a3b8;
}

.coin-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.link-text {
  white-space: nowrap;
}

/* Hover & Active States */
.sidebar-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.router-link-exact-active.sidebar-link {
  background: #1e293b;
  color: white;
}

.router-link-exact-active.sidebar-link .link-icon {
  color: white;
}

/* Logout */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
}
.logout-container {
  padding: 0;
}
.logout-container-collapsed {
}
.logout-link {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #fca5a5;
  justify-content: center;
}
.logout-link:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.logout-link .link-icon {
  color: #fca5a5;
}
.logout-link:hover .link-icon {
  color: #ef4444;
}

.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 16px 12px;
}

/* Collapsed State Layout Overrides */
.collapsed .sidebar-brand {
  justify-content: center;
  padding: 10px 0;
}

.collapsed .sidebar-nav {
  padding-right: 0;
}

.collapsed .sidebar-link {
  justify-content: center;
  padding: 12px 0;
  margin-left: 8px;
  margin-right: 8px;
  width: calc(100% - 16px);
}

.collapsed .sidebar-user {
  justify-content: center;
  padding: 12px 0;
  margin-left: 8px;
  margin-right: 8px;
  background: transparent;
  border-color: transparent;
}

.collapsed .sidebar-divider {
  margin: 16px 8px;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
