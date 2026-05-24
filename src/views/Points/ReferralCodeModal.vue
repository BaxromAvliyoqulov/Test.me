<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <div class="modal-icon-header">
        <div class="icon-ring">
          <i class="fas fa-gift"></i>
        </div>
      </div>

      <h2 class="modal-title">✨ {{ isRus ? 'Активация Кода' : 'Kodni Faollashtirish' }}</h2>
      <p class="modal-subtitle">
        {{ isRus 
          ? 'Введите пригласительный код друга — вы оба получите по 50 TP Coins!' 
          : 'Do\'stingizdan kelgan taklif kodini kiriting — ikkalingiz ham 50 TP Coins olasiz!' 
        }}
      </p>

      <!-- Bonus info chips -->
      <div class="bonus-chips">
        <div class="bonus-chip you-chip">
          <i class="fas fa-user-check"></i>
          <span>{{ isRus ? 'Вы получите' : 'Siz olasiz' }}: <strong>+50 TP</strong></span>
        </div>
        <div class="bonus-chip friend-chip">
          <i class="fas fa-user-friends"></i>
          <span>{{ isRus ? 'Друг получит' : 'Do\'stingiz oladi' }}: <strong>+50 TP</strong></span>
        </div>
      </div>

      <div class="input-container">
        <input
          v-model="referralCode"
          :placeholder="isRus ? 'Введи 8-значный код' : '8 xonali kodni kiriting'"
          maxlength="8"
          class="referral-input"
          :disabled="loading || !!successMessage"
          @input="referralCode = referralCode.toUpperCase(); errorMessage = ''"
        />
      </div>

      <button 
        @click="activateCode" 
        class="activate-btn" 
        :disabled="loading || !!successMessage || referralCode.length < 8"
      >
        <span v-if="loading" class="spinner-small"></span>
        <span v-else-if="successMessage">
          <i class="fas fa-check"></i> {{ isRus ? 'Активировано!' : 'Faollashtirildi!' }}
        </span>
        <span v-else>
          <i class="fas fa-magic"></i> {{ isRus ? 'Активировать' : 'Faollashtirish' }}
        </span>
      </button>

      <transition name="fade">
        <div v-if="errorMessage" class="message error">
          <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        </div>
      </transition>
      
      <transition name="fade">
        <div v-if="successMessage" class="message success">
          <i class="fas fa-check-circle"></i> {{ successMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { useI18n } from '@/utils/i18n';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

const emit = defineEmits(['close']);
const { locale } = useI18n();

const referralCode = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

const isRus = computed(() => locale.value === 'RUS');

const activateCode = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    errorMessage.value = isRus.value ? 'Войдите в аккаунт.' : 'Iltimos, avval tizimga kiring.';
    loading.value = false;
    return;
  }

  const code = referralCode.value.trim().toUpperCase();

  if (!code || code.length !== 8) {
    errorMessage.value = isRus.value
      ? 'Введите корректный 8-значный код.'
      : 'Iltimos, to\'g\'ri 8 xonali kod kiriting.';
    loading.value = false;
    return;
  }

  try {
    // 1. Check if current user already activated a referral code
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const currentUserDoc = await getDoc(currentUserRef);

    if (!currentUserDoc.exists()) {
      errorMessage.value = isRus.value ? 'Профиль не найден.' : 'Profil topilmadi.';
      loading.value = false;
      return;
    }

    if (currentUserDoc.data().referredBy) {
      errorMessage.value = isRus.value
        ? 'Вы уже активировали пригласительный код.'
        : 'Siz allaqachon taklif kodini faollashtirgansiz.';
      loading.value = false;
      return;
    }

    // 2. Find the referrer by their referral code
    const q = query(
      collection(db, 'users'),
      where('referralCode', '==', code)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      errorMessage.value = isRus.value
        ? 'Пригласительный код не найден.'
        : 'Taklif kodi topilmadi.';
      loading.value = false;
      return;
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;

    // 3. Prevent self-referral
    if (referrerId === currentUser.uid) {
      errorMessage.value = isRus.value
        ? 'Вы не можете активировать собственный код.'
        : 'O\'zingizning taklif kodingizni faollashtira olmaysiz.';
      loading.value = false;
      return;
    }

    // 4. Award referrer (taklif qilgan kishi): +50 TP
    const referrerRef = doc(db, 'users', referrerId);
    await updateDoc(referrerRef, {
      points: increment(50),
    });

    // Log referrer transaction
    const referrerTxRef = collection(referrerRef, 'transactions');
    await setDoc(doc(referrerTxRef), {
      action: isRus.value
        ? `Реферальный бонус: код активирован другом`
        : `Referral bonusi: do'st kodni faollashtirdi`,
      points: 50,
      timestamp: Timestamp.now(),
    });

    // 5. Award current user (taklif qilingan): +50 TP & mark as referred
    await updateDoc(currentUserRef, {
      points: increment(50),
      referredBy: code,
    });

    // Log invited user transaction
    const invitedTxRef = collection(currentUserRef, 'transactions');
    await setDoc(doc(invitedTxRef), {
      action: isRus.value
        ? `Бонус за регистрацию по реферальной ссылке`
        : `Taklif kodi orqali ro'yxatdan o'tish bonusi`,
      points: 50,
      timestamp: Timestamp.now(),
    });

    // Log referral event for current user (for audit trail)
    const referralLogRef = collection(currentUserRef, 'referral-logs');
    await setDoc(doc(referralLogRef), {
      referredBy: code,
      referrerId: referrerId,
      timestamp: Timestamp.now(),
    });

    successMessage.value = isRus.value
      ? '🎉 Код успешно активирован! Вы и ваш друг получили по 50 TP Coins!'
      : '🎉 Taklif kodi muvaffaqiyatli faollashtirildi! Siz va do\'stingiz 50 TP Coins oldingiz!';

    referralCode.value = '';

  } catch (err) {
    console.error('Referral activation error:', err);
    errorMessage.value = isRus.value
      ? 'Произошла непредвиденная ошибка: ' + err.message
      : 'Kutilmagan xatolik yuz berdi: ' + err.message;
  } finally {
    loading.value = false;
  }
};
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
  max-width: 440px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
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
}
.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Icon Header */
.modal-icon-header {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}
.icon-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #2563eb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

/* Bonus chips */
.bonus-chips {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.bonus-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 99px;
  font-size: 0.82rem;
  font-weight: 600;
}
.you-chip {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.friend-chip {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.bonus-chip strong {
  font-weight: 800;
}

.input-container {
  margin-bottom: 1.25rem;
}

.referral-input {
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
  padding: 14px 16px;
  font-size: 1.25rem;
  font-weight: 800;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  text-align: center;
  letter-spacing: 3px;
  background: #f8fafc;
  color: #1e40af;
  outline: none;
  transition: all 0.25s ease;
  font-family: 'Courier New', monospace;
}
.referral-input:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
}
.referral-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.referral-input::placeholder {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0;
  color: #94a3b8;
  font-family: inherit;
}

.activate-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  border-radius: 12px;
  padding: 13px 28px;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  font-family: inherit;
}
.activate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}
.activate-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.message {
  margin-top: 1.25rem;
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  animation: slideIn 0.2s ease;
  line-height: 1.5;
  text-align: left;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-5px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.error {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.success {
  color: #047857;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
