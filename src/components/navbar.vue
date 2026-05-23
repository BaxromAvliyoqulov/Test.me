<template>
  <div class="navbar">
    <div class="logo">
      <h1 @click="navigateTo('/')">Test.me</h1>
    </div>

    <div class="navbar-right">
      <button class="theme-toggle-btn" @click="toggleTheme" :title="isDarkMode ? 'Light Mode' : 'Dark Mode'">
        <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>
      
      <div class="profile">
        <img
          :src="profileImage"
          @click="toggleDropdown"
          class="profile-image"
          alt="User"
        />
      <div v-if="dropdownOpen" class="dropdown-content">
        <!-- User Info header inside dropdown -->
        <div class="user-info" v-if="username">
          <img :src="profileImage" class="dropdown-profile-image" alt="User" />
          <router-link to="/editProfile" class="dropdown-username">{{ username }}</router-link>
        </div>

        <!-- Language toggle group inside dropdown (UZB and RUS only) -->
        <!-- Language toggle group inside dropdown (UZB, RUS, ENG) -->
        <div class="dropdown-lang-section">
          <span class="lang-label">
            <i class="fas fa-globe"></i> 
            {{ t('language') }}
          </span>
          <div class="lang-toggle-group">
            <button 
              type="button" 
              @click.prevent="changeLocale('UZB')" 
              :class="{ active: currentLocale === 'UZB' }"
            >
              UZB
            </button>
            <button 
              type="button" 
              @click.prevent="changeLocale('RUS')" 
              :class="{ active: currentLocale === 'RUS' }"
            >
              RUS
            </button>
            <button 
              type="button" 
              @click.prevent="changeLocale('ENG')" 
              :class="{ active: currentLocale === 'ENG' }"
            >
              ENG
            </button>
          </div>
        </div>

        <!-- Logged In Links -->
        <template v-if="username">
          <div class="dropdown-links">
            <router-link to="/">
              <i class="fas fa-home"></i>
              {{ t('home') }}
            </router-link>
            <router-link to="/points">
              <img
                src="../assets/img/tpCoin.png"
                alt="TP Coin"
                style="width: 16px; height: 16px; margin-right: 8px"
              />
              {{ t('points') }}
            </router-link>
            <router-link to="/badges">
              <i class="fas fa-award"></i>
              {{ t('badges') }}
            </router-link>
            <router-link to="/certificates">
              <i class="fas fa-certificate"></i>
              {{ t('certificates') }}
            </router-link>
            <router-link to="/about">
              <i class="fas fa-info-circle"></i>
              {{ t('about') }}
            </router-link>
            <router-link to="/contactUs">
              <i class="fas fa-envelope"></i>
              {{ t('contact') }}
            </router-link>
            <router-link to="/dashboard">
              <i class="fas fa-chart-line"></i>
              {{ t('dashboard') }}
            </router-link>
            <hr class="custom-hr" />
            <a href="#" @click.prevent="logout" class="logout-link">
              <i class="fas fa-sign-out-alt"></i>
              {{ t('logout') }}
            </a>
          </div>
        </template>
        
        <!-- Logged Out Links -->
        <template v-else>
          <div class="dropdown-links">
            <router-link to="/about">
              <i class="fas fa-info-circle"></i>
              {{ t('about') }}
            </router-link>
            <router-link to="/contactUs">
              <i class="fas fa-envelope"></i>
              {{ t('contact') }}
            </router-link>
            <hr class="custom-hr" />
            <router-link to="/login">
              <i class="fas fa-sign-in-alt"></i>
              {{ t('login') }}
            </router-link>
            <router-link to="/signup">
              <i class="fas fa-user-plus"></i>
              {{ t('signup') }}
            </router-link>
          </div>
        </template>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import defaultUserImage from '../assets/img/user.png';
import { useI18n } from '@/utils/i18n';

export default {
  setup() {
    const { locale, t, setLocale } = useI18n();
    return {
      currentLocale: locale,
      t,
      setLocale,
    };
  },
  data() {
    return {
      dropdownOpen: false,
      username: null,
      profileImage: null,
      isDarkMode: false,
    };
  },

  created() {
    this.initializeAuth();
    document.addEventListener('click', this.handleClickOutside);

    // Default rasmni o'rnatish
    this.profileImage = defaultUserImage;

    const savedTheme = localStorage.getItem('theme') || 'light';
    this.isDarkMode = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
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

    handleUserAuthenticated(user) {
      this.username = user.displayName || user.email || 'User';

      if (user.photoURL) {
        this.profileImage = user.photoURL;
      } else {
        this.profileImage = defaultUserImage;
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      localStorage.setItem('user', JSON.stringify(userData));
    },

    handleUserNotAuthenticated() {
      this.username = null;
      this.profileImage = defaultUserImage;
      localStorage.removeItem('user');
    },

    navigateTo(path) {
      this.$router.push(path);
    },

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },

    handleClickOutside(event) {
      const profileElement = this.$el.querySelector('.profile');
      if (profileElement && !profileElement.contains(event.target)) {
        this.dropdownOpen = false;
      }
    },

    async logout() {
      try {
        const auth = getAuth();
        await signOut(auth);
        this.dropdownOpen = false;
        this.handleUserNotAuthenticated();
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      const theme = this.isDarkMode ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(15deg) scale(1.05);
}

.theme-toggle-btn i {
  transition: transform 0.5s ease;
}

.theme-toggle-btn:hover i {
  transform: rotate(45deg);
}

[data-theme="dark"] .dropdown-content {
  background: rgba(19, 26, 43, 0.98) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4) !important;
}

[data-theme="dark"] .user-info {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%) !important;
  border-bottom-color: rgba(255, 255, 255, 0.06) !important;
}

[data-theme="dark"] .dropdown-username {
  color: #ffffff !important;
}

[data-theme="dark"] .dropdown-links a {
  color: #e2e8f0 !important;
}

[data-theme="dark"] .dropdown-links a:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #ffffff !important;
}

[data-theme="dark"] .lang-toggle-group {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
}

[data-theme="dark"] .lang-toggle-group button {
  color: #94a3b8 !important;
}

[data-theme="dark"] .lang-toggle-group button.active {
  background: #ffffff !important;
  color: #0b0f19 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  max-width: 1200px;
  width: 90%;
  height: 64px;
  margin: 16px auto;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.25);
  position: relative;
  z-index: 999;
}

.navbar h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.2s;
}

.navbar h1:hover {
  opacity: 0.9;
}

.profile {
  position: relative;
}

.profile-image {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.4);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.profile-image:hover {
  transform: scale(1.05);
  border-color: #ffffff;
}

.dropdown-content {
  position: absolute;
  top: 48px;
  right: 0;
  min-width: 250px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04);
  z-index: 10000;
  overflow: hidden;
  animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(139, 92, 246, 0.04) 100%);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.dropdown-profile-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid rgba(37, 99, 235, 0.15);
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1);
}

.dropdown-username {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
}

.dropdown-username:hover {
  color: #2563eb;
}

/* Language Toggle Styling */
.dropdown-lang-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.lang-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-label i {
  color: #3b82f6;
}

.lang-toggle-group {
  display: flex;
  gap: 4px;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}

.lang-toggle-group button {
  border: none;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.lang-toggle-group button.active {
  background-color: #ffffff;
  color: #2563eb;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}

.dropdown-links {
  padding: 8px 10px;
}

.dropdown-content a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: #475569;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.dropdown-content a i {
  width: 20px;
  text-align: center;
  color: #64748b;
  font-size: 1.05rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.dropdown-content a img {
  transition: transform 0.2s ease;
}

.dropdown-content a:hover {
  background-color: rgba(37, 99, 235, 0.06);
  color: #2563eb;
}

.dropdown-content a:hover i {
  color: #2563eb;
  transform: scale(1.1);
}

.dropdown-content a:hover img {
  transform: scale(1.1);
}

.logout-link {
  color: #ef4444 !important;
}

.logout-link i {
  color: #ef4444 !important;
}

.logout-link:hover {
  background-color: rgba(239, 68, 68, 0.06) !important;
}

.custom-hr {
  border: none;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  margin: 8px 0;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .navbar {
    padding: 0 16px;
    height: 56px;
    width: 95%;
  }

  .navbar h1 {
    font-size: 1.3rem;
  }

  .profile-image {
    width: 34px;
    height: 34px;
  }
}
</style>
