<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Referral Link"
    >
      <h3>Your Referral Link</h3>
      <input :value="referralLink" readonly aria-label="Referral Link" />
      <button @click="copyLink" class="copy-btn">Copy</button>
      <button @click="emit('close')" class="modal-close">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getAuth } from 'firebase/auth';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['close']);
const user = getAuth().currentUser;

const referralLink = computed(() => {
  if (!user) return '';
  return `https://test.me/signup?ref=${user.uid.slice(0, 6).toUpperCase()}`;
});

const toast = useToast();
function copyLink() {
  navigator.clipboard.writeText(referralLink.value);
  toast.success('Referral link copied!');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.modal input {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.copy-btn {
  background: #4caf50;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  margin-right: 10px;
  cursor: pointer;
}
.copy-btn:hover {
  background: #388e3c;
}
.modal-close {
  background: #f44336;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.modal-close:hover {
  background: #c62828;
}
</style>
