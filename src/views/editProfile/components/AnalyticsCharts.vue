<template>
  <div class="analytics-charts-wrap">
    <div class="charts-grid">
      
      <!-- Accuracy Over Time (Line Chart) -->
      <div class="chart-card">
        <h4><i class="fas fa-chart-line text-blue"></i> {{ t('accuracyOverTime', 'O\'sish Dinamikasi') }}</h4>
        <div v-if="!isPremium" class="premium-overlay">
          <i class="fas fa-lock"></i>
          <p>{{ t('unlockPremiumAnalytics', 'Grafiklarni ko\'rish uchun Premium oling') }}</p>
        </div>
        <div class="chart-container" :class="{ 'blur-chart': !isPremium }">
          <Line v-if="lineData" :data="lineData" :options="lineOptions" />
        </div>
      </div>

      <!-- Subject Mastery (Radar Chart) -->
      <div class="chart-card">
        <h4><i class="fas fa-spider text-purple"></i> {{ t('subjectMastery', 'Fanlarni O\'zlashtirish') }}</h4>
        <div v-if="!isPremium" class="premium-overlay">
          <i class="fas fa-lock"></i>
          <p>{{ t('unlockPremiumAnalytics', 'Grafiklarni ko\'rish uchun Premium oling') }}</p>
        </div>
        <div class="chart-container" :class="{ 'blur-chart': !isPremium }">
          <Radar v-if="radarData" :data="radarData" :options="radarOptions" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Radar } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  resultsData: {
    type: Array,
    default: () => []
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  t: {
    type: Function,
    default: (key, fallback) => fallback
  }
});

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    x: { ticks: { color: '#94a3b8', maxTicksLimit: 7 }, grid: { display: false } }
  }
};

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    r: {
      angleLines: { color: 'rgba(255,255,255,0.1)' },
      grid: { color: 'rgba(255,255,255,0.1)' },
      pointLabels: { color: '#94a3b8', font: { size: 11 } },
      ticks: { display: false, min: 0, max: 100 }
    }
  }
};

const lineData = computed(() => {
  const dataSrc = (props.resultsData.length && props.isPremium) ? props.resultsData.slice(-10) : [
    { date: 'Mon', p: 40 }, { date: 'Tue', p: 55 }, { date: 'Wed', p: 50 },
    { date: 'Thu', p: 70 }, { date: 'Fri', p: 65 }, { date: 'Sat', p: 85 }
  ];

  return {
    labels: dataSrc.map((_, i) => dataSrc[i].date || `Test ${i+1}`),
    datasets: [
      {
        label: 'Accuracy %',
        data: dataSrc.map(d => d.p || Math.round((d.score/d.total)*100)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };
});

const radarData = computed(() => {
  const subs = {};
  props.resultsData.forEach(r => {
    if (!subs[r.subject]) subs[r.subject] = { s:0, c:0 };
    subs[r.subject].s += Math.round((r.score/r.total)*100);
    subs[r.subject].c++;
  });
  
  let labels = Object.keys(subs);
  let data = labels.map(l => Math.round(subs[l].s / subs[l].c));

  if (!props.isPremium || labels.length < 3) {
    labels = ['Math', 'Physics', 'History', 'Biology', 'IT'];
    data = [70, 45, 80, 60, 90];
  }

  return {
    labels,
    datasets: [{
      label: 'Mastery',
      data,
      backgroundColor: 'rgba(168, 85, 247, 0.4)',
      borderColor: '#a855f7',
      pointBackgroundColor: '#a855f7',
    }]
  };
});
</script>

<style scoped>
.analytics-charts-wrap {
  margin-top: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.chart-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.chart-card h4 {
  color: #e2e8f0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-container {
  height: 250px;
  position: relative;
  transition: filter 0.3s;
}

.blur-chart {
  filter: blur(6px);
  pointer-events: none;
}

.premium-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}
.premium-overlay i {
  font-size: 2rem;
  color: #fbbf24;
}
</style>
