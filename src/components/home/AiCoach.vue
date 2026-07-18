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
        "{{ aiAdvice.text }}"
      </p>
      <button class="btn-ai-action" v-if="!aiAdviceLoading && aiAdvice.badge" @click="$emit('ai-action')">
        <i class="fas fa-magic"></i> {{ aiAdvice.badge }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

const props = defineProps({
  aiMentorInfo: { type: Object, required: true },
  aiAdviceLoading: { type: Boolean, default: false },
  aiAdvice: { type: Object, default: () => ({ text: '', badge: '' }) },
  currentLocale: { type: String, default: 'UZB' }
});

const emit = defineEmits(['ai-action']);
</script>

<style scoped>
/* Scoped styles */
</style>
