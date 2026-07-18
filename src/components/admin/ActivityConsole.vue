<template>
  <div class="activity-log-card" v-if="isRunning || activityLogs.length > 0">
    <div class="log-header">
      <h3><i class="fas fa-terminal"></i> Live Activity Console</h3>
      <span class="pulse-indicator" :class="{ active: isRunning && !isPaused }"></span>
    </div>
    <div class="log-window">
      <div v-for="log in activityLogs" :key="log.id" :class="['log-item', 'log-' + log.type]">
        <span class="log-time">[{{ log.time }}]</span>
        <span class="log-msg">{{ log.msg }}</span>
      </div>
      <div v-if="activityLogs.length === 0" class="log-empty">Waiting for tasks to begin...</div>
    </div>
  </div>
</template>

<script setup>
defineProps(['activityLogs', 'isRunning', 'isPaused']);
</script>
