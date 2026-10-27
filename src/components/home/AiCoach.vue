<template>
  <div class="premium-card ai-card" :class="aiMentorInfo.colorClass">
    <div class="ai-header">
      <div class="ai-avatar" :class="aiMentorInfo.colorClass">
        <i :class="aiMentorInfo.icon"></i>
      </div>
      <div class="ai-title">
        <h4>{{ aiMentorInfo.name }}</h4>
        <span class="online-dot">{{ t('activeInSystem') }}</span>
      </div>
    </div>
    <div class="ai-body">
      <div v-if="aiAdviceLoading" class="ai-loading">
        <div class="spinner-small blue"></div>
        <span>{{ currentLocale === 'RUS' ? 'Анализ...' : 'Tahlil qilinmoqda...' }}</span>
      </div>
      <p v-else class="ai-text">
        "{{ displayAdviceText }}"
      </p>
      <button class="btn-ai-action" v-if="!aiAdviceLoading && aiAdviceBadge" @click="$emit('ai-action')">
        <i class="fas fa-magic"></i> {{ aiAdviceBadge }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

const props = defineProps({
  aiMentorInfo: { type: Object, required: true },
  aiAdviceLoading: { type: Boolean, default: false },
  aiAdvice: { type: Object, default: () => ({ text: '', badge: '' }) },
  currentLocale: { type: String, default: 'UZB' }
});

const emit = defineEmits(['ai-action']);

const displayAdviceText = computed(() => {
  if (props.aiAdvice?.text && props.aiAdvice.text.trim()) {
    return props.aiAdvice.text.trim();
  }
  if (props.currentLocale === 'RUS') {
    return 'Привет! Я твой ИИ-наставник. Выбери предмет слева и начни первый тест, чтобы проверить свои знания!';
  }
  return "Salom! Men sizning AI ustozingizman. Chap tarafdan fanni tanlang va bilimingizni sinash uchun birinchi testni boshlang!";
});

const aiAdviceBadge = computed(() => {
  if (props.aiAdvice?.badge && props.aiAdvice.badge.trim()) {
    return props.aiAdvice.badge.trim();
  }
  return props.currentLocale === 'RUS' ? 'Начать тест' : 'Testni boshlash';
});
</script>

<style scoped>
/* Scoped styles */
</style>
