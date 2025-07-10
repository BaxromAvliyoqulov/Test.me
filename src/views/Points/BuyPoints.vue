<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close-btn" @click="$emit('close')">✕</button>

      <h2 class="modal-title">
        <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="title-icon" />
        Buy TP Coins
      </h2>
      <p class="modal-subtitle">
        Choose a plan and boost your balance instantly!
      </p>

      <div class="packages">
        <div
          class="package-card"
          v-for="option in options"
          :key="option.id"
          :class="{ selected: selected?.id === option.id }"
          @click="selectOption(option)"
        >
          <div class="icon">
            <img src="@/assets/img/tpCoin.png" alt="TP Coin" />
          </div>
          <h3 class="points">{{ option.points }} Points</h3>
          <p class="price">${{ option.price }}</p>
          <span v-if="option.bonus" class="bonus-badge">
            🎁 +{{ option.bonus }}% Bonus
          </span>
        </div>
      </div>

      <div class="buy-section" v-if="selected">
        <p>
          You selected <strong>{{ selected.points }} Points</strong> for
          <strong class="gold">${{ selected.price }}</strong>
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
  { id: 0, points: 250, price: 3, bonus: 0 },
  { id: 1, points: 500, price: 5, bonus: 0 },
  { id: 2, points: 1000, price: 8, bonus: 10 },
  { id: 3, points: 2000, price: 18, bonus: 20 },
];

const selectOption = (option) => {
  selected.value = option;
};

const simulatePurchase = () => {
  toast.success(`You purchased ${selected.value.points} TP Coins!`);
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #ffffff;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 900px;
  text-align: center;
  position: relative;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 1.2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #555;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 0.3rem;
}

.title-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.modal-subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.8rem;
}

.packages {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.package-card {
  background: #f9f9f9;
  padding: 1.2rem 1rem;
  border-radius: 16px;
  border: 2px solid transparent;
  width: 170px;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  transform: translateY(0);
}
.package-card:hover {
  border-color: #007bff;
  background: #f0f8ff;
  transform: translateY(-3px);
}

.package-card.selected {
  border-color: #007bff;
  background: #d8ebff;
}

.package-card .icon img {
  width: 44px;
  height: 44px;
  margin-bottom: 0.8rem;
  object-fit: contain;
}

.package-card .points {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.package-card .price {
  margin-top: 0.4rem;
  font-weight: bold;
  font-size: 1rem;
  color: #007bff;
  text-shadow: 0 0 1px #007bff;
}

.bonus-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #28a745;
  color: #fff;
  padding: 4px 10px;
  font-size: 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.buy-section {
  margin-top: 1.5rem;
}

.buy-section .gold {
  color: #007bff;
  font-weight: 700;
}

.buy-btn {
  background: #007bff;
  color: white;
  font-weight: 600;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.25s ease;
}

.buy-btn:hover {
  background: #0056b3;
}
</style>
