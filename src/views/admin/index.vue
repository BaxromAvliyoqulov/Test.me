<template>
  <div class="admin-dashboard-layout">
    <div class="glow-bg glow-1"></div>
    <div class="glow-bg glow-2"></div>
    
    <LoginModal :show="!authenticated" @authenticated="handleAuthentication" />
    
    <div v-if="authenticated" class="admin-main-container">
      <div class="admin-header-card">
        <div class="header-left">
          <div class="admin-avatar">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="admin-titles">
            <h2>Super Admin Panel</h2>
            <p>Platforma boshqaruvi va ma'lumotlar bazasi</p>
          </div>
        </div>
        <button class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <div class="admin-nav-grid">
        <button 
          :class="['nav-card', { active: currentView === 'addSubject' }]" 
          @click="currentView = 'addSubject'"
        >
          <i class="fas fa-book-open nav-icon"></i>
          <span>Add Subject</span>
        </button>
        <button 
          :class="['nav-card', { active: currentView === 'addAdmin' }]" 
          @click="currentView = 'addAdmin'"
        >
          <i class="fas fa-user-shield nav-icon"></i>
          <span>Add Admin</span>
        </button>
        <button 
          :class="['nav-card', { active: currentView === 'addProduct' }]" 
          @click="currentView = 'addProduct'"
        >
          <i class="fas fa-box nav-icon"></i>
          <span>Add Product</span>
        </button>
        <button 
          :class="['nav-card upload-nav', { active: currentView === 'uploadExcel' }]" 
          @click="currentView = 'uploadExcel'"
        >
          <i class="fas fa-file-excel nav-icon"></i>
          <span>Upload Tests (Excel)</span>
        </button>
        <button 
          class="nav-card" 
          @click="$router.push('/admin-seeder')"
        >
          <i class="fas fa-robot nav-icon"></i>
          <span>AI Test Seeder</span>
        </button>

      </div>

      <div class="admin-content-area">
        <transition name="fade" mode="out-in">
          <AddSubjectComponent v-if="currentView === 'addSubject'" />
          <AddAdminComponent v-else-if="currentView === 'addAdmin'" />
          <AddProductComponent v-else-if="currentView === 'addProduct'" />
          <UploadExcelComponent v-else-if="currentView === 'uploadExcel'" />

          
          <div v-else class="welcome-placeholder">
            <i class="fas fa-cogs"></i>
            <h3>Boshqaruv paneliga xush kelibsiz</h3>
            <p>Yuqoridagi menyulardan kerakli bo'limni tanlang</p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from "@/config/firebase";
import LoginModal from "./loginModal.vue";
import AddAdminComponent from "./addAdmin.vue";
import AddSubjectComponent from "./addSubject.vue";
import AddProductComponent from "./addProduct.vue";
import UploadExcelComponent from "./uploadExcel.vue";


export default {
  components: {
    LoginModal,
    AddAdminComponent,
    AddSubjectComponent,
    AddProductComponent,
    UploadExcelComponent,

  },
  data() {
    return {
      currentView: null,
      authenticated: false,
      isBoss: false,
      selectedSubject: "",
      selectedLevel: "",
      tests: [],
      loading: false,
      status: null,
      subjects: ["English", "Math", "Physics", "History"],
      levels: ["Beginner"],
    };
  },
  created() {
    // Checking token
    const authToken = localStorage.getItem("adminAuth");
    if (authToken) {
      this.authenticated = true;
    }
    
    // Check if the current user is the super admin
    auth.onAuthStateChanged((user) => {
      if (user && user.email === 'avliyoqulovbaxrom99@gmail.com') {
        this.authenticated = true;
        this.isBoss = true;
        localStorage.setItem("adminAuth", "true");
      }
    });
  },
  methods: {
    handleAuthentication(status) {
      this.authenticated = status;
      if (!status) {
        localStorage.removeItem("adminAuth");
        this.$router.push("/");
      } else {
        localStorage.setItem("adminAuth", "true");
      }
    },
    logout() {
      localStorage.removeItem("adminAuth");
      this.authenticated = false;
      this.isBoss = false;
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.admin-dashboard-layout {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* Background glows */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.15;
}
.glow-1 {
  width: 500px;
  height: 500px;
  background: #3b82f6;
  top: -100px;
  left: -100px;
}
.glow-2 {
  width: 400px;
  height: 400px;
  background: #8b5cf6;
  bottom: 10%;
  right: -50px;
}

.admin-main-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Header Card */
.admin-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 25px 35px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 10px 15px rgba(15, 23, 42, 0.2);
}

.admin-titles h2 {
  margin: 0 0 5px 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
}

.admin-titles p {
  margin: 0;
  color: #64748b;
  font-weight: 500;
}

.logout-btn {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* Navigation Grid */
.admin-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.nav-card {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  color: #475569;
  font-weight: 600;
  font-family: inherit;
  font-size: 1rem;
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
  color: #0f172a;
}

.nav-icon {
  font-size: 28px;
  color: #94a3b8;
  transition: color 0.3s;
}

.nav-card:hover .nav-icon {
  color: #3b82f6;
}

.nav-card.active {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #bfdbfe;
  color: #1d4ed8;
  box-shadow: 0 8px 15px rgba(59, 130, 246, 0.1);
}
.nav-card.active .nav-icon {
  color: #2563eb;
}

.nav-card.upload-nav.active {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #bbf7d0;
  color: #15803d;
}
.nav-card.upload-nav.active .nav-icon {
  color: #16a34a;
}

/* Content Area */
.admin-content-area {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  min-height: 500px;
  padding: 30px;
}

.welcome-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  color: #94a3b8;
  text-align: center;
}

.welcome-placeholder i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #cbd5e1;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.welcome-placeholder h3 {
  font-size: 1.5rem;
  color: #475569;
  margin: 0 0 10px 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
