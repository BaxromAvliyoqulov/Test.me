<template>
  <div v-if="friend" class="modal-overlay" @click.self="$emit('close')">
    <div class="profile-modal-card animate-pop-in">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      
      <div class="card-hero">
        <div class="avatar-wrapper">
          <img v-if="friend.profileImage" :src="friend.profileImage" :alt="friend.displayName" class="avatar-img" />
          <div v-else class="avatar-fallback">{{ (friend.displayName || friend.email || 'U').charAt(0).toUpperCase() }}</div>
          <span class="online-indicator"></span>
        </div>
        
        <h3 class="user-name">{{ friend.displayName || friend.email }}</h3>
        <div class="user-meta">
          <span class="user-id"><i class="fas fa-id-badge"></i> {{ friend.shortId || friend.referralCode || ('#' + (friend.uid || friend.id).slice(0, 6).toUpperCase()) }}</span>
          <span v-if="friend.email" class="user-email"><i class="fas fa-envelope"></i> {{ friend.email }}</span>
        </div>

        <div class="rank-capsule" :class="rankClass">
          <i :class="rankIcon"></i>
          <span>{{ rankName }}</span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon tp-coin"><i class="fas fa-coins"></i></div>
          <div class="stat-val">{{ (friend.points || 0).toLocaleString() }}</div>
          <div class="stat-label">TP Coins</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon streak"><i class="fas fa-fire"></i></div>
          <div class="stat-val">{{ friend.streak || 1 }} kun</div>
          <div class="stat-label">Daily Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon tests"><i class="fas fa-graduation-cap"></i></div>
          <div class="stat-val">{{ friend.testsCount || friend.solvedTests || 0 }}</div>
          <div class="stat-label">Yechilgan testlar</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions-row">
        <button class="action-btn chat" @click="$emit('start-chat', friend)">
          <i class="fas fa-comment-dots"></i> Xabar Yozish
        </button>
        <button class="action-btn duel" @click="$emit('challenge-duel', friend)">
          <i class="fas fa-bolt"></i> 1v1 Duel
        </button>
        <button class="action-btn gift" @click="$emit('send-gift', friend)">
          <i class="fas fa-gift"></i> TP Sovg'a
        </button>
      </div>

      <div class="danger-zone" v-if="isFriend">
        <button class="unfriend-btn" @click="$emit('unfriend', friend)">
          <i class="fas fa-user-minus"></i> Do'stlikdan chiqarish
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getRankName, getRankClass, getRankIcon } from '@/utils/ranks';

const props = defineProps({
  friend: { type: Object, default: null },
  isFriend: { type: Boolean, default: true },
  isRus: { type: Boolean, default: false }
});

defineEmits(['close', 'start-chat', 'challenge-duel', 'send-gift', 'unfriend']);

const rankName = computed(() => {
  return getRankName(props.friend?.points || 0, props.isRus ? 'RUS' : 'UZB');
});

const rankClass = computed(() => {
  return getRankClass(props.friend?.points || 0);
});

const rankIcon = computed(() => {
  return getRankIcon(props.friend?.points || 0);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.profile-modal-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 28px;
  width: 100%;
  max-width: 460px;
  padding: 2.25rem;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: #f1f5f9;
  border: none;
  font-size: 1.5rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: rotate(90deg);
}

.card-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.75rem;
}

.avatar-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  margin-bottom: 1rem;
}

.avatar-img, .avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
}

.avatar-fallback {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
}

.online-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background: #10b981;
  border: 3px solid white;
  border-radius: 50%;
}

.user-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.35rem 0;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.user-id {
  background: #f1f5f9;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-weight: 600;
  color: #475569;
}

.rank-capsule {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.rank-newbie { color: #64748b; background: #f1f5f9; }
.rank-bronze { color: #b45309; background: #fef3c7; border-color: #fde68a; }
.rank-silver { color: #475569; background: #e2e8f0; border-color: #cbd5e1; }
.rank-gold { color: #d97706; background: #fef3c7; border-color: #f59e0b; }
.rank-platinum { color: #0284c7; background: #e0f2fe; border-color: #38bdf8; }
.rank-diamond { color: #7c3aed; background: #f3e8ff; border-color: #a855f7; }
.rank-master { color: #dc2626; background: #fee2e2; border-color: #f87171; }
.rank-grandmaster { color: #c026d3; background: #fae8ff; border-color: #e879f9; }
.rank-legendary { color: #ea580c; background: #ffedd5; border-color: #fb923c; }
.rank-mythic { color: #dc2626; background: #ffe4e6; border-color: #fb7185; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0.85rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.stat-icon.tp-coin { background: #fef3c7; color: #d97706; }
.stat-icon.streak { background: #fee2e2; color: #ef4444; }
.stat-icon.tests { background: #e0e7ff; color: #4f46e5; }

.stat-val {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
}

.actions-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.75rem 0.5rem;
  border-radius: 14px;
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.chat { background: #e0f2fe; color: #0284c7; }
.action-btn.chat:hover { background: #0284c7; color: white; transform: translateY(-2px); }

.action-btn.duel { background: #fee2e2; color: #dc2626; }
.action-btn.duel:hover { background: #dc2626; color: white; transform: translateY(-2px); }

.action-btn.gift { background: #fef3c7; color: #d97706; }
.action-btn.gift:hover { background: #d97706; color: white; transform: translateY(-2px); }

.danger-zone {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.unfriend-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.unfriend-btn:hover {
  color: #ef4444;
}

.animate-pop-in {
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
</style>
