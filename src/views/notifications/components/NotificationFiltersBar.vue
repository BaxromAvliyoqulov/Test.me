<template>
  <div class="controls-bar">
    <!-- Filter Tabs -->
    <div class="tabs-scroller">
      <button 
        class="filter-tab" 
        :class="{ active: currentTab === 'all' }" 
        @click="$emit('update:currentTab', 'all')"
      >
        <i class="fas fa-layer-group"></i>
        <span>Barchasi</span>
        <span class="tab-count">{{ totalCount }}</span>
      </button>

      <button 
        class="filter-tab" 
        :class="{ active: currentTab === 'unread' }" 
        @click="$emit('update:currentTab', 'unread')"
      >
        <i class="fas fa-envelope"></i>
        <span>O'qilmagan</span>
        <span class="tab-count danger" v-if="unreadCount > 0">{{ unreadCount }}</span>
      </button>

      <button 
        class="filter-tab" 
        :class="{ active: currentTab === 'duels' }" 
        @click="$emit('update:currentTab', 'duels')"
      >
        <i class="fas fa-bolt text-danger"></i>
        <span>Duellar</span>
        <span class="tab-count warning" v-if="duelsCount > 0">{{ duelsCount }}</span>
      </button>

      <button 
        class="filter-tab" 
        :class="{ active: currentTab === 'social' }" 
        @click="$emit('update:currentTab', 'social')"
      >
        <i class="fas fa-user-group text-primary"></i>
        <span>Do'stlar</span>
        <span class="tab-count primary" v-if="requestsCount > 0">{{ requestsCount }}</span>
      </button>

      <button 
        class="filter-tab" 
        :class="{ active: currentTab === 'rewards' }" 
        @click="$emit('update:currentTab', 'rewards')"
      >
        <i class="fas fa-coins text-warning"></i>
        <span>Mukofotlar</span>
      </button>

      <button 
        class="filter-tab" 
        :class="{ active: currentTab === 'system' }" 
        @click="$emit('update:currentTab', 'system')"
      >
        <i class="fas fa-bullhorn text-info"></i>
        <span>Tizim</span>
      </button>
    </div>

    <!-- Search input -->
    <div class="search-box">
      <i class="fas fa-search search-icon"></i>
      <input 
        :value="searchQuery" 
        @input="$emit('update:searchQuery', $event.target.value)"
        :placeholder="isRus ? 'Поиск в уведомлениях...' : 'Xabarlarni qidirish...'" 
      />
      <button v-if="searchQuery" class="clear-btn" @click="$emit('update:searchQuery', '')">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentTab: { type: String, default: 'all' },
  searchQuery: { type: String, default: '' },
  totalCount: { type: Number, default: 0 },
  unreadCount: { type: Number, default: 0 },
  duelsCount: { type: Number, default: 0 },
  requestsCount: { type: Number, default: 0 },
  isRus: { type: Boolean, default: false }
});

defineEmits(['update:currentTab', 'update:searchQuery']);
</script>

<style scoped>
.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.tabs-scroller {
  display: flex;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.35rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-tab.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-count {
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 800;
}

.tab-count.danger { background: #ef4444; color: white; }
.tab-count.warning { background: #f59e0b; color: white; }
.tab-count.primary { background: #3b82f6; color: white; }

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.search-box input {
  width: 100%;
  padding: 0.65rem 2rem 0.65rem 2.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.clear-btn {
  position: absolute;
  right: 0.65rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

@media (max-width: 768px) {
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    min-width: 100%;
  }
}
</style>
