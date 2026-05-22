<template>
  <div class="badges-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="badges-container">
      <div class="header-section">
        <h1>🏆 {{ isRus ? 'Ваши Достижения' : 'Sizning Yutuqlaringiz' }}</h1>
        <p>{{ isRus ? 'Решайте тесты, зарабатывайте баллы и открывайте новые награды!' : 'Testlarni yeching, ballar to\'plang va yangi nishonlarni qo\'lga kiriting!' }}</p>
      </div>

      <!-- Stats overview -->
      <div class="stats-overview">
        <div class="overview-card">
          <span class="value">{{ unlockedCount }} / {{ badges.length }}</span>
          <span class="label">{{ isRus ? 'Открыто наград' : 'Ochilgan yutuqlar' }}</span>
        </div>
        <div class="overview-card">
          <span class="value">{{ totalTestsSolved }}</span>
          <span class="label">{{ isRus ? 'Всего тестов' : 'Jami testlar' }}</span>
        </div>
        <div class="overview-card">
          <span class="value">{{ userPoints }}</span>
          <span class="label">TP Coins</span>
        </div>
      </div>

      <!-- Grid of Achievements -->
      <div class="badges-grid">
        <div
          v-for="badge in badges"
          :key="badge.id"
          :class="['badge-card', { locked: !badge.unlocked }]"
        >
          <!-- Badge Icon Wrapper with dynamic colors -->
          <div 
            class="badge-icon" 
            :style="badge.unlocked ? { background: badge.color + '15', color: badge.color, borderColor: badge.color + '30' } : {}"
          >
            <i :class="badge.icon"></i>
            <div class="lock-indicator" v-if="!badge.unlocked">
              <i class="fas fa-lock"></i>
            </div>
          </div>

          <div class="badge-details">
            <h3>{{ isRus ? badge.nameRu : badge.nameUz }}</h3>
            <p class="badge-desc">{{ isRus ? badge.descRu : badge.descUz }}</p>
            
            <div class="progress-bar-container" v-if="badge.progress !== null">
              <div class="progress-info">
                <span>{{ isRus ? 'Прогресс' : 'Progress' }}</span>
                <span>{{ Math.min(badge.currentVal, badge.targetVal) }} / {{ badge.targetVal }}</span>
              </div>
              <div class="bar-outer">
                <div 
                  class="bar-inner" 
                  :style="{ 
                    width: Math.min((badge.currentVal / badge.targetVal) * 100, 100) + '%', 
                    background: badge.unlocked ? badge.color : '#94a3b8' 
                  }"
                ></div>
              </div>
            </div>

            <div class="badge-meta">
              <span class="meta-rate">
                <i class="fas fa-users"></i> 
                {{ isRus ? `${badge.unlockRate}% игроков получили` : `${badge.unlockRate}% foydalanuvchilar olgan` }}
              </span>
              <span :class="['meta-status', { unlocked: badge.unlocked }]">
                <i :class="badge.unlocked ? 'fas fa-check-circle' : 'fas fa-hourglass-half'"></i>
                {{ badge.unlocked ? (isRus ? 'Открыто' : 'Ochilgan') : (isRus ? 'Закрыто' : 'Qulflangan') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from '@/config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useI18n } from '@/utils/i18n';

export default {
  name: 'BadgesView',
  setup() {
    const { locale } = useI18n();
    return { currentLocale: locale };
  },
  data() {
    return {
      totalTestsSolved: 0,
      userPoints: 0,
      perfectScoresCount: 0,
      results: [],
      loading: true,
    };
  },
  computed: {
    isRus() {
      return this.currentLocale === 'RUS';
    },
    unlockedCount() {
      return this.badges.filter(b => b.unlocked).length;
    },
    badges() {
      return [
        {
          id: 'first_step',
          nameUz: 'Birinchi qadam',
          nameRu: 'Первый шаг',
          descUz: 'Kamida 1 ta test topshirganingizda ochiladi.',
          descRu: 'Открывается при прохождении хотя бы 1 теста.',
          icon: 'fas fa-walking',
          color: '#3b82f6',
          unlockRate: 92,
          unlocked: this.totalTestsSolved >= 1,
          progress: true,
          currentVal: this.totalTestsSolved,
          targetVal: 1
        },
        {
          id: 'persistent',
          nameUz: 'Tirishqoq',
          nameRu: 'Упорный',
          descUz: 'Kamida 5 ta test topshirganingizda ochiladi.',
          descRu: 'Открывается при прохождении 5 тестов.',
          icon: 'fas fa-fire',
          color: '#f97316',
          unlockRate: 45,
          unlocked: this.totalTestsSolved >= 5,
          progress: true,
          currentVal: this.totalTestsSolved,
          targetVal: 5
        },
        {
          id: 'scholar',
          nameUz: 'Bilimdon',
          nameRu: 'Эрудит',
          descUz: 'Kamida 15 ta test topshirganingizda ochiladi.',
          descRu: 'Открывается при прохождении 15 тестов.',
          icon: 'fas fa-book-reader',
          color: '#10b981',
          unlockRate: 15,
          unlocked: this.totalTestsSolved >= 15,
          progress: true,
          currentVal: this.totalTestsSolved,
          targetVal: 15
        },
        {
          id: 'perfect_score',
          nameUz: 'A\'lochi',
          nameRu: 'Отличник',
          descUz: 'Birorta testda 100% natija qayd etganingizda ochiladi.',
          descRu: 'Открывается за 100% результат в любом тесте.',
          icon: 'fas fa-star',
          color: '#fbbf24',
          unlockRate: 24,
          unlocked: this.perfectScoresCount >= 1,
          progress: true,
          currentVal: this.perfectScoresCount,
          targetVal: 1
        },
        {
          id: 'coin_king',
          nameUz: 'Koin Qiroli',
          nameRu: 'Король Коинов',
          descUz: '500 dan ortiq TP Coin to\'plaganingizda ochiladi.',
          descRu: 'Открывается за накопление 500+ TP Coins.',
          icon: 'fas fa-coins',
          color: '#a855f7',
          unlockRate: 8,
          unlocked: this.userPoints >= 500,
          progress: true,
          currentVal: this.userPoints,
          targetVal: 500
        },
        {
          id: 'super_brain',
          nameUz: 'Super Aql',
          nameRu: 'Супер Мозг',
          descUz: '3 ta testda 100% natija qayd etganingizda ochiladi.',
          descRu: 'Открывается за 100% результат в 3 тестах.',
          icon: 'fas fa-brain',
          color: '#ec4899',
          unlockRate: 4,
          unlocked: this.perfectScoresCount >= 3,
          progress: true,
          currentVal: this.perfectScoresCount,
          targetVal: 3
        }
      ];
    }
  },
  methods: {
    fetchStats() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Fetch points
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              this.userPoints = userDoc.data().points || 0;
            }

            // Fetch results
            const resultsRef = collection(db, 'results');
            const q = query(resultsRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            
            this.results = querySnapshot.docs.map(doc => doc.data());
            this.totalTestsSolved = this.results.length;
            
            // Calculate perfect scores
            this.perfectScoresCount = this.results.filter(r => r.score === r.total).length;
          } catch (e) {
            console.error('Error fetching statistics:', e);
          } finally {
            this.loading = false;
          }
        }
      });
    }
  },
  mounted() {
    this.fetchStats();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.badges-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 3rem 1.5rem;
}

/* Background glowing elements */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.08;
}
.glow-bg-1 {
  width: 450px;
  height: 450px;
  background: #3b82f6;
  top: -10%;
  left: -5%;
}
.glow-bg-2 {
  width: 450px;
  height: 450px;
  background: #a855f7;
  bottom: -10%;
  right: -5%;
}

.badges-container {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
}

.header-section h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
}

.header-section p {
  color: #64748b;
  font-size: 1rem;
}

/* Stats overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.overview-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);
}

.overview-card .value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #2563eb;
  margin-bottom: 4px;
}

.overview-card .label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Grid of Badges */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.badge-card {
  display: flex;
  gap: 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.02);
  transition: all 0.3s ease;
}

.badge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -5px rgba(15, 23, 42, 0.06);
}

.badge-card.locked {
  background: rgba(255, 255, 255, 0.6);
}

.badge-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 18px;
  font-size: 1.8rem;
  background: #f1f5f9;
  color: #94a3b8;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.badge-card.locked .badge-icon {
  filter: grayscale(1);
}

.lock-indicator {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.badge-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.badge-details h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  transition: color 0.3s ease;
}

.badge-card.locked .badge-details h3 {
  color: #64748b;
}

.badge-desc {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0 0 12px 0;
}

/* Progress bar inside badge */
.progress-bar-container {
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
}

.bar-outer {
  height: 6px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

/* Meta Footer */
.badge-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
  margin-top: 4px;
}

.meta-rate {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
}

.meta-status.unlocked {
  color: #10b981;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .badges-grid {
    grid-template-columns: 1fr;
  }
}
</style>
