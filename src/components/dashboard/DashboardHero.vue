<template>
  <div class="hero-bento-grid">
    <!-- Main Welcome & Chart Card -->
    <div class="bento-card welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">{{ currentLocale === 'RUS' ? 'С возвращением!' : 'Xush kelibsiz!' }}</h1>
          <p class="welcome-subtitle">{{ currentLocale === 'RUS' ? 'Вот ваш текущий прогресс' : 'Sizning joriy natijalaringiz' }}</p>
        </div>
        
        <div class="chart-container">
          <Doughnut :data="chartData" :options="chartOptions" />
          <div class="chart-center-text">
            <h2>{{ averageScorePercent }}%</h2>
            <span>{{ t('averageScore') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini Stats Grid (Bento right side) -->
    <div class="mini-stats-wrapper">
      <div class="bento-card stat-bento blue-bento">
        <div class="stat-icon"><i class="fas fa-clipboard-list"></i></div>
        <div class="stat-info">
          <h3>{{ totalTests }}</h3>
          <span>{{ t('totalTests') }}</span>
        </div>
      </div>

      <div class="bento-card stat-bento orange-bento">
        <div class="stat-icon"><i class="fas fa-trophy"></i></div>
        <div class="stat-info">
          <h3>{{ highestScorePercent }}%</h3>
          <span>{{ t('highestScore') }}</span>
        </div>
      </div>

      <div class="bento-card stat-bento green-bento">
        <div class="stat-icon"><i class="fas fa-star"></i></div>
        <div class="stat-info">
          <h3>{{ perfectScoreCount }}</h3>
          <span>{{ currentLocale === 'RUS' ? 'Идеальных' : '100% Natijalar' }}</span>
        </div>
      </div>

      <div class="bento-card stat-bento purple-bento">
        <div class="stat-icon"><i class="fas fa-graduation-cap"></i></div>
        <div class="stat-info">
          <h3 class="text-truncate" :title="bestSubjectName">{{ bestSubjectName }}</h3>
          <span>{{ t('bestSubject') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  name: 'DashboardHero',
  components: { Doughnut },
  props: {
    totalTests: { type: Number, required: true },
    averageScorePercent: { type: Number, required: true },
    highestScorePercent: { type: Number, required: true },
    bestSubjectName: { type: String, required: true },
    perfectScoreCount: { type: Number, required: true },
    uniqueSubjectsStudied: { type: Number, required: true },
  },
  setup(props) {
    const { locale, t } = useI18n();

    const chartData = computed(() => ({
      labels: [t('averageScore'), locale.value === 'RUS' ? 'Ошибки' : 'Xatolar'],
      datasets: [
        {
          data: [props.averageScorePercent, 100 - props.averageScorePercent],
          backgroundColor: ['#3b82f6', '#e2e8f0'],
          hoverBackgroundColor: ['#2563eb', '#cbd5e1'],
          borderWidth: 0,
          cutout: '75%',
          borderRadius: 20
        }
      ]
    }));

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          cornerRadius: 12,
          titleFont: { family: 'Outfit', size: 14 },
          bodyFont: { family: 'Outfit', size: 14 }
        }
      }
    };

    return {
      currentLocale: locale,
      t,
      chartData,
      chartOptions
    };
  }
}
</script>

<style scoped>
.hero-bento-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

@media (max-width: 900px) {
  .hero-bento-grid {
    grid-template-columns: 1fr;
  }
}

.bento-card {
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
  overflow: hidden;
  position: relative;
  transition: all 0.4s ease;
}

.welcome-card {
  padding: 2.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

@media (max-width: 600px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
}

.chart-container {
  width: 180px;
  height: 180px;
  position: relative;
  flex-shrink: 0;
}

.chart-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.chart-center-text h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.chart-center-text span {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 4px;
}

.mini-stats-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.stat-bento {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.stat-bento:hover {
  transform: translateY(-4px) scale(1.02);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.blue-bento { border-bottom: 4px solid #3b82f6; }
.blue-bento .stat-icon { background: #eff6ff; color: #3b82f6; }

.orange-bento { border-bottom: 4px solid #f59e0b; }
.orange-bento .stat-icon { background: #fffbeb; color: #f59e0b; }

.green-bento { border-bottom: 4px solid #10b981; }
.green-bento .stat-icon { background: #ecfdf5; color: #10b981; }

.purple-bento { border-bottom: 4px solid #8b5cf6; }
.purple-bento .stat-icon { background: #f5f3ff; color: #8b5cf6; }

.stat-info h3 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.stat-info span {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
