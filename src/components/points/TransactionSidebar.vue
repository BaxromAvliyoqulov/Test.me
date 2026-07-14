<template>
  <div class="sidebar-bento">
    <!-- Stats Summary Card without Chart -->
    <div class="sidebar-card chart-card">
      <h3 class="sidebar-card-title">📈 {{ isRus ? 'Статистика кошелька' : 'Hamyon statistikasi' }}</h3>

      <div class="sidebar-stats-list">
        <div class="sidebar-stat-item">
          <div class="stat-icon-label">
            <span class="stat-icon icon-earned"><i class="fas fa-arrow-alt-circle-up"></i></span>
            <span>{{ isRus ? 'Всего заработано' : 'Jami ishlangan' }}</span>
          </div>
          <strong class="stat-val earned-color">{{ totalEarned }} TP</strong>
        </div>

        <div class="sidebar-stat-item">
          <div class="stat-icon-label">
            <span class="stat-icon icon-spent"><i class="fas fa-arrow-alt-circle-down"></i></span>
            <span>{{ isRus ? 'Всего потрачено' : 'Sarflangan' }}</span>
          </div>
          <strong class="stat-val spent-color">{{ totalSpent }} TP</strong>
        </div>
      </div>
    </div>

    <!-- Transaction History Section -->
    <div class="sidebar-card history-card">
      <h3 class="sidebar-card-title">🕒 {{ isRus ? 'История транзакций' : 'Tranzaksiyalar tarixi' }}</h3>
      
      <div v-if="transactions.length === 0" class="empty-state">
        <div class="empty-icon"><i class="fas fa-wallet"></i></div>
        <p>{{ isRus ? 'История транзакций пуста.' : 'Sizda hozircha tranzaksiyalar mavjud emas.' }}</p>
      </div>

      <div v-else class="transactions-list-scroll">
        <div 
          v-for="tx in transactions" 
          :key="tx.id" 
          class="tx-item-compact"
        >
          <div class="tx-compact-left">
            <div :class="['tx-badge-compact', tx.normalizedPoints > 0 ? 'tx-plus' : 'tx-minus']">
              <i :class="tx.normalizedPoints > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            </div>
            <div class="tx-info-compact">
              <h4>{{ tx.normalizedAction }}</h4>
              <span>{{ formatDate(tx.timestamp) }}</span>
            </div>
          </div>
          <div :class="['tx-points-compact', tx.normalizedPoints > 0 ? 'points-plus' : 'points-minus']">
            {{ tx.normalizedPoints > 0 ? '+' : '' }}{{ tx.normalizedPoints }} TP
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransactionSidebar',
  props: {
    isRus: { type: Boolean, required: true },
    totalEarned: { type: Number, required: true },
    totalSpent: { type: Number, required: true },
    transactions: { type: Array, required: true },
    formatDate: { type: Function, required: true }
  }
}
</script>

<style scoped>
.sidebar-bento {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.sidebar-card {
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 1.75rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

.sidebar-card-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
}

.wallet-chart-wrapper {
  height: 180px;
  margin-bottom: 2rem;
  position: relative;
}

.empty-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #cbd5e1;
  background: #f8fafc;
  border-radius: 50%;
  width: 180px;
  margin: 0 auto;
}

.sidebar-stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 16px;
  transition: background 0.3s ease;
}

.sidebar-stat-item:hover {
  background: #f1f5f9;
}

.stat-icon-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.icon-earned { background: #ecfdf5; color: #10b981; }
.icon-spent { background: #fef2f2; color: #ef4444; }

.stat-val {
  font-size: 1.1rem;
  font-weight: 800;
}

.earned-color { color: #10b981; }
.spent-color { color: #ef4444; }

/* History Section */
.history-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.transactions-list-scroll {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 400px;
  padding: 0.5rem 1rem 0.5rem 1rem;
  position: relative;
}

/* Timeline vertical line */
.transactions-list-scroll::before {
  content: '';
  position: absolute;
  top: 0; left: 32px; height: 100%; width: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.transactions-list-scroll::-webkit-scrollbar {
  width: 4px;
}
.transactions-list-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.tx-item-compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
  position: relative;
  z-index: 2;
}

.tx-compact-left {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.tx-badge-compact {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  box-shadow: 0 0 0 4px #ffffff;
}

.tx-plus { background: #ecfdf5; color: #10b981; }
.tx-minus { background: #fef2f2; color: #ef4444; }

.tx-info-compact h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
}

.tx-info-compact span {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.tx-points-compact {
  font-size: 1rem;
  font-weight: 800;
}

.points-plus { color: #10b981; }
.points-minus { color: #ef4444; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 0;
  color: #94a3b8;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state p {
  font-weight: 500;
  margin: 0;
}
</style>
