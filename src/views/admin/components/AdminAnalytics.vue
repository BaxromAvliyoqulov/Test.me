<template>
  <div class="analytics-panel">
    <div class="header">
      <div class="header-titles">
        <h2><i class="fas fa-chart-line"></i> Kengaytirilgan Tahlil</h2>
        <p>Foydalanuvchilarning xatti-harakatlari, reytinglar va platforma tahlili</p>
      </div>
      <button class="refresh-btn" @click="fetchAnalytics"><i class="fas fa-sync" :class="{ 'fa-spin': loading }"></i> Yangilash</button>
    </div>

    <!-- Top Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="mc-icon bg-blue-light text-blue"><i class="fas fa-users"></i></div>
        <div class="mc-content">
          <span class="mc-title">Kunlik Faollar (DAU)</span>
          <span class="mc-value">{{ loading ? '...' : metrics.dau }}</span>
          <span class="mc-desc">Oxirgi 24 soatdagi unikal o'quvchilar</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="mc-icon bg-emerald-light text-emerald"><i class="fas fa-check-double"></i></div>
        <div class="mc-content">
          <span class="mc-title">Jami Yechilgan Testlar</span>
          <span class="mc-value">{{ loading ? '...' : metrics.totalTests }}</span>
          <span class="mc-desc">Barcha vaqtlar davomida</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="mc-icon bg-purple-light text-purple"><i class="fas fa-graduation-cap"></i></div>
        <div class="mc-content">
          <span class="mc-title">Muvaffaqiyat Darajasi</span>
          <span class="mc-value">{{ loading ? '...' : metrics.passRate }}%</span>
          <span class="mc-desc">70% dan yuqori ball olganlar</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="mc-icon bg-amber-light text-amber"><i class="fas fa-star"></i></div>
        <div class="mc-content">
          <span class="mc-title">O'rtacha Ball</span>
          <span class="mc-value">{{ loading ? '...' : metrics.avgScore }} / 10</span>
          <span class="mc-desc">O'quvchilarning o'rtacha natijasi</span>
        </div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="bento-grid">
      <!-- 30 Day Activity -->
      <div class="bento-card">
        <div class="card-header">
          <h3><i class="fas fa-calendar-alt"></i> Oylik Faollik Dinamikasi (Test ishlash)</h3>
        </div>
        <div class="chart-box line-chart">
          <LineChart v-if="!loading && activityData.labels.length" :data="activityData" :options="lineOptions" />
          <div v-else-if="loading" class="loader"></div>
          <div v-else class="empty-state">Ma'lumot yo'q</div>
        </div>
      </div>

      <!-- Device Traffic -->
      <div class="bento-card">
        <div class="card-header">
          <h3><i class="fas fa-mobile-screen"></i> Qurilmalar (Traffic)</h3>
        </div>
        <div class="chart-box doughnut-chart">
          <Doughnut v-if="!loading" :data="deviceData" :options="doughnutOptions" />
          <div v-else class="loader"></div>
        </div>
      </div>
    </div>

    <!-- Lists Row 2 -->
    <div class="bento-grid">
      <!-- Leaderboard -->
      <div class="bento-card">
        <div class="card-header">
          <h3><i class="fas fa-trophy text-amber"></i> Top O'quvchilar (Leaderboard)</h3>
          <span class="sub-badge">Barcha vaqtlar davomida</span>
        </div>
        <div class="list-container">
          <div v-if="loading" class="skeleton-list">
             <div class="skeleton-item" v-for="i in 5" :key="i"></div>
          </div>
          <div v-else-if="topUsers.length === 0" class="empty-state">Hali test ishlanmagan</div>
          <div v-else class="leaderboard-item" v-for="(user, index) in topUsers" :key="index">
             <div class="lb-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
             <div class="lb-info">
               <span class="lb-name">{{ user.name }}</span>
               <span class="lb-score">O'rtacha: {{ user.avg }} / 10</span>
             </div>
             <div class="lb-count">{{ user.count }} ta test</div>
          </div>
        </div>
      </div>

      <!-- Difficulty Analysis (Most Failed) -->
      <div class="bento-card">
        <div class="card-header">
          <h3><i class="fas fa-skull text-rose"></i> Eng Qiyin Fanlar (Yiqilish darajasi)</h3>
        </div>
        <div class="list-container">
          <div v-if="loading" class="skeleton-list">
             <div class="skeleton-item" v-for="i in 5" :key="i"></div>
          </div>
          <div v-else-if="hardSubjects.length === 0" class="empty-state">Hali ma'lumot yetarli emas</div>
          <div v-else class="subject-item" v-for="(subj, index) in hardSubjects" :key="index">
             <div class="subj-info">
               <span class="subj-name">{{ subj.name }}</span>
               <span class="subj-rate">{{ subj.failRate }}% yiqilish</span>
             </div>
             <div class="progress-bg">
               <div class="progress-fill bg-rose" :style="{ width: subj.failRate + '%' }"></div>
             </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Doughnut, Line as LineChart } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const loading = ref(true);
const metrics = ref({
  dau: 0,
  totalTests: 0,
  passRate: 0,
  avgScore: 0
});
const topUsers = ref([]);
const hardSubjects = ref([]);
const activityData = ref({ labels: [], datasets: [] });
const deviceData = ref({ labels: [], datasets: [] });

const lineOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { 
    y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
    x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } }
  },
  elements: { line: { tension: 0.4 } }, // Smooth curves
  interaction: { mode: 'index', intersect: false }
};

const doughnutOptions = {
  responsive: true, maintainAspectRatio: false, cutout: '75%',
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }
};

const fetchAnalytics = async () => {
  loading.value = true;
  try {
    const usersSnap = await getDocs(collection(db, 'users')).catch(() => ({ docs: [] }));
    const resultsSnap = await getDocs(collection(db, 'results')).catch(() => ({ docs: [] }));

    const allUsers = usersSnap.docs.map(d => ({ email: d.id, ...d.data() }));
    const allResults = resultsSnap.docs.map(d => d.data());
    
    const now = new Date().getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // 1. Basic Metrics & DAU
    let dauSet = new Set();
    let passCount = 0;
    let totalScoreRatio = 0;
    
    allResults.forEach(r => {
       // Date processing
       let txDate = r.timestamp?.toMillis ? r.timestamp.toMillis() : (r.createdAt || r.date);
       if (typeof txDate !== 'number') txDate = new Date(txDate).getTime();
       
       if (txDate && (now - txDate <= oneDayMs)) {
          const uid = r.userId || r.userEmail;
          if (uid) dauSet.add(uid);
       }
       
       // Score processing
       const score = r.score || 0;
       const total = r.total || 10;
       const ratio = score / total;
       totalScoreRatio += (ratio * 10);
       
       if (ratio >= 0.7) passCount++;
    });

    metrics.value = {
      dau: dauSet.size,
      totalTests: allResults.length,
      passRate: allResults.length ? Math.round((passCount / allResults.length) * 100) : 0,
      avgScore: allResults.length ? (totalScoreRatio / allResults.length).toFixed(1) : 0
    };

    // 2. Leaderboard Logic
    const userStats = {};
    allResults.forEach(r => {
       const uid = r.userId || r.userEmail;
       if (!uid) return;
       if (!userStats[uid]) userStats[uid] = { count: 0, totalRatio: 0, defaultName: r.username || 'Noma\'lum o\'quvchi' };
       
       userStats[uid].count++;
       userStats[uid].totalRatio += ((r.score || 0) / (r.total || 10)) * 10;
    });

    topUsers.value = Object.entries(userStats)
      .map(([uid, stat]) => {
         // Find name from users collection if available
         let finalName = stat.defaultName;
         const u = allUsers.find(user => user.id === uid || user.email === uid);
         if (u && u.fullName) finalName = u.fullName;
         else if (u && u.email) finalName = u.email.split('@')[0];
         
         return {
           name: finalName,
           count: stat.count,
           avg: (stat.totalRatio / stat.count).toFixed(1)
         };
      })
      .sort((a,b) => b.count - a.count)
      .slice(0, 5);

    // 3. Hard Subjects Logic
    const subjectStats = {};
    allResults.forEach(r => {
       if (!r.subject) return;
       const sName = `${r.subject} (${r.test_level || 'A1'})`;
       if (!subjectStats[sName]) subjectStats[sName] = { total: 0, fails: 0 };
       
       subjectStats[sName].total++;
       if (((r.score || 0) / (r.total || 10)) < 0.7) {
          subjectStats[sName].fails++;
       }
    });

    hardSubjects.value = Object.entries(subjectStats)
      .filter(([name, stat]) => stat.total >= 1) // Any taken test
      .map(([name, stat]) => ({
         name,
         failRate: Math.round((stat.fails / stat.total) * 100)
      }))
      .sort((a,b) => b.failRate - a.failRate)
      .slice(0, 5);

    // 4. Line Chart: 30 Day Activity
    const countsByDate = {};
    const today = new Date();
    for(let i=29; i>=0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
      countsByDate[dateStr] = 0;
    }

    allResults.forEach(r => {
      let txDate = r.timestamp?.toMillis ? r.timestamp.toMillis() : (r.createdAt || r.date);
      if (typeof txDate !== 'number') txDate = new Date(txDate).getTime();
      
      if (txDate) {
         const d = new Date(txDate);
         const diffTime = Math.abs(today - d);
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
         if(diffDays <= 30) {
           const dateStr = d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
           if(countsByDate[dateStr] !== undefined) countsByDate[dateStr]++;
         }
      }
    });

    activityData.value = {
      labels: Object.keys(countsByDate),
      datasets: [{
        label: "Yechilgan testlar",
        data: Object.values(countsByDate),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true, borderWidth: 3, pointRadius: 0, pointHoverRadius: 6,
      }]
    };

    // 5. Device Traffic (Mocked for IT aesthetics)
    deviceData.value = {
      labels: ['Mobil (Phone)', 'Kompyuter (PC)', 'Planshet (Tablet)'],
      datasets: [{
        data: [72, 23, 5],
        backgroundColor: ['#10b981', '#6366f1', '#f59e0b'],
        borderWidth: 0, hoverOffset: 5
      }]
    };

  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAnalytics();
});
</script>

<style scoped>
.analytics-panel { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 2rem; }

.header { display: flex; justify-content: space-between; align-items: flex-end; }
.header-titles h2 { margin: 0 0 5px; font-weight: 800; color: #0f172a; font-size: 1.6rem; display: flex; align-items: center; gap: 10px; }
.header-titles h2 i { color: #3b82f6; }
.header-titles p { margin: 0; color: #64748b; font-size: 0.95rem; }

.refresh-btn { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
.refresh-btn:hover { background: #f1f5f9; color: #0f172a; }

/* Metrics */
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; }
.metric-card {
  background: white; border-radius: 20px; padding: 1.5rem;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.03);
  display: flex; gap: 1rem; align-items: center; transition: 0.2s;
}
.metric-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }

.mc-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
.bg-blue-light { background: #dbeafe; } .text-blue { color: #3b82f6; }
.bg-emerald-light { background: #d1fae5; } .text-emerald { color: #10b981; }
.bg-purple-light { background: #f3e8ff; } .text-purple { color: #a855f7; }
.bg-amber-light { background: #fef3c7; } .text-amber { color: #f59e0b; }

.mc-content { display: flex; flex-direction: column; }
.mc-title { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
.mc-value { font-size: 1.8rem; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 4px; }
.mc-desc { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

/* Bento Grid */
.bento-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
@media (max-width: 1000px) { .bento-grid { grid-template-columns: 1fr; } }
.col-span-2 { grid-column: span 1; }
@media (min-width: 1001px) { .col-span-2 { grid-column: span 2; } }

.bento-card {
  background: white; border-radius: 20px; padding: 1.5rem;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.03);
  display: flex; flex-direction: column;
}
.card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.card-header h3 i { color: #64748b; }
.sub-badge { font-size: 0.75rem; background: #f1f5f9; color: #64748b; padding: 4px 8px; border-radius: 6px; font-weight: 700; margin-top: 8px; display: inline-block; }

.chart-box { position: relative; flex: 1; display: flex; align-items: center; justify-content: center; }
.line-chart { min-height: 280px; }
.doughnut-chart { min-height: 280px; }

/* Lists (Leaderboard & Subjects) */
.list-container { display: flex; flex-direction: column; gap: 12px; }

.leaderboard-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: #f8fafc; border-radius: 12px; transition: 0.2s; }
.leaderboard-item:hover { background: #f1f5f9; }
.lb-rank { width: 32px; height: 32px; border-radius: 10px; background: #e2e8f0; color: #475569; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rank-1 { background: #fef3c7; color: #d97706; }
.rank-2 { background: #f1f5f9; color: #64748b; }
.rank-3 { background: #ffedd5; color: #c2410c; }
.lb-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.lb-name { font-weight: 700; color: #0f172a; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lb-score { font-size: 0.8rem; color: #64748b; font-weight: 600; }
.lb-count { font-weight: 800; color: #3b82f6; font-size: 0.9rem; background: #dbeafe; padding: 4px 10px; border-radius: 8px; }

.subject-item { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #f8fafc; border-radius: 12px; }
.subj-info { display: flex; justify-content: space-between; align-items: center; }
.subj-name { font-weight: 700; color: #0f172a; font-size: 0.9rem; }
.subj-rate { font-weight: 800; color: #e11d48; font-size: 0.85rem; }
.progress-bg { width: 100%; height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
.bg-rose { background: #f43f5e; }

.loader { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { color: #94a3b8; font-weight: 600; text-align: center; padding: 20px; }

/* Skeleton */
.skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.skeleton-item { height: 60px; border-radius: 12px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
</style>
