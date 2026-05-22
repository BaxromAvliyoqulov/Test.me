<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <h2 class="modal-title">✨ {{ isRus ? 'Активация Кода' : 'Kodni Faollashtirish' }}</h2>
      <p class="modal-subtitle">
        {{ isRus ? 'Введите пригласительный код друга, чтобы получить стартовый бонус 20 TP Coins!' : 'Do\'stingizdan kelgan taklif kodini kiriting va 20 TP Coins bonusga ega bo\'ling!' }}
      </p>

      <div class="input-container">
        <input
          v-model="referralCode"
          :placeholder="isRus ? 'Введи 8-значный код' : '8 xonali kodni kiriting'"
          maxlength="8"
          class="referral-input"
          @input="referralCode = referralCode.toUpperCase()"
        />
      </div>

      <button @click="activateCode" class="activate-btn" :disabled="loading">
        <span v-if="loading" class="spinner-small"></span>
        <span v-else><i class="fas fa-magic"></i> {{ isRus ? 'Активировать' : 'Faollashtirish' }}</span>
      </button>

      <transition name="fade">
        <p v-if="errorMessage" class="message error">
          <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        </p>
      </transition>
      
      <transition name="fade">
        <p v-if="successMessage" class="message success">
          <i class="fas fa-check-circle"></i> {{ successMessage }}
        </p>
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

  if (!referralCode.value || referralCode.value.length !== 8) {
    errorMessage.value = isRus.value ? 'Введите корректный 8-значный код.' : 'Iltimos, to\'g\'ri 8 xonali kod kiriting.';
    loading.value = false;
    return;
  }

  try {
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const currentUserDoc = await getDoc(currentUserRef);

    if (currentUserDoc.exists() && currentUserDoc.data().referredBy) {
      errorMessage.value = isRus.value ? 'Вы уже активировали пригласительный код.' : 'Siz allaqachon taklif kodini faollashtirgansiz.';
      loading.value = false;
      return;
    }

    const q = query(
      collection(db, 'users'),
      where('referralCode', '==', referralCode.value.toUpperCase())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      errorMessage.value = isRus.value ? 'Пригласительный код не найден.' : 'Taklif kodi topilmadi.';
      loading.value = false;
      return;
    }

    const referredUserId = querySnapshot.docs[0].id;

    if (referredUserId === currentUser.uid) {
      errorMessage.value = isRus.value ? 'Вы не можете активировать собственный код.' : 'O\'zingizning taklif kodingizni faollashtira olmaysiz.';
      loading.value = false;
      return;
    }

    // Award inviter 50 points
    await updateDoc(doc(db, 'users', referredUserId), {
      points: increment(50),
    });

    // Award current user 20 points
    await updateDoc(currentUserRef, {
      referredBy: referralCode.value.toUpperCase(),
      points: increment(20),
    });

    // Log the event
    const logsRef = doc(collection(currentUserRef, 'referral-logs'));
    await setDoc(logsRef, {
      referredBy: referralCode.value.toUpperCase(),
      timestamp: new Date(),
    });

    successMessage.value = isRus.value 
      ? 'Код успешно активирован! Вы получили 20 TP Coins.' 
      : 'Taklif kodi muvaffaqiyatli faollashtirildi! Siz 20 TP Coins qo\'lga kiritdingiz.';
    
    // Clear input on success
    referralCode.value = '';
  } catch (err) {
    console.error(err);
    errorMessage.value = isRus.value ? 'Произошла непредвиденная ошибка.' : 'Kutilmagan xatolik yuz berdi.';
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
  max-width: 420px;
  text-align: center;
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
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 1.8rem;
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
  letter-spacing: 2px;
  background: #f8fafc;
  color: #1e40af;
  outline: none;
  transition: all 0.25s ease;
}

.referral-input:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
}

.referral-input::placeholder {
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0px;
  color: #94a3b8;
}

.activate-btn {
  background: #3b82f6;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.activate-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.activate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message {
  margin-top: 1.25rem;
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 8px;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.error {
  color: #b91c1c;
  background: #fee2e2;
}

.success {
  color: #047857;
  background: #dcfce7;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
