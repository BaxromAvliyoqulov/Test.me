<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-label="Your Referral Code"
    >
      <button class="close-btn" @click="emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <h2 class="modal-title">🎁 {{ isRus ? 'Пригласи Друга' : 'Do\'stlarni taklif etish' }}</h2>
      <p class="modal-subtitle">
        {{ isRus ? 'Поделитесь кодом с друзьями и получите по 50 TP Coins за каждого приглашенного!' : 'Kodni do\'stlaringiz bilan ulashing va har bir faol taklif uchun 50 TP Coins qo\'lga kiriting!' }}
      </p>

      <div class="code-box">
        <input :value="referralCode" readonly aria-label="Referral Code" />
        <button @click="copyCode" class="copy-btn" :title="isRus ? 'Копировать' : 'Nusxa olish'">
          <i class="fas fa-copy"></i>
        </button>
      </div>

      <div class="share-actions">
        <a 
          :href="telegramShareUrl" 
          target="_blank" 
          class="share-btn telegram-btn"
        >
          <i class="fab fa-telegram-plane"></i>
          {{ isRus ? 'Поделиться в Telegram' : 'Telegram orqali ulashish' }}
        </a>
      </div>

      <p class="info-text">
        {{ isRus ? 'Ваш друг получит 20 TP Coins при регистрации, а вы — 50 TP Coins после активации его кода.' : 'Do\'stingiz ro\'yxatdan o\'tganda 20 TP Coins oladi, kod faollashtirilgach esa sizga 50 TP Coins taqdim etiladi.' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getAuth } from 'firebase/auth';
import { useToast } from 'vue-toastification';
import { useI18n } from '@/utils/i18n';

const emit = defineEmits(['close']);
const toast = useToast();
const { locale } = useI18n();
const user = getAuth().currentUser;

const isRus = computed(() => locale.value === 'RUS');

const referralCode = computed(() => {
  return user ? user.uid.slice(0, 8).toUpperCase() : '';
});

const telegramShareUrl = computed(() => {
  const code = referralCode.value;
  const baseUrl = `https://testme.uz/signup?ref=${code}`;
  const text = isRus.value
    ? `Зарегистрируйтесь на платформе Test.me, решайте тесты и проверяйте свои знания с помощью ИИ! Мой пригласительный код: ${code}`
    : `Test.me platformasida ro'yxatdan o'ting, testlarni yeching va bilimingizni AI orqali sinab ko'ring! Mening taklif kodim: ${code}`;
  
  return `https://t.me/share/url?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`;
});

function copyCode() {
  navigator.clipboard.writeText(referralCode.value);
  toast.success(isRus.value ? 'Код успешно скопирован в буфер обмена!' : 'Referral kodi clipboardga ko\'chirildi!');
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
  max-width: 440px;
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
  margin-bottom: 2rem;
}

.code-box {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.code-box input {
  font-size: 1.4rem;
  font-weight: 800;
  text-align: center;
  padding: 12px 16px;
  border: 2px solid #a7f3d0;
  border-radius: 12px;
  background: #f0fdf4;
  color: #047857;
  width: 100%;
  max-width: 220px;
  letter-spacing: 2px;
  outline: none;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.05);
  transition: all 0.25s ease;
}

.code-box input:focus {
  border-color: #10b981;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);
}

.copy-btn {
  background: #10b981;
  color: white;
  font-size: 1.1rem;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.copy-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.share-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 280px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
}

.telegram-btn {
  background: linear-gradient(135deg, #0088cc 0%, #24a1de 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(36, 161, 222, 0.3);
}

.telegram-btn:hover {
  background: linear-gradient(135deg, #0077b5 0%, #1e8fc2 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(36, 161, 222, 0.4);
}

.info-text {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.25rem;
  margin: 0;
}
</style>
