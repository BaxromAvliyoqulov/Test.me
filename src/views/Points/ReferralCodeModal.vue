<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2 class="modal-title">✨ Activate Referral Code</h2>

      <input
        v-model="referralCode"
        placeholder="Enter 8-digit referral code"
        maxlength="8"
        class="referral-input"
      />

      <button @click="activateCode" class="activate-btn">Activate</button>

      <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="message success">{{ successMessage }}</p>

      <div class="modal-actions">
        <button @click="$emit('close')" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
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
const referralCode = ref('');
const errorMessage = ref('');
const successMessage = ref('');

const activateCode = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    errorMessage.value = 'Please login first.';
    return;
  }

  if (!referralCode.value || referralCode.value.length !== 8) {
    errorMessage.value = 'Please enter a valid 8-digit code.';
    return;
  }

  const currentUserRef = doc(db, 'users', currentUser.uid);
  const currentUserDoc = await getDoc(currentUserRef);

  if (currentUserDoc.exists() && currentUserDoc.data().referredBy) {
    errorMessage.value = 'You have already used a referral code.';
    return;
  }

  const q = query(
    collection(db, 'users'),
    where('referralCode', '==', referralCode.value.toUpperCase())
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    errorMessage.value = 'Referral code not found.';
    return;
  }

  const referredUserId = querySnapshot.docs[0].id;

  if (referredUserId === currentUser.uid) {
    errorMessage.value = 'You cannot activate your own referral code.';
    return;
  }

  await updateDoc(doc(db, 'users', referredUserId), {
    points: increment(50),
  });

  await updateDoc(currentUserRef, {
    referredBy: referralCode.value.toUpperCase(),
    points: increment(20),
  });

  await setDoc(doc(collection(currentUserRef, 'referral-logs')), {
    referredBy: referralCode.value.toUpperCase(),
    timestamp: new Date(),
  });

  successMessage.value =
    'Referral code activated successfully! You earned 20 points.';
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
}

.referral-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1.1rem;
  border: 2px dashed #007bff;
  border-radius: 10px;
  margin-bottom: 1.2rem;
  text-align: center;
  letter-spacing: 1px;
  background: #f7fbff;
}

.activate-btn {
  background: #007bff;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.activate-btn:hover {
  background: #0056b3;
}

.message {
  margin-top: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
}

.error {
  color: #e53935;
}

.success {
  color: #43a047;
}

.modal-actions {
  margin-top: 1.5rem;
}

.close-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #c62828;
}
</style>
