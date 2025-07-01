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
        alt="User Avatar"
      />
      <div v-if="dropdownOpen" class="dropdown-content">
        <div class="user-info" v-if="username">
          <img
            :src="profileImage"
            class="dropdown-profile-image"
            alt="User Avatar"
          />
          <router-link to="/editProfile" class="dropdown-username">{{
            username
          }}</router-link>
        </div>
        <router-link to="/">
          <i class="fas fa-home"></i>
          Home
        </router-link>
        <div class="dropdown-links">
          <router-link to="/points">
            <img
              src="../assets/img/tpCoin.png"
              alt="TP Coin"
              style="width: 16px; height: 16px; margin-right: 5px"
            />
            Points
          </router-link>
          <router-link to="/about">
            <i class="fas fa-info-circle"></i>
            About Us
          </router-link>
          <router-link to="/contactUs">
            <i class="fas fa-envelope"></i>
            Contact Us
          </router-link>
          <router-link to="/dashboard">
            <i class="fas fa-chart-line"></i>
            Dashboard
          </router-link>
          <hr class="custom-hr" />
          <router-link to="/login" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            Log Out
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import defaultUserImage from '../assets/img/user.png';

export default {
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
  padding: 0 30px;
  max-width: 1200px;
  width: 90%;
  height: 70px;
  margin: 15px auto;
  background: linear-gradient(145deg, #0056b3, #007bff);
  color: white;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3),
    -4px -4px 10px rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.navbar h1 {
  margin: 0;
  font-size: 26px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.profile {
  position: relative;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-image:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dropdown-content {
  position: absolute;
  top: 50px;
  right: 0;
  min-width: 220px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.dropdown-profile-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.dropdown-username {
  font-weight: 600;
  color: #333;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.dropdown-links {
  padding: 10px 0;
}

.dropdown-content a {
  display: block;
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dropdown-content a:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

.custom-hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 5px 0;
}

.custom-hr::after {
  content: '';
  display: block;
  height: 1px;
  background: linear-gradient(to right, #007bff, #0056b3);
  margin-top: -1px;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .navbar {
    padding: 0 15px;
    height: 60px;
    width: 95%;
    margin: 0 auto;
  }

  .navbar h1 {
    font-size: 22px;
  }

  .profile-image {
    width: 35px;
    height: 35px;
  }

  .dropdown-content {
    right: 0;
    min-width: 200px;
  }

  .dropdown-username {
    font-size: 14px;
  }
}

@media screen and (max-width: 480px) {
  .navbar {
    padding: 0 10px;
    height: 50px;
    width: 90%;
    margin: 10px auto;
  }

  .navbar h1 {
    font-size: 18px;
  }

  .profile-image {
    width: 30px;
    height: 30px;
  }

  .dropdown-content {
    right: -10px;
    min-width: 180px;
  }

  .dropdown-content a {
    font-size: 14px;
    padding: 8px 12px;
  }

  .user-info {
    padding: 10px;
  }

  .dropdown-profile-image {
    width: 30px;
    height: 30px;
  }
}

@media screen and (max-width: 320px) {
  .navbar {
    padding: 0 8px;
    height: 45px;
    width: 95%;
  }

  .navbar h1 {
    font-size: 16px;
  }

  .profile-image {
    width: 28px;
    height: 28px;
  }

  .dropdown-content {
    right: -15px;
    min-width: 160px;
  }

  .dropdown-content a {
    font-size: 13px;
    padding: 6px 10px;
  }

  .dropdown-profile-image {
    width: 24px;
    height: 24px;
  }

  .dropdown-username {
    font-size: 13px;
  }
}
</style>
