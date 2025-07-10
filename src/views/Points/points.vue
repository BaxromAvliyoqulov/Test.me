<template>
  <div class="points-container">
    <div class="points-header">
      <h1>Points Wallet</h1>
      <div class="wallet-info">
        <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="coin-icon" />
        <p>
          Your Points:
          <strong class="gradient-text">{{ points }}</strong>
        </p>
      </div>
    </div>

    <div class="actions">
      <button @click="buyPoints" class="button">Buy Points</button>
      <button @click="showReferralModal = true" class="button">
        Earn Points via Referral
      </button>
      <button @click="showReferredUsers = true" class="button">
        View Referred Users
      </button>
    </div>

    <div class="table-container">
      <table class="points-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Points</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.id">
            <td>{{ tx.action }}</td>
            <td :class="{ positive: tx.points > 0, negative: tx.points < 0 }">
              {{ tx.points > 0 ? '+' : '' }}{{ tx.points }}
            </td>
            <td>{{ formatDate(tx.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- referral modal -->
    <ReferralModal
      v-if="showReferralModal"
      @close="showReferralModal = false"
    />
    <!-- referred users modal -->
    <ReferredUsersModal
      v-if="showReferredUsers"
      @close="showReferredUsers = false"
    />
    <!-- buy points modal -->
    <BuyPointsModal v-if="showBuyModal" @close="showBuyModal = false" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { onSnapshot, doc, collection, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ReferralModal from './ShareReferralModal.vue';
import ReferredUsersModal from './ReferralListModal.vue';
import BuyPointsModal from './BuyPoints.vue';

export default {
  name: 'PointsWallet',
  components: {
    ReferralModal,
    ReferredUsersModal,
    BuyPointsModal,
  },

  setup() {
    const points = ref(0);
    const transactions = ref([]);
    const showReferralModal = ref(false);
    const showReferredUsers = ref(false);
    const showBuyModal = ref(false);

    const auth = getAuth();
    const user = auth.currentUser;

    onMounted(() => {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const txRef = collection(userDoc, 'transactions');

        onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            points.value = docSnap.data().points || 0;
          }
        });

        onSnapshot(txRef, (querySnapshot) => {
          transactions.value = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        });
      }
    });

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString();
    };

    const buyPoints = () => {
      showBuyModal.value = true;
    };

    return {
      points,
      transactions,
      formatDate,
      buyPoints,
      showReferralModal,
      showReferredUsers,
      showBuyModal,
    };
  },
};
</script>

<style scoped>
.points-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
}
.points-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.wallet-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.25rem;
}
.coin-icon {
  width: 40px;
  height: 40px;
}
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
  flex-wrap: wrap;
}
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}
.button:hover {
  background-color: #0056b3;
}
.table-container {
  overflow-x: auto;
}
.points-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.points-table th,
.points-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.points-table th {
  background: #f8f9fa;
  font-weight: 600;
}
.positive {
  color: #28a745;
  font-weight: bold;
}
.negative {
  color: #dc3545;
  font-weight: bold;
}
</style>
