<template>
  <div class="users-panel">
    <!-- Header & Bulk Actions Toolbar -->
    <div class="header-toolbar">
      <div class="search-wrap">
        <i class="fas fa-search"></i>
        <input v-model="filters.search" placeholder="Ism, email yoki ID bo'yicha qidirish..." @input="applyFilters" />
      </div>
      
      <div class="bulk-actions" v-if="selectedUsers.length > 0">
        <span class="selected-count">{{ selectedUsers.length }} ta tanlandi</span>
        <button class="bulk-btn tp-btn" @click="bulkEditPointsModal = true"><i class="fas fa-coins"></i> TP Berish</button>
        <button class="bulk-btn ban-btn" @click="confirmBulkBan"><i class="fas fa-ban"></i> Ban</button>
      </div>
      
      <div class="toolbar-right">
        <button class="icon-btn export-btn" @click="exportCSV" title="CSV Yuklab olish">
          <i class="fas fa-file-csv"></i> Export
        </button>
        <button class="icon-btn" @click="loadUsers" title="Yangilash">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        </button>
      </div>
    </div>
    
    <!-- Advanced Filters Row -->
    <div class="filters-row">
      <select v-model="filters.role" @change="applyFilters" class="select-pill">
        <option value="all">Barcha Rollar</option>
        <option value="admin">Faqat Adminlar</option>
        <option value="user">Oddiy O'quvchilar</option>
      </select>
      
      <select v-model="filters.rank" @change="applyFilters" class="select-pill">
        <option value="all">Barcha Darajalar</option>
        <option value="Mythic">Mythic</option>
        <option value="Legendary">Legendary</option>
        <option value="Grandmaster">Grandmaster</option>
        <option value="Master">Master</option>
        <option value="Diamond Expert">Diamond Expert</option>
        <option value="Platinum Scholar">Platinum Scholar</option>
        <option value="Gold Scholar">Gold Scholar</option>
        <option value="Silver Scholar">Silver Scholar</option>
        <option value="Bronze Scholar">Bronze Scholar</option>
        <option value="Newbie Scholar">Newbie Scholar</option>
      </select>

      <select v-model="filters.sortBy" @change="applyFilters" class="select-pill">
        <option value="createdAt_desc">Eng Yangi Oldin</option>
        <option value="createdAt_asc">Eng Eski Oldin</option>
        <option value="points_desc">Eng Ko'p TP Oldin</option>
        <option value="points_asc">Eng Kam TP Oldin</option>
        <option value="name_asc">Ism (A-Z)</option>
        <option value="name_desc">Ism (Z-A)</option>
      </select>
    </div>

    <!-- Stats Row -->
    <div class="mini-stats-row">
      <div class="mini-stat"><span>{{ totalCount }}</span><label>Jami</label></div>
      <div class="mini-stat"><span>{{ activeCount }}</span><label>Faol (>0 TP)</label></div>
      <div class="mini-stat"><span>{{ adminCount }}</span><label>Adminlar</label></div>
      <div class="mini-stat"><span>{{ avgPoints }}</span><label>O'rtacha TP</label></div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table v-if="!loading && filteredUsers.length > 0">
        <thead>
          <tr>
            <th class="checkbox-th">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            </th>
            <th>Foydalanuvchi</th>
            <th>Email</th>
            <th>TP Coins</th>
            <th>Rank</th>
            <th>Referral</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id" :class="{ 'highlighted': user.isAdmin, 'selected-row': selectedUsers.includes(user.id) }">
            <td class="checkbox-td">
              <input type="checkbox" :value="user.id" v-model="selectedUsers" />
            </td>
            <td>
              <div class="user-cell">
                <div class="avatar-sm">{{ user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U' }}</div>
                <div>
                  <span class="uname">{{ user.displayName || 'Noma\'lum' }}</span>
                  <span v-if="user.isAdmin" :class="['admin-badge', getRoleClass(user.adminRole)]">{{ getRoleName(user.adminRole) }}</span>
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
                <button class="action-btn mail-btn" @click="sendMail(user)" title="Xabar yozish"><i class="fas fa-envelope"></i></button>
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

    <!-- Edit Points Modal (Single) -->
    <div class="modal-overlay" v-if="editingUser" @click.self="editingUser = null">
      <div class="modal-card">
        <h3><i class="fas fa-coins text-amber"></i> TP Coins o'zgartirish</h3>
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
    
    <!-- Bulk Edit Points Modal -->
    <div class="modal-overlay" v-if="bulkEditPointsModal" @click.self="bulkEditPointsModal = false">
      <div class="modal-card">
        <h3><i class="fas fa-gift text-emerald"></i> Ommaviy TP Sovg'a qilish</h3>
        <p>Siz <strong>{{ selectedUsers.length }}</strong> ta foydalanuvchini tanladingiz.</p>
        <div class="modal-input-group">
          <label>Ushbu o'quvchilarga qancha TP qo'shmoqchisiz?</label>
          <input v-model.number="bulkPointsToAdd" type="number" placeholder="Masalan: 500" />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="bulkEditPointsModal = false">Bekor</button>
          <button class="btn-confirm bg-emerald" @click="executeBulkTP">Barchasiga Qo'shish</button>
        </div>
      </div>
    </div>

    <!-- View User Modal (Pro CRM Version) -->
    <div class="modal-overlay" v-if="viewingUser" @click.self="closeViewUser">
      <div class="modal-card user-detail-modal">
        <!-- Profile Header -->
        <div class="user-detail-header">
          <div class="user-detail-avatar">{{ viewingUser.displayName ? viewingUser.displayName.charAt(0).toUpperCase() : 'U' }}</div>
          <div>
            <h3>{{ viewingUser.displayName || 'Noma\'lum' }}</h3>
            <p>{{ viewingUser.email }}</p>
            <span v-if="viewingUser.isAdmin" class="admin-badge mt-1">Administrator</span>
          </div>
          <button class="close-icon-btn" @click="closeViewUser"><i class="fas fa-times"></i></button>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs-nav">
          <button :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'"><i class="fas fa-id-card"></i> Umumiy</button>
          <button :class="{ active: activeTab === 'analytics' }" @click="activeTab = 'analytics'"><i class="fas fa-chart-line"></i> Tahlil</button>
          <button :class="{ active: activeTab === 'referrals' }" @click="activeTab = 'referrals'"><i class="fas fa-users"></i> Referallar</button>
        </div>

        <div class="tab-content-container">
          <!-- Tab Content: General -->
          <div v-if="activeTab === 'general'" class="tab-content fade-in">
            <div class="user-detail-grid">
              <div class="detail-item"><label>UID</label><span>{{ viewingUser.id }}</span></div>
              <div class="detail-item"><label>TP Coins</label><span>{{ (viewingUser.points || 0).toLocaleString() }}</span></div>
              <div class="detail-item"><label>Referral Kodi</label><span>{{ viewingUser.referralCode || viewingUser.shortId || '—' }}</span></div>
              <div class="detail-item"><label>Ro'yxatdan o'tgan</label><span>{{ formatDate(viewingUser.createdAt) }}</span></div>
            </div>
            
            <div class="security-actions">
              <h4>Xavfsizlik amallari</h4>
              <div class="security-buttons">
                <button class="sec-btn btn-reset" @click="sendPasswordReset"><i class="fas fa-key"></i> Parolni tiklash xati</button>
                <button class="sec-btn btn-ban" @click="confirmBan(viewingUser); closeViewUser()"><i class="fas fa-ban"></i> Bloklash (Ban)</button>
              </div>
            </div>
          </div>

          <!-- Tab Content: Analytics -->
          <div v-if="activeTab === 'analytics'" class="tab-content fade-in">
            <div v-if="loadingDetails" class="loader-box"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
            <div v-else>
              <div class="stats-mini-row mb-1">
                <div class="stat-box"><span>{{ userResults.length }}</span><label>Ishlangan Testlar</label></div>
                <div class="stat-box"><span>{{ userAvgScore }}%</span><label>O'rtacha Natija</label></div>
              </div>
              <div v-if="userResults.length > 0" class="recent-tests">
                <h4>Oxirgi 5 ta natija</h4>
                <ul>
                  <li v-for="(r, idx) in userResults.slice(0,5)" :key="idx">
                    <div class="test-info">
                      <strong>{{ r.subject }}</strong> <span class="badge-sm">{{ r.test_level || 'General' }}</span>
                    </div>
                    <div class="test-score">
                      <span :class="r.score >= (r.total * 0.7) ? 'text-emerald font-bold' : 'text-danger font-bold'">{{ r.score }} / {{ r.total }}</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div v-else class="empty-state-sm"><i class="fas fa-ghost"></i> Hali test ishlamagan</div>
            </div>
          </div>

          <!-- Tab Content: Referrals -->
          <div v-if="activeTab === 'referrals'" class="tab-content fade-in">
            <div v-if="loadingDetails" class="loader-box"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
            <div v-else>
              <div class="stats-mini-row mb-1">
                <div class="stat-box" style="width:100%"><span>{{ userReferrals.length }}</span><label>Taklif qilgan do'stlari</label></div>
              </div>
              <ul v-if="userReferrals.length > 0" class="referral-list">
                <li v-for="ref in userReferrals" :key="ref.id">
                  <div class="avatar-xs">{{ ref.displayName ? ref.displayName.charAt(0).toUpperCase() : 'U' }}</div>
                  <div class="ref-info">
                    <span class="ref-name">{{ ref.displayName || ref.email }}</span>
                    <small>{{ formatDate(ref.createdAt) }}</small>
                  </div>
                </li>
              </ul>
              <div v-else class="empty-state-sm"><i class="fas fa-users-slash"></i> Hech kimni taklif qilmagan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { getRankName, getRankClass } from '@/utils/ranks';
import { useToast } from 'vue-toastification';
import { confirmDelete } from '@/utils/sweetalert';

const toast = useToast();

export default {
  name: 'AdminUsers',
  data() {
    return {
      loading: true,
      allUsers: [],
      filteredUsers: [],
      selectedUsers: [],
      
      filters: {
        search: '',
        role: 'all',
        rank: 'all',
        sortBy: 'createdAt_desc'
      },
      
      currentPage: 1,
      pageSize: 20,
      
      editingUser: null,
      newPoints: 0,
      
      viewingUser: null,
      activeTab: 'general',
      loadingDetails: false,
      userResults: [],
      userReferrals: [],
      
      bulkEditPointsModal: false,
      bulkPointsToAdd: 0
    };
  },
  computed: {
    totalCount() { return this.filteredUsers.length; },
    activeCount() { return this.filteredUsers.filter(u => (u.points || 0) > 0).length; },
    adminCount() { return this.filteredUsers.filter(u => u.isAdmin).length; },
    avgPoints() {
      if (!this.filteredUsers.length) return 0;
      const sum = this.filteredUsers.reduce((a, u) => a + (u.points || 0), 0);
      return Math.round(sum / this.filteredUsers.length).toLocaleString();
    },
    totalPages() { return Math.ceil(this.filteredUsers.length / this.pageSize); },
    userAvgScore() {
      if (!this.userResults || this.userResults.length === 0) return 0;
      let totalP = 0;
      this.userResults.forEach(r => {
        totalP += (r.score / (r.total || 1)) * 100;
      });
      return Math.round(totalP / this.userResults.length);
    },
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
    },
    isAllSelected() {
      return this.paginatedUsers.length > 0 && this.paginatedUsers.every(u => this.selectedUsers.includes(u.id));
    }
  },
  mounted() { this.loadUsers(); },
  methods: {
    getRankName(p) { return getRankName(p); },
    getRankClass(p) { return getRankClass(p); },
    formatDate(ms) {
      if(!ms) return 'Noma\'lum';
      const d = ms.toMillis ? new Date(ms.toMillis()) : new Date(ms);
      return d.toLocaleDateString('uz-UZ');
    },
    getRoleName(role) {
      if (!role) return 'Admin';
      const map = {
        'boss': 'B O S S',
        'super_admin': 'Super Admin',
        'content_admin': 'Content Admin',
        'teacher_admin': 'Teacher Admin',
        'moderator': 'Moderator',
        'shop_admin': 'Shop Admin',
        'viewer': 'Viewer'
      };
      return map[role] || 'Admin';
    },
    getRoleClass(role) {
      if (!role) return 'role-default';
      return 'role-' + role;
    },
    async loadUsers() {
      this.loading = true;
      this.selectedUsers = [];
      try {
        const snap = await getDocs(collection(db, 'users'));
        this.allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        this.applyFilters();
      } catch(e) { 
        toast.error('Foydalanuvchilarni yuklashda xatolik: ' + e.message); 
      } finally { 
        this.loading = false; 
      }
    },
    applyFilters() {
      this.currentPage = 1;
      this.selectedUsers = []; // Clear selections on filter change
      let result = [...this.allUsers];
      
      // 1. Search filter
      if (this.filters.search.trim()) {
        const q = this.filters.search.toLowerCase();
        result = result.filter(u =>
          (u.displayName || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.referralCode || '').toLowerCase().includes(q)
        );
      }
      
      // 2. Role filter
      if (this.filters.role === 'admin') result = result.filter(u => u.isAdmin);
      else if (this.filters.role === 'user') result = result.filter(u => !u.isAdmin);
      
      // 3. Rank filter
      if (this.filters.rank !== 'all') {
         result = result.filter(u => this.getRankName(u.points || 0) === this.filters.rank);
      }
      
      // 4. Sort
      const [field, dir] = this.filters.sortBy.split('_');
      result.sort((a, b) => {
        let av = a[field] || 0, bv = b[field] || 0;
        if (field === 'name') { av = a.displayName || ''; bv = b.displayName || ''; return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); }
        if (field === 'createdAt') { av = a.createdAt?.toMillis?.() || 0; bv = b.createdAt?.toMillis?.() || 0; }
        return dir === 'asc' ? av - bv : bv - av;
      });
      
      this.filteredUsers = result;
    },
    
    // --- Selection Logic ---
    toggleSelectAll(e) {
      if (e.target.checked) {
        // Select all on current page
        this.paginatedUsers.forEach(u => {
          if (!this.selectedUsers.includes(u.id)) this.selectedUsers.push(u.id);
        });
      } else {
        // Deselect all on current page
        this.paginatedUsers.forEach(u => {
          this.selectedUsers = this.selectedUsers.filter(id => id !== u.id);
        });
      }
    },
    
    // --- Single Actions ---
    async viewUser(user) { 
      this.viewingUser = user; 
      this.activeTab = 'general';
      this.userResults = [];
      this.userReferrals = [];
      this.fetchUserDetails(user);
    },
    closeViewUser() {
      this.viewingUser = null;
    },
    async fetchUserDetails(user) {
      this.loadingDetails = true;
      try {
        // Fetch results
        const resQ = query(collection(db, 'results'), where('userId', '==', user.id));
        const resSnap = await getDocs(resQ).catch(() => ({ docs: [] }));
        let results = resSnap.docs.map(d => d.data());
        results.sort((a,b) => {
           let tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
           let tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
           return tB - tA;
        });
        this.userResults = results;
        
        // Fetch referrals
        const refQ = query(collection(db, 'users'), where('referredBy', '==', user.id));
        const refSnap = await getDocs(refQ).catch(() => ({ docs: [] }));
        let refs = refSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        refs.sort((a,b) => {
           let tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
           let tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
           return tB - tA;
        });
        this.userReferrals = refs;
        
      } catch(e) { console.error("Details fetch error", e); }
      finally { this.loadingDetails = false; }
    },
    async sendPasswordReset() {
      if (!this.viewingUser || !this.viewingUser.email) return;
      try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, this.viewingUser.email);
        toast.success(`${this.viewingUser.email} manziliga parolni tiklash xati yuborildi!`);
      } catch (error) {
        toast.error(`Xatolik: ${error.message}`);
      }
    },
    editPoints(user) { this.editingUser = user; this.newPoints = user.points || 0; },
    async savePoints() {
      if (!this.editingUser) return;
      try {
        const parsedPoints = Number(this.newPoints) || 0;
        await updateDoc(doc(db, 'users', this.editingUser.id), { points: parsedPoints });
        
        const idx = this.allUsers.findIndex(u => u.id === this.editingUser.id);
        if (idx !== -1) this.allUsers[idx].points = parsedPoints;
        
        this.applyFilters();
        toast.success(`${this.editingUser.displayName || this.editingUser.email} uchun TP muvaffaqiyatli yangilandi!`);
        this.editingUser = null;
      } catch(e) { 
        console.error(e);
        toast.error('Xatolik yuz berdi: ' + e.message); 
      }
    },
    async banUser(user) {
      if (!(await confirmDelete(
        'Foydalanuvchini bloklash',
        `${user.displayName || user.email} ni bloklaysizmi?`
      ))) return;
        updateDoc(doc(db, 'users', user.id), { isAdmin: false }).then(() => {
          toast.info('Foydalanuvchi admin huquqidan mahrum qilindi.');
          this.loadUsers();
        }).catch(e => toast.error('Xatolik yuz berdi: ' + e.message));
    },
    sendMail(user) {
      toast.info(`Maktub tizimi yozilmoqda... ${user.email} ga tez orada xat yozish imkoni bo'ladi.`);
    },
    
    // --- Bulk Actions ---
    async executeBulkTP() {
      if (this.selectedUsers.length === 0 || !this.bulkPointsToAdd) return;
      
      let successCount = 0;
      for (const uid of this.selectedUsers) {
         try {
           const user = this.allUsers.find(u => u.id === uid);
           if (!user) continue;
           
           const newTotal = (user.points || 0) + Number(this.bulkPointsToAdd);
           await updateDoc(doc(db, 'users', uid), { points: newTotal });
           user.points = newTotal;
           successCount++;
         } catch (err) {
           console.error("Failed to update user", uid, err);
         }
      }
      
      this.applyFilters();
      this.bulkEditPointsModal = false;
      this.selectedUsers = [];
      toast.success(`${successCount} ta foydalanuvchiga muvaffaqiyatli ${this.bulkPointsToAdd} TP qo'shildi!`);
    },
    async bulkBan() {
      if (this.selectedUsers.length === 0) return;
      if (!(await confirmDelete(
        'Ommaviy Bloklash',
        `Rostdan ham tanlangan ${this.selectedUsers.length} ta foydalanuvchini bloklamoqchimisiz?`
      ))) return;
        toast.warning('Ommaviy Ban qilish boshlandi...');
        for (const uid of this.selectedUsers) {
          try { await updateDoc(doc(db, 'users', uid), { isAdmin: false }); } 
          catch(e) { console.error(e); }
        }
        toast.success("Ommaviy bloklash muvaffaqiyatli yakunlandi!");
        this.selectedUsers = [];
        this.loadUsers();
    },
    
    exportCSV() {
      const headers = ['#', 'Ism', 'Email', 'TP', 'Referral', 'Rol'];
      const rows = this.filteredUsers.map((u, i) => [
        i + 1, u.displayName || '', u.email || '', u.points || 0, u.referralCode || '', u.isAdmin ? 'Admin' : 'User'
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'foydalanuvchilar.csv'; a.click();
      URL.revokeObjectURL(url);
    }
  }
}
</script>

<style scoped>
.users-panel { display: flex; flex-direction: column; gap: 1.25rem; }

/* Headers & Toolbar */
.header-toolbar { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; background: white; padding: 12px; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.03); }
.search-wrap { flex: 1; min-width: 250px; position: relative; display: flex; align-items: center; }
.search-wrap i { position: absolute; left: 16px; color: #94a3b8; }
.search-wrap input { width: 100%; padding: 12px 16px 12px 44px; border: 2px solid transparent; background: #f8fafc; border-radius: 12px; font-size: 0.95rem; outline: none; transition: 0.2s; font-weight: 500; }
.search-wrap input:focus { border-color: #3b82f6; background: white; }

.bulk-actions { display: flex; align-items: center; gap: 8px; background: #eff6ff; padding: 6px 10px; border-radius: 12px; border: 1px solid #bfdbfe; }
.selected-count { font-weight: 800; color: #1e40af; font-size: 0.85rem; padding: 0 8px; }
.bulk-btn { border: none; padding: 8px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; transition: 0.2s; }
.tp-btn { background: #3b82f6; color: white; }
.tp-btn:hover { background: #2563eb; }
.ban-btn { background: #fee2e2; color: #dc2626; }
.ban-btn:hover { background: #f87171; color: white; }

.toolbar-right { display: flex; gap: 8px; align-items: center; margin-left: auto; }
.icon-btn { padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; cursor: pointer; font-size: 0.95rem; color: #64748b; transition: 0.2s; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.icon-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.export-btn { color: #10b981; border-color: #d1fae5; background: #f0fdf4; }
.export-btn:hover { border-color: #10b981; background: #d1fae5; }

/* Advanced Filters */
.filters-row { display: flex; gap: 10px; flex-wrap: wrap; }
.select-pill { flex: 1; min-width: 150px; padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; outline: none; background: white; font-weight: 600; cursor: pointer; color: #475569; }
.select-pill:focus { border-color: #3b82f6; }

/* Mini Stats */
.mini-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.mini-stat { background: white; border: 1px solid #f1f5f9; border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.02); }
.mini-stat span { font-size: 1.6rem; font-weight: 900; color: #0f172a; line-height: 1.2; }
.mini-stat label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

/* Table */
.table-wrap { background: white; border-radius: 16px; border: 1px solid #f1f5f9; overflow-x: auto; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.03); }
table { width: 100%; border-collapse: collapse; min-width: 800px; }
thead { background: #f8fafc; }
th { padding: 14px 16px; text-align: left; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f1f5f9; }
td { padding: 14px 16px; border-bottom: 1px solid #f8fafc; vertical-align: middle; font-size: 0.9rem; }
tr:hover td { background: #fafbfc; }
tr.highlighted td { background: #fffbeb; }
tr.selected-row td { background: #eff6ff; }
tr:last-child td { border-bottom: none; }

.checkbox-th, .checkbox-td { width: 40px; text-align: center; }
input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: #3b82f6; }

.email-td { color: #64748b; font-size: 0.85rem; font-weight: 500; }
.ref-td { color: #94a3b8; font-family: monospace; font-size: 0.85rem; }

.user-cell { display: flex; align-items: center; gap: 12px; }
.avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
.uname { font-weight: 700; color: #0f172a; display: block; }
.admin-badge { font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 6px; margin-top: 2px; display: inline-block; white-space: nowrap; }
.role-boss { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.role-super_admin { background: #fef3c7; color: #d97706; }
.role-content_admin { background: #eff6ff; color: #2563eb; }
.role-teacher_admin { background: #f0f9ff; color: #0ea5e9; }
.role-moderator { background: #f0fdf4; color: #16a34a; }
.role-shop_admin { background: #f5f3ff; color: #7c3aed; }
.role-viewer { background: #f1f5f9; color: #475569; }
.role-default { background: #fee2e2; color: #dc2626; }

.tp-badge { background: #eff6ff; color: #2563eb; font-size: 0.85rem; font-weight: 800; padding: 4px 10px; border-radius: 99px; white-space: nowrap; }
.rank-badge { font-size: 0.78rem; font-weight: 800; padding: 4px 12px; border-radius: 99px; display: inline-block; white-space: nowrap; text-align: center; }
.rank-badge.rank-newbie { background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; }
.rank-badge.rank-bronze { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.rank-badge.rank-silver { background: #f1f5f9; color: #334155; border: 1px solid #94a3b8; }
.rank-badge.rank-gold { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.rank-badge.rank-platinum { background: #f0fdfa; color: #0f766e; border: 1px solid #99f6e4; }
.rank-badge.rank-diamond { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
.rank-badge.rank-master { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
.rank-badge.rank-grandmaster { background: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; box-shadow: 0 0 10px rgba(168, 85, 247, 0.12); }
.rank-badge.rank-legendary { background: #fff7ed; color: #ea580c; border: 1px solid #fdba74; box-shadow: 0 0 10px rgba(234, 88, 12, 0.12); }
.rank-badge.rank-mythic { background: #fdf4ff; color: #a21caf; border: 1px solid #f5d0fe; box-shadow: 0 0 10px rgba(192, 38, 211, 0.12); }

.actions-cell { display: flex; gap: 6px; }
.action-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: 0.2s; }
.view-btn { background: #f8fafc; color: #64748b; } .view-btn:hover { background: #e2e8f0; color: #0f172a; }
.edit-btn { background: #fefce8; color: #ca8a04; } .edit-btn:hover { background: #eab308; color: white; }
.mail-btn { background: #f0fdf4; color: #10b981; } .mail-btn:hover { background: #10b981; color: white; }
.delete-btn { background: #fef2f2; color: #ef4444; } .delete-btn:hover { background: #ef4444; color: white; }

.table-shimmer { padding: 1rem; display: flex; flex-direction: column; gap: 10px; }
.shimmer-row-table { height: 52px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 10px; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.empty-table { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #94a3b8; gap: 10px; }
.empty-table i { font-size: 3rem; color: #e2e8f0; }

/* Pagination */
.pagination { display: flex; justify-content: center; gap: 6px; }
.pagination button { width: 38px; height: 38px; border-radius: 10px; border: 2px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; }
.pagination button:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; }
.pagination button.active { background: #3b82f6; border-color: #3b82f6; color: white; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-card { background: white; border-radius: 24px; padding: 2rem; width: 100%; max-width: 440px; box-shadow: 0 25px 60px -10px rgba(0,0,0,0.25); }
.modal-card h3 { margin: 0 0 1rem; font-size: 1.25rem; color: #0f172a; display: flex; align-items: center; gap: 10px; font-weight: 800; }
.modal-card p { color: #64748b; margin: 0 0 0.5rem; font-size: 0.95rem; }
.modal-input-group { margin: 1.5rem 0; }
.modal-input-group label { display: block; font-weight: 700; color: #334155; margin-bottom: 8px; font-size: 0.9rem; }
.modal-input-group input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; outline: none; box-sizing: border-box; font-weight: 600; }
.modal-input-group input:focus { border-color: #3b82f6; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-cancel { padding: 10px 20px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-cancel:hover { background: #f1f5f9; color: #0f172a; }
.btn-confirm { padding: 10px 24px; border: none; border-radius: 12px; background: #3b82f6; color: white; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-confirm:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.bg-emerald { background: #10b981; } .bg-emerald:hover { background: #059669; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }

.text-amber { color: #f59e0b; }
.text-emerald { color: #10b981; }
.mt-1 { margin-top: 4px; }

/* User Details View */
.user-detail-modal { max-width: 520px; padding: 0; overflow: hidden; }
.user-detail-header { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; background: #f8fafc; position: relative; }
.user-detail-avatar { width: 70px; height: 70px; border-radius: 20px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; }
.user-detail-header h3 { margin: 0 0 4px; font-size: 1.3rem; font-weight: 800; color: #0f172a; }
.user-detail-header p { margin: 0; color: #64748b; font-size: 0.95rem; }
.close-icon-btn { position: absolute; top: 1.5rem; right: 1.5rem; background: transparent; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; transition: 0.2s; }
.close-icon-btn:hover { color: #0f172a; }

/* Tabs */
.tabs-nav { display: flex; border-bottom: 1px solid #f1f5f9; background: white; }
.tabs-nav button { flex: 1; padding: 12px 0; border: none; background: transparent; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; border-bottom: 3px solid transparent; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 6px; }
.tabs-nav button:hover { color: #3b82f6; background: #f8fafc; }
.tabs-nav button.active { color: #3b82f6; border-bottom-color: #3b82f6; }

.tab-content-container { padding: 1.5rem; min-height: 250px; }
.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.user-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 1rem; }
.detail-item label { display: block; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.detail-item span { font-weight: 700; color: #0f172a; font-size: 1rem; word-break: break-all; }

/* Security Actions */
.security-actions { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed #e2e8f0; }
.security-actions h4 { margin: 0 0 1rem; font-size: 0.9rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.security-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sec-btn { padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.9rem; transition: 0.2s; }
.btn-reset { background: #fffbeb; color: #d97706; } .btn-reset:hover { background: #fef3c7; }
.btn-ban { background: #fef2f2; color: #dc2626; } .btn-ban:hover { background: #fee2e2; }

/* Analytics & Referrals Tabs */
.stats-mini-row { display: flex; gap: 10px; }
.mb-1 { margin-bottom: 1rem; }
.stat-box { flex: 1; background: #f8fafc; border-radius: 12px; padding: 12px; text-align: center; border: 1px solid #f1f5f9; }
.stat-box span { display: block; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
.stat-box label { font-size: 0.75rem; font-weight: 700; color: #64748b; }

.recent-tests h4 { margin: 0 0 10px; font-size: 0.9rem; color: #0f172a; }
.recent-tests ul, .referral-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.recent-tests li { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9; }
.test-info strong { color: #0f172a; font-size: 0.95rem; }
.badge-sm { background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; margin-left: 6px; }
.font-bold { font-weight: 800; }
.text-danger { color: #dc2626; }

.referral-list li { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9; }
.avatar-xs { width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; }
.ref-info { display: flex; flex-direction: column; }
.ref-name { font-weight: 700; color: #0f172a; font-size: 0.9rem; }
.ref-info small { color: #64748b; font-size: 0.75rem; }

.loader-box { padding: 3rem; text-align: center; color: #94a3b8; font-weight: 600; display: flex; flex-direction: column; gap: 10px; }
.loader-box i { font-size: 2rem; color: #cbd5e1; }
.empty-state-sm { padding: 2rem; text-align: center; color: #94a3b8; font-weight: 600; display: flex; flex-direction: column; gap: 8px; }
.empty-state-sm i { font-size: 1.5rem; color: #cbd5e1; }
</style>
