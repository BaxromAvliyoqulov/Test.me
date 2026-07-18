<template>
  <div class="ranks-page-wrapper">
    <!-- Animated Glow Backgrounds -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="ranks-page-container">
      <!-- Header Section -->
      <div class="ranks-header">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i> {{ isRus ? 'Назад' : 'Orqaga' }}
        </button>
        <div class="header-content">
          <h1>{{ isRus ? 'Система Рангов' : 'Darajalar Tizimi' }}</h1>
          <p>{{ isRus ? 'Повышайте свой ранг и получайте щедрые награды в виде TP Coins!' : 'Darajangizni oshiring va TP Coin shaklidagi ajoyib mukofotlarga ega bo\'ling!' }}</p>
        </div>
        
        <div class="user-stats-card">
          <div class="stat-item">
            <span class="stat-label">{{ isRus ? 'Ваши очки' : 'Sizning ballingiz' }}</span>
            <span class="stat-value text-blue-500">{{ userPoints }} TP</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">{{ isRus ? 'Текущий ранг' : 'Joriy daraja' }}</span>
            <span class="stat-value text-purple-500">{{ currentRankName }}</span>
          </div>
        </div>
      </div>

      <!-- Snake Timeline Section -->
      <div class="ranks-snake-timeline-container">
        <div 
          v-for="rowIndex in Math.ceil(ranksList.length / 3)" 
          :key="rowIndex"
          class="rank-snake-row"
          :class="rowIndex % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <div 
            v-for="(rank) in ranksList.slice((rowIndex - 1) * 3, rowIndex * 3)" 
            :key="rank.id"
            class="rank-snake-item"
            :class="[
              rank.class,
              { 
                'current': isCurrentRank(ranksList.indexOf(rank)), 
                'locked': !hasReachedRank(rank),
                'completed': hasReachedRank(rank) && !isCurrentRank(ranksList.indexOf(rank))
              }
            ]"
          >
            <!-- Marker Dot -->
            <div class="rank-snake-dot-wrap">
              <div class="rank-icon-bubble">
                <i :class="rank.icon"></i>
              </div>
            </div>
            
            <!-- Rank Details Card -->
            <div class="rank-details">
              <div v-if="isCurrentRank(ranksList.indexOf(rank))" class="current-indicator">
                {{ isRus ? 'Ваш текущий ранг' : 'Sizning darajangiz' }}
              </div>
              
              <div class="details-header">
                <div class="rank-title-group">
                  <h4>{{ isRus ? rank.nameRu : rank.nameUz }}</h4>
                  <span class="rank-req">
                    <i class="fas fa-bolt"></i> 
                    {{ ranksList.indexOf(rank) === 0 ? '0 TP' : `${rank.min} TP` }}
                  </span>
                </div>

                <!-- Reward Claim Button -->
                <div class="reward-section" v-if="rank.reward > 0">
                  <div class="reward-badge" :class="{ 'claimed': hasClaimed(rank.id) }">
                    <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="reward-coin-icon" />
                    <span>+{{ rank.reward }}</span>
                  </div>
                  
                  <button 
                    v-if="hasReachedRank(rank) && !hasClaimed(rank.id)"
                    class="claim-btn animate-pulse-fast"
                    @click="claimReward(rank)"
                    :disabled="claiming === rank.id"
                  >
                    <i class="fas fa-gift" v-if="claiming !== rank.id"></i>
                    <i class="fas fa-spinner fa-spin" v-else></i>
                    {{ isRus ? 'Забрать' : 'Olish' }}
                  </button>
                  <button 
                    v-else-if="hasClaimed(rank.id)"
                    class="claim-btn claimed-btn"
                    disabled
                  >
                    <i class="fas fa-check"></i>
                  </button>
                </div>
              </div>

              <!-- Progress Bar for Current Rank -->
              <div class="rank-progress-bar-wrap" v-if="isCurrentRank(ranksList.indexOf(rank)) && ranksList.indexOf(rank) < ranksList.length - 1">
                <div class="progress-bar-bg">
                  <div class="progress-bar-fg" :style="{ width: currentRankProgressPercent + '%' }"></div>
                </div>
                <div class="progress-stats">
                  <span>{{ userPoints }} TP</span>
                  <span>{{ isRus ? `Цель: ${ranksList[ranksList.indexOf(rank)+1].min} TP` : `Maqsad: ${ranksList[ranksList.indexOf(rank)+1].min} TP` }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/utils/i18n';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, increment, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ranksData, getRankName, getNextRankInfo } from '@/utils/ranks';
import { useToast } from 'vue-toastification';

const router = useRouter();
const { locale } = useI18n();
const toast = useToast();
const auth = getAuth();

const isRus = computed(() => locale.value === 'RUS');
const ranksList = ref(ranksData);

const userPoints = ref(0);
const claimedRanks = ref([]);
const claiming = ref(null);
let authUnsub = null;
let docUnsub = null;

const currentRankName = computed(() => {
  return getRankName(userPoints.value, locale.value);
});

const currentRankIndex = computed(() => {
  for (let i = ranksList.value.length - 1; i >= 0; i--) {
    if (userPoints.value >= ranksList.value[i].min) {
      return i;
    }
  }
  return 0;
});

const currentRankProgressPercent = computed(() => {
  return getNextRankInfo(userPoints.value, locale.value).progressPercent;
});

const goBack = () => {
  router.back();
};

const isCurrentRank = (index) => {
  return index === currentRankIndex.value;
};

const hasReachedRank = (rank) => {
  return userPoints.value >= rank.min;
};

const hasClaimed = (rankId) => {
  return claimedRanks.value.includes(rankId);
};

const getLineFillHeight = (index) => {
  if (index < currentRankIndex.value) return 100;
  if (index === currentRankIndex.value) return currentRankProgressPercent.value;
  return 0;
};

const claimReward = async (rank) => {
  if (claiming.value) return;
  
  const user = auth.currentUser;
  if (!user) {
    toast.error(isRus.value ? 'Войдите в систему' : 'Tizimga kiring');
    return;
  }

  claiming.value = rank.id;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      points: increment(rank.reward),
      claimedRanks: arrayUnion(rank.id)
    });
    
    toast.success(isRus.value ? `Вы получили ${rank.reward} TP Coins!` : `Siz ${rank.reward} TP Coins oldingiz!`);
    
    // Optimistic UI update (optional, since onSnapshot will trigger anyway)
    if (!claimedRanks.value.includes(rank.id)) {
      claimedRanks.value.push(rank.id);
    }
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  } finally {
    claiming.value = null;
  }
};

onMounted(() => {
  authUnsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      docUnsub = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          userPoints.value = data.points || 0;
          claimedRanks.value = data.claimedRanks || [];
        }
      });
    }
  });
});

onUnmounted(() => {
  if (authUnsub) authUnsub();
  if (docUnsub) docUnsub();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

.ranks-page-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  padding: 3rem 1.5rem;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
  overflow: hidden;
}

/* Background Blobs */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}
.glow-bg-1 {
  top: -5%;
  left: -5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #3b82f6 0%, #8b5cf6 100%);
}
.glow-bg-2 {
  bottom: 10%;
  right: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #f59e0b 0%, #ef4444 100%);
}

.ranks-page-container {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.ranks-header {
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-family: inherit;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}
.back-btn:hover {
  background: #f1f5f9;
  transform: translateX(-4px);
}

.header-content h1 {
  font-size: 2.5rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.header-content p {
  color: #64748b;
  font-size: 1.05rem;
  max-width: 500px;
  margin: 0 auto;
}

.user-stats-card {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
}
.stat-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
  margin: 0 2rem;
}

/* Horizontal Snake Timeline */
.ranks-snake-timeline-container {
  background: white;
  border-radius: 32px;
  padding: 3rem 1.5rem;
  box-shadow: 0 20px 50px -20px rgba(15, 23, 42, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.rank-snake-row {
  display: flex;
  width: 100%;
  position: relative;
  height: 310px;
}

.rank-snake-row.row-even {
  flex-direction: row-reverse;
  justify-content: flex-end; /* Pushes partial rows (like Mythic) to the left side */
}

/* Horizontal Line */
.rank-snake-row::before {
  content: '';
  position: absolute;
  top: 32px;
  left: 16.66%;
  right: 16.66%;
  height: 6px;
  background: #cbd5e1;
  z-index: 1;
}

/* Curve Right */
.rank-snake-row.row-odd:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 32px;
  right: 16.66%;
  width: 80px;
  height: 316px;
  border-top: 6px solid #cbd5e1;
  border-right: 6px solid #cbd5e1;
  border-bottom: 6px solid #cbd5e1;
  border-top-right-radius: 80px;
  border-bottom-right-radius: 80px;
  z-index: 1;
  transform: translateX(100%);
}

/* Curve Left */
.rank-snake-row.row-even:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 32px;
  left: 16.66%;
  width: 80px;
  height: 316px;
  border-top: 6px solid #cbd5e1;
  border-left: 6px solid #cbd5e1;
  border-bottom: 6px solid #cbd5e1;
  border-top-left-radius: 80px;
  border-bottom-left-radius: 80px;
  z-index: 1;
  transform: translateX(-100%);
}

.rank-snake-item {
  width: 33.333%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  padding: 0 15px;
  /* Override global rank classes from App.vue */
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.rank-snake-dot-wrap {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.rank-icon-bubble {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 3px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #94a3b8;
  transition: all 0.3s;
  box-shadow: 0 0 0 8px white;
  position: relative;
  z-index: 3;
}

.rank-details {
  flex-grow: 1;
  background: white;
  padding: 1.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.3s;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.rank-details:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.08);
}

.details-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  width: 100%;
}

.rank-title-group h4 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}
.rank-req {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 100px;
}
.rank-req i { color: #f59e0b; }

.current-indicator {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 100px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  z-index: 2;
}

/* Reward UI */
.reward-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}
.reward-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  color: #3b82f6;
  font-size: 0.95rem;
}
.reward-badge.claimed {
  color: #94a3b8;
  opacity: 0.7;
}
.reward-coin-icon {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.claim-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 100px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  transition: all 0.2s;
}
.claim-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}
.claim-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}
.claim-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.claimed-btn {
  background: #f1f5f9;
  color: #64748b;
  box-shadow: none;
}

.animate-pulse-fast {
  animation: pulse-fast 1.5s infinite;
}
@keyframes pulse-fast {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

/* Progress Bar */
.rank-progress-bar-wrap {
  margin-top: 1rem;
  width: 100%;
}
.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.progress-bar-fg {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 8px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
}

/* Rank specific colors */
.rank-snake-item.rank-newbie .rank-icon-bubble { border-color: #475569; color: #475569; }
.rank-snake-item.rank-bronze .rank-icon-bubble { border-color: #c2410c; color: #c2410c; }
.rank-snake-item.rank-silver .rank-icon-bubble { border-color: #94a3b8; color: #94a3b8; }
.rank-snake-item.rank-gold .rank-icon-bubble { border-color: #b45309; color: #b45309; }
.rank-snake-item.rank-platinum .rank-icon-bubble { border-color: #0f766e; color: #0f766e; }
.rank-snake-item.rank-diamond .rank-icon-bubble { border-color: #0369a1; color: #0369a1; }
.rank-snake-item.rank-master .rank-icon-bubble { border-color: #be123c; color: #be123c; }
.rank-snake-item.rank-grandmaster .rank-icon-bubble { border-color: #7e22ce; color: #7e22ce; }
.rank-snake-item.rank-legendary .rank-icon-bubble { border-color: #ea580c; color: #ea580c; }
.rank-snake-item.rank-mythic .rank-icon-bubble { border-color: #a21caf; color: #a21caf; }

.rank-snake-item.rank-newbie .rank-details { border-top: 4px solid #475569; }
.rank-snake-item.rank-bronze .rank-details { border-top: 4px solid #c2410c; }
.rank-snake-item.rank-silver .rank-details { border-top: 4px solid #94a3b8; }
.rank-snake-item.rank-gold .rank-details { border-top: 4px solid #b45309; }
.rank-snake-item.rank-platinum .rank-details { border-top: 4px solid #0f766e; }
.rank-snake-item.rank-diamond .rank-details { border-top: 4px solid #0369a1; }
.rank-snake-item.rank-master .rank-details { border-top: 4px solid #be123c; }
.rank-snake-item.rank-grandmaster .rank-details { border-top: 4px solid #7e22ce; }
.rank-snake-item.rank-legendary .rank-details { border-top: 4px solid #ea580c; }
.rank-snake-item.rank-mythic .rank-details { border-top: 4px solid #a21caf; }

.rank-snake-item.locked .rank-icon-bubble {
  background: #f1f5f9;
  border-color: #e2e8f0 !important;
  color: #cbd5e1 !important;
}

.rank-snake-item.locked .rank-details {
  opacity: 0.6;
  filter: grayscale(100%);
  border-top-color: transparent !important;
}

.rank-snake-item.current .rank-details {
  background: #eff6ff;
  box-shadow: 0 15px 35px -5px rgba(59, 130, 246, 0.15);
  transform: scale(1.02);
  z-index: 5;
}
.rank-snake-item.current .rank-details:hover {
  transform: scale(1.02) translateY(-4px);
}
.rank-snake-item.current .rank-icon-bubble {
  box-shadow: 0 0 0 8px white, 0 0 0 14px rgba(59, 130, 246, 0.2);
}

@media (max-width: 768px) {
  .ranks-snake-timeline-container {
    padding: 1.5rem;
  }
  .rank-snake-row {
    flex-direction: column;
    height: auto;
  }
  .rank-snake-row.row-even {
    flex-direction: column;
  }
  .rank-snake-row::before,
  .rank-snake-row::after {
    display: none;
  }
  .rank-snake-item {
    width: 100%;
    margin-bottom: 2.5rem;
    padding: 0;
  }
  .rank-icon-bubble {
    width: 54px;
    height: 54px;
    font-size: 1.4rem;
  }
  .back-btn {
    position: relative;
    margin-bottom: 1rem;
  }
}
</style>
