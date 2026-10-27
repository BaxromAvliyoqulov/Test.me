<template>
  <div class="panel-section">
    <div class="section-header">
      <span class="step-badge">1</span>
      <h3>{{ t('chooseSubject') }}</h3>
    </div>
    
    <!-- Skeleton loader for world-class loading experience -->
    <div v-if="loadingSubjects" class="subject-grid skeleton-grid">
      <div v-for="i in 6" :key="i" class="subject-card skeleton-card">
        <div class="skeleton-shimmer"></div>
        <div class="card-content">
          <div class="icon-wrapper skeleton-circle"></div>
          <div class="skeleton-line title"></div>
          <div class="skeleton-line badge"></div>
        </div>
      </div>
    </div>

    <!-- Subjects Grid -->
    <div class="subject-grid" v-else-if="subjects && subjects.length > 0">
      <div
        v-for="subject in subjects"
        :key="subject.id"
        :class="['subject-card', { selected: selectedSubject && selectedSubject.id === subject.id, 'goal-active': isGoalActive(subject.id) }]"
        :style="{ '--subject-color': getSubjectColor(subject) }"
        @click="$emit('select', subject)"
      >
        <div class="card-bg-icon"><i :class="getSubjectIcon(subject)"></i></div>
        <div class="card-content">
          <div class="icon-wrapper"><i :class="getSubjectIcon(subject)"></i></div>
          <h4>{{ getSubjectTitle(subject) }}</h4>
          <span class="status-badge">{{ t('testsReady') }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-subjects-state" v-else>
      <div class="empty-icon">
        <i class="fas fa-book-open"></i>
      </div>
      <h4>{{ isRus ? 'Предметы не найдены' : 'Fanlar topilmadi' }}</h4>
      <p>{{ isRus ? 'Нажмите кнопку ниже, чтобы загрузить стандартные предметы' : 'Quyidagi tugmani bosib standart fanlarni yuklang' }}</p>
      <button class="btn-retry-subjects" @click="$emit('reload')">
        <i class="fas fa-redo"></i> {{ isRus ? 'Загрузить предметы' : 'Fanlarni yuklash' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { t, locale: currentLocale } = useI18n();

const props = defineProps({
  subjects: { type: Array, required: true },
  loadingSubjects: { type: Boolean, default: false },
  selectedSubject: { type: Object, default: null },
  defaultSubjectId: { type: [String, Array], default: () => [] }
});

const emit = defineEmits(['select', 'reload']);

const isRus = computed(() => currentLocale.value === 'RUS');

const isGoalActive = (subjectId) => {
  if (Array.isArray(props.defaultSubjectId)) {
    return props.defaultSubjectId.includes(subjectId);
  }
  return props.defaultSubjectId === subjectId;
};

const getSubjectTitle = (subject) => {
  if (!subject) return '';
  if (isRus.value) {
    return subject.nameRu || subject.name || subject.nameUz || subject.id;
  }
  return subject.nameUz || subject.name || subject.id;
};

const getSubjectIcon = (subject) => {
  const icon = typeof subject === 'object' ? subject.icon : null;
  if (icon && typeof icon === 'string' && icon.startsWith('fa')) {
    return icon.startsWith('fas ') ? icon : `fas ${icon}`;
  }
  const name = typeof subject === 'object' ? (subject.name || subject.id || '') : String(subject);
  const lower = name.toLowerCase();
  if (lower.includes('matem') || lower.includes('math')) return 'fas fa-calculator';
  if (lower.includes('fizik') || lower.includes('physics')) return 'fas fa-atom';
  if (lower.includes('ingliz') || lower.includes('english')) return 'fas fa-globe';
  if (lower.includes('ona tili') || lower.includes('uzbek') || lower.includes('adabiyot')) return 'fas fa-book';
  if (lower.includes('kimyo') || lower.includes('chemistry')) return 'fas fa-flask';
  if (lower.includes('biolog') || lower.includes('biology')) return 'fas fa-dna';
  if (lower.includes('informatika') || lower.includes('computer') || lower.includes('dasturlash')) return 'fas fa-laptop-code';
  if (lower.includes('tarix') || lower.includes('history')) return 'fas fa-landmark';
  if (lower.includes('geografiya') || lower.includes('geography')) return 'fas fa-globe-americas';
  return 'fas fa-graduation-cap';
};

const getSubjectColor = (subject) => {
  const color = typeof subject === 'object' ? subject.color : null;
  if (color && typeof color === 'string') return color;
  const name = typeof subject === 'object' ? (subject.name || subject.id || '') : String(subject);
  const lower = name.toLowerCase();
  if (lower.includes('matem') || lower.includes('math')) return '#8b5cf6';
  if (lower.includes('fizik') || lower.includes('physics')) return '#f59e0b';
  if (lower.includes('ingliz') || lower.includes('english')) return '#10b981';
  if (lower.includes('ona tili') || lower.includes('uzbek')) return '#6366f1';
  if (lower.includes('kimyo') || lower.includes('chemistry')) return '#14b8a6';
  if (lower.includes('biolog') || lower.includes('biology')) return '#ec4899';
  if (lower.includes('informatika') || lower.includes('computer') || lower.includes('dasturlash')) return '#06b6d4';
  if (lower.includes('tarix') || lower.includes('history')) return '#d97706';
  if (lower.includes('geografiya') || lower.includes('geography')) return '#10b981';
  return '#3b82f6';
};
</script>

<style scoped>
/* Skeletons */
.skeleton-card {
  position: relative;
  background: #f1f5f9;
  border-color: rgba(226, 232, 240, 0.6);
  pointer-events: none;
  cursor: default;
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  top: 0; left: -150%;
  width: 150%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 1.8s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(0); }
  100% { transform: translateX(200%); }
}

.skeleton-circle {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #e2e8f0;
}

.skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: #e2e8f0;
}

.skeleton-line.title {
  width: 110px;
  height: 18px;
  margin-top: 4px;
}

.skeleton-line.badge {
  width: 70px;
  height: 12px;
}

/* Empty State */
.empty-subjects-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px dashed #cbd5e1;
  border-radius: 24px;
  gap: 10px;
}

.empty-subjects-state .empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 8px;
}

.empty-subjects-state h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.empty-subjects-state p {
  color: #64748b;
  font-size: 0.95rem;
  max-width: 400px;
  margin: 0;
}

.btn-retry-subjects {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-retry-subjects:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}
</style>
