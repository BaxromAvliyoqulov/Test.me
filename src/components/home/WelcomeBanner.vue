<template>
  <div class="welcome-banner">
    <div class="welcome-content">
      <div class="welcome-text">
        <h1>{{ welcomeTitle }}</h1>
        <p>{{ welcomeSubtitle }}</p>
      </div>
      <div class="welcome-stat-chip">
        <div class="coin-icon-wrapper">
          <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="coin-icon" />
        </div>
        <div class="stat-info">
          <span class="stat-val">{{ points }}</span>
          <span class="stat-lbl">TP Coins</span>
        </div>
      </div>
    </div>
    <!-- Decorative elements -->
    <div class="banner-decoration blob-1"></div>
    <div class="banner-decoration blob-2"></div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeBanner',
  props: {
    welcomeTitle: { type: String, required: true },
    welcomeSubtitle: { type: String, required: true },
    points: { type: Number, default: 0 }
  }
}
</script>

<style scoped>
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%);
  border-radius: 32px;
  padding: 2.5rem 3rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2.5rem;
  transition: transform 0.3s ease;
}

.welcome-banner:hover {
  transform: translateY(-2px);
}

.welcome-content {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h1 {
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
  background: linear-gradient(to right, #ffffff, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-text p {
  color: #bfdbfe;
  font-size: 1.05rem;
  margin: 0;
  font-weight: 500;
}

.welcome-stat-chip {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 1rem 1.8rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-stat-chip:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.coin-icon-wrapper {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coin-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 4px 6px rgba(245, 158, 11, 0.4));
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-val {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  color: #fbbf24;
}

.stat-lbl {
  font-size: 0.75rem;
  color: #dbeafe;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
}

.banner-decoration {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: rgba(59, 130, 246, 0.5);
  top: -200px;
  left: -100px;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: rgba(139, 92, 246, 0.4);
  bottom: -150px;
  right: -50px;
}

@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .welcome-text h1 { font-size: 1.8rem; }
}
</style>
