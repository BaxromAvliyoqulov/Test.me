<template>
  <div class="points-container">
    <div class="points-header">
      <h1>Points Wallet</h1>
      <div class="wallet-info">
        <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="coin-icon" />
        <p>
          Your Points: <strong class="gradient-text">{{ points }}</strong>
        </p>
      </div>
    </div>

    <div class="actions">
      <button @click="buyPoints" class="button">
        <span>Buy Points</span>
      </button>
      <button @click="generateReferralLink" class="button">
        <span>Earn Points via Referral</span>
      </button>
    </div>

    <div class="shop-section">
      <h2>Shop</h2>
      <p>Use your TP Coins to purchase exclusive items from our platform!</p>
      <button @click="goToFullFunctionalShop" class="button">
        Explore Shop
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
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.action }}</td>
            <td
              :class="{
                positive: transaction.points > 0,
                negative: transaction.points < 0,
              }"
            >
              {{ transaction.points > 0 ? "+" : "" }}{{ transaction.points }}
            </td>
            <td>{{ formatDate(transaction.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      points: 1000,
      transactions: [
        {
          id: 1,
          action: "Bought Points",
          points: 500,
          timestamp: new Date("2023-10-01").getTime(),
        },
        {
          id: 2,
          action: "Referred a Friend",
          points: 200,
          timestamp: new Date("2023-10-02").getTime(),
        },
        {
          id: 3,
          action: "Purchased Item",
          points: -300,
          timestamp: new Date("2023-10-03").getTime(),
        },
      ],
    };
  },
  methods: {
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString();
    },
    buyPoints() {
      // Add logic here
      this.$router.push("/buy-points");
    },
    generateReferralLink() {
      // Add logic here
      const referralCode = "YOUR_REFERRAL_CODE";
      // You might want to show this in a modal or copy to clipboard
    },
    goToFullFunctionalShop() {
      this.$router.push({ name: "shop" });
    },
  },
};
</script>

<style scoped>
.points-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
}

.points-header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
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
  margin-bottom: 1.3rem;
  flex-wrap: wrap;
}

.shop-section {
  text-align: center;
  margin: 1.5rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.shop-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.table-container {
  overflow-x: auto;
}

.points-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
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
  color: #2c3e50;
}

.positive {
  color: #28a745;
  font-weight: 600;
}

.negative {
  color: #dc3545;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .points-container {
    padding: 1rem;
  }

  .actions {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }

  .wallet-info {
    flex-direction: column;
  }

  .points-table th,
  .points-table td {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
