<template>
  <div class="users-panel">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <i class="fas fa-search"></i>
        <input v-model="search" placeholder="Ism, email yoki ID bo'yicha qidirish..." @input="applyFilters" />
      </div>
      <div class="toolbar-right">
        <select v-model="sortBy" @change="applyFilters" class="select-pill">
          <option value="createdAt_desc">Eng Yangi</option>
          <option value="points_desc">Ko'p TP</option>
          <option value="points_asc">Kam TP</option>
          <option value="name_asc">Ism (A-Z)</option>
        </select>
        <button class="icon-btn" @click="loadUsers" title="Yangilash">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        </button>
        <button class="icon-btn export-btn" @click="exportCSV" title="CSV Yuklab olish">
          <i class="fas fa-file-csv"></i> Export
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="mini-stats-row">
      <div class="mini-stat"><span>{{ totalCount }}</span><label>Jami</label></div>
      <div class="mini-stat"><span>{{ activeCount }}</span><label>Faol (>0 TP)</label></div>
      <div class="mini-stat"><span>{{ avgPoints }}</span><label>O'rtacha TP</label></div>
      <div class="mini-stat"><span>{{ topPoints }}</span><label>Eng Yuqori TP</label></div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table v-if="!loading && filteredUsers.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>Foydalanuvchi</th>
            <th>Email</th>
            <th>TP Coins</th>
            <th>Rank</th>
            <th>Referral</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in paginatedUsers" :key="user.id" :class="{ 'highlighted': user.isAdmin }">
            <td class="index-td">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>
              <div class="user-cell">
                <div class="avatar-sm">{{ user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U' }}</div>
                <div>
                  <span class="uname">{{ user.displayName || 'Noma\'lum' }}</span>
                  <span v-if="user.isAdmin" class="admin-badge">Admin</span>
                </div>
              </div>
            </td>
            <td class="email-td">{{ user.email || '—' }}</td>
            <td><span class="tp-badge">{{ (user.points || 0).toLocaleString() }}</span></td>
            <td><span :class="['rank-badge', getRankClass(user.points || 0)]">{{ getRankName(user.points || 0) }}</span></td>
            <td class="ref-td">{{ user.referralCode || user.shortId || '—' }}</td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view-btn" @click="viewUser(user)" title="Ko'rish"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-btn" @click="editPoints(user)" title="TP o'zgartirish"><i class="fas fa-coins"></i></button>
                <button class="action-btn delete-btn" @click="confirmBan(user)" title="Ban"><i class="fas fa-ban"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="loading" class="table-shimmer">
        <div v-for="i in 8" :key="i" class="shimmer-row-table"></div>
      </div>
      <div v-if="!loading && filteredUsers.length === 0" class="empty-table">
        <i class="fas fa-users-slash"></i>
        <p>Foydalanuvchilar topilmadi</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="currentPage--"><i class="fas fa-chevron-left"></i></button>
      <button v-for="p in visiblePages" :key="p" :class="{ active: p === currentPage }" @click="currentPage = p">{{ p }}</button>
      <button :disabled="currentPage === totalPages" @click="currentPage++"><i class="fas fa-chevron-right"></i></button>
    </div>

    <!-- Edit Points Modal -->
    <div class="modal-overlay" v-if="editingUser" @click.self="editingUser = null">
      <div class="modal-card">
        <h3><i class="fas fa-coins"></i> TP Coins o'zgartirish</h3>
        <p>Foydalanuvchi: <strong>{{ editingUser.displayName || editingUser.email }}</strong></p>
        <p>Joriy balans: <strong>{{ editingUser.points || 0 }} TP</strong></p>
        <div class="modal-input-group">
          <label>Yangi miqdor (TP)</label>
          <input v-model.number="newPoints" type="number" min="0" placeholder="0" />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="editingUser = null">Bekor</button>
          <button class="btn-confirm" @click="savePoints">Saqlash</button>
        </div>
      </div>
    </div>

    <!-- View User Modal -->
    <div class="modal-overlay" v-if="viewingUser" @click.self="viewingUser = null">
      <div class="modal-card user-detail-modal">
        <div class="user-detail-header">
          <div class="user-detail-avatar">{{ viewingUser.displayName ? viewingUser.displayName.charAt(0).toUpperCase() : 'U' }}</div>
          <div>
            <h3>{{ viewingUser.displayName || 'Noma\'lum' }}</h3>
            <p>{{ viewingUser.email }}</p>
          </div>
        </div>
        <div class="user-detail-grid">
          <div class="detail-item"><label>UID</label><span>{{ viewingUser.id }}</span></div>
          <div class="detail-item"><label>TP Coins</label><span>{{ (viewingUser.points || 0).toLocaleString() }}</span></div>
          <div class="detail-item"><label>Referral Kodi</label><span>{{ viewingUser.referralCode || viewingUser.shortId || '—' }}</span></div>
          <div class="detail-item"><label>Admin</label><span>{{ viewingUser.isAdmin ? 'Ha' : 'Yo\'q' }}</span></div>
        </div>
        <button class="btn-cancel" style="width:100%; margin-top: 1rem;" @click="viewingUser = null">Yopish</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getRankName, getRankClass } from '@/utils/ranks';

export default {
  name: 'AdminUsers',
  data() {
    return {
      loading: true,
      allUsers: [],
      filteredUsers: [],
      search: '',
      sortBy: 'createdAt_desc',
      currentPage: 1,
      pageSize: 15,
      editingUser: null,
      viewingUser: null,
      newPoints: 0,
    };
  },
  computed: {
    totalCount() { return this.filteredUsers.length; },
    activeCount() { return this.filteredUsers.filter(u => (u.points || 0) > 0).length; },
    avgPoints() {
      if (!this.filteredUsers.length) return 0;
      const sum = this.filteredUsers.reduce((a, u) => a + (u.points || 0), 0);
      return Math.round(sum / this.filteredUsers.length).toLocaleString();
    },
    topPoints() {
      return (Math.max(...this.filteredUsers.map(u => u.points || 0)) || 0).toLocaleString();
    },
    totalPages() { return Math.ceil(this.filteredUsers.length / this.pageSize); },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredUsers.slice(start, start + this.pageSize);
    },
    visiblePages() {
      const pages = [];
      for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  mounted() { this.loadUsers(); },
  methods: {
    getRankName(p) { return getRankName(p); },
    getRankClass(p) { return getRankClass(p); },
    async loadUsers() {
      this.loading = true;
      try {
        const snap = await getDocs(collection(db, 'users'));
        this.allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        this.applyFilters();
      } catch(e) { console.error(e); }
      finally { this.loading = false; }
    },
    applyFilters() {
      this.currentPage = 1;
      let result = [...this.allUsers];
      if (this.search.trim()) {
        const q = this.search.toLowerCase();
        result = result.filter(u =>
          (u.displayName || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.referralCode || '').toLowerCase().includes(q) ||
          (u.shortId || '').toLowerCase().includes(q)
        );
      }
      const [field, dir] = this.sortBy.split('_');
      result.sort((a, b) => {
        let av = a[field] || 0, bv = b[field] || 0;
        if (field === 'name') { av = a.displayName || ''; bv = b.displayName || ''; return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); }
        if (field === 'createdAt') { av = a.createdAt?.toMillis?.() || 0; bv = b.createdAt?.toMillis?.() || 0; }
        return dir === 'asc' ? av - bv : bv - av;
      });
      this.filteredUsers = result;
    },
    viewUser(user) { this.viewingUser = user; },
    editPoints(user) { this.editingUser = user; this.newPoints = user.points || 0; },
    async savePoints() {
      if (!this.editingUser) return;
      try {
        await updateDoc(doc(db, 'users', this.editingUser.id), { points: this.newPoints });
        const idx = this.allUsers.findIndex(u => u.id === this.editingUser.id);
        if (idx !== -1) this.allUsers[idx].points = this.newPoints;
        this.applyFilters();
        alert('TP muvaffaqiyatli yangilandi!');
        this.editingUser = null;
      } catch(e) { alert('Xatolik: ' + e.message); }
    },
    confirmBan(user) {
      if (confirm(`${user.displayName || user.email} ni ban qilasizmi? Bu amal faqat isAdmin maydonini o'chiradi.`)) {
        updateDoc(doc(db, 'users', user.id), { isAdmin: false }).then(() => {
          alert('Foydalanuvchi admin huquqidan mahrum qilindi.');
          this.loadUsers();
        }).catch(e => alert('Xatolik: ' + e.message));
      }
    },
    exportCSV() {
      const headers = ['#', 'Ism', 'Email', 'TP', 'Referral'];
      const rows = this.filteredUsers.map((u, i) => [
        i + 1, u.displayName || '', u.email || '', u.points || 0, u.referralCode || u.shortId || ''
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
      URL.revokeObjectURL(url);
    }
  }
}
</script>

<style scoped>
.users-panel { display: flex; flex-direction: column; gap: 1.25rem; }

.toolbar { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.search-wrap { flex: 1; min-width: 250px; position: relative; display: flex; align-items: center; }
.search-wrap i { position: absolute; left: 14px; color: #94a3b8; }
.search-wrap input { width: 100%; padding: 10px 14px 10px 38px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; outline: none; transition: 0.2s; }
.search-wrap input:focus { border-color: #3b82f6; }
.toolbar-right { display: flex; gap: 8px; align-items: center; }
.select-pill { padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; outline: none; background: white; font-weight: 600; cursor: pointer; }
.icon-btn { padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; cursor: pointer; font-size: 0.9rem; color: #64748b; transition: 0.2s; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.icon-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.export-btn { color: #10b981; border-color: #d1fae5; }
.export-btn:hover { border-color: #10b981; background: #f0fdf4; }

.mini-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.mini-stat { background: white; border: 1px solid #f1f5f9; border-radius: 16px; padding: 1rem; text-align: center; }
.mini-stat span { display: block; font-size: 1.6rem; font-weight: 900; color: #0f172a; }
.mini-stat label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

.table-wrap { background: white; border-radius: 16px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.04); }
table { width: 100%; border-collapse: collapse; }
thead { background: #f8fafc; }
th { padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; }
td { padding: 14px 16px; border-bottom: 1px solid #f8fafc; vertical-align: middle; font-size: 0.9rem; }
tr:hover td { background: #fafbfc; }
tr.highlighted td { background: #fffbeb; }
tr:last-child td { border-bottom: none; }

.index-td { color: #94a3b8; font-weight: 600; }
.email-td { color: #64748b; font-size: 0.82rem; }
.ref-td { color: #94a3b8; font-family: monospace; font-size: 0.82rem; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar-sm { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0; }
.uname { font-weight: 700; color: #0f172a; display: block; }
.admin-badge { background: #fee2e2; color: #dc2626; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 6px; margin-left: 4px; }

.tp-badge { background: #eff6ff; color: #2563eb; font-size: 0.8rem; font-weight: 800; padding: 4px 10px; border-radius: 99px; white-space: nowrap; }
.rank-badge { font-size: 0.78rem; font-weight: 800; padding: 3px 10px; border-radius: 99px; background: #f1f5f9; color: #475569; }
.rank-badge.rank-mythic { background: linear-gradient(135deg, #581c87, #7c3aed); color: white; }
.rank-badge.rank-legendary { background: linear-gradient(135deg, #92400e, #d97706); color: white; }
.rank-badge.rank-grandmaster { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; }
.rank-badge.rank-master { background: linear-gradient(135deg, #0f4c3a, #059669); color: white; }
.rank-badge.rank-diamond { background: linear-gradient(135deg, #0c4a6e, #0ea5e9); color: white; }
.rank-badge.rank-gold { background: linear-gradient(135deg, #78350f, #f59e0b); color: white; }

.actions-cell { display: flex; gap: 6px; }
.action-btn { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: 0.2s; }
.view-btn { background: #eff6ff; color: #3b82f6; }
.view-btn:hover { background: #3b82f6; color: white; }
.edit-btn { background: #fefce8; color: #ca8a04; }
.edit-btn:hover { background: #eab308; color: white; }
.delete-btn { background: #fef2f2; color: #ef4444; }
.delete-btn:hover { background: #ef4444; color: white; }

.table-shimmer { padding: 1rem; display: flex; flex-direction: column; gap: 10px; }
.shimmer-row-table { height: 52px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 10px; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.empty-table { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #94a3b8; gap: 10px; }
.empty-table i { font-size: 3rem; color: #e2e8f0; }

.pagination { display: flex; justify-content: center; gap: 6px; }
.pagination button { width: 38px; height: 38px; border-radius: 10px; border: 2px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; }
.pagination button:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; }
.pagination button.active { background: #3b82f6; border-color: #3b82f6; color: white; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-card { background: white; border-radius: 20px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-card h3 { margin: 0 0 1rem; font-size: 1.2rem; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.modal-card h3 i { color: #f59e0b; }
.modal-card p { color: #64748b; margin: 0 0 0.5rem; font-size: 0.9rem; }
.modal-input-group { margin: 1.25rem 0; }
.modal-input-group label { display: block; font-weight: 700; color: #374151; margin-bottom: 6px; font-size: 0.9rem; }
.modal-input-group input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; outline: none; box-sizing: border-box; }
.modal-input-group input:focus { border-color: #3b82f6; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-cancel { padding: 10px 20px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-cancel:hover { background: #f1f5f9; }
.btn-confirm { padding: 10px 20px; border: none; border-radius: 12px; background: #3b82f6; color: white; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-confirm:hover { background: #2563eb; }

.user-detail-modal { max-width: 500px; }
.user-detail-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.user-detail-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; }
.user-detail-header h3 { margin: 0 0 4px; font-size: 1.2rem; color: #0f172a; }
.user-detail-header p { margin: 0; color: #64748b; font-size: 0.9rem; }
.user-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.detail-item label { display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.detail-item span { font-weight: 700; color: #0f172a; font-size: 0.9rem; word-break: break-all; }
</style>
