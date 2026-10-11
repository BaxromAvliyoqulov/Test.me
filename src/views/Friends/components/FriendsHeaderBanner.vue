<template>
  <div class="header-section">
    <div class="header-content">
      <div class="title-badge"><i class="fas fa-users-rays"></i> Hamjamiyat & Do'stlar</div>
      <h2>{{ isRus ? 'Друзья и Тестовые Дуэли' : "Do'stlar va 1v1 Test Duellari" }}</h2>
      <p>{{ isRus ? 'Находите единомышленников, соревнуйтесь в 1v1 дуэлях и делитесь знаниями!' : "Bilimdon do'stlaringizni toping, 1v1 musobaqalarda bellashing va o'zaro tajriba almashing!" }}</p>
    </div>

    <div class="header-stats-row">
      <div class="stat-pill">
        <span class="pill-num">{{ friendsCount }}</span>
        <span class="pill-label">Do'stlar</span>
      </div>
      <div class="stat-pill" v-if="pendingCount > 0">
        <span class="pill-num highlight">{{ pendingCount }}</span>
        <span class="pill-label">Yangi so'rov</span>
      </div>
      <div class="stat-pill" v-if="duelsCount > 0">
        <span class="pill-num fire">⚔️ {{ duelsCount }}</span>
        <span class="pill-label">Chaqiruv</span>
      </div>
      <button class="duel-launch-btn" @click="$emit('open-duel')">
        <span>⚔️ 1v1 Duel Boshlash</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  friendsCount: { type: Number, default: 0 },
  pendingCount: { type: Number, default: 0 },
  duelsCount: { type: Number, default: 0 },
  isRus: { type: Boolean, default: false }
});

defineEmits(['open-duel']);
</script>

<style scoped>
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 26px;
  padding: 1.75rem 2.25rem;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
}

.header-content {
  max-width: 650px;
}

.title-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #eff6ff;
  color: #2563eb;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.header-content h2 {
  margin: 0 0 0.35rem 0;
  font-size: 1.8rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.header-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.5;
}

.header-stats-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  min-width: 75px;
}

.pill-num {
  font-size: 1.25rem;
  font-weight: 900;
  color: #0f172a;
}

.pill-num.highlight { color: #3b82f6; }
.pill-num.fire { color: #ef4444; }

.pill-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
}

.duel-launch-btn {
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 18px;
  font-size: 0.92rem;
  font-weight: 800;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4);
  transition: all 0.25s;
}

.duel-launch-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(239, 68, 68, 0.5);
}

@media (max-width: 640px) {
  .header-section {
    padding: 1.25rem;
  }
  .header-content h2 {
    font-size: 1.4rem;
  }
  .duel-launch-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
