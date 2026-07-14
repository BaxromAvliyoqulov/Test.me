const fs = require('fs');
const path = require('path');

const pointsPath = path.join(__dirname, '..', 'src', 'views', 'Points', 'points.vue');
const fileContent = fs.readFileSync(pointsPath, 'utf8');

const scriptStart = fileContent.indexOf('<script>');
const styleStart = fileContent.indexOf('<style scoped>');

let scriptContent = fileContent.substring(scriptStart, styleStart);

// Add imports
scriptContent = scriptContent.replace(
  "import ReferralModal from './ShareReferralModal.vue';",
  `import WalletCards from '@/components/points/WalletCards.vue';
import ActionGrid from '@/components/points/ActionGrid.vue';
import RewardShop from '@/components/points/RewardShop.vue';
import TransactionSidebar from '@/components/points/TransactionSidebar.vue';
import ReferralModal from './ShareReferralModal.vue';`
);

// Register components
scriptContent = scriptContent.replace(
  "components: {",
  "components: {\n    WalletCards,\n    ActionGrid,\n    RewardShop,\n    TransactionSidebar,"
);

const newTemplate = `<template>
  <div class="premium-layout points-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="points-container">
      <div class="header-section">
        <h1>💎 {{ isRus ? 'Мой Кошелек TP Coins' : 'Mening TP Coins Hamyonim' }}</h1>
        <p>{{ isRus ? 'Управляйте балансом, приглашайте друзей и обменивайте коины на премиум награды!' : 'Balansingizni boshqaring, do\\'stlarni taklif qiling va premium sovg\\'alarga almashtiring!' }}</p>
      </div>

      <div class="points-grid">
        <!-- Main Content (Left) -->
        <div class="points-main">
          
          <WalletCards 
            :points="points" 
            :referralCount="referralCount" 
            :isRus="isRus" 
            :locale="locale" 
          />

          <ActionGrid 
            :isRus="isRus"
            @buy-points="buyPoints"
            @share-referral="showReferralModal = true"
            @show-users="showReferredUsers = true"
            @enter-code="showReferralCodeModal = true"
          />

          <RewardShop 
            :rewardItems="rewardItems"
            :isRus="isRus"
            :points="points"
            @exchange="exchangeItem"
          />

        </div>

        <!-- Sidebar Content (Right) -->
        <div class="points-sidebar">
          <TransactionSidebar 
            :isRus="isRus"
            :totalEarned="totalEarned"
            :totalSpent="totalSpent"
            :transactions="sortedTransactions"
            :formatDate="formatDate"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ReferralCodeModal v-if="showReferralCodeModal" @close="showReferralCodeModal = false" />
    <ReferralModal v-if="showReferralModal" @close="showReferralModal = false" />
    <ReferredUsersModal v-if="showReferredUsers" @close="showReferredUsers = false" />
    <BuyPointsModal v-if="showBuyModal" @close="showBuyModal = false" />
  </div>
</template>
`;

const newStyle = `<style scoped>
.points-wrapper {
  position: relative;
  min-height: 100vh;
  padding: 3rem 1.5rem;
  overflow-x: hidden;
  background: #f8fafc;
  font-family: 'Outfit', 'Inter', sans-serif;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
}

.glow-bg-1 {
  top: 5%;
  left: 5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #3b82f6 0%, #60a5fa 100%);
}

.glow-bg-2 {
  bottom: 5%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #f59e0b 0%, #fbbf24 100%);
}

.points-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.header-section {
  text-align: left;
}

.header-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
}

.header-section p {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 500;
}

.points-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 1100px) {
  .points-grid {
    grid-template-columns: 1fr;
  }
}

.points-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.points-sidebar {
  position: sticky;
  top: 2rem;
  height: calc(100vh - 4rem);
}

@media (max-width: 1100px) {
  .points-sidebar {
    position: static;
    height: auto;
  }
}
</style>
`;

fs.writeFileSync(pointsPath, newTemplate + '\n' + scriptContent + newStyle);
console.log('Successfully refactored points.vue');
