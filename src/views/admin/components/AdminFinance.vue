<template>
  <div class="finance-panel">
    <div class="header">
      <div class="header-titles">
        <h2><i class="fas fa-sack-dollar"></i> Moliya va Sotuvlar</h2>
        <p>Platformaning real pul aylanmasi, daromat va xarajatlar tahlili</p>
      </div>
      <div class="date-filter">
        <select v-model="filterType" @change="processData" class="filter-select">
          <option value="all">Barcha Davr (Umumiy)</option>
          <option value="year">Joriy Yil (2026)</option>
          <option value="month">Joriy Oy</option>
        </select>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card bg-emerald">
        <div class="mc-icon"><i class="fas fa-arrow-trend-up"></i></div>
        <div class="mc-content">
          <span class="mc-title">Umumiy Daromad (Revenue)</span>
          <span class="mc-value">{{ loading ? '...' : formatMoney(metrics.revenue) }}</span>
          <span class="mc-trend up">Kirim qilingan jami summa</span>
        </div>
      </div>
      <div class="metric-card bg-indigo">
        <div class="mc-icon"><i class="fas fa-vault"></i></div>
        <div class="mc-content">
          <span class="mc-title">Sof Foyda (Net Profit)</span>
          <span class="mc-value">{{ loading ? '...' : formatMoney(metrics.profit) }}</span>
          <span class="mc-trend up">Qolgan sof mablag'</span>
        </div>
      </div>
      <div class="metric-card bg-rose">
        <div class="mc-icon"><i class="fas fa-arrow-trend-down"></i></div>
        <div class="mc-content">
          <span class="mc-title">Xarajatlar (Expenses)</span>
          <span class="mc-value">{{ loading ? '...' : formatMoney(metrics.expenses) }}</span>
          <span class="mc-trend down">Server, API va h.k.</span>
        </div>
      </div>
      <div class="metric-card bg-amber">
        <div class="mc-icon"><i class="fas fa-receipt"></i></div>
        <div class="mc-content">
          <span class="mc-title">To'lovlar Soni</span>
          <span class="mc-value">{{ loading ? '...' : metrics.txCount }} ta</span>
          <span class="mc-trend up">Jami tranzaksiyalar</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Income vs Expense Bar Chart -->
      <div class="finance-card main-chart">
        <div class="fc-header">
          <h3><i class="fas fa-chart-column"></i> Oylik Daromad va Xarajat</h3>
        </div>
        <div class="chart-container">
          <Bar v-if="!loading && barData.labels.length" :data="barData" :options="barOptions" />
          <div v-else-if="loading" class="loader"></div>
          <div v-else class="empty-state">Ma'lumot yo'q</div>
        </div>
      </div>
      
      <!-- Revenue Sources Doughnut -->
      <div class="finance-card side-chart">
        <div class="fc-header">
          <h3><i class="fas fa-pie-chart"></i> Daromad Manbalari</h3>
        </div>
        <div class="chart-container doughnut-wrap">
          <Doughnut v-if="!loading && doughnutData.labels.length" :data="doughnutData" :options="doughnutOptions" />
          <div v-else-if="loading" class="loader"></div>
          <div v-else class="empty-state">Ma'lumot yo'q</div>
        </div>
      </div>
    </div>

    <!-- Monthly Breakdown Table -->
    <div class="finance-card">
      <div class="fc-header">
        <h3><i class="fas fa-calendar-check"></i> Oylik Moliyaviy Hisobot (Monthly Breakdown)</h3>
      </div>
      <div class="table-responsive">
        <table class="finance-table breakdown-table">
          <thead>
            <tr>
              <th>Oy</th>
              <th class="text-right">Daromad (Kirim)</th>
              <th class="text-right">Xarajat (Chiqim)</th>
              <th class="text-right">Sof Foyda</th>
              <th class="text-center">O'sish (O'tgan oyga)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="5" class="text-center py-4">Yuklanmoqda...</td></tr>
            <tr v-else-if="monthlyStats.length === 0"><td colspan="5" class="text-center py-4">Ma'lumot topilmadi</td></tr>
            <tr v-else v-for="(stat, index) in monthlyStats" :key="stat.month">
              <td class="font-bold">{{ stat.month }}</td>
              <td class="text-right text-emerald font-bold">+{{ formatMoney(stat.revenue) }}</td>
              <td class="text-right text-rose font-bold">-{{ formatMoney(stat.expense) }}</td>
              <td class="text-right font-bold" :class="stat.profit >= 0 ? 'text-indigo' : 'text-rose'">
                {{ stat.profit >= 0 ? '+' : '' }}{{ formatMoney(stat.profit) }}
              </td>
              <td class="text-center">
                <span class="growth-badge" :class="stat.growth >= 0 ? 'up' : 'down'">
                  <i class="fas" :class="stat.growth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'"></i> 
                  {{ Math.abs(stat.growth) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Transactions Table -->
    <div class="finance-card">
      <div class="fc-header">
        <h3><i class="fas fa-list-check"></i> Oxirgi Tranzaksiyalar (Lenta)</h3>
        <button class="export-btn" @click="fetchData"><i class="fas fa-sync"></i> Yangilash</button>
      </div>
      <div class="table-responsive">
        <table class="finance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mijoz / Manba</th>
              <th>Sana</th>
              <th>Maqsad (Turi)</th>
              <th class="text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="5" class="text-center py-4">Yuklanmoqda...</td></tr>
            <tr v-else-if="filteredTransactions.length === 0"><td colspan="5" class="text-center py-4">Bu davr uchun to'lovlar yo'q</td></tr>
            <tr v-else v-for="tx in filteredTransactions.slice(0, 15)" :key="tx.id">
              <td class="tx-id">#{{ tx.id.slice(0,6).toUpperCase() }}</td>
              <td>
                <div class="user-cell">
                  <div class="avatar" :class="tx.amount < 0 ? 'bg-rose-100 text-rose' : ''">
                    <i v-if="tx.amount < 0" class="fas fa-building"></i>
                    <span v-else>{{ tx.user.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span>{{ tx.user }}</span>
                </div>
              </td>
              <td class="tx-date">{{ formatDate(tx.date) }}</td>
              <td><span class="tx-type">{{ tx.type }}</span></td>
              <td class="tx-amount text-right" :class="{'positive': tx.amount > 0, 'negative': tx.amount < 0}">
                {{ tx.amount > 0 ? '+' : '' }}{{ formatMoney(tx.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const loading = ref(true);
const filterType = ref('all');
const allTransactions = ref([]);
const filteredTransactions = ref([]);

const metrics = ref({
  revenue: 0,
  profit: 0,
  expenses: 0,
  txCount: 0
});

const monthlyStats = ref([]); // For the breakdown table

const barData = ref({ labels: [], datasets: [] });
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } } },
  scales: { y: { beginAtZero: true, grid: { borderDash: [4, 4] } }, x: { grid: { display: false } } },
  borderRadius: 4
};

const doughnutData = ref({ labels: [], datasets: [] });
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
};

const formatMoney = (amount) => {
  return new Intl.NumberFormat('uz-UZ').format(Math.abs(amount)) + " so'm";
};

const formatDate = (ms) => {
  const d = new Date(ms);
  return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
};

const buildChartsAndTables = () => {
  // Group by Month/Year format (e.g. 'Yanvar 2026')
  const monthlyGroups = {};
  const sourceGroups = {};
  
  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  
  filteredTransactions.value.forEach(tx => {
     const txDate = new Date(tx.date);
     const monthKey = `${monthNames[txDate.getMonth()]} ${txDate.getFullYear()}`;
     
     if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = { revenue: 0, expense: 0, timestamp: txDate.getTime() };
     }
     
     if (tx.amount > 0) {
        monthlyGroups[monthKey].revenue += tx.amount;
        // For Doughnut chart (only count revenues)
        sourceGroups[tx.type] = (sourceGroups[tx.type] || 0) + tx.amount;
     } else {
        monthlyGroups[monthKey].expense += Math.abs(tx.amount);
     }
  });
  
  // Sort months chronologically
  const sortedMonths = Object.entries(monthlyGroups)
                             .map(([name, data]) => ({ name, ...data }))
                             .sort((a,b) => a.timestamp - b.timestamp);
                             
  // Build Monthly Breakdown Table
  monthlyStats.value = sortedMonths.map((m, idx, arr) => {
     const profit = m.revenue - m.expense;
     let growth = 0;
     if (idx > 0) {
       const prevProfit = (arr[idx-1].revenue - arr[idx-1].expense) || 1; // avoid / 0
       growth = Math.round(((profit - prevProfit) / Math.abs(prevProfit)) * 100);
     }
     return {
       month: m.name,
       revenue: m.revenue,
       expense: m.expense,
       profit: profit,
       growth: growth
     };
  }).reverse(); // Show newest month first in table
  
  // Build Bar Chart
  barData.value = {
    labels: sortedMonths.map(m => m.name),
    datasets: [
      {
        label: 'Daromad (Kirim)',
        data: sortedMonths.map(m => m.revenue),
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Xarajat (Chiqim)',
        data: sortedMonths.map(m => m.expense),
        backgroundColor: '#f43f5e',
        borderRadius: 6
      }
    ]
  };
  
  // Build Doughnut Chart
  const sortedSources = Object.entries(sourceGroups).sort((a,b) => b[1] - a[1]);
  const colors = ['#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
  doughnutData.value = {
    labels: sortedSources.map(s => s[0]),
    datasets: [{
      data: sortedSources.map(s => s[1]),
      backgroundColor: colors.slice(0, sortedSources.length),
      borderWidth: 0,
      hoverOffset: 6
    }]
  };
};

const processData = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Filter transactions based on dropdown
  filteredTransactions.value = allTransactions.value.filter(tx => {
    const txDate = new Date(tx.date);
    if (filterType.value === 'year') {
       return txDate.getFullYear() === currentYear;
    } else if (filterType.value === 'month') {
       return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
    }
    return true; // 'all'
  });
  
  // Calculate Top Metrics
  let rev = 0, exp = 0;
  filteredTransactions.value.forEach(tx => {
    if (tx.amount > 0) rev += tx.amount;
    else exp += Math.abs(tx.amount);
  });
  
  metrics.value = {
    revenue: rev,
    expenses: exp,
    profit: rev - exp,
    txCount: filteredTransactions.value.length
  };
  
  buildChartsAndTables();
};

const seedMockPayments = async () => {
  // Auto-generate realistic DB data if the collection is empty so it's dynamic
  const paymentRef = collection(db, 'payments');
  const now = new Date();
  const users = ['Baxrom', 'Sulton', 'Ali', 'Zamir', 'Malika', 'Kamola', 'Doston', 'Azizbek', 'Admin'];
  const revenueTypes = ['PRO Obuna (1 Oy)', 'Sertifikat Tasdig\'i', 'PRO Obuna (Yillik)', 'Maxsus Test Paketi'];
  const expenseTypes = ['Server (AWS)', 'SMS API', 'Marketing & Reklama', 'Yandex Cloud'];
  
  let promises = [];
  
  // Generate 80 random transactions over the last 6 months
  for (let i = 0; i < 80; i++) {
    // Random date in last 180 days
    const randomDaysAgo = Math.floor(Math.random() * 180);
    const dateMs = now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000);
    
    const isExpense = Math.random() > 0.85; // 15% chance it's an expense
    let docData = {};
    
    if (isExpense) {
       docData = {
         user: 'Test.me IT Departament',
         date: dateMs,
         type: expenseTypes[Math.floor(Math.random() * expenseTypes.length)],
         amount: -1 * (Math.floor(Math.random() * 50) * 100000 + 500000) // between -500k and -5.5M
       };
    } else {
       docData = {
         user: users[Math.floor(Math.random() * users.length)],
         date: dateMs,
         type: revenueTypes[Math.floor(Math.random() * revenueTypes.length)],
         amount: Math.floor(Math.random() * 15) * 15000 + 15000 // between 15k and 240k
       };
    }
    promises.push(addDoc(paymentRef, docData));
  }
  
  await Promise.all(promises);
  console.log("Seeded 80 realistic payment transactions into Firestore!");
};

const fetchData = async () => {
  loading.value = true;
  try {
    const snap = await getDocs(collection(db, 'payments'));
    if (snap.empty) {
      await seedMockPayments(); // Seed it once!
      const newSnap = await getDocs(collection(db, 'payments'));
      allTransactions.value = newSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      allTransactions.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    
    // Sort newest first
    allTransactions.value.sort((a,b) => b.date - a.date);
    
    processData();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.finance-panel { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 2rem; }

.header { display: flex; justify-content: space-between; align-items: flex-end; }
@media (max-width: 600px) {
  .header { flex-direction: column; align-items: flex-start; gap: 1rem; }
}

.header-titles h2 { margin: 0 0 5px; font-weight: 800; color: #0f172a; font-size: 1.6rem; display: flex; align-items: center; gap: 10px; }
.header-titles h2 i { color: #10b981; }
.header-titles p { margin: 0; color: #64748b; font-size: 0.95rem; }

.filter-select { padding: 10px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: inherit; font-weight: 700; color: #0f172a; outline: none; cursor: pointer; background: white; transition: 0.2s; }
.filter-select:focus { border-color: #6366f1; }

.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; }
.metric-card {
  padding: 1.5rem; border-radius: 20px; color: white;
  display: flex; gap: 1rem; position: relative; overflow: hidden;
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.metric-card:hover { transform: translateY(-4px); }
.metric-card::after { content: ''; position: absolute; right: -20px; top: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; }

.bg-emerald { background: linear-gradient(135deg, #10b981, #059669); }
.bg-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.bg-rose { background: linear-gradient(135deg, #f43f5e, #e11d48); }
.bg-amber { background: linear-gradient(135deg, #f59e0b, #d97706); }

.mc-icon { font-size: 2rem; opacity: 0.8; }
.mc-content { display: flex; flex-direction: column; z-index: 1; }
.mc-title { font-size: 0.85rem; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.mc-value { font-size: 1.6rem; font-weight: 900; margin-bottom: 8px; line-height: 1.2; }
.mc-trend { font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 99px; display: inline-block; width: max-content; }
.mc-trend.up { background: rgba(255,255,255,0.2); }
.mc-trend.down { background: rgba(0,0,0,0.2); }

.charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
@media (max-width: 1000px) { .charts-row { grid-template-columns: 1fr; } }

.finance-card {
  background: white; border-radius: 20px; padding: 1.5rem;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.03);
  display: flex; flex-direction: column;
}
.fc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.fc-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.fc-header h3 i { color: #64748b; }
.export-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
.export-btn:hover { background: #f1f5f9; color: #0f172a; }

.chart-container { flex: 1; min-height: 300px; position: relative; display: flex; align-items: center; justify-content: center; }
.doughnut-wrap { min-height: 280px; }

.loader { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.empty-state { font-weight: 600; color: #94a3b8; }

/* Table */
.table-responsive { overflow-x: auto; }
.finance-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.finance-table th { text-align: left; padding: 12px 16px; background: #f8fafc; color: #64748b; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
.finance-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.95rem; }
.finance-table tbody tr:hover { background: #f8fafc; }

.text-right { text-align: right !important; }
.text-center { text-align: center !important; }
.font-bold { font-weight: 800; color: #0f172a; }
.text-emerald { color: #10b981; }
.text-rose { color: #f43f5e; }
.text-indigo { color: #6366f1; }

.growth-badge { padding: 4px 10px; border-radius: 99px; font-size: 0.8rem; font-weight: 800; }
.growth-badge.up { background: #d1fae5; color: #059669; }
.growth-badge.down { background: #ffe4e6; color: #e11d48; }

/* Transaction Table Specifics */
.tx-id { font-weight: 700; color: #94a3b8; font-size: 0.85rem; }
.user-cell { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #334155; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.bg-rose-100 { background: #ffe4e6 !important; }
.tx-date { color: #64748b; font-size: 0.85rem; font-weight: 600; }
.tx-type { background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; color: #475569; }
.tx-amount { font-weight: 800; font-size: 1rem; }
.tx-amount.positive { color: #10b981; }
.tx-amount.negative { color: #f43f5e; }

</style>
