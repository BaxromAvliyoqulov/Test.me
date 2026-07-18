<template>
  <div class="premium-card achievements-card">
    <h4>{{ t('activityAndAwards') }}</h4>
    
    <!-- Streak counter -->
    <div class="streak-box">
      <div class="fire-icon">
        <i class="fas fa-fire"></i>
      </div>
      <div class="streak-info">
        <strong>{{ getStreakText(userStreak) }}</strong>
        <span>{{ t('streakStreak') }}</span>
      </div>
    </div>

    <!-- Mini Badges preview -->
    <div class="badges-preview">
      <h5>{{ t('latestAwards') }}</h5>
      <div class="mini-badges-row" v-if="unlockedBadges.length > 0">
        <div 
          v-for="badge in unlockedBadges.slice(0, 4)"
          :key="badge.id"
          class="badge-item"
          :style="{ '--badge-color': badge.color }"
          :title="currentLocale === 'RUS' ? badge.nameRu : badge.nameUz"
        >
          <i :class="badge.icon"></i>
        </div>
        <router-link to="/badges" class="btn-all-badges" :title="currentLocale === 'RUS' ? 'Все награды' : 'Barcha yutuqlar'">
          <i class="fas fa-chevron-right"></i>
        </router-link>
      </div>
      <div class="empty-state small" v-else>
        {{ t('noBadgesYet') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

const props = defineProps({
  userStreak: { type: Number, default: 0 },
  unlockedBadges: { type: Array, default: () => [] },
  currentLocale: { type: String, default: 'UZB' }
});

const getStreakText = (streak) => {
  if (streak === 0) return props.currentLocale === 'RUS' ? 'Нет стрика' : 'Hali boshlanmadi';
  return `${streak} ${props.currentLocale === 'RUS' ? 'дней' : 'kun'}`;
};
</script>

<style scoped>
/* Scoped styles */
</style>
