<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Referred Users List"
    >
      <h3>Users Registered with Your Code</h3>
      <div v-if="loading">Loading...</div>
      <div v-else-if="users.length === 0">No referrals yet.</div>
      <div v-else class="user-list">
        <div v-for="user in users" :key="user.uid" class="user-item">
          <p><strong>👤</strong> {{ user.displayName || 'No Name' }}</p>
          <p><strong>📧</strong> {{ user.email }}</p>
          <p><strong>📅</strong> {{ formatDate(user.createdAt) }}</p>
        </div>
      </div>
      <button @click="emit('close')" class="modal-close">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const emit = defineEmits(['close']);
const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  const user = getAuth().currentUser;
  if (!user) return;
  const code = user.uid.slice(0, 6).toUpperCase();
  const q = query(collection(db, 'users'), where('referredBy', '==', code));
  const snap = await getDocs(q);
  users.value = snap.docs.map((doc) => ({ ...doc.data(), uid: doc.id }));
  loading.value = false;
});

function formatDate(ts) {
  return ts?.seconds
    ? new Date(ts.seconds * 1000).toLocaleDateString()
    : 'Unknown';
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.user-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
.modal-close {
  margin-top: 10px;
  padding: 8px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.modal-close:hover {
  background: #c62828;
}
</style>
