<template>
  <div class="sidebar-bento">
    <!-- Search Input -->
    <div class="search-users">
      <div class="search-input-wrap">
        <i class="fas fa-search search-icon"></i>
        <input 
          :value="searchQuery" 
          @input="$emit('update:searchQuery', $event.target.value)" 
          @keyup.enter="$emit('search')" 
          :placeholder="isRus ? 'Имя, email или #ID...' : 'Ism, email yoki #ID...'" 
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="$emit('clear-search')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <button class="search-btn" @click="$emit('search')">
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-grid">
      <button 
        class="tab-btn" 
        :class="{ active: tab === 'friends' }" 
        @click="$emit('update:tab', 'friends')"
      >
        <i class="fas fa-user-group"></i>
        <span>Do'stlar</span>
        <span class="badge" v-if="friends.length">{{ friends.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ active: tab === 'requests' }" 
        @click="$emit('update:tab', 'requests')"
      >
        <i class="fas fa-envelope-open-text"></i>
        <span>So'rovlar</span>
        <span class="badge danger" v-if="pendingRequests.length">{{ pendingRequests.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ active: tab === 'duels' }" 
        @click="$emit('update:tab', 'duels')"
      >
        <i class="fas fa-bolt text-danger"></i>
        <span>Duellar</span>
        <span class="badge warning" v-if="incomingDuels.length">{{ incomingDuels.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ active: tab === 'leaderboard' }" 
        @click="$emit('update:tab', 'leaderboard')"
      >
        <i class="fas fa-trophy text-warning"></i>
        <span>Reyting</span>
      </button>
    </div>

    <!-- 1. Friends List Tab -->
    <div v-if="tab === 'friends'" class="user-list">
      <div v-if="friends.length === 0" class="empty-state">
        <div class="empty-icon-wrap"><i class="fas fa-user-plus"></i></div>
        <h4>Do'stlar yo'q</h4>
        <p>Qidiruv orqali yangi do'stlarni toping yoki ID kod bilan ulashing!</p>
      </div>

      <div 
        v-for="friend in friends" 
        :key="friend.uid" 
        class="user-item-card"
        :class="{ 'active-chat': activeChatFriendUid === friend.uid }"
      >
        <div class="user-main" @click="$emit('view-profile', friend)">
          <div class="avatar-sm">
            {{ (friend.displayName || friend.email || 'U').charAt(0).toUpperCase() }}
            <span class="status-dot"></span>
          </div>
          <div class="meta-box">
            <span class="name">{{ friend.displayName || friend.email }}</span>
            <div class="sub-info">
              <span class="rank-capsule-sm" :class="getRankClass(friend.points || 0)">
                <i :class="getRankIcon(friend.points || 0)"></i> {{ getRankName(friend.points || 0) }}
              </span>
              <span class="tp-coins"><i class="fas fa-coins text-warning"></i> {{ (friend.points || 0).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="actions-group">
          <button 
            @click.stop="$emit('open-chat', friend)" 
            class="action-btn-sm chat"
            title="Suhbat"
          >
            <i class="fas fa-comment"></i>
          </button>
          <button 
            @click.stop="$emit('start-duel', friend)" 
            class="action-btn-sm duel"
            title="1v1 Duel"
          >
            <i class="fas fa-bolt"></i>
          </button>
          <button 
            @click.stop="$emit('send-gift', friend)" 
            class="action-btn-sm gift"
            title="Sovg'a"
          >
            <i class="fas fa-gift"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. Requests Tab -->
    <div v-if="tab === 'requests'" class="user-list">
      <div class="sub-toggle">
        <button 
          :class="{ active: requestSubTab === 'incoming' }" 
          @click="requestSubTab = 'incoming'"
        >
          Kelgan ({{ pendingRequests.length }})
        </button>
        <button 
          :class="{ active: requestSubTab === 'outgoing' }" 
          @click="requestSubTab = 'outgoing'"
        >
          Yuborilgan ({{ outgoingRequests.length }})
        </button>
      </div>

      <!-- Incoming Requests -->
      <template v-if="requestSubTab === 'incoming'">
        <div v-if="pendingRequests.length === 0" class="empty-state">
          <div class="empty-icon-wrap"><i class="fas fa-inbox"></i></div>
          <p>Yangi do'stlik so'rovlari yo'q.</p>
        </div>

        <div v-for="req in pendingRequests" :key="req.id" class="user-item-card">
          <div class="user-main">
            <div class="avatar-sm">
              {{ (req.fromName || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="meta-box">
              <span class="name">{{ req.fromName }}</span>
              <span class="time-sub">{{ formatReqTime(req.timestamp) }}</span>
            </div>
          </div>
          <div class="actions-group">
            <button @click="$emit('accept-request', req)" class="action-btn-sm accept" title="Qabul qilish">
              <i class="fas fa-check"></i>
            </button>
            <button @click="$emit('reject-request', req.id)" class="action-btn-sm reject" title="Rad etish">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </template>

      <!-- Outgoing Requests -->
      <template v-if="requestSubTab === 'outgoing'">
        <div v-if="outgoingRequests.length === 0" class="empty-state">
          <div class="empty-icon-wrap"><i class="fas fa-paper-plane"></i></div>
          <p>Yuborilgan so'rovlar yo'q.</p>
        </div>

        <div v-for="req in outgoingRequests" :key="req.id" class="user-item-card">
          <div class="user-main">
            <div class="avatar-sm">
              {{ (req.toName || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="meta-box">
              <span class="name">{{ req.toName }}</span>
              <span class="time-sub">Kutilmoqda...</span>
            </div>
          </div>
          <div class="actions-group">
            <button @click="$emit('cancel-outgoing-request', req.id)" class="action-btn-sm cancel" title="Bekor qilish">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 3. Duels Tab -->
    <div v-if="tab === 'duels'" class="user-list">
      <div v-if="incomingDuels.length === 0 && outgoingDuels.length === 0" class="empty-state">
        <div class="empty-icon-wrap"><i class="fas fa-shield-halved"></i></div>
        <h4>Faol duellar yo'q</h4>
        <p>Istalgan do'stingizni 1v1 test jangiga chorlashingiz mumkin!</p>
      </div>

      <!-- Incoming Duel Challenges -->
      <div v-if="incomingDuels.length > 0" class="duel-section-title">
        <span>⚔️ Sizga kelgan chaqiruvlar:</span>
      </div>
      <div v-for="duel in incomingDuels" :key="duel.id" class="duel-item-card incoming">
        <div class="duel-card-header">
          <div class="avatar-sm gold">⚔️</div>
          <div class="duel-meta">
            <strong>{{ duel.challengerName }}</strong> sizni chorladi!
            <div class="duel-details">
              <span>{{ duel.subjectName }}</span> • <span>{{ duel.wager ? duel.wager + ' TP garov' : 'Do\'stona' }}</span>
            </div>
          </div>
        </div>
        <div class="duel-actions">
          <button class="duel-btn accept" @click="$emit('accept-duel', duel)">
            <i class="fas fa-play"></i> Qabul qilish
          </button>
          <button class="duel-btn reject" @click="$emit('reject-duel', duel.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Outgoing Duel Challenges -->
      <div v-if="outgoingDuels.length > 0" class="duel-section-title">
        <span>⏳ Yuborilgan chaqiruvlaringiz:</span>
      </div>
      <div v-for="duel in outgoingDuels" :key="duel.id" class="duel-item-card outgoing">
        <div class="duel-card-header">
          <div class="avatar-sm">🎯</div>
          <div class="duel-meta">
            <strong>{{ duel.opponentName }}</strong>
            <div class="duel-details">
              <span>{{ duel.subjectName }}</span> • <span>{{ duel.wager ? duel.wager + ' TP' : 'Do\'stona' }}</span>
            </div>
          </div>
        </div>
        <span class="status-waiting"><i class="fas fa-hourglass-half"></i> Javob kutilmoqda</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getRankName, getRankClass, getRankIcon } from '@/utils/ranks';

const props = defineProps({
  searchQuery: { type: String, default: '' },
  tab: { type: String, default: 'friends' },
  friends: { type: Array, default: () => [] },
  pendingRequests: { type: Array, default: () => [] },
  outgoingRequests: { type: Array, default: () => [] },
  incomingDuels: { type: Array, default: () => [] },
  outgoingDuels: { type: Array, default: () => [] },
  activeChatFriendUid: { type: String, default: null },
  isRus: { type: Boolean, default: false }
});

defineEmits([
  'update:searchQuery', 
  'update:tab', 
  'search', 
  'clear-search',
  'open-chat', 
  'start-duel',
  'send-gift',
  'view-profile',
  'accept-request', 
  'reject-request',
  'cancel-outgoing-request',
  'accept-duel',
  'reject-duel'
]);

const requestSubTab = ref('incoming');

const formatReqTime = (ts) => {
  if (!ts) return 'Yaqinda';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Yaqinda';
  }
};
</script>

<style scoped>
.sidebar-bento {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 24px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.search-users {
  display: flex;
  gap: 0.5rem;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.search-input-wrap input {
  width: 100%;
  padding: 0.65rem 2rem 0.65rem 2.25rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.search-input-wrap input:focus {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 0.6rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem;
}

.search-btn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: #3b82f6;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.search-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.tabs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
  background: #f1f5f9;
  padding: 0.3rem;
  border-radius: 14px;
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.5rem 0.2rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border-radius: 9999px;
  font-weight: 800;
  background: #3b82f6;
  color: white;
}

.badge.danger { background: #ef4444; }
.badge.warning { background: #f59e0b; }

.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 0.25rem;
}

.user-list::-webkit-scrollbar {
  width: 5px;
}

.user-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.user-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.user-item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.85rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.2s;
}

.user-item-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.user-item-card.active-chat {
  background: #eff6ff;
  border-color: #3b82f6;
}

.user-main {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  cursor: pointer;
}

.avatar-sm {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  position: relative;
  flex-shrink: 0;
}

.avatar-sm.gold {
  background: linear-gradient(135deg, #f59e0b, #dc2626);
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

.meta-box {
  display: flex;
  flex-direction: column;
}

.meta-box .name {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
  max-width: 130px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
}

.rank-capsule-sm {
  font-weight: 700;
}

.tp-coins {
  font-weight: 700;
  color: #d97706;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.action-btn-sm {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-sm.chat { background: #e0f2fe; color: #0284c7; }
.action-btn-sm.chat:hover { background: #0284c7; color: white; }

.action-btn-sm.duel { background: #fee2e2; color: #dc2626; }
.action-btn-sm.duel:hover { background: #dc2626; color: white; }

.action-btn-sm.gift { background: #fef3c7; color: #d97706; }
.action-btn-sm.gift:hover { background: #d97706; color: white; }

.action-btn-sm.accept { background: #dcfce7; color: #16a34a; font-size: 0.85rem; }
.action-btn-sm.accept:hover { background: #16a34a; color: white; }

.action-btn-sm.reject { background: #fee2e2; color: #dc2626; font-size: 0.85rem; }
.action-btn-sm.reject:hover { background: #dc2626; color: white; }

.action-btn-sm.cancel { background: #f1f5f9; color: #64748b; }
.action-btn-sm.cancel:hover { background: #ef4444; color: white; }

.sub-toggle {
  display: flex;
  gap: 0.35rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.sub-toggle button {
  flex: 1;
  padding: 0.4rem;
  border: none;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
}

.sub-toggle button.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.duel-item-card {
  background: white;
  border: 1px solid #fecaca;
  border-radius: 16px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.duel-item-card.incoming {
  background: linear-gradient(135deg, #fff5f5, #fff);
}

.duel-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.duel-meta {
  font-size: 0.8rem;
  color: #0f172a;
}

.duel-details {
  font-size: 0.72rem;
  color: #64748b;
}

.duel-actions {
  display: flex;
  gap: 0.5rem;
}

.duel-btn {
  padding: 0.45rem 0.8rem;
  border-radius: 10px;
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.duel-btn.accept {
  flex: 1;
  background: #ef4444;
  color: white;
}

.duel-btn.reject {
  background: #f1f5f9;
  color: #64748b;
}

.status-waiting {
  font-size: 0.72rem;
  color: #d97706;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #94a3b8;
}

.empty-icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem auto;
  font-size: 1.25rem;
  color: #94a3b8;
}

.empty-state h4 {
  margin: 0 0 0.35rem 0;
  color: #334155;
  font-size: 0.95rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
}
</style>