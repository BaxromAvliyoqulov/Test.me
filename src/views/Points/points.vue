<template>
  <div class="premium-layout points-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="points-container">
      <div class="header-section">
        <h1>💎 {{ isRus ? 'Мой Кошелек TP Coins' : 'Mening TP Coins Hamyonim' }}</h1>
        <p>{{ isRus ? 'Управляйте балансом, приглашайте друзей и обменивайте коины на премиум награды!' : 'Balansingizni boshqaring, do\'stlarni taklif qiling va premium sovg\'alarga almashtiring!' }}</p>
      </div>

      <div class="points-top-row">
        <WalletCards 
          :points="points" 
          :referralCount="referralCount" 
          :isRus="isRus" 
          :locale="locale" 
        />
      </div>

      <div class="points-grid">
        <!-- Main Content (Left) -->
        <div class="points-main">

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

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/config/firebase';
import { onSnapshot, doc, collection, updateDoc, increment, addDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useToast } from 'vue-toastification';
import { useI18n } from '@/utils/i18n';

import WalletCards from '@/components/points/WalletCards.vue';
import ActionGrid from '@/components/points/ActionGrid.vue';
import RewardShop from '@/components/points/RewardShop.vue';
import TransactionSidebar from '@/components/points/TransactionSidebar.vue';
import ReferralModal from './ShareReferralModal.vue';
import ReferredUsersModal from './ReferralListModal.vue';
import BuyPointsModal from './BuyPoints.vue';
import ReferralCodeModal from './ReferralCodeModal.vue';
import { getRankName, getRankClass, getRankIcon } from '@/utils/ranks';

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
  return [...transactions.value].map(tx => {
    // Normalize points/amount
    const val = tx.points !== undefined ? tx.points : (tx.amount || 0);
    
    // Normalize action/type
    let act = tx.action;
    if (!act) {
      if (tx.type === 'box_purchase') act = isRus.value ? 'Покупка коробки (Lootbox)' : 'Quti xaridi (Lootbox)';
      else if (tx.type === 'direct_purchase') act = isRus.value ? 'Покупка в магазине' : 'Do\'kondan xarid';
      else if (tx.type === 'quick_sell') act = isRus.value ? 'Быстрая продажа' : 'Tezkor sotish';
      else if (tx.type === 'test_reward') act = isRus.value ? 'Награда за тест' : 'Test yechish mukofoti';
      else act = isRus.value ? 'Транзакция' : 'Tranzaksiya';
    }

    return {
      ...tx,
      normalizedPoints: val,
      normalizedAction: act
    };
  }).sort((a, b) => {
    const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
    const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
    return timeB - timeA;
  });
});

const totalSpent = computed(() => {
  return sortedTransactions.value
    .filter(t => t.normalizedPoints < 0)
    .reduce((sum, t) => sum + Math.abs(t.normalizedPoints), 0);
});

const totalEarned = computed(() => {
  return sortedTransactions.value
    .filter(t => t.normalizedPoints > 0)
    .reduce((sum, t) => sum + t.normalizedPoints, 0);
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
</script>
<style scoped>
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
  animation: float-bg 15s ease-in-out infinite alternate;
}

@keyframes float-bg {
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.2) translate(50px, 30px); }
  100% { transform: scale(0.9) translate(-30px, 50px); }
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
  animation-delay: -7s;
}

.points-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.header-section {
  text-align: left;
  margin-bottom: 2rem;
}

.header-section h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.header-section p {
  color: #64748b;
  font-size: 1.1rem;
}

.points-top-row {
  margin-bottom: 2rem;
}

.points-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
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
