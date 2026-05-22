<template>
  <div class="auth-page-wrapper">
    <!-- Glowing background blobs (Soft pastel colors for light mode) -->
    <div class="bg-blob bg-blob-1"></div>
    <div class="bg-blob bg-blob-2"></div>
    <div class="bg-blob bg-blob-3"></div>

    <div class="auth-card">
      <!-- Left side: Minimalist Professional Branding Panel (Clean Royal/Sky Blue Gradient) -->
      <div class="auth-brand-side">
        <div class="brand-logo" @click="router.push('/')">Test.me</div>
        
        <div class="brand-welcome-text">
          <h2>Bilim va Karyerangizni Yangi Bosqichga Olib Chiqing</h2>
          <p>DTM, Prezident maktablari, CHSB va BSB imtihonlari, shuningdek, o'qituvchilar uchun malaka oshirish, toifa olish hamda psixologik testlarning eng mukammal majmuasi sizni kutmoqda!</p>
        </div>

        <div class="brand-features-list">
          <div class="brand-feature-inline">
            <span class="feature-icon-wrapper"><i class="fas fa-brain"></i></span>
            <div>
              <strong>Sun'iy Intellekt Tahlili:</strong> Natijalaringizni AI orqali baholang va zaif nuqtalaringizni lahzada aniqlang!
            </div>
          </div>
          <div class="brand-feature-inline">
            <span class="feature-icon-wrapper"><i class="fas fa-certificate"></i></span>
            <div>
              <strong>Nufuzli Sertifikatlar:</strong> Sinovlarni muvaffaqiyatli yakunlab, o'z bilimingizni tasdiqlovchi sertifikatlarga ega bo'ling.
            </div>
          </div>
          <div class="brand-feature-inline">
            <span class="feature-icon-wrapper"><i class="fas fa-coins"></i></span>
            <div>
              <strong>TP Coin va Real Sovg'alar:</strong> Test topshirib ball to'plang va ularni qimmatbaho sovg'alarga almashtiring!
            </div>
          </div>
        </div>

        <div class="brand-footer-stats">
          <span>DTM</span>
          <span>Prezident Maktabi</span>
          <span>CHSB & BSB</span>
          <span>Toifa & Malaka</span>
        </div>
      </div>

      <!-- Right side: Form panel (Clean White/Light Theme in Uzbek) -->
      <div class="auth-form-side">
        <div class="form-header">
          <h3>Hisob yaratish</h3>
          <p>Platformadan to'liq foydalanish uchun ro'yxatdan o'ting</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="input-group">
            <label for="username">Foydalanuvchi nomi</label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-user"></i></span>
              <input
                type="text"
                id="username"
                v-model="username"
                placeholder="foydalanuvchi nomi"
                required
                autofocus
              />
            </div>
          </div>

          <div class="input-group">
            <label for="email">Elektron pochta</label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-envelope"></i></span>
              <input
                type="email"
                id="email"
                v-model="email"
                placeholder="pochta@example.com"
                required
              />
            </div>
          </div>

          <div class="input-group">
            <label for="password">Parol</label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-lock"></i></span>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="••••••••"
                required
                maxlength="10"
              />
              <span class="toggle-password" @click="togglePasswordVisibility">
                <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </span>
            </div>
          </div>

          <button type="submit" class="auth-primary-btn">Ro'yxatdan o'tish</button>

          <div class="divider">
            <span>yoki quyidagilar orqali</span>
          </div>

          <div class="google-signup">
            <button @click.prevent="handleGoogleSignUp" type="button" class="google-btn">
              <img src="../assets/img/googleIcon.svg" alt="Google Icon" />
              Google orqali ro'yxatdan o'tish
            </button>
          </div>

          <div class="auth-footer-link">
            Avval ro'yxatdan o'tganmisiz? 
            <router-link to="/login"><span>Tizimga kirish</span></router-link>
          </div>
        </form>

        <div v-if="errorMessage" class="error-toast">
          <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from 'vue-toastification';

export default {
  name: 'Signup',
  setup() {
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const router = useRouter();
    const toast = useToast();

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const handleSubmit = async () => {
      errorMessage.value = '';
      successMessage.value = '';

      if (!email.value || !password.value || !username.value) {
        errorMessage.value = 'Barcha maydonlarni to\'ldirish shart.';
        toast.error('Barcha maydonlarni to\'ldirish shart.');
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.value,
          password.value
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: username.value,
        });

        await setDoc(doc(db, 'users', user.uid), {
          displayName: username.value,
          email: user.email,
          points: 0,
          referralCode: user.uid.slice(0, 8).toUpperCase(),
          createdAt: new Date(),
        });

        successMessage.value = 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz!';
        toast.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
        console.log('Firebase Auth User ID:', user.uid);
        router.push('/');
      } catch (error) {
        errorMessage.value = error.message;
        toast.error(error.message);
      }
    };

    const handleGoogleSignUp = async () => {
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName || 'Anonymous',
          email: user.email,
          points: 0,
          referralCode: user.uid.slice(0, 8).toUpperCase(),
          createdAt: new Date(),
        });

        successMessage.value = 'Google orqali ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!';
        toast.success('Google orqali ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!');
        router.push('/');
      } catch (error) {
        errorMessage.value = 'Xatolik yuz berdi: ' + error.message;
        toast.error(errorMessage.value);
        console.error(error);
      }
    };

    return {
      username,
      email,
      password,
      showPassword,
      togglePasswordVisibility,
      handleSubmit,
      handleGoogleSignUp,
      errorMessage,
      successMessage,
      router,
    };
  },
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

/* Glowing background blobs (light subtle colors) */
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

/* Left Brand Panel (Keep high contrast clean gradient for text visibility) */
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

/* Right Form Panel (Clean Light Mode) */
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
}

.auth-primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
  background: linear-gradient(to right, #2563eb, #1d4ed8);
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
.divider:not(:empty)::before {
  margin-right: 0.8rem;
}
.divider:not(:empty)::after {
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

.google-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: translateY(-1px);
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
}
</style>
