<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-label="Referred Users List"
    >
      <button class="close-btn" @click="emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <h2 class="modal-title">
        <i class="fas fa-users"></i> 
        {{ isRus ? 'Приглашенные друзья' : 'Taklif qilingan do\'stlar' }}
      </h2>
      <p class="modal-subtitle">
        {{ isRus ? 'Список пользователей, которые зарегистрировались по вашему коду' : 'Sizning taklif kodingiz orqali ro\'yxatdan o\'tgan foydalanuvchilar ro\'yxati' }}
      </p>

      <div v-if="loading" class="status-loading">
        <div class="spinner"></div>
        <p>{{ isRus ? 'Загрузка...' : 'Yuklanmoqda...' }}</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-referrals">
        <div class="empty-icon"><i class="fas fa-user-friends"></i></div>
        <p>{{ isRus ? 'Вы пока не пригласили друзей. Поделитесь кодом, чтобы заработать TP Coins!' : 'Sizda hozircha taklif qilingan do\'stlar mavjud emas. TP Coin olish uchun kodingizni ulashing!' }}</p>
      </div>

      <div v-else class="user-list-container">
        <div class="user-cards-grid">
          <div v-for="referredUser in users" :key="referredUser.uid" class="user-card">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-meta">
              <h4>{{ referredUser.displayName || (isRus ? 'Без имени' : 'Ism kiritilmagan') }}</h4>
              <p class="user-email"><i class="fas fa-envelope"></i> {{ referredUser.email }}</p>
              <p class="user-date"><i class="fas fa-calendar-alt"></i> {{ isRus ? 'Регистрация' : 'Ro\'yxatdan o\'tdi' }}: {{ formatDate(referredUser.createdAt) }}</p>
            </div>
            <div class="user-status-badge">
              <span class="status-badge"><i class="fas fa-check-circle"></i> Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { useI18n } from '@/utils/i18n';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

const emit = defineEmits(['close']);
const { locale } = useI18n();
const users = ref([]);
const loading = ref(true);

const isRus = computed(() => locale.value === 'RUS');

onMounted(async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const myReferralCode = userSnap.data()?.referralCode;

    if (!myReferralCode) {
      loading.value = false;
      return;
    }

    const q = query(
      collection(db, 'users'),
      where('referredBy', '==', myReferralCode)
    );
    const snap = await getDocs(q);
    users.value = snap.docs.map((doc) => ({ ...doc.data(), uid: doc.id }));
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

function formatDate(ts) {
  if (!ts) return isRus.value ? 'Неизвестно' : 'Noma\'lum';
  let date;
  if (ts.seconds) {
    date = new Date(ts.seconds * 1000);
  } else {
    date = new Date(ts);
  }
  return date.toLocaleDateString(locale.value === 'RUS' ? 'ru-RU' : 'uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  background: #ffffff;
  padding: 2.5rem 2rem;
  border-radius: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1000;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.5;
}

.status-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 12px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-loading p {
  font-size: 0.9rem;
  color: #64748b;
}

.empty-referrals {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  font-size: 2.8rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.empty-referrals p {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 360px;
  margin: 0 auto;
}

.user-list-container {
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 4px;
}

.user-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 18px;
  transition: all 0.2s;
}

.user-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  border: 1px solid #dbeafe;
}

.user-meta {
  flex-grow: 1;
  text-align: left;
}

.user-meta h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.user-email, .user-date {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 0 2px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-status-badge {
  flex-shrink: 0;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #15803d;
  background: #dcfce7;
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
