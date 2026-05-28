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
    <div class="sidebar-user" v-if="username">
      <div class="user-avatar-wrapper" @click="navigateTo('/editProfile')">
        <img :src="profileImage" class="user-avatar" alt="Avatar" />
        <div class="avatar-ring"></div>
      </div>
      <transition name="fade-slide">
        <div class="user-details" v-if="!isCollapsed">
          <router-link to="/editProfile" class="user-name">{{ username }}</router-link>
          <div :class="['user-rank', getRankClass(userPoints)]">
            <i :class="getRankIcon(userPoints)"></i>
            <span>{{ getRankName(userPoints, currentLocale) }}</span>
          </div>
          <div class="user-short-id" v-if="shortId" @click="copyId" title="Nusxalash / Copy">
            ID: {{ shortId }} <i class="fas fa-copy"></i>
          </div>
        </div>
      </transition>
    </div>

    <!-- Language Section (UZB & RUS) -->
    <div class="sidebar-lang" v-if="!isCollapsed">
      <div class="lang-toggle-container">
        <button 
          @click.prevent="changeLocale('UZB')" 
          :class="{ active: currentLocale === 'UZB' }"
          class="lang-btn"
        >
          UZ
        </button>
        <button 
          @click.prevent="changeLocale('RUS')" 
          :class="{ active: currentLocale === 'RUS' }"
          class="lang-btn"
        >
          RU
        </button>
      </div>
    </div>

    <!-- Navigation Menu Links -->
    <nav class="sidebar-nav">
      <div class="nav-section-title" v-if="!isCollapsed">{{ t('menu') || 'Mentyu' }}</div>
      
      <div class="nav-links-list">
        <router-link to="/" class="sidebar-link home-link" v-tooltip="t('home')">
          <div class="link-icon"><i class="fas fa-home"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('home') }}</span>
          </transition>
        </router-link>

        <router-link to="/points" class="sidebar-link points-link" v-tooltip="t('points')">
          <div class="link-icon">
            <img src="../assets/img/tpCoin.png" alt="TP" class="coin-img" />
          </div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('points') }}</span>
          </transition>
        </router-link>

        <router-link to="/shop" class="sidebar-link shop-link" v-tooltip="'Shop'">
          <div class="link-icon"><i class="fas fa-store"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">Shop</span>
          </transition>
        </router-link>

        <router-link to="/inventory" class="sidebar-link inventory-link" v-tooltip="'Inventory'">
          <div class="link-icon"><i class="fas fa-box-open"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">Inventory</span>
          </transition>
        </router-link>

        <router-link to="/badges" class="sidebar-link badges-link" v-tooltip="t('badges')">
          <div class="link-icon"><i class="fas fa-award"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('badges') }}</span>
          </transition>
        </router-link>

        <router-link to="/certificates" class="sidebar-link certs-link" v-tooltip="t('certificates')">
          <div class="link-icon"><i class="fas fa-certificate"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('certificates') }}</span>
          </transition>
        </router-link>

        <router-link to="/dashboard" class="sidebar-link dash-link" v-tooltip="t('dashboard')">
          <div class="link-icon"><i class="fas fa-chart-pie"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('dashboard') }}</span>
          </transition>
        </router-link>

        <router-link to="/friends" class="sidebar-link friends-link" v-tooltip="'Friends'">
          <div class="link-icon"><i class="fas fa-users"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">Friends</span>
          </transition>
        </router-link>
      </div>

      <div class="sidebar-divider"></div>

      <div class="nav-links-list footer-links">
        <router-link to="/about" class="sidebar-link about-link" v-tooltip="t('about')">
          <div class="link-icon"><i class="fas fa-info-circle"></i></div>
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

        <a href="#" @click.prevent="logout" class="sidebar-link logout-link" v-tooltip="t('logout')">
          <div class="link-icon"><i class="fas fa-sign-out-alt"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">{{ t('logout') }}</span>
          </transition>
        </a>
      </div>
    </nav>
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
            await updateDoc(doc(db, 'users', user.uid), { shortId: newShortId });
            this.shortId = newShortId;
          } else {
            this.shortId = data.shortId;
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
    copyId() {
      if (this.shortId) {
        navigator.clipboard.writeText(this.shortId);
        this.toast.success(this.currentLocale === 'RUS' ? 'ID скопирован!' : 'ID nusxalandi!');
      }
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
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 20px;
}

.user-avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  z-index: 2;
  position: relative;
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  opacity: 0.7;
  z-index: 1;
  animation: rotateRing 6s linear infinite;
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
  font-weight: 700;
  color: white;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-name:hover {
  color: #60a5fa;
}

.user-rank {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 99px;
  align-self: flex-start;
}

.user-rank.rank-legend { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

.user-short-id {
  margin-top: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.user-short-id:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

/* Language Switcher */
.sidebar-lang {
  margin-bottom: 20px;
  padding: 0 12px;
}

.lang-toggle-container {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 4px;
}

.lang-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.lang-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
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
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  font-weight: 800;
  padding-left: 12px;
  margin-bottom: 12px;
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
  padding: 12px;
  border-radius: 12px;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.link-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s;
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
  transform: translateX(4px);
}

.router-link-exact-active.sidebar-link {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.2);
}

.router-link-exact-active.sidebar-link .link-icon {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Individual Link Hover Effects */
.home-link:hover .link-icon { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.points-link:hover .link-icon { background: rgba(234, 179, 8, 0.2); }
.shop-link:hover .link-icon { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.inventory-link:hover .link-icon { background: rgba(217, 70, 239, 0.2); color: #d946ef; }
.badges-link:hover .link-icon { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
.certs-link:hover .link-icon { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.dash-link:hover .link-icon { background: rgba(244, 63, 94, 0.2); color: #f43f5e; }
.friends-link:hover .link-icon { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.about-link:hover .link-icon { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
.contact-link:hover .link-icon { background: rgba(20, 184, 166, 0.2); color: #14b8a6; }

.logout-link {
  color: #fca5a5;
}
.logout-link:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.logout-link:hover .link-icon {
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
