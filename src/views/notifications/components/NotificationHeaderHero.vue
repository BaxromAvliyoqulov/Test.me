<template>
  <div class="header-hero">
    <div class="header-left">
      <div class="title-pill">
        <i class="fas fa-bell animate-bounce-slow"></i> {{ isRus ? 'Центр Уведомлений' : 'Bildirishnomalar Markazi' }}
      </div>
      <h2>{{ isRus ? 'Центр Уведомлений' : 'Barcha Bildirishnomalar' }}</h2>
      <p>{{ isRus ? 'Следите за вызовами на дуэли, запросами в друзья и системными наградами в реальном времени!' : '1v1 duel chaqiruvlari, do\'stlik so\'rovlari, TP Coin mukofotlari va platforma yangiliklarini bir joyda kuzating!' }}</p>
    </div>

    <div class="header-actions">
      <button 
        v-if="unreadCount > 0" 
        class="action-btn mark-read" 
        @click="$emit('mark-all-read')"
        :disabled="isProcessing"
      >
        <i class="fas fa-check-double"></i>
        <span>{{ isRus ? 'Прочитать всё' : 'Barchasini o\'qilgan qilish' }}</span>
      </button>

      <button 
        class="action-btn clear-read" 
        @click="$emit('clear-read')"
        :disabled="isProcessing || hasNoRead"
      >
        <i class="fas fa-trash-can"></i>
        <span>{{ isRus ? 'Очистить' : 'O\'qilganlarni tozalash' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  unreadCount: { type: Number, default: 0 },
  hasNoRead: { type: Boolean, default: true },
  isProcessing: { type: Boolean, default: false },
  isRus: { type: Boolean, default: false }
});

defineEmits(['mark-all-read', 'clear-read']);
</script>

<style scoped>
.header-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 26px;
  padding: 2rem 2.25rem;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
}

.header-left {
  max-width: 650px;
}

.title-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #b45309;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
}

.header-hero h2 {
  margin: 0 0 0.35rem 0;
  font-size: 1.85rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.header-hero p {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn.mark-read {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.action-btn.mark-read:hover:not(:disabled) {
  background: #2563eb;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.25);
}

.action-btn.clear-read {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.action-btn.clear-read:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animate-bounce-slow {
  animation: bounceSlow 2s infinite;
}

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@media (max-width: 768px) {
  .header-hero {
    padding: 1.5rem;
  }
}
</style>
