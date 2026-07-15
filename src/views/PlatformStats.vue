<template>
  <div class="stats-page-container">
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>
    <div class="glow-bg glow-bg-3"></div>

    <div class="stats-content">
      <div class="page-header">
        <div class="header-titles">
          <h1>Tizim Statistikasi</h1>
          <p>Platformaning umumiy holati va real-time ko'rsatkichlar</p>
        </div>
        <button class="btn-refresh" @click="fetchStats" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Yangilash
        </button>
      </div>

      <div v-if="loading && !stats.totalUsers" class="loading-state">
        <div class="spinner-xl"></div>
        <p>Real-time ma'lumotlar tahlil qilinmoqda...</p>
      </div>

      <div class="dashboard-grid" v-else>
        <!-- Top Summary Cards (Users & Tests) -->
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
            <div class="stat-icon tests-taken"><i class="fas fa-check-double"></i></div>
            <div class="stat-info">
              <h3>Jami Ishlangan Testlar</h3>
              <div class="stat-value">{{ formatNumber(stats.totalTestsTaken) }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon questions"><i class="fas fa-database"></i></div>
            <div class="stat-info">
              <h3>Bazada Jami Savollar</h3>
              <div class="stat-value">{{ formatNumber(stats.totalQuestionsInDb) }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon special"><i class="fas fa-bolt"></i></div>
            <div class="stat-info">
              <h3>Maxsus Testlar</h3>
              <div class="stat-value">{{ formatNumber(stats.specialTests) }}</div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-container">
          
          <!-- Device Info Chart -->
          <div class="chart-card device-card">
            <div class="chart-header">
              <h3><i class="fas fa-mobile-screen"></i> Qurilmalar Statistikasi</h3>
            </div>
            <div class="chart-wrapper">
              <Doughnut v-if="deviceChartData" :data="deviceChartData" :options="deviceOptions" />
              <div class="no-data" v-if="!deviceChartData || deviceChartData.datasets[0].data.length === 0">
                Ma'lumot yig'ilmoqda...
              </div>
            </div>
          </div>

          <!-- Free vs Premium Chart -->
          <div class="chart-card donut-card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-pie"></i> Foydalanuvchilar Tarkibi</h3>
            </div>
            <div class="chart-wrapper">
              <Doughnut v-if="userChartData" :data="userChartData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- Activity by Subject Chart -->
          <div class="chart-card bar-card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-column"></i> Fanlar Bo'yicha Faollik</h3>
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
import { collection, query, where, getCountFromServer, getDocs, collectionGroup } from 'firebase/firestore';

// Chart.js registration
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

const loading = ref(true);
const stats = ref({
  totalUsers: 0,
  premiumUsers: 0,
  totalTestsTaken: 0,
  totalQuestionsInDb: 0,
  specialTests: 0,
  subjectStats: [],
  deviceStats: {}
});

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const fetchStats = async () => {
  loading.value = true;
  try {
    // 1. Users count
    const usersCol = collection(db, 'users');
    const usersCountSnap = await getCountFromServer(usersCol);
    stats.value.totalUsers = usersCountSnap.data().count;

    // 2. Premium Users
    const premiumQuery = query(usersCol, where('isPremium', '==', true));
    const premiumCountSnap = await getCountFromServer(premiumQuery);
    stats.value.premiumUsers = premiumCountSnap.data().count;

    // 3. Total Tests Taken
    const resultsCol = collection(db, 'results');
    const resultsCountSnap = await getCountFromServer(resultsCol);
    stats.value.totalTestsTaken = resultsCountSnap.data().count;

    // 4. Total Questions in DB (using collectionGroup)
    const allTestsQuery = collectionGroup(db, 'tests');
    const allTestsCountSnap = await getCountFromServer(allTestsQuery);
    stats.value.totalQuestionsInDb = allTestsCountSnap.data().count;

    // 5. Special Tests Count
    const specialTestsCol = collection(db, 'special_tests');
    const specialCountSnap = await getCountFromServer(specialTestsCol);
    stats.value.specialTests = specialCountSnap.data().count;

    // 6. Devices Info (Read all users - cost effective for small/medium DBs)
    const usersSnap = await getDocs(usersCol);
    const devices = { 'Windows': 0, 'macOS': 0, 'Android': 0, 'iOS': 0, 'Linux': 0, 'Unknown': 0 };
    usersSnap.forEach(doc => {
      const data = doc.data();
      const os = data.deviceOS || 'Unknown';
      if (devices[os] !== undefined) devices[os]++;
      else devices['Unknown']++;
    });
    stats.value.deviceStats = devices;

    // 7. Tests taken by Subject
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

const deviceChartData = computed(() => {
  const d = stats.value.deviceStats;
  const totalWithDevice = Object.values(d).reduce((a,b)=>a+b, 0);
  if (totalWithDevice === 0) return null;

  return {
    labels: ['Windows', 'macOS', 'Android', 'iOS', 'Linux', 'Noma\'lum'],
    datasets: [
      {
        data: [d['Windows'], d['macOS'], d['Android'], d['iOS'], d['Linux'], d['Unknown']],
        backgroundColor: ['#0078D7', '#a1a1aa', '#3DDC84', '#000000', '#facc15', '#cbd5e1'],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };
});

const subjectChartData = computed(() => {
  if (stats.value.subjectStats.length === 0) return null;
  const topSubjects = stats.value.subjectStats.slice(0, 10);
  
  return {
    labels: topSubjects.map(s => s.subject),
    datasets: [
      {
        label: 'Ishlangan Testlar',
        data: topSubjects.map(s => s.count),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
        borderRadius: 6,
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
      labels: { color: '#475569', font: { family: "'Inter', sans-serif", size: 13, weight: '600' }, padding: 15 }
    },
    tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: 12, titleFont: { size: 14 }, bodyFont: { size: 14 } }
  },
  cutout: '70%'
};

const deviceOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { color: '#475569', font: { family: "'Inter', sans-serif", size: 13, weight: '600' }, padding: 10 }
    },
    tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: 12, titleFont: { size: 14 }, bodyFont: { size: 14 } }
  },
  cutout: '60%'
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: 12, titleFont: { size: 14 }, bodyFont: { size: 14 } }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(226, 232, 240, 0.6)', borderDash: [5, 5] },
      ticks: { color: '#64748b', font: { family: "'Inter', sans-serif", size: 12 } }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#475569', font: { family: "'Inter', sans-serif", size: 12, weight: '600' } }
    }
  }
};
</script>

<style scoped>
.stats-page-container {
  min-height: 100vh;
  padding: 100px 20px 60px;
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
  top: -10%; left: -5%; width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(255,255,255,0) 70%);
}
.glow-bg-2 {
  bottom: -10%; right: -10%; width: 60vw; height: 60vw;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(255,255,255,0) 70%);
}
.glow-bg-3 {
  top: 40%; left: 30%; width: 40vw; height: 40vw;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(255,255,255,0) 70%);
}

.stats-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.header-titles h1 {
  font-size: 2.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-titles p {
  color: #64748b;
  font-size: 1.15rem;
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
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.08);
}
.btn-refresh:disabled { opacity: 0.7; cursor: not-allowed; }

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
  width: 50px; height: 50px;
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 65px; height: 65px;
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
}
.stat-icon.users { background: linear-gradient(135deg, #e0f2fe, #bae6fd); color: #0284c7; }
.stat-icon.premium { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #d97706; }
.stat-icon.tests-taken { background: linear-gradient(135deg, #f3e8ff, #e9d5ff); color: #9333ea; }
.stat-icon.questions { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669; }
.stat-icon.special { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #dc2626; }

.stat-info h3 { margin: 0 0 6px 0; font-size: 0.95rem; color: #64748b; font-weight: 600; line-height: 1.2; }
.stat-value { font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -1px; }

/* Charts */
.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 24px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
}

.bar-card {
  grid-column: span 3;
}

.chart-header { margin-bottom: 24px; }
.chart-header h3 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; }
.chart-header h3 i { color: #6366f1; }

.chart-wrapper {
  position: relative;
  height: 280px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bar-wrapper { height: 350px; }

.no-data {
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .charts-container { grid-template-columns: 1fr 1fr; }
  .bar-card { grid-column: span 2; }
}
@media (max-width: 992px) {
  .charts-container { grid-template-columns: 1fr; }
  .bar-card { grid-column: span 1; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .header-titles h1 { font-size: 2.2rem; }
  .stat-card { padding: 20px; }
  .stat-icon { width: 55px; height: 55px; font-size: 1.5rem; }
  .stat-value { font-size: 1.6rem; }
}
</style>
