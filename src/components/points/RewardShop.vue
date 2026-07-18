<template>
  <div class="reward-shop-bento">
    <div class="section-header">
      <h2 class="section-title"><i class="fas fa-gift"></i> {{ isRus ? 'Магазин Наград' : 'Sovg\'alar do\'koni' }}</h2>
      <p class="section-subtitle">{{ isRus ? 'Обменяйте накопленные TP Coins на ценные привилегии и бонусы!' : 'To\'plangan TP Coinlaringizni ajoyib imtiyoz va sovg\'alarga almashtiring!' }}</p>
    </div>
    
    <div class="rewards-grid">
      <div 
        v-for="item in rewardItems" 
        :key="item.id" 
        class="reward-card"
      >
        <div class="reward-icon-wrapper" :style="{ background: 'color-mix(in srgb, ' + item.color + ' 15%, transparent)', color: item.color }">
          <i :class="item.icon"></i>
        </div>
        <div class="reward-details">
          <h3>{{ isRus ? item.nameRu : item.nameUz }}</h3>
          <p>{{ isRus ? item.descRu : item.descUz }}</p>
          
          <div class="reward-footer">
            <span class="cost-badge">
              <img src="@/assets/img/tpCoin.png" alt="TP Coin" />
              {{ item.cost }} TP
            </span>
            <button 
              class="exchange-btn" 
              :style="{ background: item.color }"
              @click="$emit('exchange', item)"
              :disabled="points < item.cost"
            >
              {{ isRus ? 'Обменять' : 'Almashtirish' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  rewardItems: { type: Array, required: true },
  isRus: { type: Boolean, required: true },
  points: { type: Number, required: true }
});

const emit = defineEmits(['exchange']);
</script>

<style scoped>
.reward-shop-bento {
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 2rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title i {
  color: #f43f5e;
}

.section-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 6px 0 0 0;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.reward-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  gap: 1.25rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.reward-card:hover {
  background: #ffffff;
  transform: translateY(-4px);
  box-shadow: 0 12px 25px -8px rgba(0,0,0,0.08);
  border-color: #cbd5e1;
}

.reward-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}

.reward-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.reward-details h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.reward-details p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 1.25rem 0;
  line-height: 1.4;
}

.reward-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.cost-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fffbeb;
  color: #d97706;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.9rem;
}

.cost-badge img {
  width: 18px;
  height: 18px;
}

.exchange-btn {
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exchange-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.exchange-btn:disabled {
  background: #cbd5e1 !important;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
