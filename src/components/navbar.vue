<template>
  <div class="navbar">
    <div class="logo">
      <h1 @click="navigateTo('/')">Test.me</h1>
    </div>

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
        <div class="dropdown-lang-section">
          <span class="lang-label">
            <i class="fas fa-globe"></i> 
            {{ currentLocale === 'UZB' ? 'Til' : 'Язык' }}
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
              {{ currentLocale === 'RUS' ? 'Достижения' : 'Yutuqlar' }}
            </router-link>
            <router-link to="/certificates">
              <i class="fas fa-certificate"></i>
              {{ currentLocale === 'RUS' ? 'Сертификаты' : 'Sertifikatlar' }}
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
            <a href="#" @click.prevent="logout">
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
    };
  },

  created() {
    this.initializeAuth();
    document.addEventListener('click', this.handleClickOutside);

    // Default rasmni o'rnatish
    this.profileImage = defaultUserImage;
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
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
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
  min-width: 240px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);
  z-index: 10000;
  overflow: hidden;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 1px solid #e2e8f0;
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
}

.dropdown-username:hover {
  color: #2563eb;
}

/* Language Toggle Styling */
.dropdown-lang-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.lang-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.lang-toggle-group {
  display: flex;
  gap: 3px;
  background-color: #f1f5f9;
  padding: 2px;
  border-radius: 6px;
}

.lang-toggle-group button {
  border: none;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-toggle-group button.active {
  background-color: #ffffff;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.dropdown-links {
  padding: 6px 0;
}

.dropdown-content a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  color: #334155;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dropdown-content a i {
  width: 16px;
  text-align: center;
  color: #64748b;
}

.dropdown-content a:hover {
  background-color: #f8fafc;
  color: #2563eb;
}

.dropdown-content a:hover i {
  color: #2563eb;
}

.custom-hr {
  border: none;
  border-top: 1px solid #f1f5f9;
  margin: 6px 0;
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
