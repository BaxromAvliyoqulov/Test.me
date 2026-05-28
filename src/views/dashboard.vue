<template>
  <div class="dashboard-wrapper">
    <!-- Glowing background blobs matching the premium theme -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="dashboard-container">
      <!-- Hero Header Section -->
      <div class="dashboard-hero">
        <h1 class="dashboard-title">
          <span class="gradient-text">{{ t('dashboard') }}</span>
        </h1>
        <p class="dashboard-subtitle">
          {{ currentLocale === 'RUS' ? 'Просматривайте результаты тестов и отслеживайте свой прогресс' : 
             'Test natijalaringizni ko\'ring va rivojlanishingizni kuzatib boring' }}
        </p>
      </div>

      <!-- Quick Statistics Summary Cards -->
      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-icon-wrapper total-tests-icon"><i class="fas fa-clipboard-list"></i></div>
          <div class="stats-info">
            <span class="stats-label">{{ t('totalTests') }}</span>
            <h3 class="stats-value">{{ items.length }}</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="stats-icon-wrapper avg-score-icon"><i class="fas fa-percentage"></i></div>
          <div class="stats-info">
            <span class="stats-label">{{ t('averageScore') }}</span>
            <h3 class="stats-value">{{ averageScorePercent }}%</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="stats-icon-wrapper max-score-icon"><i class="fas fa-trophy"></i></div>
          <div class="stats-info">
            <span class="stats-label">{{ t('highestScore') }}</span>
            <h3 class="stats-value">{{ highestScorePercent }}%</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="stats-icon-wrapper best-subject-icon"><i class="fas fa-graduation-cap"></i></div>
          <div class="stats-info">
            <span class="stats-label">{{ t('bestSubject') }}</span>
            <h3 class="stats-value text-truncate" :title="bestSubjectName">{{ bestSubjectName }}</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="stats-icon-wrapper perfect-icon"><i class="fas fa-star"></i></div>
          <div class="stats-info">
            <span class="stats-label">{{ currentLocale === 'RUS' ? '100% Natijalar' : '100% Natijalar' }}</span>
            <h3 class="stats-value">{{ perfectScoreCount }}</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="stats-icon-wrapper streak-icon"><i class="fas fa-fire"></i></div>
          <div class="stats-info">
            <span class="stats-label">{{ currentLocale === 'RUS' ? 'Фанов изучено' : 'Fanlar soni' }}</span>
            <h3 class="stats-value">{{ uniqueSubjectsStudied }}</h3>
          </div>
        </div>
      </div>

      <!-- Subject Performance -->
      <div v-if="subjectStats.length > 0" class="analytics-section">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-chart-bar"></i> {{ currentLocale === 'RUS' ? 'Результаты по предметам' : 'Fanlar bo\'yicha natijalar' }}</h2>
        </div>
        <div class="subject-grid">
          <div v-for="subj in subjectStats" :key="subj.name" class="subject-card">
            <div class="subject-card-header">
              <div class="subj-icon" :style="{ background: subj.color + '20', color: subj.color }"><i :class="subj.icon"></i></div>
              <div class="subj-meta">
                <span class="subj-name">{{ subj.name }}</span>
                <span class="subj-count">{{ subj.count }} {{ currentLocale === 'RUS' ? 'тестов' : 'ta test' }}</span>
              </div>
              <div class="subj-avg" :style="{ color: subj.color }">{{ subj.avg }}%</div>
            </div>
            <div class="subj-bar-outer">
              <div class="subj-bar-inner" :style="{ width: subj.avg + '%', background: subj.color }"></div>
            </div>
            <div class="subj-footer">
              <span>{{ currentLocale === 'RUS' ? 'Лучший:' : 'Eng yaxshi:' }} <strong>{{ subj.best }}%</strong></span>
              <span>⭐ {{ subj.perfectCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Level Performance -->
      <div v-if="levelStats.length > 0" class="analytics-section">
        <div class="section-header">
          <h2 class="section-title"><i class="fas fa-layer-group"></i> {{ currentLocale === 'RUS' ? 'Результаты по уровням' : 'Darajalar bo\'yicha natijalar' }}</h2>
        </div>
        <div class="level-grid">
          <div v-for="lvl in levelStats" :key="lvl.name" class="level-card">
            <div class="level-top">
              <span :class="['level-badge', lvl.cls]">{{ lvl.name }}</span>
              <span class="level-avg-val">{{ lvl.avg }}%</span>
            </div>
            <div class="subj-bar-outer">
              <div class="subj-bar-inner" :class="lvl.cls + '-bar'" :style="{ width: lvl.avg + '%' }"></div>
            </div>
            <div class="subj-footer">
              <span>{{ lvl.count }} {{ currentLocale === 'RUS' ? 'тестов' : 'ta test' }}</span>
              <span>⭐ {{ lvl.perfectCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Controls & Search -->
      <div class="filter-card">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="search"
            type="text"
            :placeholder="t('searchPlaceholder')"
            class="search-input"
          />
        </div>
        
        <div class="filter-controls">
          <div class="select-wrapper">
            <i class="fas fa-book select-icon"></i>
            <select v-model="filterSubject" class="filter-select">
              <option value="">{{ t('allSubjects') }}</option>
              <option
                v-for="subject in uniqueSubjects"
                :key="subject"
                :value="subject"
              >
                {{ subject }}
              </option>
            </select>
          </div>

          <div class="select-wrapper">
            <i class="fas fa-layer-group select-icon"></i>
            <select v-model="filterLevel" class="filter-select">
              <option value="">{{ t('allLevels') }}</option>
              <option v-for="level in uniqueLevels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
          </div>

          <button @click="exportToExcel" class="export-btn" id="export-btn">
            <i class="fas fa-file-excel"></i>
            <span>{{ t('exportExcel') }}</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="state-card">
        <div class="spinner"></div>
        <p class="state-text">{{ t('loading') }}</p>
      </div>

      <!-- No Results State -->
      <div v-else-if="items.length === 0" class="state-card">
        <div class="state-icon error-icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <p class="state-text">{{ t('noResults') }}</p>
      </div>

      <!-- Table Card Section -->
      <div v-else class="table-card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.value"
                  @click="sortBy(header.value)"
                  :class="{ 'active-sort': sortKey === header.value }"
                >
                  <div class="header-content">
                    <span>{{ header.text }}</span>
                    <span v-if="sortKey === header.value" class="sort-indicator">
                      {{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}
                    </span>
                  </div>
                </th>
                <th>{{ t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedAndFilteredItems" :key="item.id">
                <td class="username-cell">
                  <div class="user-avatar-mini">
                    {{ item.username ? item.username.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <span class="user-name-text">{{ item.username }}</span>
                </td>
                <td class="subject-cell">
                  <span class="subject-badge">{{ item.subject }}</span>
                </td>
                <td class="text-center font-semibold">{{ item.test_number }}</td>
                <td>
                  <span :class="['level-badge', getLevelClass(item.test_level)]">
                    {{ item.test_level }}
                  </span>
                </td>
                <td>
                  <div class="score-container">
                    <span :class="['score-pill', getScoreClass(item.score, item.total)]">
                      {{ getScorePercent(item.score, item.total) }}%
                    </span>
                    <span class="score-ratio">{{ item.score }}/{{ item.total }}</span>
                  </div>
                </td>
                <td class="date-cell">{{ formatDate(item.timestamp) }}</td>
                <td class="actions-cell">
                  <button 
                    class="action-btn delete-btn" 
                    @click="deleteItem(item)" 
                    :title="currentLocale === 'RUS' ? 'Удалить результат' : 'Natijani o\'chirish'"
                    id="delete"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
            <span>{{ t('prev') }}</span>
          </button>
          <span class="page-info">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="pagination-btn"
          >
            <span>{{ t('next') }}</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { useI18n } from '@/utils/i18n';

export default {
  name: 'Dashboard',
  setup() {
    const { locale, t } = useI18n();
    return {
      currentLocale: locale,
      t,
    };
  },
  data() {
    return {
      items: [],
      search: '',
      filterSubject: '',
      filterLevel: '',
      currentPage: 1,
      itemsPerPage: 10,
      sortKey: 'timestamp',
      sortOrder: 'desc',
      loading: true,
    };
  },
  computed: {
    headers() {
      return [
        { text: this.t('username'), value: 'username' },
        { text: this.t('subject'), value: 'subject' },
        { text: this.t('testNumber'), value: 'test_number' },
        { text: this.t('level'), value: 'test_level' },
        { text: this.t('score'), value: 'score' },
        { text: this.t('date'), value: 'timestamp' },
      ];
    },
    uniqueSubjects() {
      return [...new Set(this.items.map((item) => item.subject))];
    },
    uniqueLevels() {
      return [...new Set(this.items.map((item) => item.test_level))];
    },
    averageScorePercent() {
      if (this.items.length === 0) return 0;
      const sum = this.items.reduce((acc, item) => acc + this.getScorePercent(item.score, item.total), 0);
      return Math.round(sum / this.items.length);
    },
    highestScorePercent() {
      if (this.items.length === 0) return 0;
      return Math.max(...this.items.map(item => this.getScorePercent(item.score, item.total)));
    },
    bestSubjectName() {
      if (this.items.length === 0) return '—';
      const subjectSums = {};
      const subjectCounts = {};
      this.items.forEach(item => {
        const percent = this.getScorePercent(item.score, item.total);
        subjectSums[item.subject] = (subjectSums[item.subject] || 0) + percent;
        subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
      });
      let bestSub = '—';
      let bestAvg = -1;
      for (const sub in subjectSums) {
        const avg = subjectSums[sub] / subjectCounts[sub];
        if (avg > bestAvg) {
          bestAvg = avg;
          bestSub = sub;
        }
      }
      return bestSub;
    },
    filteredItems() {
      return this.items.filter((item) => {
        const searchMatch = Object.values(item).some((value) =>
          String(value).toLowerCase().includes(this.search.toLowerCase())
        );
        const subjectMatch =
          !this.filterSubject || item.subject === this.filterSubject;
        const levelMatch =
          !this.filterLevel || item.test_level === this.filterLevel;
        return searchMatch && subjectMatch && levelMatch;
      });
    },
    sortedItems() {
      return [...this.filteredItems].sort((a, b) => {
        let aVal = a[this.sortKey];
        let bVal = b[this.sortKey];
        
        // Handle firestore Timestamp conversion for sorting
        if (aVal && typeof aVal.toDate === 'function') {
          aVal = aVal.toDate().getTime();
        }
        if (bVal && typeof bVal.toDate === 'function') {
          bVal = bVal.toDate().getTime();
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        return this.sortOrder === 'asc'
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
          ? 1
          : -1;
      });
    },
    paginatedAndFilteredItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.sortedItems.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage) || 1;
    },
    perfectScoreCount() {
      return this.items.filter(i => i.total > 0 && i.score === i.total).length;
    },
    uniqueSubjectsStudied() {
      return new Set(this.items.map(i => i.subject)).size;
    },
    bestStreak() {
      let streak = 0, best = 0;
      [...this.items].sort((a,b) => {
        const ta = a.timestamp && a.timestamp.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
        const tb = b.timestamp && b.timestamp.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
        return ta - tb;
      }).forEach(i => {
        const pct = i.total > 0 ? Math.round((i.score/i.total)*100) : 0;
        if (pct >= 60) { streak++; if (streak > best) best = streak; } else streak = 0;
      });
      return best;
    },
    subjectStats() {
      const icons = { english: 'fas fa-globe', matematik: 'fas fa-calculator', tarix: 'fas fa-landmark', fizika: 'fas fa-atom', rus: 'fas fa-feather', 'o\'zbek': 'fas fa-book', ozbek: 'fas fa-book', dasturlash: 'fas fa-code', informatika: 'fas fa-desktop', ai: 'fas fa-robot' };
      const colors = ['#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f97316','#06b6d4','#6366f1','#84cc16'];
      const map = {};
      this.items.forEach(i => {
        const s = i.subject || 'Other';
        if (!map[s]) map[s] = { name: s, scores: [], color: '', icon: 'fas fa-book' };
        map[s].scores.push(i.total > 0 ? Math.round((i.score/i.total)*100) : 0);
      });
      return Object.values(map).map((s, idx) => {
        const key = Object.keys(icons).find(k => s.name.toLowerCase().includes(k));
        return { name: s.name, count: s.scores.length, avg: s.scores.length ? Math.round(s.scores.reduce((a,b)=>a+b,0)/s.scores.length) : 0, best: s.scores.length ? Math.max(...s.scores) : 0, perfectCount: s.scores.filter(p=>p===100).length, color: colors[idx % colors.length], icon: key ? icons[key] : 'fas fa-book' };
      }).sort((a,b) => b.count - a.count);
    },
    levelStats() {
      const map = {};
      this.items.forEach(i => {
        const l = i.test_level || 'Other';
        if (!map[l]) map[l] = { name: l, scores: [] };
        map[l].scores.push(i.total > 0 ? Math.round((i.score/i.total)*100) : 0);
      });
      return Object.values(map).map(l => {
        const lc = l.name.toLowerCase();
        let cls = 'level-hard';
        if (lc.includes('elem') || lc.includes('beg') || lc.includes('boshlang') || lc.includes('easy')) cls = 'level-easy';
        else if (lc.includes('inter') || lc.includes('orta') || lc.includes('medium')) cls = 'level-medium';
        return { name: l.name, count: l.scores.length, avg: l.scores.length ? Math.round(l.scores.reduce((a,b)=>a+b,0)/l.scores.length) : 0, perfectCount: l.scores.filter(p=>p===100).length, cls };
      });
    },
  },
  methods: {
    async fetchResults() {
      this.loading = true;
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const q = query(
          collection(db, 'results'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        this.items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return '—';
      if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString();
      }
      return new Date(timestamp).toLocaleString();
    },
    getScorePercent(score, total) {
      if (!total || total === 0) return 0;
      return Math.round((score / total) * 100);
    },
    getScoreClass(score, total) {
      const percent = this.getScorePercent(score, total);
      if (percent >= 85) return 'score-excellent';
      if (percent >= 60) return 'score-good';
      return 'score-poor';
    },
    getLevelClass(level) {
      const l = String(level).toLowerCase();
      if (l.includes('oson') || l.includes('easy') || l.includes('легко') || l.includes('low')) {
        return 'level-easy';
      }
      if (l.includes('orta') || l.includes('o\'rtacha') || l.includes('medium') || l.includes('средне') || l.includes('middle')) {
        return 'level-medium';
      }
      return 'level-hard';
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },
    async deleteItem(item) {
      if (!confirm(this.t('deleteConfirm'))) return;
      try {
        await deleteDoc(doc(db, 'results', item.id));
        this.fetchResults();
      } catch (error) {
        console.error('Error deleting result:', error);
      }
    },
    async exportToExcel() {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(
        this.sortedItems.map((item) => ({
          [this.t('username')]: item.username,
          [this.t('subject')]: item.subject,
          [this.t('testNumber')]: item.test_number,
          [this.t('level')]: item.test_level,
          [`${this.t('score')} (%)`]: this.getScorePercent(item.score, item.total),
          [this.t('date')]: this.formatDate(item.timestamp),
        }))
      );

      ws['!cols'] = [
        { width: 20 }, // Username
        { width: 15 }, // Subject
        { width: 12 }, // Test Number
        { width: 12 }, // Level
        { width: 15 }, // Score
        { width: 22 }, // Date
      ];

      XLSX.utils.book_append_sheet(wb, ws, this.t('testResults'));
      XLSX.writeFile(
        wb,
        `test_results_${new Date().toLocaleDateString()}.xlsx`
      );
    },
  },
  mounted() {
    const auth = getAuth();
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.fetchResults();
      } else {
        this.$router.push('/login');
      }
    });
  },
  watch: {
    filteredItems() {
      this.currentPage = 1;
    },
  },
};
</script>

<style scoped>
.dashboard-wrapper {
  position: relative;
  min-height: 90vh;
  padding: 3rem 1.5rem;
  overflow: hidden;
  background: #f8fafc;
  font-family: 'Outfit', 'Inter', sans-serif;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
}

.glow-bg-1 {
  top: 5%;
  left: 5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #3b82f6 0%, #60a5fa 100%);
}

.glow-bg-2 {
  bottom: 5%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #10b981 0%, #34d399 100%);
}

.dashboard-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.dashboard-hero {
  text-align: center;
}

.dashboard-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
  margin: 0 0 0.5rem 0;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Statistics Grid cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stats-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.02);
}

.stats-card:hover {
  transform: translateY(-4px);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 20px 30px -15px rgba(15, 23, 42, 0.06);
}

.stats-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.total-tests-icon {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  color: #4f46e5;
}

.avg-score-icon {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #2563eb;
}

.max-score-icon {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #d97706;
}

.best-subject-icon {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
}

.perfect-icon {
  background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%);
  color: #ca8a04;
}

.streak-icon {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  color: #ea580c;
}

/* Analytics section */
.analytics-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.15rem;
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

/* Subject grid */
.subject-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.subject-card {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226,232,240,0.8);
  border-radius: 18px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px -3px rgba(15,23,42,0.04);
}

.subject-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -5px rgba(15,23,42,0.08);
}

.subject-card-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.subj-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.subj-meta {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subj-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.subj-count {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.subj-avg {
  font-size: 1.5rem;
  font-weight: 800;
}

.subj-bar-outer {
  height: 7px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.subj-bar-inner {
  height: 100%;
  border-radius: 99px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.level-easy-bar { background: linear-gradient(90deg, #10b981, #34d399); }
.level-medium-bar { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.level-hard-bar { background: linear-gradient(90deg, #ef4444, #f87171); }

.subj-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #64748b;
  padding-top: 0.25rem;
  border-top: 1px solid #f1f5f9;
}

/* Level grid */
.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.level-card {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226,232,240,0.8);
  border-radius: 18px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px -3px rgba(15,23,42,0.04);
}

.level-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -5px rgba(15,23,42,0.08);
}

.level-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-avg-val {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}


.stats-info {
  flex-grow: 1;
  min-width: 0;
}

.stats-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
}

.stats-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 4px 0 0 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Modern Filter Card */
.filter-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.02);
}

.search-box {
  position: relative;
  flex-grow: 1;
  max-width: 350px;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.95rem;
}

.search-input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.92rem;
  background-color: #ffffff;
  color: #0f172a;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.select-wrapper {
  position: relative;
  min-width: 160px;
}

.select-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  font-size: 0.9rem;
}

.filter-select {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.4rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.92rem;
  background-color: #ffffff;
  color: #0f172a;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  transition: all 0.2s;
  font-family: inherit;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(16, 185, 129, 0.35);
}

.export-btn:active {
  transform: translateY(0);
}

/* Loading & Empty States */
.state-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.state-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-icon {
  background-color: #f1f5f9;
  color: #94a3b8;
}

.state-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

/* Data Table Layout */
.table-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.02);
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;
}

.data-table th {
  background-color: rgba(248, 250, 252, 0.6);
  padding: 1.1rem 1.25rem;
  font-weight: 700;
  color: #475569;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.data-table th:hover {
  background-color: #f1f5f9;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-indicator {
  color: #3b82f6;
  font-size: 0.8rem;
}

.data-table td {
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.data-table tbody tr {
  transition: background-color 0.2s;
}

.data-table tbody tr:hover {
  background-color: rgba(248, 250, 252, 0.8);
}

/* Row-specific cells styling */
.username-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-mini {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
}

.user-name-text {
  font-weight: 600;
  color: #0f172a;
}

.subject-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid #e2e8f0;
}

.font-semibold {
  font-weight: 600;
}

.text-center {
  text-align: center;
}

/* Level Badges */
.level-badge {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: capitalize;
}

.level-easy {
  background-color: #d1fae5;
  color: #065f46;
}

.level-medium {
  background-color: #fef3c7;
  color: #92400e;
}

.level-hard {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Score Pills */
.score-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-pill {
  padding: 0.3rem 0.75rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 800;
  text-align: center;
}

.score-excellent {
  background-color: #d1fae5;
  color: #065f46;
}

.score-good {
  background-color: #eff6ff;
  color: #1e40af;
}

.score-poor {
  background-color: #fee2e2;
  color: #991b1b;
}

.score-ratio {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.date-cell {
  font-size: 0.88rem;
  color: #64748b;
}

/* Actions */
.actions-cell {
  text-align: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn {
  background-color: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.delete-btn:hover {
  background-color: #ef4444;
  color: white;
  transform: scale(1.08);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
}

/* Pagination Section */
.pagination {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(248, 250, 252, 0.4);
  border-top: 1px solid #e2e8f0;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  border-color: #cbd5e1;
  background-color: #f8fafc;
  color: #0f172a;
}

.page-info {
  font-size: 0.9rem;
  font-weight: 700;
  color: #475569;
  background-color: #f1f5f9;
  padding: 0.4rem 1rem;
  border-radius: 20px;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-wrapper {
    padding: 2rem 1rem;
  }

  .dashboard-title {
    font-size: 2.2rem;
  }

  .filter-card {
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem;
  }

  .search-box {
    max-width: 100%;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .select-wrapper {
    width: 100%;
  }

  .export-btn {
    justify-content: center;
  }

  .pagination {
    padding: 1rem;
  }
  
  .pagination-btn span {
    display: none;
  }
  
  .pagination-btn {
    padding: 0.5rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
