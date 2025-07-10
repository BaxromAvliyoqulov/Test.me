<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">Username:</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            autofocus
          />
        </div>
        <div class="input-group">
          <label for="password">Password:</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              required
            />
            <span class="toggle-password" @click="togglePasswordVisibility">
              <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </span>
          </div>
        </div>
        <button type="submit" class="login-button">Login</button>
        <div class="google-login">
          <button @click.prevent="handleGoogleLog" type="button">
            <img src="../assets/img/googleIcon.svg" alt="Google Icon" />
            Continue with Google
          </button>
        </div>
        <div class="link-button">
          <router-link to="/SignUp"
            >Don't have an account? <span>Sign up</span></router-link
          >
        </div>
      </form>

      <!-- Xatoliklarni ko'rsatish -->
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../config/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';

export default {
  setup() {
    const router = useRouter();
    const errorMessage = ref('');
    const successMessage = ref('');

    return {
      errorMessage,
      successMessage,
      router,
    };
  },
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      showPassword: false,
    };
  },
  methods: {
    handleLogin() {
      const { username, password } = this.form;

      // Firebase bilan login
      signInWithEmailAndPassword(auth, username, password)
        .then((userCredential) => {
          // Login muvaffaqiyatli
          const user = userCredential.user;
          console.log('Login successful:', user);
          // Redirect to the home page
          this.router.push('/');
        })
        .catch((error) => {
          // Xatolik yuz bersa, xato xabarini ko'rsatish
          this.errorMessage =
            'Username or password is incorrect. Please try again.';
          console.error('Login failed:', error.message);
        });
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async handleGoogleLog() {
      try {
        // Google provider yaratish
        const provider = new GoogleAuthProvider();

        // Google loginni pop-up tarzda ochish
        const result = await signInWithPopup(auth, provider);

        // Agar login muvaffaqiyatli bo'lsa
        console.log('Google Log In successful:', result.user);
        // Success xabarini ko'rsatish
        this.successMessage = 'Google login successful!';
        // Home sahifasiga yo'naltirish
        this.router.push('/');
      } catch (error) {
        // Xatolik yuz bersa
        console.error('Google LogIn failed:', error.message);
        this.errorMessage = 'Google login error. Please try again.';
      }
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: white;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  transition: border 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.input-group input:focus {
  border-color: #1e3c72;
  outline: none;
  box-shadow: 0 0 5px rgba(30, 60, 114, 0.5);
}

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #0056b3;
}

.google-login {
  margin-top: 20px;
}

.google-login button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
}

.google-login button:hover {
  background-color: #f8f8f8;
  border-color: #999;
}

.google-login img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.link-button {
  margin-top: 20px;
  text-align: center;
}

.link-button a {
  color: #333;
  text-decoration: none;
}

.link-button span {
  color: #007bff;
  font-weight: bold;
}

/* Error message style */
.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: center;
}

/* Responsive styles */
@media (max-width: 480px) {
  .login-box {
    padding: 20px;
  }

  .input-group input {
    padding: 10px;
  }

  .login-button {
    padding: 10px;
  }
}

@media (max-width: 320px) {
  .login-box {
    padding: 15px;
  }

  .login-title {
    font-size: 20px;
  }

  .input-group {
    margin-bottom: 15px;
  }
}
</style>
