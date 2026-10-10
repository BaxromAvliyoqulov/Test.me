<template>
  <nav class="mobile-bottom-nav">
    <router-link to="/" class="nav-item" active-class="active">
      <i class="fas fa-home"></i>
      <span>{{ isRus ? 'Главная' : 'Bosh' }}</span>
    </router-link>
    <router-link to="/dashboard" class="nav-item" active-class="active">
      <i class="fas fa-chart-pie"></i>
      <span>{{ isRus ? 'Панель' : 'Panel' }}</span>
    </router-link>
    <router-link to="/test" class="nav-item nav-center" active-class="active">
      <div class="center-icon">
        <i class="fas fa-play"></i>
      </div>
      <span>{{ isRus ? 'Тест' : 'Test' }}</span>
    </router-link>
    <router-link to="/shop" class="nav-item" active-class="active">
      <i class="fas fa-store"></i>
      <span>{{ isRus ? 'Магазин' : "Do'kon" }}</span>
    </router-link>
    <router-link to="/editProfile" class="nav-item" active-class="active">
      <i class="fas fa-user"></i>
      <span>{{ isRus ? 'Профиль' : 'Profil' }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { locale } = useI18n();
const isRus = computed(() => locale.value === 'RUS');
</script>

<style scoped>
.mobile-bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(64px + env(safe-area-inset-bottom, 0px));
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.06);
    z-index: 999;
    padding: 0 8px env(safe-area-inset-bottom, 0px) 8px;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 700;
    gap: 4px;
    transition: all 0.2s ease;
    flex: 1;
    text-decoration: none;
    min-height: 48px;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-item:active {
    transform: scale(0.92);
  }

  .nav-item i {
    font-size: 1.15rem;
    transition: transform 0.2s;
  }

  .nav-item.active {
    color: #3b82f6;
  }

  .nav-item.active i {
    transform: translateY(-2px);
  }

  .nav-center {
    position: relative;
    top: -10px;
  }

  .center-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
    border: 3px solid white;
    transition: transform 0.15s ease;
  }

  .center-icon:active {
    transform: scale(0.9);
  }

  .center-icon i {
    font-size: 1.1rem;
    margin-left: 2px;
  }

  .nav-center span {
    margin-top: 2px;
  }
}
</style>
