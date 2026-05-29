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

      <!-- Timeline Section -->
      <div class="ranks-timeline-container">
        <div class="ranks-timeline">
          <div 
            v-for="(rank, index) in ranksList" 
            :key="rank.id"
            class="rank-timeline-item"
            :class="{ 
              'current': isCurrentRank(index), 
              'locked': !hasReachedRank(rank),
              'completed': hasReachedRank(rank) && !isCurrentRank(index)
            }"
          >
            <!-- Timeline Line -->
            <div class="timeline-line" v-if="index < ranksList.length - 1">
              <div class="timeline-line-fill" :style="{ height: getLineFillHeight(index) + '%' }"></div>
            </div>

            <!-- Rank Icon Bubble -->
            <div class="rank-node" :class="rank.class">
              <div class="rank-icon-bubble">
                <i :class="rank.icon"></i>
              </div>
            </div>

            <!-- Rank Details Card -->
            <div class="rank-details">
              <div v-if="isCurrentRank(index)" class="current-indicator">
                {{ isRus ? 'Ваш текущий ранг' : 'Sizning darajangiz' }}
              </div>
              
              <div class="details-header">
                <div class="rank-title-group">
                  <h4>{{ isRus ? rank.nameRu : rank.nameUz }}</h4>
                  <span class="rank-req">
                    <i class="fas fa-bolt"></i> 
                    {{ index === 0 ? '0 TP' : `${rank.min} TP` }} {{ isRus ? 'и выше' : 'dan boshlab' }}
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
                    {{ isRus ? 'Получено' : 'Olingan' }}
                  </button>
                </div>
              </div>

              <!-- Progress Bar for Current Rank -->
              <div class="rank-progress-bar-wrap" v-if="isCurrentRank(index) && index < ranksList.length - 1">
                <div class="progress-bar-bg">
                  <div class="progress-bar-fg" :style="{ width: currentRankProgressPercent + '%' }"></div>
                </div>
                <div class="progress-stats">
                  <span>{{ userPoints }} TP</span>
                  <span>{{ isRus ? `Цель: ${ranksList[index+1].min} TP` : `Maqsad: ${ranksList[index+1].min} TP` }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/utils/i18n';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, increment, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ranksData, getRankName, getNextRankInfo } from '@/utils/ranks';
import { useToast } from 'vue-toastification';

export default {
  name: 'RankSystemPage',
  setup() {
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

    return {
      isRus,
      ranksList,
      userPoints,
      currentRankName,
      currentRankProgressPercent,
      claiming,
      goBack,
      isCurrentRank,
      hasReachedRank,
      hasClaimed,
      getLineFillHeight,
      claimReward
    };
  }
};
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

/* Timeline */
.ranks-timeline-container {
  background: white;
  border-radius: 32px;
  padding: 3rem;
  box-shadow: 0 20px 50px -20px rgba(15, 23, 42, 0.1);
  border: 1px solid #e2e8f0;
}

.ranks-timeline {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 10px;
}

.rank-timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  position: relative;
  padding-bottom: 3.5rem;
}
.rank-timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-line {
  position: absolute;
  top: 50px;
  bottom: -15px;
  left: 32px;
  width: 4px;
  background: #e2e8f0;
  border-radius: 4px;
  z-index: 1;
}
.timeline-line-fill {
  width: 100%;
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: height 1s ease-out;
}

.rank-node {
  position: relative;
  z-index: 2;
  margin-top: 4px;
}
.rank-icon-bubble {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  border: 4px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #94a3b8;
  transition: all 0.3s;
  box-shadow: 0 0 0 6px white;
}

.rank-details {
  flex-grow: 1;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  position: relative;
  transition: all 0.3s;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.rank-title-group h4 {
  margin: 0 0 6px 0;
  font-size: 1.3rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: #0f172a;
}
.rank-req {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rank-req i { color: #f59e0b; }

.current-indicator {
  position: absolute;
  top: -12px;
  left: 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Reward UI */
.reward-section {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 6px 6px 6px 16px;
  border-radius: 100px;
  border: 1px solid #e2e8f0;
}
.reward-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  color: #3b82f6;
}
.reward-badge.claimed {
  color: #94a3b8;
  opacity: 0.7;
}
.reward-coin-icon {
  width: 20px;
  height: 20px;
}

.claim-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 100px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
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
  margin-top: 1.5rem;
}
.progress-bar-bg {
  width: 100%;
  height: 10px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}
.progress-bar-fg {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

/* Rank specific colors */
.rank-newbie .rank-icon-bubble { border-color: #94a3b8; color: #94a3b8; }
.rank-bronze .rank-icon-bubble { border-color: #b45309; color: #b45309; }
.rank-silver .rank-icon-bubble { border-color: #94a3b8; color: #94a3b8; }
.rank-gold .rank-icon-bubble { border-color: #f59e0b; color: #f59e0b; }
.rank-platinum .rank-icon-bubble { border-color: #14b8a6; color: #14b8a6; }
.rank-diamond .rank-icon-bubble { border-color: #3b82f6; color: #3b82f6; }
.rank-master .rank-icon-bubble { border-color: #8b5cf6; color: #8b5cf6; }
.rank-grandmaster .rank-icon-bubble { border-color: #ec4899; color: #ec4899; }
.rank-legendary .rank-icon-bubble { border-color: #f43f5e; color: #f43f5e; }
.rank-mythic .rank-icon-bubble { border-color: #10b981; color: #10b981; }

.rank-timeline-item.locked .rank-icon-bubble {
  background: #f1f5f9;
  border-color: #e2e8f0 !important;
  color: #cbd5e1 !important;
}

.rank-timeline-item.locked .rank-details {
  opacity: 0.6;
  filter: grayscale(100%);
}

.rank-timeline-item.current .rank-details {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 15px 35px -5px rgba(59, 130, 246, 0.15);
  transform: scale(1.02);
  z-index: 5;
}
.rank-timeline-item.current .rank-icon-bubble {
  box-shadow: 0 0 0 6px white, 0 0 0 10px rgba(59, 130, 246, 0.2);
}

@media (max-width: 768px) {
  .ranks-timeline-container {
    padding: 1.5rem;
  }
  .rank-timeline-item {
    gap: 1rem;
  }
  .timeline-line {
    left: 20px;
  }
  .rank-icon-bubble {
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }
  .details-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .back-btn {
    position: relative;
    margin-bottom: 1rem;
  }
}
</style>
