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

<script setup>
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
import { useRouter } from 'vue-router';

const { locale: currentLocale, t } = useI18n();
const router = useRouter();

// State
const items = ref([]);
const search = ref('');
const filterSubject = ref('');
const filterLevel = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const sortKey = ref('timestamp');
const sortOrder = ref('desc');
const loading = ref(true);

// Computed
const headers = computed(() => [
  { text: t('username'), value: 'username' },
  { text: t('subject'), value: 'subject' },
  { text: t('testNumber'), value: 'test_number' },
  { text: t('level'), value: 'test_level' },
  { text: t('score'), value: 'score' },
  { text: t('date'), value: 'timestamp' },
]);

const uniqueSubjects = computed(() => [...new Set(items.value.map((item) => item.subject))]);
const uniqueLevels = computed(() => [...new Set(items.value.map((item) => item.test_level))]);

const getScorePercent = (score, total) => {
  if (!total || total === 0) return 0;
  return Math.round((score / total) * 100);
};

const averageScorePercent = computed(() => {
  if (items.value.length === 0) return 0;
  const sum = items.value.reduce((acc, item) => acc + getScorePercent(item.score, item.total), 0);
  return Math.round(sum / items.value.length);
});

const highestScorePercent = computed(() => {
  if (items.value.length === 0) return 0;
  return Math.max(...items.value.map(item => getScorePercent(item.score, item.total)));
});

const bestSubjectName = computed(() => {
  if (items.value.length === 0) return '—';
  const subjectSums = {};
  const subjectCounts = {};
  items.value.forEach(item => {
    const percent = getScorePercent(item.score, item.total);
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
});

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const searchMatch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(search.value.toLowerCase())
    );
    const subjectMatch = !filterSubject.value || item.subject === filterSubject.value;
    const levelMatch = !filterLevel.value || item.test_level === filterLevel.value;
    return searchMatch && subjectMatch && levelMatch;
  });
});

const sortedItems = computed(() => {
  return [...filteredItems.value].sort((a, b) => {
    let aVal = a[sortKey.value];
    let bVal = b[sortKey.value];
    
    if (aVal && typeof aVal.toDate === 'function') aVal = aVal.toDate().getTime();
    if (bVal && typeof bVal.toDate === 'function') bVal = bVal.toDate().getTime();

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    return sortOrder.value === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });
});

const paginatedAndFilteredItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return sortedItems.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage) || 1);

const perfectScoreCount = computed(() => items.value.filter(i => i.total > 0 && i.score === i.total).length);
const uniqueSubjectsStudied = computed(() => new Set(items.value.map(i => i.subject)).size);

const subjectStats = computed(() => {
  const icons = { english: 'fas fa-globe', matematik: 'fas fa-calculator', tarix: 'fas fa-landmark', fizika: 'fas fa-atom', rus: 'fas fa-feather', 'o\'zbek': 'fas fa-book', ozbek: 'fas fa-book', dasturlash: 'fas fa-code', informatika: 'fas fa-desktop', ai: 'fas fa-robot' };
  const colors = ['#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f97316','#06b6d4','#6366f1','#84cc16'];
  const map = {};
  items.value.forEach(i => {
    const s = i.subject || 'Other';
    if (!map[s]) map[s] = { name: s, scores: [], color: '', icon: 'fas fa-book' };
    map[s].scores.push(i.total > 0 ? Math.round((i.score/i.total)*100) : 0);
  });
  return Object.values(map).map((s, idx) => {
    const key = Object.keys(icons).find(k => s.name.toLowerCase().includes(k));
    return { name: s.name, count: s.scores.length, avg: s.scores.length ? Math.round(s.scores.reduce((a,b)=>a+b,0)/s.scores.length) : 0, best: s.scores.length ? Math.max(...s.scores) : 0, perfectCount: s.scores.filter(p=>p===100).length, color: colors[idx % colors.length], icon: key ? icons[key] : 'fas fa-book' };
  }).sort((a,b) => b.count - a.count);
});

const levelStats = computed(() => {
  const map = {};
  items.value.forEach(i => {
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
});

// Methods
const fetchResults = async () => {
  loading.value = true;
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const q = query(
      collection(db, 'results'),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    items.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching results:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const deleteItem = async (item) => {
  if (!(await confirmDelete(t('deleteConfirm'), "Bu amalni ortga qaytarib bo'lmaydi!"))) return;
  try {
    await deleteDoc(doc(db, 'results', item.id));
    fetchResults();
  } catch (error) {
    console.error('Error deleting result:', error);
  }
};

const exportToExcel = () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(
    sortedItems.value.map((item) => ({
      [t('username')]: item.username,
      [t('subject')]: item.subject,
      [t('testNumber')]: item.test_number,
      [t('level')]: item.test_level,
      [`${t('score')} (%)`]: getScorePercent(item.score, item.total),
      [t('date')]: formatDate(item.timestamp),
    }))
  );

  ws['!cols'] = [
    { width: 20 },
    { width: 15 },
    { width: 12 },
    { width: 12 },
    { width: 15 },
    { width: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, t('testResults'));
  XLSX.writeFile(
    wb,
    `test_results_${new Date().toLocaleDateString()}.xlsx`
  );
};

// Lifecycle & Watchers
onMounted(() => {
  const auth = getAuth();
  auth.onAuthStateChanged((user) => {
    if (user) {
      fetchResults();
    } else {
      router.push('/login');
    }
  });
});

watch(filteredItems, () => {
  currentPage.value = 1;
});
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

@media (max-width: 768px) {
  .dashboard-wrapper {
    padding: 1.5rem 1rem;
  }
  .dashboard-container {
    gap: 1.5rem;
  }
}
</style>
