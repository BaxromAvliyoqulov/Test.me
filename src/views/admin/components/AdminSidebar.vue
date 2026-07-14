<template>
  <aside class="admin-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="logo-area" :class="{ 'hidden': isCollapsed }">
        <div class="logo-icon"><i class="fas fa-crown"></i></div>
        <transition name="label-fade">
          <span v-if="!isCollapsed" class="logo-text">Admin<span>Panel</span></span>
        </transition>
      </div>
      <button class="collapse-btn" @click="$emit('toggle-collapse')">
        <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div v-for="group in navGroups" :key="group.label" class="nav-group">
        <transition name="label-fade">
          <span v-if="!isCollapsed" class="nav-group-label">{{ group.label }}</span>
        </transition>
        <button
          v-for="item in group.items"
          :key="item.key"
          class="nav-item"
          :class="{ active: currentView === item.key }"
          @click="$emit('navigate', item.key)"
          :title="isCollapsed ? item.label : ''"
        >
          <i :class="['nav-icon', item.icon]"></i>
          <transition name="label-fade">
            <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
          </transition>
          <span v-if="!isCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="nav-item logout-item" @click="$emit('logout')">
        <i class="nav-icon fas fa-sign-out-alt"></i>
        <transition name="label-fade">
          <span v-if="!isCollapsed" class="nav-label">Chiqish</span>
        </transition>
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'AdminSidebar',
  props: {
    currentView: { type: String, default: 'overview' },
    isCollapsed: { type: Boolean, default: false },
    stats: { type: Object, default: () => ({}) }
  },
  computed: {
    navGroups() {
      return [
        {
          label: 'ASOSIY',
          items: [
            { key: 'overview',   label: 'Umumiy Ko\'rinish', icon: 'fas fa-chart-pie' },
            { key: 'analytics',  label: 'Tahlil',            icon: 'fas fa-chart-line' },
            { key: 'finance',    label: 'Moliya va Sotuv',   icon: 'fas fa-wallet' },
          ]
        },
        {
          label: 'FOYDALANUVCHILAR',
          items: [
            { key: 'users',      label: 'Foydalanuvchilar',  icon: 'fas fa-users' },
            { key: 'addAdmin',   label: 'Admin Qo\'shish',   icon: 'fas fa-user-shield' },
          ]
        },
        {
          label: 'TA\'LIM',
          items: [
            { key: 'subjects',   label: 'Fanlar',            icon: 'fas fa-book-open' },
            { key: 'addSubject', label: 'Test Yuklash (JSON)',icon: 'fas fa-file-code' },
            { key: 'uploadExcel',label: 'Test Yuklash (Excel)',icon: 'fas fa-file-excel' },
            { key: 'aiSeeder',   label: 'AI Test Seeder',    icon: 'fas fa-robot' },
          ]
        },
        {
          label: 'DO\'KON',
          items: [
            { key: 'shopItems',  label: 'Shop Mahsulotlari', icon: 'fas fa-store' },
            { key: 'addProduct', label: 'Mahsulot Qo\'shish',icon: 'fas fa-plus-circle' },
            { key: 'orders',     label: 'Buyurtmalar',       icon: 'fas fa-receipt' },
          ]
        },
        {
          label: 'TIZIM',
          items: [
            { key: 'notifications', label: 'Bildirishnomalar', icon: 'fas fa-bell' },
            { key: 'certificates',  label: 'Sertifikatlar',    icon: 'fas fa-certificate' },
            { key: 'settings',      label: 'Sozlamalar',       icon: 'fas fa-cog' },
          ]
        }
      ];
    }
  }
}
</script>

<style scoped>
.admin-sidebar {
  width: 260px;
  height: 100%;
  min-height: 100%;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  z-index: 100;
  overflow-x: hidden;
}

.admin-sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  min-height: 72px;
}

.admin-sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 20px 0;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  transition: opacity 0.2s;
}
.logo-area.hidden {
  display: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  white-space: nowrap;
}
.logo-text span { color: #60a5fa; }

.collapse-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: 0.2s;
  flex-shrink: 0;
}
.collapse-btn:hover { background: rgba(255,255,255,0.1); color: white; }

.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav::-webkit-scrollbar {
  width: 5px;
}
.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-group { margin-bottom: 8px; }

.nav-group-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  color: #475569;
  letter-spacing: 1px;
  padding: 8px 8px 4px;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.admin-sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 10px 0;
}

.nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.15));
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.nav-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label { flex: 1; }

.nav-badge {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  padding: 2px 7px;
  border-radius: 99px;
  font-weight: 800;
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(255,255,255,0.07);
}

.admin-sidebar.collapsed .sidebar-footer {
  padding: 10px 0;
}

.logout-item { color: #f87171; }
.logout-item:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.label-fade-enter-active, .label-fade-leave-active { transition: opacity 0.15s, width 0.3s; }
.label-fade-enter-from, .label-fade-leave-to { opacity: 0; }
</style>
