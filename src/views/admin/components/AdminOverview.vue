<template>
  <div class="overview-panel">
    
    <!-- Header with Quick Actions -->
    <div class="overview-header">
      <div class="header-titles">
        <h2>Admin Panel Overview</h2>
        <p>Barcha platforma ko'rsatkichlari va tezkor amallar</p>
      </div>
      <div class="quick-actions">
        <button class="qa-btn" @click="$emit('navigate', 'addSubject')">
          <i class="fas fa-plus"></i> Yangi Test
        </button>
        <button class="qa-btn" @click="$emit('navigate', 'notifications')">
          <i class="fas fa-paper-plane"></i> Xabar Yuborish
        </button>
        <button class="qa-btn qa-btn-accent" @click="$emit('navigate', 'addAdmin')">
          <i class="fas fa-user-shield"></i> Admin Qo'shish
        </button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.key" class="stat-card" :style="{ '--accent': card.color }">
        <div class="stat-icon-wrap" :style="{ background: card.color + '20', color: card.color }">
          <i :class="card.icon"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ loading ? '...' : formatNum(cardValues[card.key]) }}</span>
          <span class="stat-label">{{ card.label }}</span>
        </div>
        <div class="stat-trend up">
          <i class="fas fa-arrow-up"></i>
        </div>
      </div>
    </div>

    <!-- Interactive Charts & Activity Feed Grid -->
    <div class="main-grid">
      
      <!-- Chart Area -->
      <div class="panel-card chart-card">
        <div class="panel-card-header">
          <h3><i class="fas fa-chart-area"></i> Oxirgi 7 kunlik statistika (Ro'yxatdan O'tish)</h3>
        </div>
        <div class="chart-container">
          <div v-if="loading" class="chart-skeleton"></div>
          <Line v-else-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
          <div v-else class="empty-state">Ma'lumot yetarli emas</div>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="panel-card feed-card">
        <div class="panel-card-header">
          <h3><i class="fas fa-bolt"></i> Jonli Harakatlar</h3>
          <button class="see-all-btn" @click="loadData"><i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i></button>
        </div>
        
        <div v-if="loading" class="shimmer-list">
          <div v-for="i in 5" :key="i" class="shimmer-row"></div>
        </div>
        <div v-else class="activity-feed">
          <div v-for="(item, index) in activityFeed" :key="index" class="feed-item">
            <div class="feed-icon" :style="{ background: item.color + '20', color: item.color }">
              <i :class="item.icon"></i>
            </div>
            <div class="feed-content">
              <p class="feed-text" v-html="item.text"></p>
              <span class="feed-time">{{ item.time }}</span>
            </div>
          </div>
          <div v-if="!activityFeed.length" class="empty-mini">Harakatlar yo'q</div>
        </div>
      </div>

      <!-- Subject Popularity Lists -->
      <div class="panel-card full-width-card">
        <div class="panel-card-header">
          <h3><i class="fas fa-fire"></i> Fanlar Ommabopligi</h3>
        </div>
        <div v-if="loading" class="shimmer-list">
          <div v-for="i in 3" :key="i" class="shimmer-row"></div>
        </div>
        <div v-else class="popularity-grid">
          <div class="pop-column">
            <h4 class="pop-title text-emerald"><i class="fas fa-arrow-trend-up"></i> Eng ko'p ishlanganlar (Top 5)</h4>
            <div class="pop-list">
              <div v-for="(subj, index) in topSubjects" :key="'top'+index" class="pop-item">
                <span class="pop-rank">{{ index + 1 }}</span>
                <span class="pop-name">{{ subj.name }}</span>
                <span class="pop-count">{{ subj.count }} marta</span>
              </div>
              <div v-if="!topSubjects.length" class="empty-mini">Ma'lumot yo'q</div>
            </div>
          </div>
          <div class="pop-column">
            <h4 class="pop-title text-rose"><i class="fas fa-arrow-trend-down"></i> Eng kam ishlanganlar</h4>
            <div class="pop-list">
              <div v-for="(subj, index) in bottomSubjects" :key="'bot'+index" class="pop-item">
                <span class="pop-rank danger">{{ topSubjects.length > 0 ? (topSubjects.length + index + 1) : index + 1 }}</span>
                <span class="pop-name">{{ subj.name }}</span>
                <span class="pop-count danger-text">{{ subj.count }} marta</span>
              </div>
              <div v-if="!bottomSubjects.length" class="empty-mini">Ma'lumot yo'q</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Stats -->
      <div class="panel-card full-width-card">
        <div class="panel-card-header">
          <h3><i class="fas fa-chart-bar"></i> Platforma Maqsadli Statistikasi</h3>
        </div>
        <div class="platform-stats-list">
          <div v-for="stat in platformStats" :key="stat.label" class="platform-stat-row">
            <span class="ps-label"><i :class="stat.icon"></i> {{ stat.label }}</span>
            <div class="ps-bar-wrap">
              <div class="ps-bar-fill" :style="{ width: stat.percent + '%', background: stat.color }"></div>
            </div>
            <span class="ps-val">{{ loading ? '...' : formatNum(stat.value) }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

defineEmits(['navigate']);

const loading = ref(true);
const cardValues = ref({ totalUsers: 0, totalTests: 0, totalResults: 0, totalCerts: 0 });
const platformStats = ref([]);
const activityFeed = ref([]);
const topSubjects = ref([]);
const bottomSubjects = ref([]);
const chartData = ref({ labels: [], datasets: [] });
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false }
  },
  scales: {
    y: { beginAtZero: true, grid: { borderDash: [5, 5], color: '#f1f5f9' } },
    x: { grid: { display: false } }
  },
  interaction: { mode: 'nearest', axis: 'x', intersect: false },
  elements: { line: { tension: 0.4 } } // Smooth curves
};

const statCards = [
  { key: 'totalUsers',   label: "Jami Foydalanuvchilar", icon: 'fas fa-users',         color: '#3b82f6' },
  { key: 'totalTests',   label: "Jami Testlar",          icon: 'fas fa-file-alt',       color: '#10b981' },
  { key: 'totalResults', label: "Jami Natijalar",        icon: 'fas fa-chart-line',     color: '#8b5cf6' },
  { key: 'totalCerts',   label: "Jami Sertifikatlar",    icon: 'fas fa-certificate',    color: '#f59e0b' },
];

const formatNum = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Yaqinda';
  const ms = timestamp.toMillis ? timestamp.toMillis() : (timestamp.seconds ? timestamp.seconds * 1000 : new Date(timestamp).getTime());
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} soat oldin`;
  return `${Math.floor(hrs / 24)} kun oldin`;
};

const loadData = async () => {
  loading.value = true;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000));
    
    const usersPromise = getDocs(collection(db, 'users')).catch(() => ({ docs: [], size: 0 }));
    const subjectsPromise = getDocs(collection(db, 'subjects')).catch(() => ({ docs: [], size: 0 }));
    const resultsPromise = getDocs(collection(db, 'results')).catch(() => ({ docs: [], size: 0 }));
    const certsPromise = getDocs(collection(db, 'certificates')).catch(() => ({ docs: [], size: 0 }));

    const [usersSnap, subjectsSnap, resultsSnap, certsSnap] = await Promise.race([
      Promise.all([usersPromise, subjectsPromise, resultsPromise, certsPromise]),
      timeout
    ]);

    // Basic Stats
    const allUsers = usersSnap.docs ? usersSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
    cardValues.value.totalUsers = allUsers.length;
    
    let totalTests = 0;
    try {
      if (subjectsSnap.docs) {
         for (const subDoc of subjectsSnap.docs) {
           totalTests += (subDoc.data().levelCount || 1) * 3; 
         }
      }
    } catch(e) {}
    cardValues.value.totalTests = totalTests > 0 ? totalTests : 15;

    cardValues.value.totalResults = resultsSnap.size || 0;
    cardValues.value.totalCerts = certsSnap.size || 0;

    // Platform Stats calculation
    const maxUsers = Math.max(cardValues.value.totalUsers, 1);
    platformStats.value = [
      { label: "Sertifikat olingan",   icon: 'fas fa-certificate',  value: cardValues.value.totalCerts,   percent: Math.min((cardValues.value.totalCerts / maxUsers) * 100, 100),   color: '#f59e0b' },
      { label: "Test ishlagan",         icon: 'fas fa-file-alt',     value: cardValues.value.totalResults, percent: Math.min((cardValues.value.totalResults / Math.max(totalTests * 0.2, 1)) * 10, 100), color: '#8b5cf6' },
      { label: "Jami foydalanuvchilar", icon: 'fas fa-users',        value: cardValues.value.totalUsers,   percent: 100,                                                              color: '#3b82f6' },
      { label: "Jami testlar",          icon: 'fas fa-question',     value: cardValues.value.totalTests,   percent: Math.min(cardValues.value.totalTests / 10, 100),                   color: '#10b981' },
    ];

    // Process Chart Data (Last 7 Days User Registration)
    const countsByDate = {};
    const today = new Date();
    // Initialize last 7 days with 0
    for(let i=6; i>=0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
      countsByDate[dateStr] = 0;
    }

    allUsers.forEach(u => {
      if(u.createdAt) {
        const ms = u.createdAt.toMillis ? u.createdAt.toMillis() : u.createdAt;
        const d = new Date(ms);
        // check if within last 7 days
        const diffTime = Math.abs(today - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if(diffDays <= 7) {
          const dateStr = d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
          if(countsByDate[dateStr] !== undefined) {
            countsByDate[dateStr]++;
          }
        }
      }
    });

    chartData.value = {
      labels: Object.keys(countsByDate),
      datasets: [{
        label: "Yangi Foydalanuvchilar",
        data: Object.values(countsByDate),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };

    // Process Activity Feed & Subject Popularity
    const allResults = resultsSnap.docs ? resultsSnap.docs.map(d => d.data()) : [];
    
    // Subject Popularity Analysis
    const subjectCounts = {};
    allResults.forEach(r => {
      if (r.subject) {
        // Also include level if exists for more detail, or just subject
        const name = r.test_level && r.test_level !== 'General' ? `${r.subject} (${r.test_level})` : r.subject;
        subjectCounts[name] = (subjectCounts[name] || 0) + 1;
      }
    });
    
    const sortedSubjects = Object.entries(subjectCounts).sort((a,b) => b[1] - a[1]);
    
    // Split into Top 5 and Bottom 5 (avoid overlap if less than 10)
    if (sortedSubjects.length > 5) {
      topSubjects.value = sortedSubjects.slice(0, 5).map(s => ({ name: s[0], count: s[1] }));
      bottomSubjects.value = sortedSubjects.slice(-5).reverse().map(s => ({ name: s[0], count: s[1] }));
    } else {
      topSubjects.value = sortedSubjects.map(s => ({ name: s[0], count: s[1] }));
      bottomSubjects.value = [];
    }

    let feed = [];
    allUsers.forEach(u => {
      if(u.createdAt) {
        feed.push({
          type: 'user',
          icon: 'fas fa-user-plus',
          color: '#3b82f6',
          text: `<b>${u.displayName || u.email}</b> platformadan ro'yxatdan o'tdi`,
          timestamp: u.createdAt
        });
      }
    });
    
    // Let's grab some real results if we can parse them, otherwise mock feed items 
    allResults.forEach(r => {
       if(r.createdAt || r.date) {
         const ts = r.createdAt || r.date;
         feed.push({
           type: 'result',
           icon: 'fas fa-check-circle',
           color: '#10b981',
           text: `Foydalanuvchi test ishladi va <b>${r.score || r.correctAnswers || 0}</b> ball to'pladi`,
           timestamp: ts
         });
       }
    });

    // Sort by time descending
    feed.sort((a, b) => {
      const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : (new Date(a.timestamp).getTime() || 0);
      const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : (new Date(b.timestamp).getTime() || 0);
      return tb - ta;
    });

    // Limit to 10 items
    activityFeed.value = feed.slice(0, 8).map(f => ({
      ...f,
      time: getTimeAgo(f.timestamp)
    }));

  } catch (e) {
    console.error('Overview load error:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.overview-panel { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 2rem; }

.overview-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem; }
.header-titles h2 { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 5px; }
.header-titles p { margin: 0; color: #64748b; font-size: 0.95rem; }

.quick-actions { display: flex; gap: 10px; }
.qa-btn {
  background: white; border: 1px solid #e2e8f0; color: #475569;
  padding: 10px 16px; border-radius: 12px; font-weight: 700; font-size: 0.9rem;
  cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
.qa-btn:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-2px); }
.qa-btn i { color: #3b82f6; }

.qa-btn-accent { background: #0f172a; color: white; border: none; }
.qa-btn-accent i { color: #60a5fa; }
.qa-btn-accent:hover { background: #1e293b; color: white; border: none; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  background: white; border-radius: 20px; padding: 1.5rem;
  display: flex; align-items: center; gap: 1rem;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.04);
  transition: 0.3s; position: relative; overflow: hidden;
}
.stat-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 4px; background: var(--accent); border-radius: 99px;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px -5px rgba(0,0,0,0.08); }

.stat-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
}
.stat-info { flex: 1; }
.stat-value { display: block; font-size: 2rem; font-weight: 900; color: #0f172a; line-height: 1.1; }
.stat-label { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-trend { color: #10b981; font-size: 0.85rem; font-weight: 700; }

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;
}
@media (max-width: 1000px) { .main-grid { grid-template-columns: 1fr; } }

.panel-card {
  background: white; border-radius: 20px; padding: 1.5rem;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.04);
}
.full-width-card { grid-column: 1 / -1; }

.panel-card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.25rem;
}
.panel-card-header h3 { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px; }
.panel-card-header h3 i { color: #3b82f6; }
.see-all-btn { background: #f1f5f9; border: none; color: #64748b; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.see-all-btn:hover { background: #e2e8f0; }

.chart-container { height: 300px; position: relative; }
.chart-skeleton { width: 100%; height: 100%; background: #f8fafc; border-radius: 12px; }
.empty-state { height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: 600; }

.activity-feed { display: flex; flex-direction: column; gap: 15px; }
.feed-item { display: flex; gap: 12px; }
.feed-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.9rem; }
.feed-content { flex: 1; }
.feed-text { margin: 0 0 4px 0; font-size: 0.88rem; color: #334155; line-height: 1.4; }
.feed-time { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

.platform-stats-list { display: flex; flex-direction: column; gap: 14px; }
.platform-stat-row { display: flex; align-items: center; gap: 10px; }
.ps-label { font-size: 0.82rem; font-weight: 600; color: #64748b; width: 180px; flex-shrink: 0; display: flex; align-items: center; gap: 8px; }
.ps-bar-wrap { flex: 1; height: 8px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.ps-bar-fill { height: 100%; border-radius: 99px; transition: width 1s ease; }
.ps-val { font-size: 0.82rem; font-weight: 800; color: #0f172a; width: 50px; text-align: right; }

.shimmer-list { display: flex; flex-direction: column; gap: 12px; }
.shimmer-row { height: 48px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.empty-mini { text-align: center; color: #94a3b8; font-size: 0.9rem; padding: 20px; }

/* Popularity Lists */
.popularity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 800px) { .popularity-grid { grid-template-columns: 1fr; gap: 1.5rem; } }
.pop-title { font-size: 0.95rem; font-weight: 800; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 8px; }
.text-emerald { color: #10b981; }
.text-rose { color: #f43f5e; }
.pop-list { display: flex; flex-direction: column; gap: 10px; }
.pop-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; background: #f8fafc; transition: 0.2s; }
.pop-item:hover { background: #f1f5f9; }
.pop-rank { width: 28px; height: 28px; border-radius: 8px; background: #d1fae5; color: #059669; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pop-rank.danger { background: #ffe4e6; color: #e11d48; }
.pop-name { flex: 1; font-weight: 700; color: #334155; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pop-count { font-weight: 800; font-size: 0.85rem; color: #10b981; white-space: nowrap; }
.pop-count.danger-text { color: #e11d48; }
</style>
