<template>
  <div class="progress-grid">
    <div v-for="level in levels" :key="level.id" class="level-card">
      <div class="level-header">
        <h3>{{ level.id.toUpperCase() }}</h3>
        <span class="status-badge" :class="level.status">
          {{ level.status }}
        </span>
      </div>
      
      <div class="level-target-input">
        <label><i class="fas fa-bullseye"></i> Target Tests</label>
        <input 
          :value="level.targetCount" 
          @input="updateLevelTarget(level.id, $event.target.value)" 
          type="number" 
          class="no-spinners" 
          :disabled="isRunning" 
        />
      </div>

      <div class="progress-wrapper">
        <div class="progress-stats">
          <span>{{ level.current }} / {{ level.targetCount }} generated</span>
          <span>{{ Math.round((level.current / Math.max(1, level.targetCount)) * 100) }}%</span>
        </div>
        <div class="progress-bar-bg">
          <div 
            class="progress-bar-fill" 
            :style="{ width: `${Math.min((level.current / Math.max(1, level.targetCount)) * 100, 100)}%` }"
            :class="{ 'finished': level.current >= level.targetCount }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['levels', 'isRunning']);
const emit = defineEmits(['update-level']);

const updateLevelTarget = (id, val) => {
  emit('update-level', { id, count: parseInt(val) || 0 });
};
</script>
