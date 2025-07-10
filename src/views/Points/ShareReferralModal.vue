<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Your Referral Code"
    >
      <h2 class="modal-title">🎁 Your Referral Code</h2>

      <div class="code-box">
        <input :value="referralCode" readonly aria-label="Referral Code" />
        <button @click="copyCode" class="copy-btn" title="Copy code">
          <span class="icon">📋</span>
        </button>
      </div>

      <p class="info-text">
        Share this code with your friends to earn
        <strong>bonus points</strong> when they sign up using it.
      </p>

      <div class="modal-actions">
        <button @click="emit('close')" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getAuth } from 'firebase/auth';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['close']);
const toast = useToast();
const user = getAuth().currentUser;

const referralCode = computed(() => {
  return user ? user.uid.slice(0, 8).toUpperCase() : '';
});

function copyCode() {
  navigator.clipboard.writeText(referralCode.value);
  toast.success('Referral code copied to clipboard!');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.modal {
  background-color: #fff;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
}

.code-box {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.code-box input {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  padding: 12px 16px;
  border: 2px dashed #4caf50;
  border-radius: 10px;
  background: #f1fff3;
  color: #2e7d32;
  width: 100%;
  max-width: 250px;
  letter-spacing: 1px;
}

.copy-btn {
  background: #4caf50;
  color: white;
  font-size: 20px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.copy-btn:hover {
  background: #388e3c;
}

.info-text {
  font-size: 0.95rem;
  color: #555;
  margin: 0.5rem 0 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.close-btn {
  background: #f44336;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #c62828;
}
</style>
