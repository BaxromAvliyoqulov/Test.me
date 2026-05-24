<template>
  <div class="navbar">
    <div class="logo">
      <h1 @click="navigateTo('/')">Test.me</h1>
    </div>

    <div class="navbar-right">
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
          <div class="user-info-text">
            <router-link to="/editProfile" class="dropdown-username">{{ username }}</router-link>
            <div :class="['nav-rank-badge', getRankClass(userPoints)]">
              <i :class="getRankIcon(userPoints)"></i>
              <span>{{ getRankName(userPoints, currentLocale) }}</span>
            </div>
          </div>
        </div>

        <!-- Language toggle group inside dropdown (UZB and RUS only) -->
        <!-- Language toggle group inside dropdown (UZB, RUS only) -->
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
          </div>
        </div>

        <!-- Logged In Links -->
        <template v-if="username">
          <div class="dropdown-links">
            <router-link to="/" class="nav-link home-link">
              <div class="nav-icon"><i class="fas fa-home"></i></div>
              <span class="nav-text">{{ t('home') }}</span>
            </router-link>
            
            <router-link to="/points" class="nav-link points-link">
              <div class="nav-icon">
                <img src="../assets/img/tpCoin.png" alt="TP Coin" />
              </div>
              <span class="nav-text">{{ t('points') }}</span>
            </router-link>

            <router-link to="/badges" class="nav-link badges-link">
              <div class="nav-icon"><i class="fas fa-award"></i></div>
              <span class="nav-text">{{ t('badges') }}</span>
            </router-link>

            <router-link to="/certificates" class="nav-link certs-link">
              <div class="nav-icon"><i class="fas fa-certificate"></i></div>
              <span class="nav-text">{{ t('certificates') }}</span>
            </router-link>

            <router-link to="/dashboard" class="nav-link dash-link">
              <div class="nav-icon"><i class="fas fa-chart-pie"></i></div>
              <span class="nav-text">{{ t('dashboard') }}</span>
            </router-link>

            <hr class="custom-hr" />

            <router-link to="/about" class="nav-link about-link">
              <div class="nav-icon"><i class="fas fa-info"></i></div>
              <span class="nav-text">{{ t('about') }}</span>
            </router-link>

            <router-link to="/contactUs" class="nav-link contact-link">
              <div class="nav-icon"><i class="fas fa-headset"></i></div>
              <span class="nav-text">{{ t('contact') }}</span>
            </router-link>

            <hr class="custom-hr" />

            <a href="#" @click.prevent="logout" class="nav-link logout-link">
              <div class="nav-icon"><i class="fas fa-sign-out-alt"></i></div>
              <span class="nav-text">{{ t('logout') }}</span>
            </a>
          </div>
        </template>
        
        <!-- Logged Out Links -->
        <template v-else>
          <div class="dropdown-links">
            <router-link to="/about" class="nav-link about-link">
              <div class="nav-icon"><i class="fas fa-info"></i></div>
              <span class="nav-text">{{ t('about') }}</span>
            </router-link>

            <router-link to="/contactUs" class="nav-link contact-link">
              <div class="nav-icon"><i class="fas fa-headset"></i></div>
              <span class="nav-text">{{ t('contact') }}</span>
            </router-link>

            <hr class="custom-hr" />

            <router-link to="/login" class="nav-link login-link">
              <div class="nav-icon"><i class="fas fa-sign-in-alt"></i></div>
              <span class="nav-text">{{ t('login') }}</span>
            </router-link>

            <router-link to="/signup" class="nav-link signup-link">
              <div class="nav-icon"><i class="fas fa-user-plus"></i></div>
              <span class="nav-text">{{ t('signup') }}</span>
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import defaultUserImage from '../assets/img/user.png';
import { useI18n } from '@/utils/i18n';
import { getRankName, getRankClass, getRankIcon } from '@/utils/ranks';

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
      userPoints: 0,
    };
  },

  created() {
    this.initializeAuth();
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('profile-updated', this.handleProfileUpdated);

    // Default rasmni o'rnatish
    this.profileImage = defaultUserImage;

    // Reset and clear theme variables to default (light)
    localStorage.removeItem('theme');
    document.documentElement.removeAttribute('data-theme');
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('profile-updated', this.handleProfileUpdated);
  },

  methods: {
    handleProfileUpdated(event) {
      const { displayName, photoURL } = event.detail;
      if (displayName) {
        this.username = displayName;
      }
      if (photoURL) {
        this.profileImage = photoURL;
      }
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

      // First set Firebase Auth photoURL as fallback
      if (user.photoURL) {
        this.profileImage = user.photoURL;
      } else {
        this.profileImage = defaultUserImage;
      }

      // Then try Firestore for full photoURL (includes Base64 custom images)
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.photoURL) {
            this.profileImage = data.photoURL;
          }
          if (data.displayName) {
            this.username = data.displayName;
          }
          this.userPoints = data.points || 0;
        }
      } catch (e) {
        // Firestore read failed, keep Firebase Auth values
        console.warn('Navbar: could not load user doc from Firestore', e);
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: this.username,
        photoURL: this.profileImage,
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
    
    // Rank wrappers
    getRankName(pts, loc) { return getRankName(pts, loc); },
    getRankClass(pts) { return getRankClass(pts); },
    getRankIcon(pts) { return getRankIcon(pts); },
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

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  max-width: 1400px;
  width: 95%;
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

.user-info-text {
  display: flex;
  flex-direction: column;
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
  padding: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f1f5f9;
  color: #64748b;
}

.nav-icon img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.nav-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
  transition: color 0.2s;
}

/* Hover effect */
.nav-link:hover {
  background: #f8fafc;
  transform: translateX(4px);
}

.nav-link:hover .nav-icon {
  transform: scale(1.1) rotate(-5deg);
}

/* Individual Colors */
.home-link:hover { background: #eff6ff; }
.home-link .nav-icon { background: #eff6ff; color: #3b82f6; }
.home-link:hover .nav-text { color: #2563eb; }
.home-link:hover .nav-icon { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }

.points-link:hover { background: #fefce8; }
.points-link .nav-icon { background: #fefce8; }
.points-link:hover .nav-text { color: #ca8a04; }
.points-link:hover .nav-icon { background: #eab308; box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3); }

.badges-link:hover { background: #faf5ff; }
.badges-link .nav-icon { background: #faf5ff; color: #a855f7; }
.badges-link:hover .nav-text { color: #9333ea; }
.badges-link:hover .nav-icon { background: #a855f7; color: white; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3); }

.certs-link:hover { background: #f0fdf4; }
.certs-link .nav-icon { background: #f0fdf4; color: #22c55e; }
.certs-link:hover .nav-text { color: #16a34a; }
.certs-link:hover .nav-icon { background: #22c55e; color: white; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }

.dash-link:hover { background: #fff1f2; }
.dash-link .nav-icon { background: #fff1f2; color: #f43f5e; }
.dash-link:hover .nav-text { color: #e11d48; }
.dash-link:hover .nav-icon { background: #f43f5e; color: white; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3); }

.about-link:hover { background: #f8fafc; }
.about-link .nav-icon { background: #f8fafc; color: #64748b; }
.about-link:hover .nav-text { color: #475569; }
.about-link:hover .nav-icon { background: #64748b; color: white; box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3); }

.contact-link:hover { background: #f0fdfa; }
.contact-link .nav-icon { background: #f0fdfa; color: #14b8a6; }
.contact-link:hover .nav-text { color: #0d9488; }
.contact-link:hover .nav-icon { background: #14b8a6; color: white; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3); }

.login-link:hover { background: #eff6ff; }
.login-link .nav-icon { background: #eff6ff; color: #3b82f6; }
.login-link:hover .nav-text { color: #2563eb; }
.login-link:hover .nav-icon { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }

.signup-link:hover { background: #f0fdf4; }
.signup-link .nav-icon { background: #f0fdf4; color: #22c55e; }
.signup-link:hover .nav-text { color: #16a34a; }
.signup-link:hover .nav-icon { background: #22c55e; color: white; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }

.logout-link:hover { background: #fef2f2 !important; }
.logout-link .nav-icon { background: #fef2f2; color: #ef4444; }
.logout-link:hover .nav-text { color: #dc2626 !important; }
.logout-link:hover .nav-icon { background: #ef4444; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }

.custom-hr {
  border: none;
  border-top: 1px dashed rgba(15, 23, 42, 0.08);
  margin: 6px 12px;
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
