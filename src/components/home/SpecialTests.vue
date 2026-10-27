<template>
  <div class="panel-section">
    <div class="section-header">
      <span class="step-badge special"><i class="fas fa-star"></i></span>
      <h3>{{ isRus ? 'Специальные тесты и ДТМ' : 'DTM va Maxsus Imtihonlar' }}</h3>
    </div>
    
    <div v-if="loadingSpecial && (!specialTests || specialTests.length === 0)" class="loading-state">
      <div class="spinner"></div>
      <p>{{ isRus ? 'Загрузка специальных тестов...' : 'Maxsus testlar yuklanmoqda...' }}</p>
    </div>
    
    <div class="special-tests-list" v-else-if="specialTests.length > 0">
      <div v-for="test in specialTests" :key="test.id" class="special-test-card" @click="$emit('start-test', test)">
        <div class="st-icon" :class="getCategoryClass(test.category)">
          <i :class="getCategoryIcon(test.category)"></i>
        </div>
        <div class="st-details">
          <h4>{{ test.title }}</h4>
          <span class="st-category">{{ test.category }}</span>
        </div>
        <button class="btn-st-start"><i class="fas fa-play"></i> {{ isRus ? 'Начать' : 'Boshlash' }}</button>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <i class="fas fa-box-open"></i>
      <p>{{ isRus ? 'Специальные тесты пока не добавлены.' : 'Hozircha maxsus testlar yo\'q.' }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { locale: currentLocale } = useI18n();

const props = defineProps({
  specialTests: { type: Array, required: true },
  loadingSpecial: { type: Boolean, default: false }
});

const emit = defineEmits(['start-test']);

const isRus = computed(() => currentLocale.value === 'RUS');

const getCategoryClass = (category) => {
  if (!category) return 'dtm';
  const cat = String(category).toLowerCase();
  if (cat.includes('dtm')) return 'dtm';
  if (cat.includes('mantiq') || cat.includes('iq')) return 'mantiq';
  if (cat.includes('cefr') || cat.includes('eng')) return 'cefr';
  return 'dtm';
};

const getCategoryIcon = (category) => {
  if (!category) return 'fas fa-graduation-cap';
  const cat = String(category).toLowerCase();
  if (cat.includes('dtm')) return 'fas fa-award';
  if (cat.includes('mantiq') || cat.includes('iq')) return 'fas fa-brain';
  if (cat.includes('cefr') || cat.includes('eng')) return 'fas fa-globe';
  return 'fas fa-graduation-cap';
};
</script>

<style scoped>
/* Scoped styles */
</style>
