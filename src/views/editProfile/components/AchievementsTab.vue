<template>
  <div class="tab-pane-content">
    <div class="pro-form-body">
      <!-- Grid Statistics Cards -->
      <div class="stats-mini-grid">
        <div class="stat-mini-card">
          <i class="fas fa-clipboard-list stat-mini-icon text-blue"></i>
          <div class="stat-mini-info">
            <span class="stat-mini-lbl">{{ currentLocale === 'RUS' ? 'Всего тестов' : 'Jami testlar' }}</span>
            <span class="stat-mini-val">{{ stats.totalTests }}</span>
          </div>
        </div>
      
        <div class="stat-mini-card">
          <i class="fas fa-percentage stat-mini-icon text-orange"></i>
          <div class="stat-mini-info">
            <span class="stat-mini-lbl">{{ currentLocale === 'RUS' ? 'Ср. Точность' : 'O\'rtacha aniqlik' }}</span>
            <span class="stat-mini-val">{{ stats.averageAccuracy }}%</span>
          </div>
        </div>

        <div class="stat-mini-card">
          <i class="fas fa-trophy stat-mini-icon text-gold"></i>
          <div class="stat-mini-info">
            <span class="stat-mini-lbl">{{ currentLocale === 'RUS' ? 'Лучший результат' : 'Eng yuqori ball' }}</span>
            <span class="stat-mini-val">{{ stats.highestAccuracy }}%</span>
          </div>
        </div>

        <div class="stat-mini-card">
          <i class="fas fa-star stat-mini-icon text-purple"></i>
          <div class="stat-mini-info">
            <span class="stat-mini-lbl">{{ currentLocale === 'RUS' ? 'Лучший предмет' : 'Eng yaxshi fan' }}</span>
            <span class="stat-mini-val text-truncate" :title="stats.bestSubject">{{ stats.bestSubject }}</span>
          </div>
        </div>
      </div>

      <!-- Unlocked Badges Gallery Grid -->
      <div class="badges-gallery-wrap">
        <h3 class="badges-gallery-title">
          <i class="fas fa-ribbon"></i> {{ currentLocale === 'RUS' ? 'Мои Награды' : 'Mening mukofotlarim' }}
        </h3>
        <div class="badges-gallery-grid">
          <div 
            v-for="badge in badges" 
            :key="badge.id" 
            :class="['badge-gallery-item', { locked: !badge.unlocked }]"
          >
            <div 
              class="badge-icon-bubble"
              :style="{ 
                backgroundColor: badge.unlocked ? badge.color + '15' : '#f1f5f9',
                borderColor: badge.unlocked ? badge.color : '#e2e8f0',
                color: badge.unlocked ? badge.color : '#94a3b8'
              }"
            >
              <i :class="badge.icon"></i>
              <i v-if="!badge.unlocked" class="fas fa-lock badge-lock-icon"></i>
            </div>
            <div class="badge-gallery-meta">
              <span class="badge-gallery-name">{{ badge.name }}</span>
              <span class="badge-gallery-desc">{{ badge.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Analytics Charts -->
      <AnalyticsCharts 
        :results-data="rawResults" 
        :is-premium="profile.isPremium" 
        :t="t"
      />
    </div>
  </div>
</template>

<script setup>
import AnalyticsCharts from './AnalyticsCharts.vue';

const props = defineProps({
  currentLocale: String,
  stats: Object,
  badges: Array,
  rawResults: Array,
  profile: Object,
  t: Function
});
</script>
