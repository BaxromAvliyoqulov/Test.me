<template>
  <div class="add-admin-panel">
    <div class="panel-header">
      <h3><i class="fas fa-user-shield"></i> Admin Boshqaruvi</h3>
      <p>Foydalanuvchilarga admin roli tayinlash va mavjud adminlarni boshqarish</p>
    </div>

    <div class="two-col-layout">
      <!-- LEFT: Add Admin Form -->
      <div class="form-card">
        <h4><i class="fas fa-plus-circle"></i> Admin Qo'shish / Yangilash</h4>

        <div class="form-group">
          <label>Foydalanuvchi Email *</label>
          <div class="email-search-wrap">
            <input v-model="emailInput" @input="searchUser" placeholder="email@example.com" type="email" />
            <div class="user-found-badge" v-if="foundUser">
              <i class="fas fa-check-circle"></i> {{ foundUser.displayName || 'Topildi' }}
            </div>
          </div>
          <small v-if="emailInput && !foundUser && !searching">Foydalanuvchi topilmadi yoki email to'g'ri kiriting</small>
          <small v-if="searching"><i class="fas fa-spinner fa-spin"></i> Qidirilmoqda...</small>
        </div>

        <div class="form-group">
          <label>Admin Roli *</label>
          <div class="role-cards">
            <div
              v-for="role in roles"
              :key="role.key"
              :class="['role-card', { active: selectedRole === role.key }]"
              :style="selectedRole === role.key ? { '--rc': role.color } : {}"
              @click="selectedRole = role.key"
            >
              <i :class="['role-icon', role.icon]" :style="{ color: role.color }"></i>
              <span class="role-name">{{ role.label }}</span>
              <span class="role-desc">{{ role.desc }}</span>
              <div class="permissions-mini">
                <span v-for="p in role.permissions" :key="p" class="perm-chip">{{ p }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Qo'shimcha izoh (ixtiyoriy)</label>
          <input v-model="adminNote" placeholder="Masalan: Ingliz tili bo'limi uchun..." />
        </div>

        <div v-if="formStatus" :class="['status-msg', formStatus.type]">{{ formStatus.message }}</div>

        <button class="btn-submit" @click="assignAdmin" :disabled="saving || !selectedRole">
          <span v-if="!saving"><i class="fas fa-user-shield"></i> Rol Tayinlash</span>
          <span v-else class="loader"></span>
        </button>
      </div>

      <!-- RIGHT: Current Admins Table -->
      <div class="admins-card">
        <div class="card-header-row">
          <h4><i class="fas fa-users-gear"></i> Mavjud Adminlar</h4>
          <button class="refresh-btn" @click="loadAdmins"><i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingAdmins }"></i></button>
        </div>

        <div v-if="loadingAdmins" class="loading-msg"><i class="fas fa-spinner fa-spin"></i></div>

        <div v-else-if="admins.length === 0" class="empty-admin">
          <i class="fas fa-user-slash"></i>
          <p>Hech qanday admin topilmadi</p>
        </div>

        <div v-else class="admins-list">
          <div v-for="admin in admins" :key="admin.id" class="admin-row">
            <div class="admin-avatar" :style="{ background: getRoleColor(admin.adminRole) + '20', color: getRoleColor(admin.adminRole) }">
              {{ admin.displayName ? admin.displayName.charAt(0).toUpperCase() : 'A' }}
            </div>
            <div class="admin-info">
              <span class="admin-name">{{ admin.displayName || admin.email }}</span>
              <span class="admin-email">{{ admin.email }}</span>
              <span v-if="admin.adminNote" class="admin-note">{{ admin.adminNote }}</span>
            </div>
            <div class="admin-right">
              <span :class="['role-badge', 'role-' + admin.adminRole]">
                <i :class="getRoleIcon(admin.adminRole)"></i>
                {{ getRoleLabel(admin.adminRole) }}
              </span>
              <div class="admin-actions">
                <button class="action-btn edit-btn" @click="editAdmin(admin)" title="Rolni o'zgartirish"><i class="fas fa-pen"></i></button>
                <button class="action-btn remove-btn" @click="removeAdmin(admin)" title="Admin huquqini olish"><i class="fas fa-user-minus"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <div class="modal-overlay" v-if="editingAdmin" @click.self="editingAdmin = null">
      <div class="modal-card">
        <h3><i class="fas fa-pen"></i> Rolni O'zgartirish</h3>
        <p>Admin: <strong>{{ editingAdmin.displayName || editingAdmin.email }}</strong></p>
        <div class="role-cards compact">
          <div
            v-for="role in roles"
            :key="role.key"
            :class="['role-card', { active: editRole === role.key }]"
            @click="editRole = role.key"
          >
            <i :class="['role-icon', role.icon]" :style="{ color: role.color }"></i>
            <span class="role-name">{{ role.label }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="editingAdmin = null">Bekor</button>
          <button class="btn-confirm" @click="saveEditRole">Saqlash</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { collection, getDocs, doc, updateDoc, query, where, limit } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import { confirmDelete } from '@/utils/sweetalert';

const toast = useToast();

export default {
  name: 'AdminAddAdmin',
  data() {
    return {
      emailInput: '',
      foundUser: null,
      searching: false,
      searchTimeout: null,
      selectedRole: 'content_admin',
      adminNote: '',
      formStatus: null,
      saving: false,
      admins: [],
      loadingAdmins: false,
      editingAdmin: null,
      editRole: '',
      roles: [
        {
          key: 'super_admin',
          label: 'Super Admin',
          icon: 'fas fa-crown',
          color: '#f59e0b',
          desc: 'To\'liq huquq — barcha sozlamalar',
          permissions: ['Barchasi', 'Delete', 'Settings']
        },
        {
          key: 'content_admin',
          label: 'Content Admin',
          icon: 'fas fa-book-open',
          color: '#3b82f6',
          desc: 'Testlar va fanlarni boshqarish',
          permissions: ['Testlar', 'Fanlar', 'AI Seeder']
        },
        {
          key: 'moderator',
          label: 'Moderator',
          icon: 'fas fa-shield-halved',
          color: '#10b981',
          desc: 'Foydalanuvchilar va shikoyatlar',
          permissions: ['Users', 'Ban', 'Xabarlar']
        },
        {
          key: 'shop_admin',
          label: 'Shop Admin',
          icon: 'fas fa-store',
          color: '#8b5cf6',
          desc: 'Do\'kon va mahsulotlarni boshqarish',
          permissions: ['Shop', 'Mahsulotlar', 'Buyurtmalar']
        },
        {
          key: 'viewer',
          label: 'Viewer',
          icon: 'fas fa-eye',
          color: '#64748b',
          desc: 'Faqat ko\'rish huquqi',
          permissions: ['Ko\'rish']
        }
      ]
    };
  },
  mounted() { this.loadAdmins(); },
  methods: {
    getRoleColor(role) {
      const r = this.roles.find(r => r.key === role);
      return r ? r.color : '#64748b';
    },
    getRoleIcon(role) {
      const r = this.roles.find(r => r.key === role);
      return r ? r.icon : 'fas fa-user';
    },
    getRoleLabel(role) {
      const r = this.roles.find(r => r.key === role);
      return r ? r.label : role;
    },
    searchUser() {
      clearTimeout(this.searchTimeout);
      this.foundUser = null;
      if (!this.emailInput.includes('@')) return;
      this.searching = true;
      this.searchTimeout = setTimeout(async () => {
        try {
          const q = query(collection(db, 'users'), where('email', '==', this.emailInput.trim()), limit(1));
          const snap = await getDocs(q);
          this.foundUser = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
        } catch(e) { this.foundUser = null; }
        finally { this.searching = false; }
      }, 600);
    },
    async assignAdmin() {
      if (!this.foundUser || !this.selectedRole) {
        this.formStatus = { type: 'error', message: 'Foydalanuvchi topilmadi yoki rol tanlanmadi!' };
        return;
      }
      this.saving = true;
      this.formStatus = null;
      try {
        await updateDoc(doc(db, 'users', this.foundUser.id), {
          isAdmin: true,
          adminRole: this.selectedRole,
          adminNote: this.adminNote || '',
        });
        this.formStatus = { type: 'success', message: `${this.foundUser.displayName || this.emailInput} — "${this.getRoleLabel(this.selectedRole)}" roli berildi!` };
        this.emailInput = '';
        this.foundUser = null;
        this.adminNote = '';
        await this.loadAdmins();
      } catch(e) {
        this.formStatus = { type: 'error', message: 'Xatolik: ' + e.message };
      } finally { this.saving = false; }
    },
    async loadAdmins() {
      this.loadingAdmins = true;
      try {
        const q = query(collection(db, 'users'), where('isAdmin', '==', true));
        const snap = await getDocs(q);
        this.admins = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch(e) { this.admins = []; }
      finally { this.loadingAdmins = false; }
    },
    editAdmin(admin) {
      this.editingAdmin = admin;
      this.editRole = admin.adminRole || 'viewer';
    },
    async saveEditRole() {
      try {
        await updateDoc(doc(db, 'users', this.editingAdmin.id), { adminRole: this.editRole });
        toast.success(`Admin roli muvaffaqiyatli yangilandi!`);
        await this.loadAdmins();
        this.editingAdmin = null;
      } catch(e) { toast.error('Xatolik: ' + e.message); }
    },
    async removeAdmin(admin) {
      if (!(await confirmDelete(
        'Adminni o\'chirish',
        `${admin.displayName || admin.email} foydalanuvchisidan adminlikni olasizmi?`
      ))) return;
      try {
        await updateDoc(doc(db, 'users', admin.id), { isAdmin: false, adminRole: null });
        toast.info(`${admin.displayName || admin.email} adminlar ro'yxatidan o'chirildi.`);
        await this.loadAdmins();
      } catch(e) { toast.error('Xatolik: ' + e.message); }
    }
  }
}
</script>

<style scoped>
.add-admin-panel { display: flex; flex-direction: column; gap: 1.5rem; }

.panel-header h3 { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0 0 4px; display: flex; align-items: center; gap: 10px; }
.panel-header h3 i { color: #8b5cf6; }
.panel-header p { color: #64748b; margin: 0; font-size: 0.9rem; }

.two-col-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 900px) { .two-col-layout { grid-template-columns: 1fr; } }

.form-card, .admins-card {
  background: white; border-radius: 20px; padding: 1.5rem;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.04);
  display: flex; flex-direction: column; gap: 1.25rem;
}

h4 { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
h4 i { color: #3b82f6; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-weight: 700; color: #374151; font-size: 0.85rem; }
.form-group input { padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; outline: none; transition: 0.2s; }
.form-group input:focus { border-color: #8b5cf6; }
.form-group small { color: #94a3b8; font-size: 0.8rem; }

.email-search-wrap { display: flex; gap: 10px; align-items: center; }
.email-search-wrap input { flex: 1; }
.user-found-badge { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; white-space: nowrap; display: flex; align-items: center; gap: 6px; }

/* Role Cards */
.role-cards { display: flex; flex-direction: column; gap: 10px; }
.role-cards.compact { flex-direction: row; flex-wrap: wrap; }

.role-card {
  display: flex; flex-direction: column; gap: 4px;
  padding: 14px; border-radius: 14px; border: 2px solid #e2e8f0;
  cursor: pointer; transition: all 0.2s;
}
.role-cards.compact .role-card { flex: 1; min-width: 100px; align-items: center; text-align: center; }
.role-card:hover { border-color: #cbd5e1; background: #f8fafc; }
.role-card.active { border-color: var(--rc, #3b82f6); background: color-mix(in srgb, var(--rc, #3b82f6) 5%, white); }

.role-icon { font-size: 1.2rem; margin-bottom: 2px; }
.role-name { font-weight: 800; color: #0f172a; font-size: 0.9rem; }
.role-desc { font-size: 0.78rem; color: #64748b; }
.permissions-mini { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.perm-chip { background: #f1f5f9; color: #64748b; font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; }

.status-msg { padding: 10px 14px; border-radius: 10px; font-weight: 600; font-size: 0.85rem; }
.status-msg.success { background: #f0fdf4; color: #16a34a; }
.status-msg.error { background: #fef2f2; color: #dc2626; }

.btn-submit { padding: 12px; border: none; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; font-weight: 800; cursor: pointer; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(109, 40, 217, 0.3); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.card-header-row { display: flex; justify-content: space-between; align-items: center; }
.refresh-btn { background: #f1f5f9; border: none; color: #64748b; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
.refresh-btn:hover { background: #e2e8f0; }

.admins-list { display: flex; flex-direction: column; gap: 10px; max-height: 550px; overflow-y: auto; }
.admin-row { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; border: 1px solid #f1f5f9; transition: 0.2s; }
.admin-row:hover { background: #f8fafc; }

.admin-avatar { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; flex-shrink: 0; }
.admin-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.admin-name { font-weight: 800; color: #0f172a; font-size: 0.9rem; }
.admin-email { font-size: 0.78rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.admin-note { font-size: 0.75rem; color: #64748b; font-style: italic; }

.admin-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.role-badge { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 800; }
.role-super_admin { background: #fef3c7; color: #d97706; }
.role-content_admin { background: #eff6ff; color: #2563eb; }
.role-moderator { background: #f0fdf4; color: #16a34a; }
.role-shop_admin { background: #f5f3ff; color: #7c3aed; }
.role-viewer { background: #f1f5f9; color: #475569; }

.admin-actions { display: flex; gap: 6px; }
.action-btn { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: 0.2s; }
.edit-btn { background: #fefce8; color: #ca8a04; }
.edit-btn:hover { background: #eab308; color: white; }
.remove-btn { background: #fef2f2; color: #ef4444; }
.remove-btn:hover { background: #ef4444; color: white; }

.empty-admin { display: flex; flex-direction: column; align-items: center; padding: 2rem; color: #94a3b8; gap: 10px; }
.empty-admin i { font-size: 2.5rem; color: #e2e8f0; }
.loading-msg { text-align: center; color: #94a3b8; padding: 2rem; font-size: 1.2rem; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-card { background: white; border-radius: 20px; padding: 2rem; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-card h3 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.modal-card p { color: #64748b; margin: 0 0 1.25rem; font-size: 0.9rem; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.25rem; }
.btn-cancel { padding: 10px 20px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; color: #64748b; font-weight: 700; cursor: pointer; }
.btn-confirm { padding: 10px 20px; border: none; border-radius: 12px; background: #8b5cf6; color: white; font-weight: 700; cursor: pointer; }
</style>
