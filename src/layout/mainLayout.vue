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
      <main ref="pageContentRef" :class="['page-content', { 'admin-page-content': isAdmin }]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from "../components/Sidebar.vue";
import Header from "../components/Header.vue";

const route = useRoute();
const pageContentRef = ref(null);

watch(() => route.path, () => {
  if (pageContentRef.value) {
    pageContentRef.value.scrollTop = 0;
  }
});

const isSidebarCollapsed = ref(false);
const isMobileSidebarOpen = ref(false);
const isMobile = ref(false);

const isAdmin = computed(() => {
  return route && route.path ? route.path.startsWith('/admin') : false;
});

const showNavbar = computed(() => {
  const hideOnPaths = ['/login', '/signup', '/SignUp'];
  return route && route.path ? !hideOnPaths.includes(route.path) && !isAdmin.value : true;
});

const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    isMobileSidebarOpen.value = false;
  }
};

const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
  } else {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    localStorage.setItem('sidebar_collapsed', isSidebarCollapsed.value);
  }
};

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false;
};

onMounted(() => {
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
  
  const savedState = localStorage.getItem('sidebar_collapsed');
  if (savedState !== null) {
    isSidebarCollapsed.value = savedState === 'true';
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIfMobile);
});
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
