<template>
  <div class="premium-question-card">
    <div class="card-header">
      <span class="q-badge">{{ isRus ? 'Вопрос' : 'Savol' }} {{ questionNumber }} / {{ totalQuestions }}</span>
    </div>
    
    <h2 class="q-text">{{ question?.question }}</h2>

    <transition name="fade">
      <div v-if="hintText" class="hint-box">
        <i class="fas fa-lightbulb"></i> {{ hintText }}
      </div>
    </transition>

    <div class="options-container">
      <button
        v-for="(option, index) in question?.options"
        :key="index"
        class="opt-btn"
        v-show="!eliminatedOptions.includes(index)"
        :class="{ 'selected': selectedAnswer === index }"
        @click="$emit('selectOption', index)"
      >
        <div class="opt-letter-box" :class="'bg-' + index">
          {{ ['A', 'B', 'C', 'D'][index] }}
        </div>
        <div class="opt-text">{{ option }}</div>
      </button>
    </div>

    <div class="tools-container">
      <button 
        class="tool-btn" 
        :disabled="using5050 || eliminatedOptions.length > 0"
        @click="$emit('use5050')"
      >
        <i class="fas fa-balance-scale"></i> 50/50 
        <span class="badge" v-if="userTools?.tool_5050 > 0">{{ userTools.tool_5050 }}</span>
        <span class="badge price-badge" v-else><i class="fas fa-coins text-yellow-500"></i> 20 TP</span>
      </button>
      <button 
        class="tool-btn" 
        :disabled="hintText !== null || isAiLoading"
        @click="$emit('useAiHint')"
      >
        <i class="fas fa-robot" v-if="!isAiLoading"></i> 
        <i class="fas fa-spinner fa-spin" v-else></i>
        {{ isRus ? 'Подсказка' : 'Yordam' }} 
        <span class="badge" v-if="userTools?.tool_ai_hint > 0">{{ userTools.tool_ai_hint }}</span>
        <span class="badge price-badge" v-else><i class="fas fa-coins text-yellow-500"></i> 50 TP</span>
      </button>
    </div>

    <div class="card-footer">
      <button class="nav-btn prev" @click="$emit('goToPrev')" :disabled="questionNumber === 1">
        <i class="fas fa-arrow-left"></i>
      </button>
      
      <button class="nav-btn next" @click="$emit('submitAnswer')">
        {{ questionNumber < totalQuestions ? (isRus ? 'Далее' : 'Keyingisi') : (isRus ? 'Завершить' : 'Yakunlash') }}
        <i class="fas" :class="questionNumber < totalQuestions ? 'fa-arrow-right' : 'fa-check'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  question: Object,
  questionNumber: Number,
  totalQuestions: Number,
  selectedAnswer: Number,
  eliminatedOptions: Array,
  hintText: String,
  userTools: Object,
  using5050: Boolean,
  isRus: Boolean,
  isAiLoading: Boolean
});

defineEmits(['selectOption', 'use5050', 'useAiHint', 'goToPrev', 'submitAnswer']);
</script>

<style scoped>
.premium-question-card {
  background: #ffffff;
  border-radius: 32px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.card-header {
  margin-bottom: 24px;
}

.q-badge {
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.q-text {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.4;
  margin: 0 0 32px 0;
}

.hint-box {
  background: #fef9c3;
  color: #ca8a04;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.opt-btn {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.opt-btn:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 20px rgba(0,0,0,0.03);
}

.opt-btn.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
}

.opt-letter-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  margin-right: 16px;
  color: white;
  flex-shrink: 0;
}

/* Beautiful distinct colors for options */
.bg-0 { background: #3b82f6; }
.bg-1 { background: #ec4899; }
.bg-2 { background: #10b981; }
.bg-3 { background: #f59e0b; }

.opt-text {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
}

.opt-btn.selected .opt-text {
  color: #3b82f6;
}

.tools-container {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.tool-btn {
  background: #f8fafc;
  border: none;
  padding: 12px 20px;
  border-radius: 16px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.tool-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge {
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
}

.price-badge {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}
.text-yellow-500 {
  color: #eab308;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.nav-btn {
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.nav-btn.prev {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.2rem;
}

.nav-btn.prev:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.nav-btn.prev:disabled {
  opacity: 0.4;
}

.nav-btn.next {
  background: #0f172a;
  color: white;
  padding: 0 32px;
  height: 56px;
  border-radius: 100px;
  font-size: 1.1rem;
  gap: 12px;
}

.nav-btn.next:hover {
  background: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
}

@media (max-width: 600px) {
  .premium-question-card {
    padding: 24px;
    border-radius: 24px;
  }
  .q-text {
    font-size: 1.4rem;
  }
  .opt-btn {
    padding: 8px 12px;
  }
  .opt-letter-box {
    width: 36px; height: 36px; font-size: 1rem;
  }
}
</style>
