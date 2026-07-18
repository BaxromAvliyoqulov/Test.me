<template>
  <div class="controls-card">
    <div class="form-group api-key-group">
      <label><i class="fas fa-key"></i> Gemini API Key</label>
      <input :value="geminiApiKey" @input="$emit('update:geminiApiKey', $event.target.value)" type="password" placeholder="Paste your AIza... key here" />
    </div>
    <div class="form-group">
      <label><i class="fas fa-book"></i> Subject ID</label>
      <select :value="subjectId" @change="$emit('update:subjectId', $event.target.value)" class="subject-select" :disabled="isRunning || subjects.length === 0">
        <option value="" disabled>Select a subject</option>
        <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.title || sub.id }}</option>
      </select>
    </div>
    <div class="form-group">
      <label><i class="fas fa-bullseye"></i> Target Count (All)</label>
      <input :value="globalTargetCount" @input="$emit('update:globalTargetCount', parseInt($event.target.value))" type="number" class="no-spinners" />
    </div>
    <button 
      @click="$emit('start')" 
      class="start-btn" 
      :disabled="isRunning || !subjectId || levels.length === 0"
      v-if="!isRunning"
    >
      <i class="fas fa-play"></i>
      Start Generating Tests
    </button>
    
    <div v-if="isRunning" class="action-buttons">
      <button v-if="!isPaused" @click="$emit('pause')" class="pause-btn">
        <i class="fas fa-pause"></i> Pause
      </button>
      <button v-if="isPaused" @click="$emit('resume')" class="resume-btn">
        <i class="fas fa-play"></i> Resume
      </button>
      <button @click="$emit('stop')" class="stop-btn">
        <i class="fas fa-stop"></i> Stop
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(['geminiApiKey', 'subjectId', 'subjects', 'globalTargetCount', 'isRunning', 'isPaused', 'levels']);
defineEmits(['update:geminiApiKey', 'update:subjectId', 'update:globalTargetCount', 'start', 'pause', 'resume', 'stop']);
</script>
