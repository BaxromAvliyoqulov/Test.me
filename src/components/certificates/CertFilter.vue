<template>
  <div class="smart-filter-container">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)" :placeholder="isRus ? 'Поиск сертификатов...' : 'Sertifikatlarni qidirish...'" />
    </div>
    <div class="filter-tabs">
      <button :class="{ active: activeFilter === 'all' }" @click="$emit('update:activeFilter', 'all')">
        <i class="fas fa-border-all"></i> {{ isRus ? 'Все' : 'Barcha' }}
      </button>
      <button :class="{ active: activeFilter === 'unlocked' }" @click="$emit('update:activeFilter', 'unlocked')">
        <i class="fas fa-unlock"></i> {{ isRus ? 'Открыто' : 'Olingan' }}
      </button>
      <button :class="{ active: activeFilter === 'locked' }" @click="$emit('update:activeFilter', 'locked')">
        <i class="fas fa-lock"></i> {{ isRus ? 'Закрыто' : 'Qulflangan' }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  searchQuery: { type: String, required: true },
  activeFilter: { type: String, required: true },
  isRus: { type: Boolean, required: true }
});

const emit = defineEmits(['update:searchQuery', 'update:activeFilter']);
</script>

<style scoped>
.smart-filter-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  padding: 1.25rem;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 2rem;
}
.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}
.search-box i {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 1.1rem;
}
.search-box input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: white;
  font-family: inherit;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.3s;
}
.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
.filter-tabs {
  display: flex;
  background: rgba(241, 245, 249, 0.8);
  padding: 0.4rem;
  border-radius: 14px;
  gap: 0.4rem;
}
.filter-tabs button {
  padding: 0.6rem 1.2rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}
.filter-tabs button:hover {
  color: #334155;
  background: rgba(226, 232, 240, 0.5);
}
.filter-tabs button.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>