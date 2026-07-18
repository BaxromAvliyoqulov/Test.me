<template>
  <div class="panel-section">
    <div class="section-header">
      <span class="step-badge">1</span>
      <h3>{{ t('chooseSubject') }}</h3>
    </div>
    
    <div v-if="loadingSubjects" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('loadingSubjects') }}</p>
    </div>

    <div class="subject-grid" v-else>
      <div
        v-for="subject in subjects"
        :key="subject.id"
        :class="['subject-card', { selected: selectedSubject && selectedSubject.id === subject.id, 'goal-active': subject.id === defaultSubjectId }]"
        :style="{ '--subject-color': getSubjectColor(subject.id) }"
        @click="$emit('select', subject)"
      >
        <div class="card-bg-icon"><i :class="getSubjectIcon(subject.id)"></i></div>
        <div class="card-content">
          <div class="icon-wrapper"><i :class="getSubjectIcon(subject.id)"></i></div>
          <h4>{{ subject.id }}</h4>
          <span class="status-badge">{{ t('testsReady') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

const props = defineProps({
  subjects: { type: Array, required: true },
  loadingSubjects: { type: Boolean, default: false },
  selectedSubject: { type: Object, default: null },
  defaultSubjectId: { type: String, default: null }
});

const emit = defineEmits(['select']);

const getSubjectIcon = (name) => {
  if (!name) return 'fas fa-graduation-cap';
  const lower = name.toLowerCase();
  if (lower.includes('matem') || lower.includes('math')) return 'fas fa-calculator';
  if (lower.includes('fizik') || lower.includes('physics')) return 'fas fa-atom';
  if (lower.includes('ingliz') || lower.includes('english')) return 'fas fa-globe';
  if (lower.includes('ona tili') || lower.includes('uzbek')) return 'fas fa-book';
  if (lower.includes('kimyo') || lower.includes('chemistry')) return 'fas fa-flask';
  if (lower.includes('biolog') || lower.includes('biology')) return 'fas fa-dna';
  if (lower.includes('informatika') || lower.includes('computer')) return 'fas fa-laptop-code';
  if (lower.includes('tarix') || lower.includes('history')) return 'fas fa-landmark';
  if (lower.includes('geografiya') || lower.includes('geography')) return 'fas fa-globe-americas';
  if (lower.includes('adabiyot') || lower.includes('literature')) return 'fas fa-feather-alt';
  return 'fas fa-graduation-cap';
};

const getSubjectColor = (name) => {
  if (!name) return '#3b82f6';
  const lower = name.toLowerCase();
  if (lower.includes('matem') || lower.includes('math')) return '#8b5cf6';
  if (lower.includes('fizik') || lower.includes('physics')) return '#f59e0b';
  if (lower.includes('ingliz') || lower.includes('english')) return '#ef4444';
  if (lower.includes('ona tili') || lower.includes('uzbek')) return '#3b82f6';
  if (lower.includes('kimyo') || lower.includes('chemistry')) return '#10b981';
  if (lower.includes('biolog') || lower.includes('biology')) return '#84cc16';
  if (lower.includes('informatika') || lower.includes('computer')) return '#06b6d4';
  if (lower.includes('tarix') || lower.includes('history')) return '#d97706';
  if (lower.includes('geografiya') || lower.includes('geography')) return '#14b8a6';
  if (lower.includes('adabiyot') || lower.includes('literature')) return '#ec4899';
  return '#3b82f6';
};
</script>

<style scoped>
/* Scoped styles will be extracted from home.vue eventually, but we can rely on global or home.vue styles for now if we want, or copy them. */
</style>
