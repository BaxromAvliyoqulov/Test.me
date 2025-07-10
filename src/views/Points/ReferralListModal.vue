<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Referred Users List"
    >
      <h2 class="modal-title">👥 Users Registered with Your Code</h2>

      <div v-if="loading" class="status-text">Loading...</div>
      <div v-else-if="users.length === 0" class="status-text">
        No referrals yet.
      </div>
      <div v-else class="user-list">
        <div v-for="user in users" :key="user.uid" class="user-item">
          <p><strong>👤 Name:</strong> {{ user.displayName || 'No Name' }}</p>
          <p><strong>📧 Email:</strong> {{ user.email }}</p>
          <p><strong>📅 Joined:</strong> {{ formatDate(user.createdAt) }}</p>
        </div>
      </div>

      <div class="actions">
        <button @click="emit('close')" class="modal-close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

const emit = defineEmits(['close']);
const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

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
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
  backdrop-filter: blur(3px);
}

.modal {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.status-text {
  text-align: center;
  font-size: 1rem;
  color: #777;
  margin-bottom: 1rem;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-item {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 10px;
  border-left: 4px solid #4caf50;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.user-item p {
  margin: 0.25rem 0;
  color: #444;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.modal-close {
  background: #f44336;
  color: white;
  padding: 10px 20px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: #c62828;
}
</style>
