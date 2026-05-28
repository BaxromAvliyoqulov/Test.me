<template>
  <div class="points-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="points-container">
      <div class="header-section">
        <h1>💎 {{ isRus ? 'Мой Кошелек TP Coins' : 'Mening TP Coins Hamyonim' }}</h1>
        <p>{{ isRus ? 'Управляйте балансом, приглашайте друзей и обменивайте коины на премиум награды!' : 'Balansingizni boshqaring, do\'stlarni taklif qiling va premium sovg\'alarga almashtiring!' }}</p>
      </div>

      <div class="points-grid">
        <!-- Main Content (Left) -->
        <div class="points-main">

          <!-- Premium Cards Grid -->
          <div class="wallet-cards-grid">
            <!-- Balance Card -->
            <div class="wallet-card balance-card">
              <div class="card-glass">
                <div class="card-glare"></div>
                <div class="card-pattern"></div>
                
                <div class="card-top">
                  <span class="card-title">{{ isRus ? 'ТЕКУЩИЙ БАЛАНС' : 'JORIY BALANS' }}</span>
                  <div class="card-chip-container">
                    <div class="chip-line horizontal"></div>
                    <div class="chip-line vertical"></div>
                  </div>
                </div>
                
                <div class="balance-display">
                  <img src="../../assets/img/tpCoin.png" alt="TP Coin" class="coin-logo animate-spin-slow" />
                  <div class="balance-val">
                    <h2>{{ points }}</h2>
                    <span>TP Coins</span>
                  </div>
                </div>

                <!-- Monospace card number mockup -->
                <div class="card-number">**** **** **** {{ points > 0 ? (points * 7).toString().padStart(4, '0').slice(-4) : '2026' }}</div>
                
                <div class="card-holder-row">
                  <div class="card-holder">
                    <span>{{ isRus ? 'ВЛАДЕЛЕЦ' : 'EGA' }}</span>
                    <strong>
                      <i :class="getRankIcon(points)"></i> {{ getRankName(points, locale) }}
                    </strong>
                  </div>
                  <div class="card-brand">
                    <div class="brand-circle left"></div>
                    <div class="brand-circle right"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Referrals Card -->
            <div class="wallet-card referrals-card">
              <div class="card-glass">
                <div class="card-glare"></div>
                <div class="card-pattern"></div>
                
                <div class="card-top">
                  <span class="card-title">{{ isRus ? 'ДОХОД ОТ ПРИГЛАШЕНИЙ' : 'TAKLIFLARDAN DAROMAD' }}</span>
                  <div class="card-hologram"></div>
                </div>
                
                <div class="balance-display">
                  <div class="referral-earnings-logo">
                    <i class="fas fa-handshake"></i>
                  </div>
                  <div class="balance-val">
                    <h2>{{ referralCount * 50 }}</h2>
                    <span>TP Coins</span>
                  </div>
                </div>

                <!-- Monospace card code mockup -->
                <div class="card-number">REF-CODE-{{ referralCount.toString().padStart(4, '0') }}</div>
                
                <div class="card-holder-row">
                  <div class="card-holder">
                    <span>{{ isRus ? 'ПАРТНЕР' : 'HAMKOR' }}</span>
                    <strong>REFERRAL CARD</strong>
                  </div>
                  <div class="card-brand">
                    <div class="brand-circle left-green"></div>
                    <div class="brand-circle right-yellow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Action Cards Grid -->
          <div class="actions-grid">
            <div class="action-card" @click="buyPoints">
              <div class="action-icon icon-blue">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <div class="action-info">
                <h3>{{ isRus ? 'Покупка коинов' : 'TP Coin sotib olish' }}</h3>
                <p>{{ isRus ? 'Пополнить баланс кошелька' : 'Hamyon balansini to\'ldirish' }}</p>
              </div>
              <div class="action-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>

            <div class="action-card" @click="showReferralModal = true">
              <div class="action-icon icon-green">
                <i class="fas fa-share-alt"></i>
              </div>
              <div class="action-info">
                <h3>{{ isRus ? 'Пригласить друга' : 'Do\'stlarni taklif etish' }}</h3>
                <p>{{ isRus ? 'Получить бонус по ссылке' : 'Havola orqali bonus olish' }}</p>
              </div>
              <div class="action-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>

            <div class="action-card" @click="showReferredUsers = true">
              <div class="action-icon icon-purple">
                <i class="fas fa-users"></i>
              </div>
              <div class="action-info">
                <h3>{{ isRus ? 'Приглашенные друзья' : 'Taklif etilganlar ro\'yxati' }}</h3>
                <p>{{ isRus ? 'Список приглашенных учеников' : 'Siz taklif qilgan o\'quvchilar' }}</p>
              </div>
              <div class="action-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>

            <div class="action-card" @click="showReferralCodeModal = true">
              <div class="action-icon icon-orange">
                <i class="fas fa-plus"></i>
              </div>
              <div class="action-info">
                <h3>{{ isRus ? 'Активировать код' : 'Taklif kodini kiritish' }}</h3>
                <p>{{ isRus ? 'Ввести промокод от друга' : 'Do\'stingizdan kelgan kodni faollash' }}</p>
              </div>
              <div class="action-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>

          <!-- Reward Shop Section -->
          <div class="reward-shop-section">
            <h2 class="section-title">🎁 {{ isRus ? 'Магазин Наград' : 'Sovg\'alar do\'koni' }}</h2>
            <p class="section-subtitle">{{ isRus ? 'Обменяйте накопленные TP Coins на ценные привилегии и бонусы!' : 'To\'plangan TP Coinlaringizni ajoyib imtiyoz va sovg\'alarga almashtiring!' }}</p>
            
            <div class="rewards-grid">
              <div 
                v-for="item in rewardItems" 
                :key="item.id" 
                class="reward-card"
              >
                <div class="reward-icon-wrapper" :style="{ background: item.color + '15', color: item.color }">
                  <i :class="item.icon"></i>
                </div>
                <div class="reward-details">
                  <h3>{{ isRus ? item.nameRu : item.nameUz }}</h3>
                  <p>{{ isRus ? item.descRu : item.descUz }}</p>
                  
                  <div class="reward-footer">
                    <span class="cost-badge">
                      <img src="../../assets/img/tpCoin.png" alt="TP Coin" />
                      {{ item.cost }} TP
                    </span>
                    <button 
                      class="exchange-btn" 
                      :style="{ background: item.color }"
                      @click="exchangeItem(item)"
                    >
                      {{ isRus ? 'Обменять' : 'Almashtirish' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Content (Right) -->
        <div class="points-sidebar">
          <!-- Stats Summary Card -->
          <div class="sidebar-card stats-summary-card">
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

              <div class="sidebar-stat-item">
                <div class="stat-icon-label">
                  <span class="stat-icon icon-friends"><i class="fas fa-user-friends"></i></span>
                  <span>{{ isRus ? 'Приглашено друзей' : 'Taklif etilgan do\'stlar' }}</span>
                </div>
                <strong class="stat-val friends-color">{{ referralCount }}</strong>
              </div>

              <div class="sidebar-stat-item">
                <div class="stat-icon-label">
                  <span class="stat-icon icon-status"><i class="fas fa-shield-alt"></i></span>
                  <span>{{ isRus ? 'Статус аккаунта' : 'Aksiya va Status' }}</span>
                </div>
                <div class="stat-status-badges">
                  <span class="status-badge active-badge"><i class="fas fa-check"></i> {{ isRus ? 'Активен' : 'Faol' }}</span>
                  <span class="status-badge promo-badge"><i class="fas fa-fire"></i> {{ isRus ? 'Промо' : 'Aksiya' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Transaction History Section -->
          <div class="sidebar-card history-section-card">
            <h3 class="sidebar-card-title">🕒 {{ isRus ? 'История транзакций' : 'Tranzaksiyalar tarixi' }}</h3>
            
            <div v-if="transactions.length === 0" class="empty-state">
              <div class="empty-icon"><i class="fas fa-wallet"></i></div>
              <p>{{ isRus ? 'История транзакций пуста.' : 'Sizda hozircha tranzaksiyalar mavjud emas.' }}</p>
            </div>

            <div v-else class="transactions-list-scroll">
              <div 
                v-for="tx in sortedTransactions" 
                :key="tx.id" 
                class="tx-item-compact"
              >
                <div class="tx-compact-left">
                  <div :class="['tx-badge-compact', tx.points > 0 ? 'tx-plus' : 'tx-minus']">
                    <i :class="tx.points > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  </div>
                  <div class="tx-info-compact">
                    <h4>{{ tx.action }}</h4>
                    <span>{{ formatDate(tx.timestamp) }}</span>
                  </div>
                </div>
                <div :class="['tx-points-compact', tx.points > 0 ? 'points-plus' : 'points-minus']">
                  {{ tx.points > 0 ? '+' : '' }}{{ tx.points }} TP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ReferralCodeModal
      v-if="showReferralCodeModal"
      @close="showReferralCodeModal = false"
    />
    <ReferralModal
      v-if="showReferralModal"
      @close="showReferralModal = false"
    />
    <ReferredUsersModal
      v-if="showReferredUsers"
      @close="showReferredUsers = false"
    />
    <BuyPointsModal 
      v-if="showBuyModal" 
      @close="showBuyModal = false" 
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/config/firebase';
import { onSnapshot, doc, collection, updateDoc, increment, addDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useToast } from 'vue-toastification';
import { useI18n } from '@/utils/i18n';

import ReferralModal from './ShareReferralModal.vue';
import ReferredUsersModal from './ReferralListModal.vue';
import BuyPointsModal from './BuyPoints.vue';
import ReferralCodeModal from './ReferralCodeModal.vue';
import { getRankName, getRankClass, getRankIcon } from '@/utils/ranks';

export default {
  name: 'PointsWallet',
  components: {
    ReferralModal,
    ReferredUsersModal,
    BuyPointsModal,
    ReferralCodeModal,
  },

  setup() {
    const points = ref(0);
    const referralCount = ref(0);
    const transactions = ref([]);
    const showReferralModal = ref(false);
    const showReferredUsers = ref(false);
    const showBuyModal = ref(false);
    const showReferralCodeModal = ref(false);

    const toast = useToast();
    const { locale } = useI18n();
    const auth = getAuth();

    const rewardItems = [
      {
        id: 'premium_pass',
        nameUz: 'Premium Test Ruxsati',
        nameRu: 'Премиум Доступ к Тестам',
        descUz: 'Har qanday 1 ta premium testni bepul ochish imkoniyati.',
        descRu: 'Возможность разблокировать любой 1 премиум-тест.',
        cost: 200,
        icon: 'fas fa-key',
        color: '#3b82f6'
      },
      {
        id: 'gold_frame',
        nameUz: 'Oltin Sertifikat Ramkasi',
        nameRu: 'Золотая Рамка Сертификата',
        descUz: 'Sertifikatlaringizni chiroyli oltin hoshiya bilan bezash.',
        descRu: 'Украсьте свои сертификаты красивой золотой рамкой.',
        cost: 500,
        icon: 'fas fa-gem',
        color: '#fbbf24'
      },
      {
        id: 'super_badge',
        nameUz: 'Super Aql Profili Belgisi',
        nameRu: 'Значок Супер Мозга',
        descUz: 'Profil ismingiz yonida maxsus toj belgisi chiqariladi.',
        descRu: 'Специальная иконка короны рядом с именем профиля.',
        cost: 100,
        icon: 'fas fa-crown',
        color: '#a855f7'
      }
    ];

    onMounted(() => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userDoc = doc(db, 'users', user.uid);
          const txRef = collection(userDoc, 'transactions');

          onSnapshot(userDoc, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              points.value = data.points || 0;
              
              const myReferralCode = data.referralCode || user.uid.slice(0, 8).toUpperCase();
              if (!data.referralCode) {
                await updateDoc(userDoc, {
                  referralCode: myReferralCode
                });
              }

              // Listen to referral counts
              const referralsQuery = query(
                collection(db, 'users'),
                where('referredBy', '==', myReferralCode)
              );
              onSnapshot(referralsQuery, (refSnap) => {
                referralCount.value = refSnap.size;
              });
            }
          });

          onSnapshot(txRef, (querySnapshot) => {
            transactions.value = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          });
        }
      });
    });

    const isRus = computed(() => locale.value === 'RUS');

    const sortedTransactions = computed(() => {
      return [...transactions.value].sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    });

    const totalSpent = computed(() => {
      return transactions.value
        .filter(t => t.points < 0)
        .reduce((sum, t) => sum + Math.abs(t.points), 0);
    });

    const totalEarned = computed(() => {
      return transactions.value
        .filter(t => t.points > 0)
        .reduce((sum, t) => sum + t.points, 0);
    });

    const exchangeItem = async (item) => {
      const user = auth.currentUser;
      if (!user) {
        toast.error(isRus.value ? 'Войдите в аккаунт' : 'Tizimga kiring');
        return;
      }

      if (points.value < item.cost) {
        toast.error(isRus.value ? 'Недостаточно TP Coins!' : 'TP Coinlaringiz yetarli emas!');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const txRef = collection(userDocRef, 'transactions');

        await updateDoc(userDocRef, {
          points: increment(-item.cost)
        });

        await addDoc(txRef, {
          action: isRus.value ? `Обмен: ${item.nameRu}` : `Almashtirildi: ${item.nameUz}`,
          points: -item.cost,
          timestamp: new Date()
        });

        toast.success(isRus.value ? `Вы успешно обменяли на "${item.nameRu}"!` : `"${item.nameUz}" muvaffaqiyatli almashtirildi!`);
      } catch (err) {
        console.error(err);
        toast.error(isRus.value ? 'Ошибка при покупке' : 'Xarid qilishda xatolik yuz berdi');
      }
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      let date;
      if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleDateString(locale.value === 'RUS' ? 'ru-RU' : 'uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const buyPoints = () => {
      showBuyModal.value = true;
    };

    return {
      points,
      referralCount,
      transactions,
      sortedTransactions,
      totalSpent,
      totalEarned,
      formatDate,
      buyPoints,
      showReferralModal,
      showReferredUsers,
      showBuyModal,
      showReferralCodeModal,
      rewardItems,
      exchangeItem,
      isRus,
      
      // Rank wrappers
      getRankName,
      getRankIcon,
      getRankClass,
      locale,
    };
  },
};
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.points-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 2.5rem 1.5rem;
}

/* Background glowing elements for futuristic feel */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  z-index: 0;
  opacity: 0.05;
  pointer-events: none;
}
.glow-bg-1 {
  width: 500px;
  height: 500px;
  background: #3b82f6;
  top: -5%;
  left: -5%;
}
.glow-bg-2 {
  width: 600px;
  height: 600px;
  background: #fbbf24;
  bottom: -5%;
  right: -5%;
}

.points-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  width: 95%;
  margin: 0 auto;
}

.points-grid {
  display: grid;
  grid-template-columns: 2fr 1.1fr;
  gap: 2.5rem;
}

@media (max-width: 1100px) {
  .points-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.points-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header-section {
  text-align: left;
  margin-bottom: 2rem;
}

.header-section h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
}

.header-section p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

/* Premium Credit Card Styling */
.wallet-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .wallet-cards-grid {
    grid-template-columns: 1fr;
  }
}

.wallet-card {
  position: relative;
  border-radius: 28px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  perspective: 1000px;
}

.wallet-card .card-glass {
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease;
}

.wallet-card:hover .card-glass {
  transform: rotateY(6deg) rotateX(4deg) translateY(-4px);
}

.balance-card .card-glass {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%);
  box-shadow: 0 20px 40px -15px rgba(37, 99, 235, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.balance-card:hover .card-glass {
  box-shadow: 0 30px 60px -15px rgba(37, 99, 235, 0.35);
}

.referrals-card .card-glass {
  background: linear-gradient(135deg, #022c22 0%, #065f46 50%, #10b981 100%);
  box-shadow: 0 20px 40px -15px rgba(16, 185, 129, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.referrals-card:hover .card-glass {
  box-shadow: 0 30px 60px -15px rgba(16, 185, 129, 0.35);
}

.referral-earnings-logo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #a7f3d0;
}

.card-glass {
  border-radius: 27px;
  padding: 2.25rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.card-glare {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
  z-index: 2;
}

.card-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 10% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 35%);
  pointer-events: none;
  z-index: 1;
}

.card-chip-container {
  width: 44px;
  height: 32px;
  background: linear-gradient(135deg, #ffe066 0%, #f5b041 50%, #d35400 100%);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.5),
    0 2px 5px rgba(0, 0, 0, 0.15);
}

.chip-line {
  position: absolute;
  background: rgba(0, 0, 0, 0.18);
}

.chip-line.horizontal {
  width: 100%;
  height: 1px;
  top: 50%;
  left: 0;
}

.chip-line.vertical {
  width: 1px;
  height: 100%;
  left: 50%;
  top: 0;
}

.card-hologram {
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #ff7675, #74b9ff, #55efc4, #ffeaa7);
  background-size: 400% 400%;
  animation: hologram-animation 6s ease infinite;
  border-radius: 50%;
  opacity: 0.85;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

@keyframes hologram-animation {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

.card-number {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 3px;
  margin-bottom: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
  z-index: 3;
  position: relative;
}

.card-holder-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 3;
  position: relative;
}

.card-holder {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-holder span {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.card-holder strong {
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.card-brand {
  display: flex;
  align-items: center;
  position: relative;
  width: 44px;
  height: 28px;
}

.brand-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  position: absolute;
  opacity: 0.85;
}

.brand-circle.left {
  background: #ff5f00;
  left: 0;
}

.brand-circle.right {
  background: #f79e1b;
  right: 18px;
}

.brand-circle.left-green {
  background: #00b894;
  left: 0;
}

.brand-circle.right-yellow {
  background: #fdcb6e;
  right: 18px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 2px;
  opacity: 0.8;
}

.balance-display {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
}

.coin-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));
}

.animate-spin-slow {
  animation: spin 10s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.balance-val h2 {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1;
  margin: 0;
}

.balance-val span {
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 600px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: white;
  border: 1.5px solid #f1f5f9;
  border-radius: 24px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.01);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -5px rgba(15, 23, 42, 0.06);
  border-color: #cbd5e1;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.icon-blue { background: #eff6ff; color: #3b82f6; }
.icon-green { background: #f0fdf4; color: #22c55e; }
.icon-purple { background: #faf5ff; color: #a855f7; }
.icon-orange { background: #fff7ed; color: #f97316; }

.action-info {
  flex-grow: 1;
}

.action-info h3 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.action-info p {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.action-arrow {
  color: #94a3b8;
  font-size: 0.8rem;
  transition: transform 0.2s;
}

.action-card:hover .action-arrow {
  transform: translateX(3px);
  color: #0f172a;
}

/* Sections General */
.section-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.section-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0 0 1.75rem 0;
  font-weight: 500;
}

/* Reward Shop CSS */
.reward-shop-section {
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 28px;
  padding: 2.25rem;
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.04);
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.reward-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f8fafc;
  border: 1.5px solid #f1f5f9;
  border-radius: 22px;
  transition: all 0.3s ease;
}

.reward-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px -8px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.reward-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.reward-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.reward-details h3 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.reward-details p {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.45;
  margin: 0 0 14px 0;
  font-weight: 500;
}

.reward-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.cost-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fef9c3;
  color: #854d0e;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 800;
}

.cost-badge img {
  width: 14px;
  height: 14px;
}

.exchange-btn {
  border: none;
  color: white;
  padding: 8px 16px;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.exchange-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Sidebar Layout & Cards */
.points-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.04);
}

.sidebar-card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.4px;
}

/* Stats list */
.sidebar-stats-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sidebar-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.sidebar-stat-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stat-icon-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.icon-earned { background: rgba(34, 197, 94, 0.08); color: #22c55e; }
.icon-spent { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
.icon-friends { background: rgba(168, 85, 247, 0.08); color: #a855f7; }
.icon-status { background: rgba(249, 115, 22, 0.08); color: #f97316; }

.stat-val {
  font-size: 1.05rem;
  font-weight: 800;
}

.earned-color { color: #16a34a; }
.spent-color { color: #2563eb; }
.friends-color { color: #a855f7; }

.stat-status-badges {
  display: flex;
  gap: 6px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
}

.status-badge.active-badge {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.promo-badge {
  background: #ffedd5;
  color: #ea580c;
}

/* Scrollable Transaction List */
.transactions-list-scroll {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 4px;
}

/* Custom scrollbar */
.transactions-list-scroll::-webkit-scrollbar {
  width: 6px;
}
.transactions-list-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}
.transactions-list-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.transactions-list-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.tx-item-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.tx-item-compact:hover {
  border-color: #cbd5e1;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}

.tx-compact-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.tx-badge-compact {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.tx-plus {
  background: #dcfce7;
  color: #15803d;
}

.tx-minus {
  background: #fee2e2;
  color: #b91c1c;
}

.tx-info-compact {
  min-width: 0;
}

.tx-info-compact h4 {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-info-compact span {
  font-size: 0.68rem;
  color: #94a3b8;
  display: block;
}

.tx-points-compact {
  font-size: 0.88rem;
  font-weight: 800;
  flex-shrink: 0;
}

.points-plus {
  color: #16a34a;
}

.points-minus {
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
}

.empty-icon {
  font-size: 2.2rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.empty-state p {
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.45;
  margin: 0;
}
</style>
