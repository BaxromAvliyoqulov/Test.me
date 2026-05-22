<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <h2 class="modal-title">
        <img src="../../assets/img/tpCoin.png" alt="TP Coin" class="title-icon animate-bounce-slow" />
        {{ isRus ? 'Пополнение TP Coins' : 'TP Coin sotib olish' }}
      </h2>
      <p class="modal-subtitle">
        {{ isRus ? 'Выберите подходящий пакет и мгновенно пополните баланс!' : 'Mos keluvchi paketni tanlang va balansingizni bir zumda to\'ldiring!' }}
      </p>

      <div class="packages-grid">
        <div
          class="package-card"
          v-for="option in options"
          :key="option.id"
          :class="{ selected: selected?.id === option.id }"
          @click="selectOption(option)"
        >
          <div class="package-icon-wrapper">
            <img src="../../assets/img/tpCoin.png" alt="TP Coin" />
          </div>
          <h3 class="points-val">{{ option.points }} TP</h3>
          <p class="price-val">{{ formatPrice(option.price) }}</p>
          <span v-if="option.bonus" class="bonus-tag">
            🎁 +{{ option.bonus }}% Bonus
          </span>
        </div>
      </div>

      <div class="checkout-section" v-if="selected">
        <p class="selection-text">
          {{ isRus ? 'Вы выбрали' : 'Siz tanladingiz' }}: 
          <strong>{{ selected.points }} TP Coins</strong> 
          {{ isRus ? 'za' : 'narxi' }} 
          <span class="price-badge">{{ formatPrice(selected.price) }}</span>
        </p>
        <button class="checkout-btn" @click="simulatePurchase">
          <i class="fas fa-credit-card"></i> 
          {{ isRus ? 'Купить сейчас' : 'Sotib olish' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';
import { doc, updateDoc, increment, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useI18n } from '@/utils/i18n';

const emit = defineEmits(['close']);
const toast = useToast();
const { locale } = useI18n();

const selected = ref(null);

const isRus = computed(() => locale.value === 'RUS');

const formatPrice = (price) => {
  return price.toLocaleString(locale.value === 'RUS' ? 'ru-RU' : 'uz-UZ') + (isRus.value ? ' сум' : " so'm");
};

const options = [
  { id: 0, points: 250, price: 35000, bonus: 0 },
  { id: 1, points: 500, price: 55000, bonus: 0 },
  { id: 2, points: 1000, price: 90000, bonus: 10 },
  { id: 3, points: 2000, price: 200000, bonus: 20 },
];

const selectOption = (option) => {
  selected.value = option;
};

const simulatePurchase = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    toast.error(isRus.value ? "Войдите, чтобы совершить покупку." : "Xarid qilish uchun tizimga kirishingiz kerak.");
    return;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const bonusMultiplier = 1 + (selected.value.bonus / 100);
    const earnedPoints = Math.round(selected.value.points * bonusMultiplier);

    // Update user points
    await updateDoc(userDocRef, {
      points: increment(earnedPoints)
    });

    // Record transaction
    const txRef = collection(userDocRef, 'transactions');
    await addDoc(txRef, {
      action: isRus.value 
        ? `Покупка ${selected.value.points} TP Coins (+${selected.value.bonus}% Бонус)`
        : `Sotib olindi ${selected.value.points} TP Coins (+${selected.value.bonus}% Bonus)`,
      points: earnedPoints,
      timestamp: Timestamp.now()
    });

    toast.success(isRus.value ? `Баланс успешно пополнен на ${earnedPoints} TP Coins!` : `${earnedPoints} TP Coins balansingizga muvaffaqiyatli qo'shildi!`);
    emit('close');
  } catch (error) {
    console.error("Purchase error:", error);
    toast.error(isRus.value ? "Ошибка при проведении платежа: " : "To'lovni amalga oshirishda xatolik: " + error.message);
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
  max-width: 600px;
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
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.title-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.modal-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 2.2rem;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.2rem;
}

.package-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  padding: 1.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
}

.package-card:hover {
  border-color: #3b82f6;
  background: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -8px rgba(37, 99, 235, 0.1);
}

.package-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 10px 25px -8px rgba(37, 99, 235, 0.15);
}

.package-icon-wrapper img {
  width: 48px;
  height: 48px;
  margin-bottom: 0.75rem;
  object-fit: contain;
}

.points-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.price-val {
  margin-top: 0.25rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #2563eb;
}

.bonus-tag {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #10b981;
  color: #fff;
  padding: 4px 10px;
  font-size: 0.72rem;
  border-radius: 20px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.checkout-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.selection-text {
  font-size: 0.95rem;
  color: #475569;
  margin-bottom: 1.25rem;
}

.price-badge {
  color: #16a34a;
  font-weight: 800;
  font-size: 1.1rem;
}

.checkout-btn {
  background: #3b82f6;
  color: white;
  font-weight: 700;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.checkout-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.35);
}

@media (max-width: 480px) {
  .packages-grid {
    grid-template-columns: 1fr;
  }
}
</style>
