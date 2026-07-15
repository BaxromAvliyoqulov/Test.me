const fs = require('fs');
const path = require('path');

const vueFile = path.resolve('src/views/editProfile/editProfile.vue');
let content = fs.readFileSync(vueFile, 'utf-8');

// 1. Replace layout container and sidebar with navbar
const navRegex = /<div class="edit-profile-container layout-v3">.*?<main class="profile-main-v3">/s;
const newNav = `    <!-- Clean SaaS Layout Container -->
    <div class="edit-profile-container layout-v4">
      
      <!-- Top Navbar -->
      <nav class="pro-top-navbar">
        <button 
          type="button" 
          :class="['pro-nav-link', { active: activeTab === 'profile' }]" 
          @click="activeTab = 'profile'"
        >
          <i class="fas fa-user-cog"></i> 
          <span>{{ currentLocale === 'RUS' ? 'Профиль' : 'Profil' }}</span>
        </button>
        <button 
          type="button" 
          :class="['pro-nav-link', { active: activeTab === 'preferences' }]" 
          @click="activeTab = 'preferences'"
        >
          <i class="fas fa-sliders-h"></i> 
          <span>{{ currentLocale === 'RUS' ? 'Настройки' : 'Sozlamalar' }}</span>
        </button>
        <button 
          type="button" 
          :class="['pro-nav-link', { active: activeTab === 'goals' }]" 
          @click="activeTab = 'goals'"
        >
          <i class="fas fa-bullseye"></i> 
          <span>{{ currentLocale === 'RUS' ? 'Цели' : 'Maqsadlar' }}</span>
        </button>
        <button 
          type="button" 
          :class="['pro-nav-link', { active: activeTab === 'mentor' }]" 
          @click="activeTab = 'mentor'"
        >
          <i class="fas fa-robot"></i> 
          <span>{{ currentLocale === 'RUS' ? 'AI Ментор' : 'AI Ustoz' }}</span>
        </button>
        <button 
          type="button" 
          :class="['pro-nav-link', { active: activeTab === 'achievements' }]" 
          @click="activeTab = 'achievements'"
        >
          <i class="fas fa-award"></i> 
          <span>{{ currentLocale === 'RUS' ? 'Достижения' : 'Yutuqlar' }}</span>
        </button>
      </nav>

      <!-- Middle Column: Main Forms -->
      <main class="profile-main-v4">`;

content = content.replace(navRegex, newNav);

// 2. Insert Rank Progress into Profile Tab
const rankBanner = `            <div v-show="activeTab === 'profile'" class="tab-pane-content">
              <!-- Minimal Rank Progress Banner -->
              <div class="minimal-rank-progress-banner" @click="goToRanksPage">
                <div class="minimal-rank-header">
                  <span class="rank-lbl">{{ currentLocale === 'RUS' ? 'Ваш Ранг' : 'Sizning Rangingiz' }}</span>
                  <span class="rank-val">{{ getRankName(userPoints, currentLocale) }}</span>
                </div>
                <div class="minimal-progress-bar">
                  <div class="minimal-progress-fill" :style="{ width: getNextRankInfo(userPoints, currentLocale).progressPercent + '%' }"></div>
                </div>
                <div class="minimal-rank-footer">
                  <span>{{ userPoints }} TP</span>
                  <span class="text-blue-500">→ {{ getNextRankInfo(userPoints, currentLocale).nextRankName }}</span>
                </div>
              </div>

              <div class="pro-pane-header">`;

content = content.replace(
  `            <div v-show="activeTab === 'profile'" class="tab-pane-content">\n              <div class="pro-pane-header">`, 
  rankBanner
);

// 3. Remove Right Sidebar
const rightSidebarRegex = /<!-- Right Column: Live Preview Sticky Card -->.*?<\/aside>/s;
content = content.replace(rightSidebarRegex, '');

// 4. CSS changes for layout
const cssReplacement = `
.layout-v4 {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
  padding-top: 1rem;
}

.pro-top-navbar {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 0.75rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
  overflow-x: auto;
}

.pro-top-navbar::-webkit-scrollbar {
  display: none;
}

.pro-top-navbar .pro-nav-link {
  flex: 1;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border: none;
  background: transparent;
  border-radius: 14px;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pro-top-navbar .pro-nav-link:hover {
  background: rgba(248, 250, 252, 0.8);
  color: #0f172a;
}

.pro-top-navbar .pro-nav-link.active {
  background: #ffffff;
  color: #3b82f6;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
}

.minimal-rank-progress-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0rem;
}
.minimal-rank-progress-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.1);
  border-color: #bfdbfe;
}
`;

content = content.replace('.edit-profile-container.layout-v3 {', cssReplacement + '\n/* OLD CSS REMOVED */\n.old-layout-v3 {');

fs.writeFileSync(vueFile, content, 'utf-8');
console.log('Restructured editProfile.vue successfully.');
