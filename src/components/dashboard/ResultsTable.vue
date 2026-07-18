<template>
  <div class="results-table-container">
    <!-- Filter Controls & Search -->
    <div class="filter-card">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          :value="search"
          @input="$emit('update:search', $event.target.value)"
          type="text"
          :placeholder="t('searchPlaceholder')"
          class="search-input"
        />
      </div>
      
      <div class="filter-controls">
        <div class="select-wrapper">
          <i class="fas fa-book select-icon"></i>
          <select :value="filterSubject" @change="$emit('update:filterSubject', $event.target.value)" class="filter-select">
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
          <select :value="filterLevel" @change="$emit('update:filterLevel', $event.target.value)" class="filter-select">
            <option value="">{{ t('allLevels') }}</option>
            <option v-for="level in uniqueLevels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>

        <button @click="$emit('export')" class="export-btn" id="export-btn">
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
                @click="$emit('sort', header.value)"
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
            <tr v-for="item in paginatedItems" :key="item.id">
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
                  @click="$emit('delete', item)" 
                  :title="currentLocale === 'RUS' ? 'Удалить результат' : 'Natijani o\'chirish'"
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
          @click="$emit('update:currentPage', currentPage - 1)"
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
          @click="$emit('update:currentPage', currentPage + 1)"
          class="pagination-btn"
        >
          <span>{{ t('next') }}</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '@/utils/i18n';

const props = defineProps({
  search: String,
  filterSubject: String,
  filterLevel: String,
  uniqueSubjects: Array,
  uniqueLevels: Array,
  loading: Boolean,
  items: Array,
  paginatedItems: Array,
  headers: Array,
  sortKey: String,
  sortOrder: String,
  currentPage: Number,
  totalPages: Number
});

const emit = defineEmits(['update:search', 'update:filterSubject', 'update:filterLevel', 'update:currentPage', 'export', 'sort', 'delete']);

const { locale, t } = useI18n();
const currentLocale = locale;

const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

const getScorePercent = (score, total) => {
  if (!total || total === 0) return 0;
  return Math.round((score / total) * 100);
};

const getScoreClass = (score, total) => {
  const percent = getScorePercent(score, total);
  if (percent >= 85) return 'score-excellent';
  if (percent >= 60) return 'score-good';
  return 'score-poor';
};

const getLevelClass = (level) => {
  const l = String(level).toLowerCase();
  if (l.includes('oson') || l.includes('easy') || l.includes('легко') || l.includes('low')) return 'level-easy';
  if (l.includes('orta') || l.includes("o'rtacha") || l.includes('medium') || l.includes('средне')) return 'level-medium';
  return 'level-hard';
};
</script>

<style scoped>
.results-table-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Filter Controls */
.filter-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 1rem;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
}

.filter-select {
  appearance: none;
  padding: 0.875rem 2.5rem 0.875rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") no-repeat right 1rem center/1.2rem;
  cursor: pointer;
  min-width: 160px;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.export-btn {
  padding: 0.875rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.export-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
}

/* Table Card */
.table-card {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.data-table th {
  background: #f8fafc;
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.2s;
}

.data-table th:hover {
  background: #f1f5f9;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.data-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.95rem;
  color: #334155;
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr {
  transition: background 0.2s;
}

.data-table tr:hover {
  background: #f8fafc;
}

/* Cell Styles */
.username-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar-mini {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.user-name-text {
  font-weight: 600;
  color: #0f172a;
}

.subject-badge {
  padding: 6px 12px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
}

.level-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.level-easy { background: #ecfdf5; color: #059669; }
.level-medium { background: #fffbeb; color: #d97706; }
.level-hard { background: #fef2f2; color: #dc2626; }

.score-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.score-pill {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
}

.score-excellent { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.score-good { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.score-poor { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.score-ratio {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
}

.date-cell {
  color: #64748b;
  font-size: 0.9rem;
}

.actions-cell {
  text-align: right;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.pagination-btn {
  padding: 0.75rem 1.25rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.pagination-btn:not(:disabled):hover {
  background: #f1f5f9;
  color: #0f172a;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
}

/* States */
.state-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.state-icon {
  font-size: 3rem;
  color: #94a3b8;
}

.error-icon {
  color: #fca5a5;
}

.state-text {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .filter-card {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    min-width: 100%;
  }
  .filter-controls {
    flex-direction: column;
  }
  .select-wrapper, .filter-select, .export-btn {
    width: 100%;
  }
}
</style>
