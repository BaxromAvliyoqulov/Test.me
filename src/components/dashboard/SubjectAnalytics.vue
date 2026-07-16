<template>
  <div class="analytics-bento-container">
    
    <!-- Top Row: Radar Chart & Levels Grid -->
    <div class="bento-row">
      <!-- Radar Chart (Subject Overview) -->
      <div v-if="subjectStats.length > 0" class="bento-card radar-card">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-spider"></i> {{ currentLocale === 'RUS' ? 'Анализ предметов' : 'Fanlar tahlili' }}</h2>
          <p class="section-subtitle">{{ currentLocale === 'RUS' ? 'Ваши сильные стороны' : 'Sizning kuchli tomonlaringiz' }}</p>
        </div>
        <div class="radar-container">
          <Radar :data="radarData" :options="radarOptions" />
        </div>
      </div>

      <!-- Level Performance (Bento style) -->
      <div v-if="levelStats.length > 0" class="bento-card levels-card">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-layer-group"></i> {{ currentLocale === 'RUS' ? 'Уровни сложности' : 'Qiyinchilik darajalari' }}</h2>
        </div>
        <div class="level-bars">
          <div v-for="lvl in levelStats" :key="lvl.name" class="level-progress-item">
            <div class="level-top">
              <span :class="['level-badge', lvl.cls]">{{ lvl.name }}</span>
              <span class="level-pct">{{ lvl.avg }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :class="lvl.cls + '-fill'" :style="{ width: lvl.avg + '%' }"></div>
            </div>
            <div class="level-bot">
              <span>{{ lvl.count }} {{ currentLocale === 'RUS' ? 'тестов' : 'test' }}</span>
              <span v-if="lvl.perfectCount > 0" class="star-text">⭐ {{ lvl.perfectCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Detailed Subject Cards -->
    <div v-if="subjectStats.length > 0" class="bento-card detailed-subjects-card">
      <div class="section-header">
        <h2 class="section-title"><i class="fas fa-chart-bar"></i> {{ currentLocale === 'RUS' ? 'Детально по предметам' : 'Fanlar bo\'yicha batafsil' }}</h2>
      </div>
      
      <div class="subject-grid-bento">
        <div v-for="subj in subjectStats" :key="subj.name" class="subj-bento-item" :style="{ '--subj-color': subj.color }">
          <div class="subj-icon-wrap"><i :class="subj.icon"></i></div>
          <div class="subj-info-wrap">
            <span class="s-name">{{ subj.name }}</span>
            <span class="s-count">{{ subj.count }} {{ currentLocale === 'RUS' ? 'тестов' : 'ta test' }}</span>
          </div>
          <div class="s-score-wrap">
            <div class="s-ring">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle" :stroke-dasharray="subj.avg + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span class="s-pct">{{ subj.avg }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'vue-chartjs';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default {
  name: 'SubjectAnalytics',
  components: { Radar },
  props: {
    subjectStats: { type: Array, required: true },
    levelStats: { type: Array, required: true }
  },
  setup(props) {
    const { locale, t } = useI18n();

    const radarData = computed(() => {
      // Limit to top 6 subjects for best radar look
      const topSubj = [...props.subjectStats].slice(0, 6);
      
      return {
        labels: topSubj.map(s => s.name),
        datasets: [{
          label: locale.value === 'RUS' ? 'Средний балл' : 'O\'rtacha ball',
          data: topSubj.map(s => s.avg),
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          borderColor: '#6366f1',
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#6366f1',
          pointHoverBackgroundColor: '#6366f1',
          pointHoverBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          tension: 0.3
        }]
      };
    });

    const radarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { 
            color: 'rgba(148, 163, 184, 0.3)',
            lineWidth: 1
          },
          grid: { 
            color: 'rgba(148, 163, 184, 0.2)',
            lineWidth: 1,
            circular: true
          },
          pointLabels: {
            font: { 
              family: "'Outfit', 'Inter', sans-serif", 
              size: 13, 
              weight: '700' 
            },
            color: '#1e293b',
            padding: 15
          },
          ticks: { 
            display: false, 
            min: 0, 
            max: 100,
            stepSize: 20
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleFont: { family: "'Outfit', sans-serif", size: 14, weight: 'bold' },
          bodyFont: { family: "'Outfit', sans-serif", size: 14 },
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}%`;
            }
          }
        }
      }
    };

    return {
      currentLocale: locale,
      t,
      radarData,
      radarOptions
    }
  }
}
</script>

<style scoped>
.analytics-bento-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.bento-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .bento-row {
    grid-template-columns: 1fr;
  }
}

.bento-card {
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
  padding: 2rem;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.section-title i {
  color: #3b82f6;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 4px 0 0 0;
  font-weight: 500;
}

.radar-container {
  height: 300px;
  width: 100%;
  padding: 10px;
}

.level-bars {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.level-progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-pct {
  font-weight: 800;
  font-size: 1.1rem;
  color: #0f172a;
}

.level-easy { background: #ecfdf5; color: #059669; }
.level-medium { background: #fffbeb; color: #d97706; }
.level-hard { background: #fef2f2; color: #dc2626; }

.progress-track {
  height: 8px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.level-easy-fill { background: linear-gradient(90deg, #10b981, #34d399); box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
.level-medium-fill { background: linear-gradient(90deg, #f59e0b, #fbbf24); box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
.level-hard-fill { background: linear-gradient(90deg, #ef4444, #f87171); box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }

.level-bot {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.star-text {
  color: #d97706;
}

/* Detailed Subjects Mini Grid */
.subject-grid-bento {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.subj-bento-item {
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.subj-bento-item:hover {
  background: #ffffff;
  border-color: var(--subj-color);
  box-shadow: 0 10px 20px -5px color-mix(in srgb, var(--subj-color) 20%, transparent);
  transform: translateY(-2px);
}

.subj-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--subj-color) 15%, transparent);
  color: var(--subj-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.subj-info-wrap {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.s-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: #0f172a;
}

.s-count {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

/* Circular Progress for Subject */
.s-score-wrap {
  width: 45px;
  height: 45px;
  position: relative;
}

.circular-chart {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 250px;
}

.circle-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke-width: 3.8;
  stroke-linecap: round;
  stroke: var(--subj-color);
  transition: stroke-dasharray 1s ease-out;
}

.s-pct {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f172a;
}
</style>
