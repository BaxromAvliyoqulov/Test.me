<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close-btn" @click="$emit('close')">✕</button>
      <h2>Buy TP Coins</h2>
      <p>Select a package to purchase points</p>

      <div class="packages">
        <div
          class="package-card"
          v-for="option in options"
          :key="option.id"
          :class="{ selected: selected?.id === option.id }"
          @click="selectOption(option)"
        >
          <div class="header">
            <img src="@/assets/img/tpCoin.png" alt="coin" />
            <h3>{{ option.points }} Points</h3>
          </div>
          <p class="price">
            ${{ option.price }}
            <span v-if="option.bonus">+{{ option.bonus }}% Bonus</span>
          </p>
        </div>
      </div>

      <div class="buy-section" v-if="selected">
        <p>
          You selected <strong>{{ selected.points }} Points</strong> for
          <strong>${{ selected.price }}</strong>
        </p>
        <button class="buy-btn" @click="simulatePurchase">Buy Now</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['close']);
const toast = useToast();

const selected = ref(null);

const options = [
  { id: 1, points: 500, price: 5, bonus: 0 },
  { id: 2, points: 1000, price: 8, bonus: 10 },
  { id: 3, points: 2000, price: 18, bonus: 20 },
];

const selectOption = (option) => {
  selected.value = option;
};

const simulatePurchase = () => {
  toast.success(`Simulated purchase: ${selected.value.points} points`);
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #e7e7e7;
  padding: 2rem;
  border-radius: 16px;
  max-width: 60%;
  width: 90%;
  text-align: center;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 1.2rem;
  background: transparent;
  border: none;
  cursor: pointer;
}
.packages {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}
.package-card {
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  width: 150px;
  transition: all 0.3s ease;
}
.package-card:hover {
  border-color: #007bff;
  background: #eef7ff;
}
.package-card.selected {
  border-color: #007bff;
  background: #dbeeff;
}
.package-card .header {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.package-card img {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}
.package-card .price {
  font-weight: bold;
  margin-top: 10px;
  color: #2c3e50;
}
.package-card .price span {
  display: block;
  color: #28a745;
  font-size: 0.9rem;
}
.buy-section {
  margin-top: 2rem;
}
.buy-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s ease;
}
.buy-btn:hover {
  background: #0056b3;
}
</style>
