<template>
  <div :class="['main-layout-wrapper', { 'sidebar-collapsed': isSidebarCollapsed, 'no-sidebar': !showNavbar, 'mobile-sidebar-open': isMobileSidebarOpen }]">
    
    <!-- Mobile Overlay Backdrop -->
    <div class="mobile-overlay" v-if="isMobileSidebarOpen && showNavbar" @click="closeMobileSidebar"></div>

    <!-- Collapsible Premium Sidebar -->
    <Sidebar 
      v-if="showNavbar" 
      :is-collapsed="isSidebarCollapsed" 
      :is-mobile-open="isMobileSidebarOpen"
      @toggle-sidebar="toggleSidebar"
      @close-mobile="closeMobileSidebar"
    />

    <!-- Main Content Layout -->
    <div class="main-layout-container">
      <!-- Premium Top Header -->
      <Header 
        v-if="showNavbar" 
        @toggle-sidebar="toggleSidebar"
      />

      <!-- Content Area -->
      <main :class="['page-content', { 'admin-page-content': isAdmin }]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Header from "../components/Header.vue";

export default {
  components: {
    Sidebar,
    Header,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      isMobile: false
    };
  },
  computed: {
    isAdmin() {
      return this.$route.path.startsWith('/admin');
    },
    showNavbar() {
      const hideOnPaths = ['/login', '/signup', '/SignUp'];
      return !hideOnPaths.includes(this.$route.path) && !this.isAdmin;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    
    // Load sidebar state preference
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState !== null) {
      this.isSidebarCollapsed = savedState === 'true';
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.isMobileSidebarOpen = false;
      }
    },
    toggleSidebar() {
      if (this.isMobile) {
        this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
      } else {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        localStorage.setItem('sidebar_collapsed', this.isSidebarCollapsed);
      }
    },
    closeMobileSidebar() {
      this.isMobileSidebarOpen = false;
    }
  }
};
</script>

<style scoped>
.main-layout-wrapper {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 998;
}

.main-layout-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;
  margin-left: 280px;
  transition: margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  width: calc(100% - 280px);
}

.sidebar-collapsed .main-layout-container {
  margin-left: 80px;
  width: calc(100% - 80px);
}

.no-sidebar .main-layout-container {
  margin-left: 0;
  width: 100%;
}

.page-content {
  flex: 1;
  padding: 10px 30px 30px 30px;
  background-color: #f8fafc;
  background-image: radial-gradient(rgba(37, 99, 235, 0.02) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  overflow-y: auto;
  overflow-x: hidden;
}

.admin-page-content {
  padding: 0;
  background-image: none;
  background-color: #f1f5f9;
  overflow: hidden;
  display: flex;
  flex: 1;
  min-height: 0;
}

/* Responsive adjustments */
@media screen and (max-width: 1024px) {
  /* On medium screens, collapse sidebar by default */
  .main-layout-wrapper:not(.no-sidebar) .app-sidebar {
    position: fixed;
  }
}

@media screen and (max-width: 768px) {
  .main-layout-container {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .mobile-overlay {
    display: block;
  }
  
  .page-content {
    padding: 10px 16px 20px 16px;
  }
}
</style>
