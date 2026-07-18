<template>
  <div class="ai-mentor-wrap">
    <div class="mentor-cards">
      <div 
        v-for="mentor in mentors" 
        :key="mentor.id"
        :class="['mentor-card', `card-${mentor.id}`, { active: localMentorType === mentor.id, locked: mentor.premium && !isPremium }]"
        :style="{ '--mentor-color': mentor.color }"
        @click="selectMentor(mentor)"
      >
        <div class="card-header-area">
          <div class="mentor-icon">
            <i :class="mentor.icon"></i>
          </div>
          <div v-if="mentor.premium && !isPremium" class="pro-badge">
            <i class="fas fa-lock"></i> PRO
          </div>
          <div v-else-if="mentor.premium" class="pro-badge unlocked">
            <i class="fas fa-unlock"></i> PRO
          </div>
        </div>
        <div class="mentor-info">
          <h4>{{ mentor.name[currentLocale] }}</h4>
          <p>{{ mentor.desc[currentLocale] }}</p>
        </div>
        <div class="active-indicator">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>
    </div>

    <div class="mentor-preview" v-if="selectedMentorData">
      <div class="chat-bubble" :style="{ '--mentor-color': selectedMentorData.color }">
        <div class="bubble-header">
          <div class="bubble-avatar">
            <i :class="selectedMentorData.icon"></i>
          </div>
          <span>{{ selectedMentorData.name[currentLocale] }}</span>
        </div>
        <p class="bubble-text">"{{ selectedMentorData.greeting[currentLocale] }}"</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { AIMentors } from '@/config/mentors';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'standard'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  currentLocale: {
    type: String,
    default: 'UZB'
  }
});

const emit = defineEmits(['update:modelValue']);

const localMentorType = ref(props.modelValue || 'standard');

const mentors = Object.values(AIMentors);

const selectedMentorData = computed(() => {
  return mentors.find(m => m.id === localMentorType.value) || mentors[0];
});

watch(() => props.modelValue, (newVal) => {
  localMentorType.value = newVal || 'standard';
});

const selectMentor = (mentor) => {
  if (mentor.premium && !props.isPremium) {
    alert(props.currentLocale === 'RUS' ? 'Этот наставник доступен только в Premium!' : 'Bu ustoz faqat Premium obunada mavjud!');
    return;
  }
  localMentorType.value = mentor.id;
  emit('update:modelValue', mentor.id);
};
</script>

<style scoped>
.ai-mentor-wrap {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1rem;
}

.mentor-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.mentor-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 28px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.04), inset 0 0 0 1px rgba(255,255,255,0.5);
  z-index: 1;
}

/* Inner glow aura */
.mentor-card::after {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--mentor-color) 35%, transparent), transparent 50%);
  opacity: 0;
  z-index: -2;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(-20px);
}

.mentor-card:hover:not(.locked) {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 30px 60px -15px color-mix(in srgb, var(--mentor-color) 25%, transparent),
    0 15px 25px -10px color-mix(in srgb, var(--mentor-color) 15%, transparent),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  border-color: transparent;
  background: rgba(255, 255, 255, 0.9);
}

.mentor-card:hover:not(.locked)::after {
  opacity: 1;
  transform: translateY(0);
}

/* Active State with Animated Glowing Border Effect */
.mentor-card.active {
  background: rgba(255, 255, 255, 0.95);
  border-color: transparent;
  box-shadow: 
    0 20px 50px -10px color-mix(in srgb, var(--mentor-color) 35%, transparent),
    inset 0 0 0 2px var(--mentor-color);
  transform: scale(1.02);
}
.mentor-card.active::after {
  opacity: 1;
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--mentor-color) 25%, transparent), transparent 60%);
}

.card-header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Big, bold icons */
.mentor-icon {
  width: 68px;
  height: 68px;
  border-radius: 22px;
  background: #ffffff;
  color: var(--mentor-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  box-shadow: 
    0 10px 25px -5px color-mix(in srgb, var(--mentor-color) 30%, transparent),
    inset 0 0 0 1px color-mix(in srgb, var(--mentor-color) 15%, transparent);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 2;
  overflow: hidden;
}

.mentor-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--mentor-color), color-mix(in srgb, var(--mentor-color) 50%, white));
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.mentor-card:hover:not(.locked) .mentor-icon,
.mentor-card.active .mentor-icon {
  color: #ffffff;
  transform: scale(1.1) translateY(-4px) rotate(-5deg);
  box-shadow: 0 15px 35px -5px color-mix(in srgb, var(--mentor-color) 50%, transparent);
}

.mentor-card:hover:not(.locked) .mentor-icon::before,
.mentor-card.active .mentor-icon::before {
  opacity: 1;
}

/* Premium Badges with shine effect */
.pro-badge {
  background: #0f172a;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.4);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}
.pro-badge::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
  transform: skewX(-20deg);
  animation: shine 4s infinite cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes shine {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}

.pro-badge.unlocked {
  background: #f1f5f9;
  color: #64748b;
  box-shadow: none;
  border: 1px solid #e2e8f0;
}
.pro-badge.unlocked::after {
  display: none;
}

.mentor-info h4 {
  color: #0f172a;
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
  letter-spacing: -0.5px;
}

.mentor-info p {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.6;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.active-indicator {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  color: var(--mentor-color);
  font-size: 1.6rem;
  opacity: 0;
  transform: scale(0.5) rotate(-45deg);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.mentor-card.active .active-indicator {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.mentor-card.locked {
  opacity: 0.6;
  filter: grayscale(0.9);
}
.mentor-card.locked:hover {
  filter: grayscale(0.7);
  opacity: 0.8;
}

/* Epic Chat Bubble Redesign */
.mentor-preview {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-start;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-bubble {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 28px 28px 28px 4px;
  padding: 2rem 2.5rem;
  position: relative;
  max-width: 90%;
  box-shadow: 
    0 20px 40px -10px rgba(15, 23, 42, 0.05),
    0 10px 15px -5px color-mix(in srgb, var(--mentor-color) 10%, transparent);
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1.25rem;
  font-size: 1.2rem;
  letter-spacing: -0.3px;
}

.bubble-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  background: linear-gradient(135deg, var(--mentor-color), color-mix(in srgb, var(--mentor-color) 60%, white));
  color: white;
  box-shadow: 0 8px 16px -4px color-mix(in srgb, var(--mentor-color) 50%, transparent);
  position: relative;
}

/* Pulsing online indicator */
.bubble-avatar::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.bubble-text {
  color: #334155;
  font-size: 1.15rem;
  line-height: 1.7;
  font-weight: 500;
  font-style: italic;
  position: relative;
}

</style>
