<template>
  <div class="ai-bubble-wrapper" :class="{ 'is-loading': loading }">
    <div class="ai-avatar-container">
      <div class="ai-avatar-ring" :style="{ borderColor: mentorColor }"></div>
      <img :src="mentorAvatar" alt="AI Mentor" class="ai-avatar" />
      <div class="ai-status-dot" :style="{ backgroundColor: mentorColor }"></div>
    </div>
    <div class="ai-chat-bubble" :style="{ borderLeftColor: mentorColor }">
      <div v-if="loading" class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
      <div v-else class="ai-message">
        <h4 :style="{ color: mentorColor }">
          <i :class="mentorIcon"></i> {{ mentorName }}
        </h4>
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getMentorConfig } from '@/config/mentors';

const props = defineProps({
  mentorId: {
    type: String,
    default: 'friendly'
  },
  message: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  locale: {
    type: String,
    default: 'UZB'
  }
});

const mentorConfig = computed(() => getMentorConfig(props.mentorId));

const mentorName = computed(() => mentorConfig.value.name[props.locale] || mentorConfig.value.name['UZB']);
const mentorAvatar = computed(() => mentorConfig.value.avatarUrl);
const mentorColor = computed(() => mentorConfig.value.color);
const mentorIcon = computed(() => mentorConfig.value.icon);
</script>

<style scoped>
.ai-bubble-wrapper {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin: 1rem 0;
  animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ai-avatar-container {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.ai-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #f1f5f9;
  position: relative;
  z-index: 2;
}

.ai-avatar-ring {
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border: 2px dashed;
  border-radius: 50%;
  animation: spin 10s linear infinite;
  z-index: 1;
}

.ai-status-dot {
  position: absolute;
  bottom: 0; right: 0;
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  z-index: 3;
}

.ai-chat-bubble {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 1rem 1.25rem;
  border-radius: 0 16px 16px 16px;
  border-left: 4px solid;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  max-width: 80%;
}

.ai-message h4 {
  font-size: 0.85rem;
  font-weight: 800;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-message p {
  margin: 0;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.5;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 4px;
}
.typing-indicator span {
  width: 8px; height: 8px;
  background-color: #cbd5e1;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
