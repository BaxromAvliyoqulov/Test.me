<template>
  <div class="premium-layout dashboard-wrapper">
    <!-- Glowing background blobs matching the premium theme -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="dashboard-container">
      <DashboardHero 
        :totalTests="items.length"
        :averageScorePercent="averageScorePercent"
        :highestScorePercent="highestScorePercent"
        :bestSubjectName="bestSubjectName"
        :perfectScoreCount="perfectScoreCount"
        :uniqueSubjectsStudied="uniqueSubjectsStudied"
      />

      <SubjectAnalytics 
        :subjectStats="subjectStats"
        :levelStats="levelStats"
      />

      <ResultsTable 
        :search="search"
        @update:search="search = $event"
        :filterSubject="filterSubject"
        @update:filterSubject="filterSubject = $event"
        :filterLevel="filterLevel"
        @update:filterLevel="filterLevel = $event"
        :uniqueSubjects="uniqueSubjects"
        :uniqueLevels="uniqueLevels"
        :loading="loading"
        :items="items"
        :paginatedItems="paginatedAndFilteredItems"
        :headers="headers"
        :sortKey="sortKey"
        :sortOrder="sortOrder"
        :currentPage="currentPage"
        @update:currentPage="currentPage = $event"
        :totalPages="totalPages"
        @sort="sortBy"
        @delete="deleteItem"
        @export="exportToExcel"
      />
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
import { confirmDelete } from '@/utils/sweetalert';
import DashboardHero from '@/components/dashboard/DashboardHero.vue';
import SubjectAnalytics from '@/components/dashboard/SubjectAnalytics.vue';
import ResultsTable from '@/components/dashboard/ResultsTable.vue';

export default {
  name: 'Dashboard',
  components: {
    DashboardHero,
    SubjectAnalytics,
    ResultsTable
  },
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
      if (!(await confirmDelete(this.t('deleteConfirm'), "Bu amalni ortga qaytarib bo'lmaydi!"))) return;
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
  min-height: 100vh;
  padding: 3rem 1.5rem;
  overflow-x: hidden;
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
</style>
