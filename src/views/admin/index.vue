<template>
  <div class="admin-root">
    <template v-if="loadingAuth">
      <div class="loading-overlay">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Admin huquqlari tekshirilmoqda...</p>
      </div>
    </template>
    <template v-else-if="authenticated">
      <!-- Sidebar -->
      <AdminSidebar
        :currentView="currentView"
        :isCollapsed="sidebarCollapsed"
        :adminRole="adminRole"
        @navigate="navigate"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
        @logout="logout"
      />

      <!-- Main area -->
      <div class="admin-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <!-- Top Header Bar -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" @click="sidebarCollapsed = !sidebarCollapsed">
              <i class="fas fa-bars"></i>
            </button>
            <div class="breadcrumb">
              <span class="bc-root" @click="navigate('overview')" title="Bosh sahifaga qaytish">Admin</span>
              <i class="fas fa-chevron-right bc-sep"></i>
              <span class="bc-current">{{ currentViewLabel }}</span>
            </div>
          </div>
          <div class="topbar-right">
            <div class="topbar-time">{{ currentTime }}</div>
            <div class="admin-badge-topbar">
              <i class="fas fa-shield-halved"></i>
              <span>{{ displayRole }}</span>
            </div>
          </div>
        </header>

        <!-- Scrollable Content -->
        <div class="admin-content-wrapper">
          <transition name="page-fade" mode="out-in">
            <component :is="currentComponent" :key="currentView" @navigate="navigate" />
          </transition>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminOverview from './components/AdminOverview.vue';
import AdminUsers from './components/AdminUsers.vue';
import AdminShop from './components/AdminShop.vue';
import AdminSubjects from './components/AdminSubjects.vue';
import AdminNotifications from './components/AdminNotifications.vue';
import AdminSettings from './components/AdminSettings.vue';
import AdminAnalytics from './components/AdminAnalytics.vue';
import AdminFinance from './components/AdminFinance.vue';

// Re-use existing components
import AddAdminComponent from './addAdmin.vue';
import UploadExcelComponent from './uploadExcel.vue';
import AddSubjectComponent from './addSubject.vue';
import AdminSeederComponent from '@/views/AdminSeeder.vue';

const VIEW_MAP = {
  overview:      AdminOverview,
  users:         AdminUsers,
  shopItems:     AdminShop,
  addProduct:    AdminShop,
  orders:        AdminShop,
  subjects:      AdminSubjects,
  addSubject:    AddSubjectComponent,
  uploadExcel:   UploadExcelComponent,
  aiSeeder:      AdminSeederComponent,
  addAdmin:      AddAdminComponent,
  notifications: AdminNotifications,
  certificates:  { template: '<div style="padding:2rem;text-align:center;color:#64748b"><i class="fas fa-certificate" style="font-size:3rem;color:#f59e0b;display:block;margin-bottom:1rem"></i><h3>Sertifikatlar boshqaruvi</h3><p>Firebase Firestore > "certificates" kolleksiyasini tekshiring.</p></div>' },
  analytics:     AdminAnalytics,
  finance:       AdminFinance,
  settings:      AdminSettings,
};

const LABELS = {
  overview: "Umumiy Ko'rinish", users: "Foydalanuvchilar", shopItems: "Shop Mahsulotlari",
  addProduct: "Mahsulot Qo'shish", orders: "Buyurtmalar", subjects: "Fanlar",
  addSubject: "Fanlar", uploadExcel: "Excel Yuklash", aiSeeder: "AI Seeder",
  addAdmin: "Admin Qo'shish", notifications: "Bildirishnomalar",
  certificates: "Sertifikatlar", analytics: "Tahlil", finance: "Moliya", settings: "Sozlamalar"
};

export default {
  name: 'AdminPanel',
  components: { AdminSidebar },
  data() {
    return {
      authenticated: false,
      loadingAuth: true,
      sidebarCollapsed: false,
      currentView: 'overview',
      currentTime: '',
      timeInterval: null,
      adminRole: 'admin',
    };
  },
  computed: {
    currentComponent() {
      const superViews = ['users', 'addAdmin', 'analytics', 'finance', 'shopItems', 'addProduct', 'orders', 'notifications', 'certificates', 'settings', 'aiSeeder'];
      if (superViews.includes(this.currentView) && this.adminRole !== 'super_admin') {
        return AdminOverview;
      }
      return VIEW_MAP[this.currentView] || AdminOverview;
    },
    currentViewLabel() { return LABELS[this.currentView] || this.currentView; },
    displayRole() {
      if (this.adminRole === 'super_admin') return 'Super Admin';
      if (this.adminRole === 'content_admin') return 'Content Admin';
      if (this.adminRole === 'teacher_admin') return 'Teacher Admin';
      return 'Admin';
    }
  },
  created() {
    auth.onAuthStateChanged(async user => {
      if (user) {
        if (user.email === 'avliyoqulovbaxrom99@gmail.com') {
          this.authenticated = true;
          this.adminRole = 'super_admin';
          this.loadingAuth = false;
        } else {
          // Fetch role from Firestore
          try {
            const docSnap = await getDoc(doc(db, 'users', user.uid));
            if (docSnap.exists() && docSnap.data().adminRole) {
              this.adminRole = docSnap.data().adminRole;
              this.authenticated = true;
            } else {
              this.authenticated = false;
              this.$router.push('/');
            }
          } catch(e) {
            console.error("Admin rolni olishda xatolik:", e);
            this.authenticated = false;
            this.$router.push('/');
          } finally {
            this.loadingAuth = false;
          }
        }
      } else {
        this.authenticated = false;
        this.loadingAuth = false;
        this.$router.push('/login');
      }
    });
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
  },
  beforeUnmount() { clearInterval(this.timeInterval); },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    },
    navigate(view) { this.currentView = view; },
    logout() {
      this.authenticated = false;
      this.adminRole = null;
      this.$router.push('/');
    },
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.admin-root {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f1f5f9;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* Top Header */
.admin-topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 50;
}

.topbar-left { display: flex; align-items: center; gap: 16px; }
.mobile-menu-btn { display: none; background: none; border: none; color: #64748b; font-size: 1.2rem; cursor: pointer; padding: 8px; border-radius: 8px; }
.mobile-menu-btn:hover { background: #f1f5f9; }

.breadcrumb { display: flex; align-items: center; gap: 8px; }
.bc-root { font-weight: 700; color: #94a3b8; font-size: 0.9rem; cursor: pointer; transition: color 0.2s; }
.bc-root:hover { color: #3b82f6; }
.bc-sep { color: #cbd5e1; font-size: 0.7rem; }
.bc-current { font-weight: 800; color: #0f172a; font-size: 0.95rem; }

.topbar-right { display: flex; align-items: center; gap: 16px; }
.topbar-time { font-weight: 700; color: #64748b; font-size: 0.9rem; font-variant-numeric: tabular-nums; }
.admin-badge-topbar {
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.82rem;
  font-weight: 700;
}
.admin-badge-topbar i { color: #60a5fa; }

/* Content scroll area */
.admin-content-wrapper {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  overflow-x: hidden;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(241, 245, 249, 0.9);
  z-index: 100;
  color: #3b82f6;
}
.loading-overlay i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.loading-overlay p {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

/* Page Transition */
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.page-fade-enter-from, .page-fade-leave-to { opacity: 0; transform: translateY(8px); }

/* Mobile */
@media (max-width: 900px) {
  .mobile-menu-btn { display: flex; }
  .topbar-time { display: none; }
  .admin-content-wrapper { padding: 16px; }
}
</style>
