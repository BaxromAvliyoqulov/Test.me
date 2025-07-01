<template>
  <div class="dashboard-container">
    <div class="table-header">
      <h2>Test Results</h2>
      <div class="search-filter">
        <div class="search-box">
          <input
            v-model="search"
            type="text"
            placeholder="Search..."
            class="search-input"
          />
        </div>
        <select v-model="filterSubject" class="filter-select">
          <option value="">All Subjects</option>
          <option
            v-for="subject in uniqueSubjects"
            :key="subject"
            :value="subject"
          >
            {{ subject }}
          </option>
        </select>
        <select v-model="filterLevel" class="filter-select">
          <option value="">All Levels</option>
          <option v-for="level in uniqueLevels" :key="level" :value="level">
            {{ level }}
          </option>
        </select>
        <button @click="exportToExcel" class="export-btn excel">
          <i class="fas fa-file-excel"></i> Export to Excel
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">Loading results...</div>

    <!-- No results state -->
    <div v-else-if="items.length === 0" class="no-results">
      <p>No results found</p>
    </div>

    <!-- Results table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="header in headers"
              :key="header.value"
              @click="sortBy(header.value)"
              :class="{ 'active-sort': sortKey === header.value }"
            >
              {{ header.text }}
              <span v-if="sortKey === header.value" class="sort-indicator">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedAndFilteredItems" :key="item.id">
            <td>{{ item.username }}</td>
            <td>{{ item.subject }}</td>
            <td>{{ item.test_number }}</td>
            <td>{{ item.test_level }}</td>
            <td :class="getScoreClass(item.score, item.total)">
              {{ getScorePercent(item.score, item.total) }}%
            </td>
            <td>{{ formatDate(item.timestamp) }}</td>
            <td class="actions">
              <i
                class="fa-solid fa-trash-can action-icon delete"
                @click="deleteItem(item)"
                title="Delete"
                id="delete"
              >
              </i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="items.length > 0">
      <button
        :disabled="currentPage === 1"
        @click="currentPage--"
        class="pagination-btn"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        :disabled="currentPage === totalPages"
        @click="currentPage++"
        class="pagination-btn"
      >
        Next
      </button>
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

export default {
  name: 'Dashboard',
  setup() {
    // ... ваш существующий код setup ...
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
      headers: [
        { text: 'Username', value: 'username' },
        { text: 'Subject', value: 'subject' },
        { text: 'Test Number', value: 'test_number' },
        { text: 'Level', value: 'test_level' },
        { text: 'Score', value: 'score' },
        { text: 'Date', value: 'timestamp' },
      ],
    };
  },
  computed: {
    uniqueSubjects() {
      return [...new Set(this.items.map((item) => item.subject))];
    },
    uniqueLevels() {
      return [...new Set(this.items.map((item) => item.test_level))];
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
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
  },
  methods: {
    async fetchResults() {
      this.loading = true;
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          this.$router.push('/login');
          return;
        }
        const q = query(
          collection(db, 'results'),
          where('user_id', '==', user.uid)
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
      return timestamp.toDate().toLocaleString();
    },
    getScorePercent(score, total) {
      return Math.round((score / total) * 100);
    },
    getScoreClass(score, total) {
      const percent = this.getScorePercent(score, total);
      if (percent >= 90) return 'score-excellent';
      if (percent >= 70) return 'score-good';
      return 'score-poor';
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
      if (!confirm('Are you sure you want to delete this result?')) return;
      await deleteDoc(doc(db, 'results', item.id));
      this.fetchResults();
    },
    async exportToExcel() {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(
        this.sortedItems.map((item) => ({
          Username: item.username,
          Subject: item.subject,
          'Test Number': item.test_number,
          Level: item.test_level,
          'Score (%)': this.getScorePercent(item.score, item.total),
          Date: this.formatDate(item.timestamp),
        }))
      );

      // Style configuration
      ws['!cols'] = [
        { width: 20 }, // Username
        { width: 15 }, // Subject
        { width: 12 }, // Test Number
        { width: 12 }, // Level
        { width: 15 }, // Score
        { width: 20 }, // Date
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Test Results');
      XLSX.writeFile(
        wb,
        `test_results_${new Date().toLocaleDateString()}.xlsx`
      );
    },
  },
  mounted() {
    this.fetchResults();
  },
  watch: {
    filteredItems() {
      this.currentPage = 1;
    },
  },
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.search-filter {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 200px;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 120px;
}

.table-wrapper {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

th {
  background: #f0f0f0;
  padding: 0.8rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  position: relative;
}

td {
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f0f4f8;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.export-btn.excel {
  background: #1e874d;
  color: white;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.page-info {
  font-weight: 500;
  color: #666;
}

.loading-state,
.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-state i,
.no-results i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #007bff;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 1rem;
  }

  .search-filter {
    flex-wrap: wrap;
    justify-content: center;
  }

  .data-table {
    display: block;
    overflow-x: auto;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }
}
#export-btn {
  font-size: 0.9rem;
}
#delete {
  cursor: pointer;
  font-size: 1rem;
  color: red;
}
</style>
