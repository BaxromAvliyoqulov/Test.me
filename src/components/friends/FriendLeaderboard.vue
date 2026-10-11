<template>
  <div class="leaderboard-wrapper">
    <div class="leaderboard-header">
      <div class="header-title">
        <i class="fas fa-trophy trophy-glow"></i>
        <div>
          <h3>Do'stlararo Haftalik Reyting</h3>
          <p>O'z do'stlaringiz davrasida kim eng yuqori bilim cho'qqisida turganini bilib oling!</p>
        </div>
      </div>
      <div class="total-badge">
        <i class="fas fa-users"></i> {{ rankedList.length }} nafar do'st
      </div>
    </div>

    <!-- Podium (Top 3) -->
    <div v-if="rankedList.length >= 3" class="podium-section">
      <!-- 2nd Place -->
      <div class="podium-step step-2" @click="$emit('select-user', rankedList[1])">
        <div class="podium-avatar">
          <div class="avatar-circle silver">
            {{ (rankedList[1]?.displayName || 'U').charAt(0).toUpperCase() }}
          </div>
          <span class="medal-icon">🥈</span>
        </div>
        <div class="podium-name">{{ rankedList[1]?.displayName || 'Foydalanuvchi' }}</div>
        <div class="podium-points">{{ (rankedList[1]?.points || 0).toLocaleString() }} TP</div>
        <div class="podium-block block-silver">
          <span>2</span>
        </div>
      </div>

      <!-- 1st Place -->
      <div class="podium-step step-1" @click="$emit('select-user', rankedList[0])">
        <div class="crown-icon">👑</div>
        <div class="podium-avatar">
          <div class="avatar-circle gold">
            {{ (rankedList[0]?.displayName || 'U').charAt(0).toUpperCase() }}
          </div>
          <span class="medal-icon">🥇</span>
        </div>
        <div class="podium-name">{{ rankedList[0]?.displayName || 'Foydalanuvchi' }}</div>
        <div class="podium-points">{{ (rankedList[0]?.points || 0).toLocaleString() }} TP</div>
        <div class="podium-block block-gold">
          <span>1</span>
        </div>
      </div>

      <!-- 3rd Place -->
      <div class="podium-step step-3" @click="$emit('select-user', rankedList[2])">
        <div class="podium-avatar">
          <div class="avatar-circle bronze">
            {{ (rankedList[2]?.displayName || 'U').charAt(0).toUpperCase() }}
          </div>
          <span class="medal-icon">🥉</span>
        </div>
        <div class="podium-name">{{ rankedList[2]?.displayName || 'Foydalanuvchi' }}</div>
        <div class="podium-points">{{ (rankedList[2]?.points || 0).toLocaleString() }} TP</div>
        <div class="podium-block block-bronze">
          <span>3</span>
        </div>
      </div>
    </div>

    <!-- Ranked Table List -->
    <div class="ranked-table">
      <div 
        v-for="(user, index) in rankedList" 
        :key="user.uid || user.id"
        class="ranked-row"
        :class="{ 'is-current-user': user.uid === currentUid || user.id === currentUid }"
        @click="$emit('select-user', user)"
      >
        <div class="row-rank">
          <span v-if="index === 0" class="rank-num gold">🥇</span>
          <span v-else-if="index === 1" class="rank-num silver">🥈</span>
          <span v-else-if="index === 2" class="rank-num bronze">🥉</span>
          <span v-else class="rank-num default">#{{ index + 1 }}</span>
        </div>

        <div class="row-user-info">
          <div class="user-avatar-sm" :class="{ 'me-border': user.uid === currentUid }">
            {{ (user.displayName || user.email || 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="user-details">
            <span class="name">
              {{ user.displayName || user.email }}
              <span v-if="user.uid === currentUid || user.id === currentUid" class="you-badge">(Siz)</span>
            </span>
            <span class="rank-tag" :class="getRankClass(user.points || 0)">
              <i :class="getRankIcon(user.points || 0)"></i> {{ getRankName(user.points || 0) }}
            </span>
          </div>
        </div>

        <div class="row-score">
          <span class="score-val">{{ (user.points || 0).toLocaleString() }}</span>
          <span class="score-label">TP</span>
        </div>

        <div class="row-action">
          <button 
            v-if="user.uid !== currentUid && user.id !== currentUid" 
            class="challenge-mini-btn" 
            title="1v1 Duelga chaqirish"
            @click.stop="$emit('challenge', user)"
          >
            ⚔️ Duel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getRankName, getRankClass, getRankIcon } from '@/utils/ranks';

const props = defineProps({
  friends: { type: Array, default: () => [] },
  currentUser: { type: Object, default: null },
  isRus: { type: Boolean, default: false }
});

defineEmits(['select-user', 'challenge']);

const currentUid = computed(() => props.currentUser?.uid || props.currentUser?.id);

const rankedList = computed(() => {
  const combined = [];
  
  if (props.currentUser) {
    combined.push({
      uid: currentUid.value,
      id: currentUid.value,
      displayName: props.currentUser.displayName || 'Siz',
      email: props.currentUser.email || '',
      points: Number(props.currentUser.points || 0),
      isSelf: true
    });
  }

  props.friends.forEach(f => {
    if ((f.uid || f.id) !== currentUid.value) {
      combined.push({
        ...f,
        uid: f.uid || f.id,
        points: Number(f.points || 0)
      });
    }
  });

  return combined.sort((a, b) => (b.points || 0) - (a.points || 0));
});
</script>

<style scoped>
.leaderboard-wrapper {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 15px 40px -10px rgba(15, 23, 42, 0.08);
}

.leaderboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.trophy-glow {
  font-size: 2.5rem;
  color: #f59e0b;
  filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.4));
}

.header-title h3 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
}

.header-title p {
  margin: 0.25rem 0 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.total-badge {
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}

/* Podium Styling */
.podium-section {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding-top: 1rem;
}

.podium-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 130px;
  cursor: pointer;
  transition: transform 0.2s;
}

.podium-step:hover {
  transform: translateY(-4px);
}

.crown-icon {
  font-size: 1.5rem;
  margin-bottom: -6px;
  animation: floatCrown 2s infinite ease-in-out;
}

@keyframes floatCrown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.podium-avatar {
  position: relative;
  margin-bottom: 0.5rem;
}

.avatar-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  border: 3px solid white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.avatar-circle.gold { background: linear-gradient(135deg, #f59e0b, #d97706); }
.avatar-circle.silver { background: linear-gradient(135deg, #94a3b8, #64748b); }
.avatar-circle.bronze { background: linear-gradient(135deg, #d97706, #b45309); }

.medal-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 1.25rem;
}

.podium-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium-points {
  font-size: 0.75rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 0.5rem;
}

.podium-block {
  width: 100%;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  font-weight: 900;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.block-gold { height: 110px; background: linear-gradient(180deg, #f59e0b, #d97706); }
.block-silver { height: 80px; background: linear-gradient(180deg, #94a3b8, #64748b); }
.block-bronze { height: 60px; background: linear-gradient(180deg, #d97706, #b45309); }

/* Table List */
.ranked-table {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.ranked-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.85rem 1.25rem;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.ranked-row:hover {
  border-color: #3b82f6;
  box-shadow: 0 6px 20px -4px rgba(59, 130, 246, 0.15);
  transform: translateX(4px);
}

.ranked-row.is-current-user {
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  border: 2px solid #3b82f6;
}

.row-rank {
  width: 44px;
}

.rank-num {
  font-size: 1.1rem;
  font-weight: 800;
}

.rank-num.default {
  color: #64748b;
  font-size: 0.95rem;
}

.row-user-info {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
}

.user-avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #3b82f6;
}

.user-avatar-sm.me-border {
  border-color: #10b981;
  background: #ecfdf5;
  color: #059669;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details .name {
  font-weight: 800;
  font-size: 0.92rem;
  color: #0f172a;
}

.you-badge {
  font-size: 0.72rem;
  background: #10b981;
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  margin-left: 0.35rem;
}

.rank-tag {
  font-size: 0.72rem;
  font-weight: 700;
}

.row-score {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0 1rem;
}

.score-val {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0f172a;
}

.score-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #f59e0b;
}

.challenge-mini-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.challenge-mini-btn:hover {
  background: #dc2626;
  color: white;
  transform: scale(1.05);
}
</style>
