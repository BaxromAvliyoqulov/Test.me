<template>
  <div class="premium-card rank-card">
    <div class="rank-header">
      <div class="rank-badge" :class="getRankClass(userPoints)">
        <i :class="getRankIcon(userPoints)"></i> {{ getRankName(userPoints, currentLocale) }}
      </div>
      <span class="next-rank">
        → {{ nextRank.nextRankName }}
      </span>
    </div>
    <div class="progress-track">
      <div 
        class="progress-fill" 
        :class="getRankClass(userPoints)"
        :style="{ width: nextRank.progressPercent + '%' }"
      >
        <div class="progress-glow"></div>
      </div>
    </div>
    <div class="rank-footer">
      <span>{{ nextRank.label }}</span>
      <span v-if="nextRank.pointsNeeded > 0" class="points-needed">
        {{ currentLocale === 'RUS' ? `Нужно еще ${nextRank.pointsNeeded} TP` : `Yana ${nextRank.pointsNeeded} TP` }}
      </span>
      <span v-else class="points-needed">{{ currentLocale === 'RUS' ? 'Максимальный Ранг' : 'Maksimal Rang' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getRankName, getRankClass, getRankIcon, getNextRankInfo } from '@/utils/ranks';

const props = defineProps({
  userPoints: { type: Number, default: 0 },
  currentLocale: { type: String, default: 'UZB' }
});

const nextRank = computed(() => getNextRankInfo(props.userPoints, props.currentLocale));
</script>

<style scoped>
/* Scoped styles */
</style>
