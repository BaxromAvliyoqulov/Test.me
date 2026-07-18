<template>
  <div class="search-results-bento">
    <h3 class="results-title"><i class="fas fa-search"></i> {{ isRus ? 'Результаты поиска' : 'Qidiruv natijalari' }}</h3>
    <div class="grid">
      <div v-for="user in searchResults" :key="user.id" class="result-card-premium">
        <div class="card-glass-bg"></div>
        <div class="avatar-large">{{ user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U' }}</div>
        <h4>{{ user.displayName || user.email }}</h4>
        <span class="user-id-badge">ID: {{ user.shortId || user.referralCode || 'N/A' }}</span>
        
        <button 
          :class="['btn-add-premium', { 'disabled': isFriendOrRequested(user.id) }]"
          :disabled="isFriendOrRequested(user.id)" 
          @click="$emit('send-request', user)"
        >
          {{ isFriendOrRequested(user.id) ? (isRus ? 'Уже в друзьях/Отправлено' : "Qo'shilgan / So'rov yuborilgan") : (isRus ? '+ Добавить' : "+ Qo'shish") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  searchResults: Array,
  isRus: Boolean,
  isFriendOrRequested: Function
});

const emit = defineEmits(['send-request']);
</script>

<style scoped>
.search-results-bento {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 2rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

.results-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.result-card-premium {
  position: relative;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
  overflow: hidden;
}

.result-card-premium:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px -10px rgba(15, 23, 42, 0.1);
  border-color: #3b82f6;
}

.avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.result-card-premium h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.user-id-badge {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.btn-add-premium {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  margin-top: 5px;
  transition: 0.2s;
}

.btn-add-premium:not(.disabled):hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-add-premium.disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>