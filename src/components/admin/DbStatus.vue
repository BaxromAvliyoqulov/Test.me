<template>
  <div class="db-status-card">
    <div class="status-header">
      <h3><i class="fas fa-database"></i> Database Status <span v-if="subjectId">({{ subjectId }})</span></h3>
      <button @click="$emit('fetch-stats')" class="refresh-btn" title="Refresh DB Stats" :disabled="!subjectId">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isFetchingStats }"></i> Refresh
      </button>
    </div>
    <div class="stats-grid" v-if="dbStats.length > 0">
      <div 
        v-for="stat in dbStats" 
        :key="stat.id" 
        class="stat-item" 
        :class="getStatColor(stat.count)"
      >
        <span class="stat-level">{{ stat.id.toUpperCase() }}</span>
        <span class="stat-count">{{ stat.count }} tests</span>
      </div>
    </div>
    <div v-else class="empty-stats">
      Please select a subject to see database status.
    </div>
  </div>
</template>

<script setup>
defineProps(['dbStats', 'subjectId', 'isFetchingStats']);
defineEmits(['fetch-stats']);

const getStatColor = (count) => {
  if (count < 100) return 'status-red';
  if (count < 500) return 'status-yellow';
  return 'status-green';
};
</script>
