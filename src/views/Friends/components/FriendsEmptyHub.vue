<template>
  <div class="empty-state-hub">
    <div class="orb-container">
      <i class="fas fa-users-viewfinder pulse-orb"></i>
    </div>
    <h3>Suhbat yoki Duelni tanlang</h3>
    <p>Chap menyudan do'stingizni tanlang, yangi do'stlarni qidiring yoki 1v1 duel boshlang!</p>
    <div class="quick-chips">
      <button class="chip" @click="$emit('select-tab', 'friends')">
        <i class="fas fa-user-group"></i> Do'stlar ro'yxati
      </button>
      <button class="chip" @click="$emit('select-tab', 'leaderboard')">
        <i class="fas fa-trophy text-warning"></i> Do'stlar reytingi
      </button>
      <button class="chip" @click="$emit('open-duel')">
        <i class="fas fa-bolt text-danger"></i> 1v1 Duel
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['select-tab', 'open-duel']);
</script>

<style scoped>
.empty-state-hub {
  height: 100%;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border: 2px dashed #cbd5e1;
  border-radius: 28px;
  padding: 3rem 2rem;
  text-align: center;
}

.orb-container {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0f2fe, #f0fdf4);
  border: 2px solid #bae6fd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.pulse-orb {
  font-size: 2.5rem;
  color: #0284c7;
  animation: pulseIcon 2s infinite ease-in-out;
}

@keyframes pulseIcon {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.1); opacity: 1; }
}

.empty-state-hub h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.empty-state-hub p {
  font-size: 0.92rem;
  color: #64748b;
  max-width: 480px;
  margin: 0 0 1.75rem 0;
  line-height: 1.5;
}

.quick-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.chip:hover {
  border-color: #3b82f6;
  color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px -2px rgba(59, 130, 246, 0.15);
}
</style>
