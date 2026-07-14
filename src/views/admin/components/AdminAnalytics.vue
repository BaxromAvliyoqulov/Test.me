<template>
  <div class="analytics-panel">
    <div class="header">
      <h2><i class="fas fa-chart-pie"></i> Kengaytirilgan Tahlil</h2>
      <p>Platforma foydalanuvchilarining uzoq muddatli harakatlari va iqtisodiyot statistikasi</p>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
       <!-- Economy (TP) -->
       <div class="stat-box economy">
         <div class="stat-icon"><i class="fas fa-coins"></i></div>
         <div class="stat-details">
           <span class="stat-val">{{ loading ? '...' : formatNum(totalTP) }} <span style="font-size:1rem;color:#f59e0b">TP</span></span>
           <span class="stat-label">Aylanmadagi Jami TP</span>
         </div>
       </div>
       
       <!-- Conversion -->
       <div class="stat-box conversion">
         <div class="stat-icon"><i class="fas fa-trophy"></i></div>
         <div class="stat-details">
           <span class="stat-val">{{ loading ? '...' : conversionRate }}%</span>
           <span class="stat-label">Sertifikat Olish Darajasi</span>
         </div>
       </div>
       
       <!-- Average Score -->
       <div class="stat-box avg-score">
         <div class="stat-icon"><i class="fas fa-star-half-stroke"></i></div>
         <div class="stat-details">
           <span class="stat-val">{{ loading ? '...' : avgScore }}</span>
           <span class="stat-label">O'rtacha Ball (10 ballik)</span>
         </div>
       </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid">
      <!-- Doughnut Chart: Pass vs Fail -->
      <div class="chart-card">
        <h3><i class="fas fa-bullseye"></i> O'tish Ko'rsatkichi (Pass Rate)</h3>
        <div class="chart-wrap doughnut">
          <Doughnut v-if="!loading && passRateData.labels.length" :data="passRateData" :options="doughnutOptions" />
          <div v-else-if="loading" class="loader"></div>
          <div v-else class="empty-state">Ma'lumot yo'q</div>
        </div>
        <div class="chart-desc">
           Umumiy yechilgan testlar ichida 70% dan yuqori ball olganlar nisbati.
        </div>
      </div>

      <!-- Line Chart: 30 Day Activity -->
      <div class="chart-card">
        <h3><i class="fas fa-calendar-alt"></i> Oxirgi 30 Kundagi Faollik</h3>
        <div class="chart-wrap line">
          <LineChart v-if="!loading && activityData.labels.length" :data="activityData" :options="lineOptions" />
          <div v-else-if="loading" class="loader"></div>
          <div v-else class="empty-state">Ma'lumot yo'q</div>
        </div>
        <div class="chart-desc">
           Kunlik yechilgan testlar sonining so'nggi 30 kunlik dinamikasi.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Doughnut, Line as LineChart } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

export default {
  name: 'AdminAnalytics',
  components: { Doughnut, LineChart },
  data() {
    return {
      loading: true,
      totalTP: 0,
      conversionRate: 0,
      avgScore: 0,
      
      passRateData: { labels: [], datasets: [] },
      activityData: { labels: [], datasets: [] },
      
      doughnutOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' } } }
        },
        cutout: '65%'
      },
      lineOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
          y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
          x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } }
        },
        elements: { line: { tension: 0.3 } },
        interaction: { mode: 'index', intersect: false }
      }
    };
  },
  async mounted() {
    await this.fetchAnalytics();
  },
  methods: {
    formatNum(n) {
      if(n >= 1000000) return (n/1000000).toFixed(1) + 'M';
      if(n >= 1000) return (n/1000).toFixed(1) + 'K';
      return n.toString();
    },
    async fetchAnalytics() {
      this.loading = true;
      try {
        const usersSnap = await getDocs(collection(db, 'users')).catch(() => ({ docs: [] }));
        const resultsSnap = await getDocs(collection(db, 'results')).catch(() => ({ docs: [] }));
        const certsSnap = await getDocs(collection(db, 'certificates')).catch(() => ({ docs: [] }));

        const allUsers = usersSnap.docs.map(d => d.data());
        const allResults = resultsSnap.docs.map(d => d.data());
        
        // 1. Total TP in circulation
        let tp = 0;
        allUsers.forEach(u => { if(u.points) tp += u.points; });
        this.totalTP = tp;

        // 2. Conversion Rate
        const totalUsers = allUsers.length || 1;
        const totalCerts = certsSnap.docs.length;
        this.conversionRate = Math.min(Math.round((totalCerts / totalUsers) * 100), 100);

        // 3. Average Score and Pass Rate
        let totalScoreRatio = 0;
        let passCount = 0;
        let failCount = 0;

        // Activity (Last 30 Days)
        const countsByDate = {};
        const today = new Date();
        for(let i=29; i>=0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
          countsByDate[dateStr] = 0;
        }

        allResults.forEach(r => {
          // Pass/Fail Logic
          const score = r.score || 0;
          const total = r.total || 10;
          const ratio = score / total;
          totalScoreRatio += (ratio * 10); // scale to 10
          
          if(ratio >= 0.7) passCount++;
          else failCount++;

          // 30 day logic
          if(r.createdAt || r.date || r.timestamp) {
            const ts = r.timestamp?.toMillis ? r.timestamp.toMillis() : (r.createdAt || r.date);
            const ms = typeof ts === 'number' ? ts : new Date(ts).getTime();
            if (ms) {
               const d = new Date(ms);
               const diffTime = Math.abs(today - d);
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
               if(diffDays <= 30) {
                 const dateStr = d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
                 if(countsByDate[dateStr] !== undefined) {
                   countsByDate[dateStr]++;
                 }
               }
            }
          }
        });

        this.avgScore = allResults.length ? (totalScoreRatio / allResults.length).toFixed(1) : 0;

        if (passCount > 0 || failCount > 0) {
          this.passRateData = {
            labels: ['O\'tdi (>= 70%)', 'Yiqildi (< 70%)'],
            datasets: [{
              data: [passCount, failCount],
              backgroundColor: ['#10b981', '#ef4444'],
              borderWidth: 0,
              hoverOffset: 6
            }]
          };
        }

        this.activityData = {
          labels: Object.keys(countsByDate),
          datasets: [{
            label: "Yechilgan testlar",
            data: Object.values(countsByDate),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            borderWidth: 3,
            pointRadius: 2,
            pointHoverRadius: 6,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#8b5cf6',
          }]
        };

      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.analytics-panel {
  display: flex; flex-direction: column; gap: 2rem; padding-bottom: 2rem;
}
.header h2 { margin: 0 0 5px; font-weight: 800; color: #0f172a; font-size: 1.6rem; display: flex; align-items: center; gap: 10px; }
.header h2 i { color: #8b5cf6; }
.header p { margin: 0; color: #64748b; font-size: 0.95rem; }

.stats-row {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;
}
.stat-box {
  background: white; border-radius: 20px; padding: 1.5rem;
  display: flex; align-items: center; gap: 1rem;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.03);
  transition: 0.2s;
}
.stat-box:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
.economy .stat-icon { background: #fef3c7; color: #f59e0b; }
.conversion .stat-icon { background: #dbeafe; color: #3b82f6; }
.avg-score .stat-icon { background: #f3e8ff; color: #a855f7; }

.stat-icon {
  width: 56px; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
}
.stat-details { flex: 1; }
.stat-val { display: block; font-size: 1.8rem; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 4px; }
.stat-label { font-size: 0.85rem; font-weight: 600; color: #64748b; }

.charts-grid {
  display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;
}
@media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }

.chart-card {
  background: white; border-radius: 20px; padding: 1.5rem;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.03);
  display: flex; flex-direction: column;
}
.chart-card h3 {
  margin: 0 0 1.5rem; font-size: 1.1rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;
}
.chart-card h3 i { color: #8b5cf6; }

.chart-wrap { position: relative; width: 100%; flex: 1; min-height: 250px; display: flex; align-items: center; justify-content: center; }
.chart-wrap.doughnut { min-height: 280px; }

.chart-desc { margin-top: 1rem; font-size: 0.85rem; color: #64748b; text-align: center; background: #f8fafc; padding: 10px; border-radius: 10px; font-weight: 600; }

.loader {
  width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #8b5cf6;
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { color: #94a3b8; font-weight: 600; }
</style>
