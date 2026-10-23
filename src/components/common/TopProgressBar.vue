<template>
  <div class="page-navigation-container" v-if="isNavigating">
    <!-- Top Progress Bar -->
    <div 
      class="top-progress-bar"
      :style="{ width: `${progress}%` }"
    >
      <div class="progress-glow"></div>
    </div>

    <!-- Centered Ambient Feedback for Slower Connections -->
    <transition name="fade-fast">
      <div v-if="showCenteredLoader" class="ambient-loader-toast">
        <div class="spinner-mini"></div>
        <span>Sahifa yuklanmoqda...</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { usePageProgress } from '@/composables/usePageProgress';

const { isNavigating, showCenteredLoader, progress } = usePageProgress();
</script>

<style scoped>
.page-navigation-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  pointer-events: none;
}

.top-progress-bar {
  height: 3px;
  background: linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%);
  transition: width 0.15s ease-out;
  position: relative;
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.8), 0 0 6px rgba(124, 58, 237, 0.6);
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 3px;
  box-shadow: 0 0 14px 3px rgba(6, 182, 212, 0.9);
  opacity: 0.9;
}

.ambient-loader-toast {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffffff;
  font-size: 0.84rem;
  font-weight: 600;
  border-radius: 9999px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 99999;
}

.spinner-mini {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
