<template>
  <div class="wallet-cards-grid">
    <!-- Balance Card -->
    <div 
      class="premium-wallet-card balance-card"
      @mousemove="handleMouseMove($event, 'balance')"
      @mouseleave="handleMouseLeave('balance')"
      ref="balanceCard"
      :style="balanceStyle"
    >
      <div class="card-glass">
        <div class="card-glare" :style="balanceGlareStyle"></div>
        <div class="card-pattern"></div>
        <div class="glow-orb"></div>
        
        <div class="card-top">
          <span class="card-title">{{ isRus ? 'ТЕКУЩИЙ БАЛАНС' : 'JORIY BALANS' }}</span>
          <div class="card-chip-container">
            <div class="chip-line horizontal"></div>
            <div class="chip-line vertical"></div>
          </div>
        </div>
        
        <div class="balance-display">
          <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="coin-logo animate-float" />
          <div class="balance-val">
            <h2>{{ points }}</h2>
            <span>TP Coins</span>
          </div>
        </div>

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
    <div 
      class="premium-wallet-card referrals-card"
      @mousemove="handleMouseMove($event, 'referral')"
      @mouseleave="handleMouseLeave('referral')"
      ref="referralCard"
      :style="referralStyle"
    >
      <div class="card-glass">
        <div class="card-glare" :style="referralGlareStyle"></div>
        <div class="card-pattern"></div>
        <div class="glow-orb orb-green"></div>
        
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
</template>

<script>
import { ref } from 'vue';
import { getRankName, getRankIcon } from '@/utils/ranks';

export default {
  name: 'WalletCards',
  props: {
    points: { type: Number, required: true },
    referralCount: { type: Number, required: true },
    isRus: { type: Boolean, required: true },
    locale: { type: String, required: true }
  },
  setup() {
    const balanceStyle = ref({});
    const balanceGlareStyle = ref({});
    const referralStyle = ref({});
    const referralGlareStyle = ref({});

    const handleMouseMove = (e, cardType) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const y = e.clientY - rect.top;  // y position within the element.
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -15; // Max rotation 15deg
      const rotateY = ((x - centerX) / centerX) * 15;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      const transformStyle = {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: 'transform 0.1s ease-out'
      };

      const glare = {
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
        opacity: '1'
      };

      if (cardType === 'balance') {
        balanceStyle.value = transformStyle;
        balanceGlareStyle.value = glare;
      } else {
        referralStyle.value = transformStyle;
        referralGlareStyle.value = glare;
      }
    };

    const handleMouseLeave = (cardType) => {
      const resetStyle = {
        transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
      };
      const resetGlare = { opacity: '0', transition: 'opacity 0.5s ease' };

      if (cardType === 'balance') {
        balanceStyle.value = resetStyle;
        balanceGlareStyle.value = resetGlare;
      } else {
        referralStyle.value = resetStyle;
        referralGlareStyle.value = resetGlare;
      }
    };

    return {
      getRankName,
      getRankIcon,
      handleMouseMove,
      handleMouseLeave,
      balanceStyle,
      balanceGlareStyle,
      referralStyle,
      referralGlareStyle
    }
  }
}
</script>

<style scoped>
.wallet-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  position: relative;
  width: 100%;
  min-height: 280px;
  align-items: stretch;
}

@media (max-width: 900px) {
  .wallet-cards-grid {
    grid-template-columns: 1fr;
    min-height: auto;
  }
}

.premium-wallet-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.1);
  transform-style: preserve-3d;
  cursor: pointer;
  z-index: 1;
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.premium-wallet-card::before {
  content: '';
  position: absolute;
  top: -10px; left: -10px; right: -10px; bottom: -10px;
  background: inherit;
  filter: blur(20px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  border-radius: 35px;
}

.premium-wallet-card:hover::before {
  opacity: 0.6;
}

.card-glass {
  border-radius: 27px;
  padding: 2.25rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  height: 100%;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.balance-card .card-glass {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
}

.referrals-card .card-glass {
  background: linear-gradient(135deg, #022c22 0%, #065f46 50%, #10b981 100%);
}

.card-glare {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 5;
  opacity: 0;
}

.glow-orb {
  position: absolute;
  top: -50px; right: -50px;
  width: 150px; height: 150px;
  background: rgba(59, 130, 246, 0.8);
  filter: blur(50px);
  border-radius: 50%;
  animation: pulse-orb 4s ease-in-out infinite alternate;
  z-index: 1;
}

.orb-green { background: rgba(16, 185, 129, 0.8); }

@keyframes pulse-orb {
  0% { transform: scale(1) translate(0, 0); opacity: 0.5; }
  100% { transform: scale(1.5) translate(-20px, 20px); opacity: 0.8; }
}

.card-pattern {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.3;
  transform: perspective(500px) rotateX(60deg) scale(2);
  transform-origin: top center;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  z-index: 3;
  position: relative;
  transform: translateZ(30px);
  gap: 1rem;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  word-wrap: break-word;
  line-height: 1.2;
}

.card-chip-container {
  width: 50px; height: 35px;
  background: linear-gradient(135deg, #ffe066 0%, #f5b041 50%, #d35400 100%);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 4px 10px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.chip-line { position: absolute; background: rgba(0, 0, 0, 0.3); }
.chip-line.horizontal { width: 100%; height: 1px; top: 50%; left: 0; }
.chip-line.vertical { width: 1px; height: 100%; left: 50%; top: 0; }

.card-hologram {
  width: 40px; height: 40px;
  background: linear-gradient(45deg, #ff7675, #74b9ff, #55efc4, #ffeaa7);
  background-size: 400% 400%;
  animation: hologram-animation 4s ease infinite;
  border-radius: 8px;
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

@keyframes hologram-animation {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

.balance-display {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
  z-index: 3;
  position: relative;
  transform: translateZ(40px);
}

.coin-logo { width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); }
.referral-earnings-logo {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #a7f3d0;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.2);
}

.animate-float {
  animation: float 3s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  100% { transform: translateY(-10px) rotate(10deg); }
}

.balance-val h2 {
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0;
  line-height: 1;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
.balance-val span { font-size: 1rem; font-weight: 700; opacity: 0.9; letter-spacing: 1px; }

.card-number {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 4px;
  margin-bottom: 1.5rem;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.5);
  opacity: 0.95;
  z-index: 3;
  position: relative;
  transform: translateZ(20px);
}

.card-holder-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 3;
  position: relative;
  transform: translateZ(30px);
}

.card-holder { display: flex; flex-direction: column; gap: 4px; }
.card-holder span { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; font-weight: 600; }
.card-holder strong { font-size: 1.05rem; font-weight: 800; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

.card-brand {
  display: flex; align-items: center; position: relative; width: 48px; height: 32px;
}

.brand-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; opacity: 0.9; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
.brand-circle.left { background: #ef4444; left: 0; mix-blend-mode: screen; }
.brand-circle.right { background: #f59e0b; right: 12px; mix-blend-mode: screen; }
.brand-circle.left-green { background: #a7f3d0; left: 0; mix-blend-mode: overlay; }
.brand-circle.right-yellow { background: #fef08a; right: 12px; mix-blend-mode: overlay; }
</style>
