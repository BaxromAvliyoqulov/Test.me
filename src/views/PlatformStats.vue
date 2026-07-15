<template>
  <div class="stats-page-container">
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="stats-content">
      <div class="page-header">
        <div class="header-titles">
          <h1>Platforma Statistikasi</h1>
          <p>Tizimning umumiy holati va foydalanuvchilar faolligi</p>
        </div>
        <button class="btn-refresh" @click="fetchStats" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Yangilash
        </button>
      </div>

      <div v-if="loading && !stats.totalUsers" class="loading-state">
        <div class="spinner-xl"></div>
        <p>Ma'lumotlar yuklanmoqda...</p>
      </div>

      <div class="dashboard-grid" v-else>
        <!-- Top Summary Cards -->
        <div class="summary-cards">
          <div class="stat-card">
            <div class="stat-icon users"><i class="fas fa-users"></i></div>
            <div class="stat-info">
              <h3>Jami Foydalanuvchilar</h3>
              <div class="stat-value">{{ formatNumber(stats.totalUsers) }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon premium"><i class="fas fa-crown"></i></div>
            <div class="stat-info">
              <h3>Premium Obunachilar</h3>
              <div class="stat-value">{{ formatNumber(stats.premiumUsers) }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon tests"><i class="fas fa-file-alt"></i></div>
            <div class="stat-info">
              <h3>Jami Ishlangan Testlar</h3>
              <div class="stat-value">{{ formatNumber(stats.totalTests) }}</div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-container">
          <div class="chart-card donut-card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-pie"></i> Foydalanuvchilar Tarkibi</h3>
            </div>
            <div class="chart-wrapper">
              <Doughnut v-if="userChartData" :data="userChartData" :options="doughnutOptions" />
            </div>
          </div>

          <div class="chart-card bar-card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-bar"></i> Fanlar Bo'yicha Faollik</h3>
            </div>
            <div class="chart-wrapper bar-wrapper">
              <Bar v-if="subjectChartData" :data="subjectChartData" :options="barOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/config/firebase';
import { collection, query, where, getCountFromServer, getDocs } from 'firebase/firestore';

// Chart.js registration
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

const loading = ref(true);
const stats = ref({
  totalUsers: 0,
  premiumUsers: 0,
  totalTests: 0,
  subjectStats: []
});

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const fetchStats = async () => {
  loading.ref = true;
  loading.value = true;
  try {
    // 1. Total Users
    const usersCol = collection(db, 'users');
    const usersCountSnap = await getCountFromServer(usersCol);
    stats.value.totalUsers = usersCountSnap.data().count;

    // 2. Premium Users
    const premiumQuery = query(usersCol, where('isPremium', '==', true));
    const premiumCountSnap = await getCountFromServer(premiumQuery);
    stats.value.premiumUsers = premiumCountSnap.data().count;

    // 3. Total Tests
    const resultsCol = collection(db, 'results');
    const resultsCountSnap = await getCountFromServer(resultsCol);
    stats.value.totalTests = resultsCountSnap.data().count;

    // 4. Tests by Subject
    const subjectsCol = collection(db, 'subjects');
    const subjectsSnap = await getDocs(subjectsCol);
    
    const subjectStatsPromises = subjectsSnap.docs.map(async (docSnap) => {
      const subjectId = docSnap.id;
      const subQuery = query(resultsCol, where('subjectId', '==', subjectId));
      const subCountSnap = await getCountFromServer(subQuery);
      return {
        subject: subjectId,
        count: subCountSnap.data().count
      };
    });

    stats.value.subjectStats = await Promise.all(subjectStatsPromises);
    stats.value.subjectStats.sort((a, b) => b.count - a.count);

  } catch (error) {
    console.error("Error fetching stats:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});

// --- CHART DATA & OPTIONS ---

const userChartData = computed(() => {
  if (!stats.value.totalUsers) return null;
  const standardUsers = stats.value.totalUsers - stats.value.premiumUsers;
  
  return {
    labels: ['Oddiy Foydalanuvchilar', 'Premium Obunachilar'],
    datasets: [
      {
        data: [standardUsers, stats.value.premiumUsers],
        backgroundColor: ['#3b82f6', '#f59e0b'],
        hoverBackgroundColor: ['#2563eb', '#d97706'],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };
});

const subjectChartData = computed(() => {
  if (stats.value.subjectStats.length === 0) return null;
  
  // Show top 10 subjects
  const topSubjects = stats.value.subjectStats.slice(0, 10);
  
  return {
    labels: topSubjects.map(s => s.subject),
    datasets: [
      {
        label: 'Ishlangan Testlar',
        data: topSubjects.map(s => s.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
        borderRadius: 8,
      }
    ]
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#475569',
        font: { family: "'Inter', sans-serif", size: 13, weight: '600' },
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 12,
      titleFont: { family: "'Inter', sans-serif", size: 14 },
      bodyFont: { family: "'Inter', sans-serif", size: 14 }
    }
  },
  cutout: '75%'
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 12,
      titleFont: { family: "'Inter', sans-serif", size: 14 },
      bodyFont: { family: "'Inter', sans-serif", size: 14 }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(226, 232, 240, 0.6)',
        borderDash: [5, 5]
      },
      ticks: {
        color: '#64748b',
        font: { family: "'Inter', sans-serif", size: 12 }
      }
    },
    x: {
      grid: { display: false },
      ticks: {
        color: '#475569',
        font: { family: "'Inter', sans-serif", size: 12, weight: '600' }
      }
    }
  }
};
</script>

<style scoped>
.stats-page-container {
  min-height: 100vh;
  padding: 120px 20px 60px;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  pointer-events: none;
}
.glow-bg-1 {
  top: -10%; left: -5%;
  width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(255,255,255,0) 70%);
}
.glow-bg-2 {
  bottom: -10%; right: -10%;
  width: 60vw; height: 60vw;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(255,255,255,0) 70%);
}

.stats-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.header-titles h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-titles p {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
}

.btn-refresh {
  padding: 12px 24px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-refresh:hover:not(:disabled) {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.05);
}
.btn-refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: #64748b;
}
.spinner-xl {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.stat-icon.users {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0284c7;
}
.stat-icon.premium {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}
.stat-icon.tests {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #9333ea;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #64748b;
  font-weight: 600;
}
.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
}

/* Charts */
.charts-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
}

.chart-header {
  margin-bottom: 24px;
}
.chart-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}
.chart-header h3 i {
  color: #3b82f6;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}
.bar-wrapper {
  height: 350px;
}

/* Responsive */
@media (max-width: 992px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .stat-card {
    padding: 20px;
  }
  .stat-icon {
    width: 60px; height: 60px; font-size: 1.5rem;
  }
  .stat-value {
    font-size: 1.8rem;
  }
}
</style>
