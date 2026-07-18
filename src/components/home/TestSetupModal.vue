<template>
  <transition name="modal-fade">
    <div class="premium-modal-overlay" v-if="showTestWizard" @click.self="$emit('close')">
      <div class="modal-wizard-card">
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <div class="m-icon-wrapper"><i :class="getSubjectIcon(selectedSubject?.id)"></i></div>
            <div class="m-title-info">
              <h3>{{ selectedSubject?.id }}</h3>
              <span>{{ currentLocale === 'RUS' ? 'Настройки Теста' : 'Test Sozlamalari' }}</span>
            </div>
          </div>
          <button class="m-close-btn" @click="$emit('close')"><i class="fas fa-times"></i></button>
        </div>
        
        <div class="modal-body">
          <!-- Level Selection -->
          <div class="m-section">
            <div class="m-section-title">
              <span class="m-step">1</span>
              <h4>{{ t('selectLevel') }}</h4>
            </div>
            <div v-if="loadingLevels" class="loading-state small">
              <div class="spinner"></div>
            </div>
            <div class="pills-grid" v-else>
              <button
                type="button"
                v-for="level in levels"
                :key="level"
                :class="['pill-btn', { active: selectedLevel === level }]"
                @click="$emit('update:selectedLevel', level)"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <!-- Question count selection -->
          <transition name="expand">
          <div class="m-section" v-if="selectedLevel">
            <div class="m-section-title">
              <span class="m-step">2</span>
              <h4>{{ t('questionCount') }}</h4>
            </div>
            <div class="pills-grid">
              <button
                type="button"
                v-for="count in questionCounts"
                :key="count"
                :class="['pill-btn', { active: selectedQuestionCount === count }]"
                @click="$emit('update:selectedQuestionCount', count)"
              >
                {{ count }} {{ t('questions') }}
              </button>
            </div>
          </div>
          </transition>
        </div>

        <div class="modal-footer">
           <button @click="$emit('start')" class="btn-start-premium" :disabled="!canStart">
             <span v-if="!loading">{{ t('startTest') }} <i class="fas fa-play"></i></span>
             <div v-else class="spinner-small"></div>
           </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

const props = defineProps({
  showTestWizard: { type: Boolean, default: false },
  selectedSubject: { type: Object, default: null },
  currentLocale: { type: String, default: 'UZB' },
  loadingLevels: { type: Boolean, default: false },
  levels: { type: Array, default: () => [] },
  selectedLevel: { type: String, default: '' },
  questionCounts: { type: Array, default: () => [5, 10, 15, 20, 25, 30] },
  selectedQuestionCount: { type: [Number, String], default: '' },
  canStart: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'update:selectedLevel', 'update:selectedQuestionCount', 'start']);

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
</script>

<style scoped>
/* Scoped styles */
</style>
