<template>
  <div class="premium-results-container">
    <div class="results-card">
      <div class="confetti-icon">🎉</div>
      <h1 class="r-title">{{ isRus ? 'Потрясающе!' : 'Ajoyib Natija!' }}</h1>
      <p class="r-subtitle">{{ isRus ? 'Вы успешно завершили тест.' : 'Siz testni muvaffaqiyatli yakunladingiz.' }}</p>

      <div class="score-ring-wrapper">
        <svg class="score-ring" viewBox="0 0 36 36">
          <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path class="ring-fill" :stroke-dasharray="(scorePercentage) + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div class="score-content">
          <span class="score-num">{{ score }}</span>
          <span class="score-total">/ {{ totalQuestions }}</span>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-pill">
          <i class="fas fa-bullseye text-blue"></i>
          <span>{{ scorePercentage }}% {{ isRus ? 'Точность' : 'Aniqlik' }}</span>
        </div>
        <div class="stat-pill">
          <i class="fas fa-times-circle text-rose"></i>
          <span>{{ errors }} {{ isRus ? 'Ошибки' : 'Xatolar' }}</span>
        </div>
        <div class="stat-pill">
          <i class="fas fa-clock text-amber"></i>
          <span>{{ timeSpent }}</span>
        </div>
      </div>

      <div class="reward-box" v-if="score > 0">
        <div class="reward-icon"><img src="@/assets/img/tpCoin.png" alt="TP Coin" /></div>
        <div class="reward-info">
          <span class="reward-val">+{{ score }} TP Coins</span>
          <span class="reward-lbl">{{ isRus ? 'Заработано' : 'Sizga taqdim etildi' }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-outline" @click="$emit('showReview')">
          <i class="fas fa-eye"></i> {{ isRus ? 'Анализ' : 'Tahlil' }}
        </button>
        <button class="btn btn-primary" @click="$emit('goHome')">
          {{ isRus ? 'На главную' : 'Bosh Sahifa' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: Number,
  totalQuestions: Number,
  timeSpent: String,
  isRus: Boolean
});

defineEmits(['goHome', 'showReview']);

const scorePercentage = computed(() => {
  if (!props.totalQuestions) return 0;
  return Math.round((props.score / props.totalQuestions) * 100);
});

const errors = computed(() => {
  return props.totalQuestions - props.score;
});
</script>

<style scoped>
.premium-results-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.results-card {
  background: white;
  border-radius: 32px;
  padding: 48px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.confetti-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.r-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.r-subtitle {
  color: #64748b;
  font-weight: 500;
  margin-bottom: 32px;
}

.score-ring-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: 32px;
}

.score-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 2.5;
}

.ring-fill {
  fill: none;
  stroke: #10b981;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease-out;
}

.score-content {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-num {
  font-size: 3.5rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}

.score-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #94a3b8;
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-pill {
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
}

.text-blue { color: #3b82f6; }
.text-rose { color: #e11d48; }
.text-amber { color: #d97706; }

.reward-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 20px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  width: 100%;
}

.reward-icon img {
  width: 48px;
  height: 48px;
  animation: spin 6s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.reward-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.reward-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #d97706;
}

.reward-lbl {
  font-size: 0.8rem;
  font-weight: 600;
  color: #b45309;
}

.action-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
}

.btn {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.05rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: #0f172a;
  color: white;
}

.btn-primary:hover {
  background: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
}

.btn-outline {
  background: white;
  border: 2px solid #e2e8f0;
  color: #475569;
}

.btn-outline:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

@media (max-width: 600px) {
  .results-card { padding: 24px; }
  .action-buttons { flex-direction: column; }
}
</style>
