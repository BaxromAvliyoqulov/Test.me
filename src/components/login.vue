<template>
  <div class="auth-page-wrapper">
    <!-- Glowing background blobs -->
    <div class="bg-blob bg-blob-1"></div>
    <div class="bg-blob bg-blob-2"></div>
    <div class="bg-blob bg-blob-3"></div>

    <div class="auth-card">
      <!-- Left side: Brand Panel -->
      <div class="auth-brand-side">
        <div class="brand-logo" @click="router.push('/')">Test.me</div>
        
        <div class="brand-welcome-text">
          <h2>Bilim va Karyerangizni Yangi Bosqichga Olib Chiqing</h2>
          <p>DTM, Prezident maktablari, CHSB va BSB imtihonlari, shuningdek, o'qituvchilar uchun malaka oshirish, toifa olish hamda psixologik testlarning eng mukammal majmuasi sizni kutmoqda!</p>
        </div>

        <div class="brand-features-list">
          <div class="brand-feature-inline">
            <span class="feature-icon-wrapper"><i class="fas fa-brain"></i></span>
            <div><strong>Sun'iy Intellekt Tahlili:</strong> Natijalaringizni AI orqali baholang va zaif nuqtalaringizni lahzada aniqlang!</div>
          </div>
          <div class="brand-feature-inline">
            <span class="feature-icon-wrapper"><i class="fas fa-certificate"></i></span>
            <div><strong>Nufuzli Sertifikatlar:</strong> Sinovlarni muvaffaqiyatli yakunlab, o'z bilimingizni tasdiqlovchi sertifikatlarga ega bo'ling.</div>
          </div>
          <div class="brand-feature-inline">
            <span class="feature-icon-wrapper"><i class="fas fa-coins"></i></span>
            <div><strong>TP Coin va Real Sovg'alar:</strong> Test topshirib ball to'plang va ularni qimmatbaho sovg'alarga almashtiring!</div>
          </div>
        </div>

        <div class="brand-footer-stats">
          <span>DTM</span>
          <span>Prezident Maktabi</span>
          <span>CHSB & BSB</span>
          <span>Toifa & Malaka</span>
        </div>
      </div>

      <!-- Right side: Form panel -->
      <div class="auth-form-side">
        <div class="form-header">
          <h3>Tizimga kirish</h3>
          <p>Profilingizga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form" novalidate>
          <div class="input-group">
            <label for="email">Elektron pochta</label>
            <div class="input-wrapper" :class="{ 'has-error': errors.email }">
              <span class="input-icon"><i class="fas fa-envelope"></i></span>
              <input
                type="email"
                id="email"
                v-model="form.email"
                placeholder="pochta@example.com"
                :disabled="isLoading"
                @input="clearError('email')"
              />
            </div>
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <div class="input-group">
            <label for="password">Parol</label>
            <div class="input-wrapper" :class="{ 'has-error': errors.password }">
              <span class="input-icon"><i class="fas fa-lock"></i></span>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                placeholder="••••••••"
                :disabled="isLoading"
                @input="clearError('password')"
              />
              <span class="toggle-password" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </span>
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>

          <div class="form-actions-row">
            <label class="remember-me">
              <input type="checkbox" v-model="form.rememberMe" :disabled="isLoading" />
              <span class="checkmark"></span>
              Meni eslab qol
            </label>
            <a href="#" class="forgot-password-link" @click.prevent="openForgotPasswordModal">
              Parolni unutdingizmi?
            </a>
          </div>

          <button type="submit" class="auth-primary-btn" :disabled="isLoading">
            <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i> Kutmoqda...</span>
            <span v-else>Kirish</span>
          </button>

          <div class="divider">
            <span>yoki quyidagilar orqali</span>
          </div>

          <div class="google-login">
            <button @click.prevent="handleGoogleLog" type="button" class="google-btn" :disabled="isGoogleLoading">
              <span v-if="isGoogleLoading"><i class="fas fa-spinner fa-spin"></i> Kutmoqda...</span>
              <template v-else>
                <img src="../assets/img/googleIcon.svg" alt="Google Icon" />
                Google orqali kirish
              </template>
            </button>
          </div>

          <div class="auth-footer-link">
            Hisobingiz yo'qmi? 
            <router-link to="/signup"><span>Ro'yxatdan o'tish</span></router-link>
          </div>
        </form>

        <div v-if="globalError" class="error-toast">
          <i class="fas fa-exclamation-circle"></i> {{ globalError }}
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotModal" class="modal-overlay" @click.self="closeForgotPasswordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Parolni tiklash</h4>
          <button class="close-btn" @click="closeForgotPasswordModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <p>Elektron pochta manzilingizni kiriting va biz parolni tiklash havolasini yuboramiz.</p>
          <div class="input-group">
            <div class="input-wrapper" :class="{ 'has-error': resetError }">
              <span class="input-icon"><i class="fas fa-envelope"></i></span>
              <input 
                type="email" 
                v-model="resetEmail" 
                placeholder="pochta@example.com" 
                @input="resetError = ''"
              />
            </div>
            <span v-if="resetError" class="error-text">{{ resetError }}</span>
          </div>
          <button class="auth-primary-btn reset-btn" @click="handleForgotPassword" :disabled="isResetting">
            <span v-if="isResetting"><i class="fas fa-spinner fa-spin"></i> Yuborilmoqda...</span>
            <span v-else>Havolani yuborish</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../config/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();

// State
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const errors = reactive({
  email: '',
  password: ''
});

const globalError = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const isGoogleLoading = ref(false);

// Forgot Password Modal State
const showForgotModal = ref(false);
const resetEmail = ref('');
const resetError = ref('');
const isResetting = ref(false);

// Validation logic
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateForm = () => {
  let isValid = true;
  errors.email = '';
  errors.password = '';
  globalError.value = '';

  if (!form.email) {
    errors.email = "Elektron pochta manzilini kiriting.";
    isValid = false;
  } else if (!isValidEmail(form.email)) {
    errors.email = "To'g'ri elektron pochta manzilini kiriting.";
    isValid = false;
  }

  if (!form.password) {
    errors.password = "Parolni kiriting.";
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak.";
    isValid = false;
  }

  return isValid;
};

const clearError = (field) => {
  if (errors[field]) errors[field] = '';
  if (globalError.value) globalError.value = '';
};

// Handlers
const handleLogin = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  
  try {
    // Handle Remember Me persistence
    const persistenceType = form.rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);

    // Proceed with login
    const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
    
    toast.success("Tizimga muvaffaqiyatli kirdingiz!");
    router.push('/');
  } catch (error) {
    console.error("Login Error:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      globalError.value = "Elektron pochta yoki parol noto'g'ri.";
    } else if (error.code === 'auth/too-many-requests') {
       globalError.value = "Juda ko'p urinishlar. Iltimos, birozdan so'ng qayta urinib ko'ring.";
    } else {
      globalError.value = "Tizimga kirishda xatolik yuz berdi.";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLog = async () => {
  isGoogleLoading.value = true;
  globalError.value = '';
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    toast.success("Google orqali kirish muvaffaqiyatli!");
    router.push('/');
  } catch (error) {
    console.error('Google Auth Error:', error);
    globalError.value = "Google orqali kirish bekor qilindi yoki xatolik yuz berdi.";
  } finally {
    isGoogleLoading.value = false;
  }
};

// Forgot Password logic
const openForgotPasswordModal = () => {
  resetEmail.value = form.email; // Pre-fill if email is already typed
  resetError.value = '';
  showForgotModal.value = true;
};

const closeForgotPasswordModal = () => {
  showForgotModal.value = false;
  resetEmail.value = '';
  resetError.value = '';
};

const handleForgotPassword = async () => {
  if (!resetEmail.value) {
    resetError.value = "Pochtani kiriting.";
    return;
  }
  if (!isValidEmail(resetEmail.value)) {
    resetError.value = "To'g'ri pochta manzilini kiriting.";
    return;
  }

  isResetting.value = true;
  resetError.value = '';

  try {
    await sendPasswordResetEmail(auth, resetEmail.value);
    toast.success("Parolni tiklash havolasi pochtangizga yuborildi!");
    closeForgotPasswordModal();
  } catch (error) {
    console.error("Reset Password Error:", error);
    if (error.code === 'auth/user-not-found') {
      resetError.value = "Bunday foydalanuvchi topilmadi.";
    } else {
      resetError.value = "Havola yuborishda xatolik yuz berdi.";
    }
  } finally {
    isResetting.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
}

.auth-page-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 1.5rem;
}

/* Glowing background blobs */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.15;
}
.bg-blob-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #3b82f6 0%, #bfdbfe 100%);
  top: -10%;
  left: -10%;
}
.bg-blob-2 {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, #8b5cf6 0%, #ddd6fe 100%);
  bottom: -10%;
  right: -10%;
}
.bg-blob-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #ec4899 0%, #fbcfe8 100%);
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.auth-card {
  position: relative;
  z-index: 10;
  display: flex;
  width: 960px;
  max-width: 100%;
  height: 620px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 50px -15px rgba(15, 23, 42, 0.08);
}

/* Left Brand Panel */
.auth-brand-side {
  flex: 1.1;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.brand-logo {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -1.5px;
  color: #ffffff;
  cursor: pointer;
}

.brand-welcome-text h2 {
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 0.8rem;
  line-height: 1.3;
  letter-spacing: -0.5px;
  color: #ffffff;
}

.brand-welcome-text p {
  color: #bfdbfe;
  font-size: 0.92rem;
  line-height: 1.5;
  font-weight: 400;
  margin: 0;
}

.brand-features-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.brand-feature-inline {
  display: flex;
  gap: 0.8rem;
  font-size: 0.86rem;
  line-height: 1.4;
  color: #dbeafe;
}

.brand-feature-inline strong {
  color: white;
}

.feature-icon-wrapper {
  color: #93c5fd;
  font-size: 1.1rem;
  min-width: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.brand-footer-stats {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.brand-footer-stats span {
  font-size: 0.72rem;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.65rem;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Right Form Panel */
.auth-form-side {
  flex: 1;
  padding: 2.2rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  overflow-y: auto;
}

.form-header h3 {
  font-size: 1.7rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.3rem 0;
  letter-spacing: -0.5px;
}

.form-header p {
  color: #64748b;
  font-size: 0.88rem;
  margin: 0 0 1.5rem 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.input-group label {
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #64748b;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.input-wrapper input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.8rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-wrapper input:focus + .input-icon {
  color: #3b82f6;
}

/* Error States */
.input-wrapper.has-error input {
  border-color: #ef4444;
  background: #fef2f2;
}
.input-wrapper.has-error input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.input-wrapper.has-error .input-icon {
  color: #ef4444;
}
.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.2rem;
  margin-left: 0.2rem;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.3s ease;
}
.toggle-password:hover {
  color: #0f172a;
}

.form-actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.2rem;
  font-size: 0.85rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #475569;
  cursor: pointer;
  font-weight: 500;
}

.remember-me input {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.forgot-password-link {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}
.forgot-password-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.auth-primary-btn {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.auth-primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
  background: linear-gradient(to right, #2563eb, #1d4ed8);
}
.auth-primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0.1rem 0;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}
.divider:not(:empty):before {
  margin-right: 0.8rem;
}
.divider:not(:empty):after {
  margin-left: 0.8rem;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.7rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.google-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: translateY(-1px);
}
.google-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.google-btn img {
  width: 18px;
  height: 18px;
}

.auth-footer-link {
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 0.4rem;
}

.auth-footer-link span {
  color: #2563eb;
  font-weight: 700;
  margin-left: 0.25rem;
}
.auth-footer-link span:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.error-toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.7rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  margin-top: 1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}
.modal-header h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}
.close-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
}
.modal-body p {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.reset-btn {
  width: 100%;
  margin-top: 1.5rem;
}

/* Responsive queries */
@media (max-width: 900px) {
  .auth-card {
    flex-direction: column;
    width: 460px;
    height: auto;
  }
  .auth-brand-side {
    padding: 2.5rem;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  .brand-welcome-text h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  .brand-footer-stats {
    margin-top: 1.5rem;
  }
  .auth-form-side {
    padding: 2.5rem;
    overflow-y: visible;
  }
}

@media (max-width: 520px) {
  .auth-page-wrapper {
    padding: 1rem;
  }
  .auth-card {
    width: 100%;
    border-radius: 20px;
  }
  .auth-brand-side {
    padding: 2rem;
  }
  .auth-form-side {
    padding: 2rem 1.5rem;
  }
  .form-actions-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
}
</style>
