<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="gift-modal-card animate-pop-in">
      <div class="modal-header">
        <div class="gift-icon-box">🎁</div>
        <div>
          <h3>Do'stga TP Coin Sovg'a Qilish</h3>
          <p class="subtitle">Do'stingizni yangi cho'qqilarga erishishi uchun tangalar bilan qo'llab-quvvatlang!</p>
        </div>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Recipient Card -->
        <div class="recipient-info">
          <div class="recipient-avatar">
            {{ (friend?.displayName || friend?.email || 'U').charAt(0).toUpperCase() }}
          </div>
          <div>
            <div class="recipient-name">{{ friend?.displayName || friend?.email }}</div>
            <div class="recipient-sub">Qabul qiluvchi do'stingiz</div>
          </div>
        </div>

        <!-- Current Balance Bar -->
        <div class="balance-bar">
          <span>Sizning hisobingiz:</span>
          <strong><i class="fas fa-coins text-warning"></i> {{ (currentUserPoints || 0).toLocaleString() }} TP</strong>
        </div>

        <!-- Gift Amounts -->
        <div class="form-group">
          <label class="form-label">Sovg'a miqdori (TP Coin):</label>
          <div class="amount-cards">
            <button 
              v-for="amt in [25, 50, 100, 250]" 
              :key="amt"
              type="button"
              class="amount-btn"
              :class="{ active: selectedAmount === amt, disabled: currentUserPoints < amt }"
              :disabled="currentUserPoints < amt"
              @click="selectedAmount = amt"
            >
              <span class="amt-coin">🪙</span>
              <span class="amt-val">{{ amt }} TP</span>
            </button>
          </div>
        </div>

        <!-- Encouraging Note -->
        <div class="form-group">
          <label class="form-label">Dalda beruvchi xabar (Ixtiyoriy):</label>
          <input 
            v-model="giftMessage" 
            class="input-note" 
            placeholder="Masalan: Testlarda omad! Zo'r ketyapsan! 🔥" 
            maxlength="80"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">Bekor qilish</button>
        <button 
          class="send-gift-btn" 
          :disabled="isSubmitting || currentUserPoints < selectedAmount"
          @click="handleSend"
        >
          <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
          <span v-else>🎉 {{ selectedAmount }} TP Sovg'a Yuborish</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  friend: { type: Object, default: null },
  currentUserPoints: { type: Number, default: 0 }
});

const emit = defineEmits(['close', 'send-gift']);

const selectedAmount = ref(50);
const giftMessage = ref('');
const isSubmitting = ref(false);

const handleSend = () => {
  if (!props.friend) return;
  emit('send-gift', {
    friend: props.friend,
    amount: selectedAmount.value,
    message: giftMessage.value.trim() || "Do'stingizdan sovg'a! 🎉"
  });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.gift-modal-card {
  background: white;
  border-radius: 28px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  border-bottom: 1px solid #fef08a;
  position: relative;
}

.gift-icon-box {
  font-size: 2.2rem;
  width: 52px;
  height: 52px;
  background: #fde047;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #713f12;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.78rem;
  color: #854d0e;
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: white;
  border: 1px solid #fde047;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.25rem;
  color: #854d0e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.recipient-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.85rem 1rem;
  border-radius: 16px;
}

.recipient-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
}

.recipient-name {
  font-weight: 800;
  color: #0f172a;
}

.recipient-sub {
  font-size: 0.78rem;
  color: #64748b;
}

.balance-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f5f9;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #475569;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.amount-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.amount-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.25rem;
  border-radius: 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.amount-btn.active {
  background: #fefce8;
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.amount-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.amt-val {
  font-size: 0.82rem;
  font-weight: 800;
  color: #0f172a;
}

.input-note {
  padding: 0.75rem 1rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.9rem;
  outline: none;
}

.input-note:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  padding: 0.7rem 1.25rem;
  background: white;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.send-gift-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  border-radius: 12px;
  font-weight: 800;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 20px -4px rgba(245, 158, 11, 0.4);
  transition: all 0.2s;
}

.send-gift-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(245, 158, 11, 0.5);
}

.send-gift-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animate-pop-in {
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
</style>
