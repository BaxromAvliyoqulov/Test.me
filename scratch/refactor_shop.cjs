const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '..', 'src', 'views', 'shop', 'ShopPage.vue');

const newTemplate = `<template>
  <div class="premium-layout shop-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="shop-container">
      <div class="header-section">
        <h1>🛍️ {{ isRus ? 'Магазин' : 'Do\\'kon' }}</h1>
        <p>{{ isRus ? 'Обменивайте TP Coins на кейсы и получайте уникальные награды!' : 'TP Coin larni g\\'aznalarga almashtiring va noyob yutuqlarni qolga kiriting!' }}</p>
      </div>

      <div class="shop-content">
        <!-- Balance Header -->
        <div class="balance-bento">
          <div class="balance-left">
            <span class="balance-label">{{ isRus ? 'ВАШ БАЛАНС' : 'SIZNING BALANSINGIZ' }}</span>
            <div class="balance-val">
              <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="animate-spin-slow" />
              <h2>{{ points }}</h2>
              <span>TP Coins</span>
            </div>
          </div>
          <button class="earn-more-btn" @click="$router.push('/points')">
            <i class="fas fa-plus"></i> {{ isRus ? 'Заработать' : 'Ishlash' }}
          </button>
        </div>

        <!-- Cases Section -->
        <div class="cases-section">
          <div class="section-title-wrap">
            <h2><i class="fas fa-box-open text-blue"></i> {{ isRus ? 'Секретные Ящики' : 'Sirli G\\'aznalar' }}</h2>
            <p>{{ isRus ? 'Откройте ящик и испытайте удачу' : 'G\\'aznani oching va omadingizni sinab koring' }}</p>
          </div>
          
          <ShopCases 
            :userPoints="points" 
            :isRus="isRus" 
            :isOpening="isOpening"
            @open-case="handleOpenCase"
          />
        </div>
      </div>
    </div>

    <!-- Lootbox Opening Animation Overlay -->
    <div v-if="showOverlay" class="lootbox-overlay">
      <div class="lootbox-animation-container">
        <h2 class="opening-text">{{ isRus ? 'Открытие...' : 'Ochilmoqda...' }}</h2>
        <div class="box-shaker" :class="{ 'shake': isShaking, 'explode': isExploding }">
          <i :class="activeCase.icon" :style="{ color: activeCase.color }"></i>
        </div>
        
        <div v-if="rewardRevealed" class="reward-reveal animate-pop-in">
          <h3>{{ isRus ? 'ПОЗДРАВЛЯЕМ!' : 'TABRIKLAYMIZ!' }}</h3>
          <p>{{ isRus ? 'Вы получили новый значок!' : 'Siz yangi nishonni qolga kiritdingiz!' }}</p>
          <div class="reward-item">
            <i :class="rewardIcon"></i>
            <span>{{ rewardName }}</span>
          </div>
          <button class="claim-btn" @click="closeOverlay">{{ isRus ? 'Забрать' : 'Olish' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useToast } from 'vue-toastification';
import { useI18n } from '@/utils/i18n';
import ShopCases from '@/components/shop/ShopCases.vue';
import { getBadges } from '@/utils/badges';

export default {
  name: 'ShopPage',
  components: { ShopCases },
  setup() {
    const points = ref(0);
    const { locale } = useI18n();
    const isRus = ref(locale.value === 'RUS');
    const toast = useToast();
    const auth = getAuth();

    // Animation States
    const isOpening = ref(false);
    const showOverlay = ref(false);
    const isShaking = ref(false);
    const isExploding = ref(false);
    const rewardRevealed = ref(false);
    
    const activeCase = ref(null);
    const rewardIcon = ref('');
    const rewardName = ref('');

    onMounted(async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            points.value = userDoc.data().points || 0;
          }
        }
      });
    });

    const handleOpenCase = async (caseItem) => {
      if (points.value < caseItem.price) {
        toast.error(isRus.value ? 'Недостаточно TP Coins!' : 'TP Coins yetarli emas!');
        return;
      }

      const user = auth.currentUser;
      if (!user) return;

      isOpening.value = true;
      showOverlay.value = true;
      activeCase.value = caseItem;
      isShaking.value = true;

      try {
        // Deduct points
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          points: increment(-caseItem.price)
        });
        points.value -= caseItem.price;

        // Mock getting a random badge for visual effect
        // In reality, this would save to user's inventory
        const allBadges = getBadges(100, 10, 1000);
        const randomBadge = allBadges[Math.floor(Math.random() * allBadges.length)];
        
        rewardIcon.value = randomBadge.icon;
        rewardName.value = isRus.value ? randomBadge.nameRu : randomBadge.nameUz;

        // Animation timing
        setTimeout(() => {
          isShaking.value = false;
          isExploding.value = true;
          
          setTimeout(() => {
            rewardRevealed.value = true;
          }, 500);
        }, 2000);

      } catch (error) {
        console.error('Error opening case:', error);
        toast.error('Xatolik yuz berdi!');
        closeOverlay();
      }
    };

    const closeOverlay = () => {
      showOverlay.value = false;
      isOpening.value = false;
      isShaking.value = false;
      isExploding.value = false;
      rewardRevealed.value = false;
      activeCase.value = null;
    };

    return {
      points,
      isRus,
      isOpening,
      showOverlay,
      isShaking,
      isExploding,
      rewardRevealed,
      activeCase,
      rewardIcon,
      rewardName,
      handleOpenCase,
      closeOverlay
    };
  }
}
</script>

<style scoped>
.shop-wrapper {
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
  background: radial-gradient(circle, #8b5cf6 0%, #d946ef 100%);
}

.glow-bg-2 {
  bottom: 5%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #f59e0b 0%, #fbbf24 100%);
  animation-delay: -7s;
}

.shop-container {
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

.shop-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.balance-bento {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

@media (max-width: 600px) {
  .balance-bento {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }
}

.balance-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 1px;
}

.balance-val {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-val img {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.balance-val h2 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1;
}

.balance-val span {
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 8px;
}

.earn-more-btn {
  background: #f1f5f9;
  color: #0f172a;
  border: none;
  padding: 12px 24px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.earn-more-btn:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.section-title-wrap {
  margin-bottom: 2rem;
}

.section-title-wrap h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.text-blue {
  color: #3b82f6;
}

.section-title-wrap p {
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* OVERLAY ANIMATIONS */
.lootbox-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lootbox-animation-container {
  text-align: center;
  position: relative;
}

.opening-text {
  color: white;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 2rem;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.box-shaker {
  font-size: 10rem;
  transition: transform 0.5s;
}

.shake {
  animation: shake 0.5s infinite cubic-bezier(.36,.07,.19,.97) both;
}

.explode {
  transform: scale(0);
  opacity: 0;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-5px, 0, 0) rotate(-5deg); }
  20%, 80% { transform: translate3d(5px, 0, 0) rotate(5deg); }
  30%, 50%, 70% { transform: translate3d(-10px, -10px, 0) rotate(-10deg); }
  40%, 60% { transform: translate3d(10px, 10px, 0) rotate(10deg); }
}

.reward-reveal {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 3rem;
  border-radius: 30px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}

.animate-pop-in {
  animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes popIn {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.reward-reveal h3 {
  font-size: 1.8rem;
  font-weight: 900;
  color: #10b981;
  margin: 0 0 10px 0;
}

.reward-reveal p {
  color: #64748b;
  margin: 0 0 2rem 0;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 2rem;
}

.reward-item i {
  font-size: 4rem;
  color: #f59e0b;
  background: #fffbeb;
  width: 100px; height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);
}

.reward-item span {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}

.claim-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 14px 0;
  width: 100%;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
}
</style>
`;

fs.writeFileSync(shopPath, newTemplate);
console.log('Successfully refactored ShopPage.vue');
