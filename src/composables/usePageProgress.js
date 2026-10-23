// src/composables/usePageProgress.js
import { ref } from 'vue';

const isNavigating = ref(false);
const showCenteredLoader = ref(false);
const progress = ref(0);

let progressTimer = null;
let delayTimer = null;

export const usePageProgress = () => {
  const startNavigation = () => {
    isNavigating.value = true;
    progress.value = 15;

    if (progressTimer) clearInterval(progressTimer);
    if (delayTimer) clearTimeout(delayTimer);

    // Faqat agar navigatsiya 180ms dan ko'proq vaqt olsa, o'rtada nozik indikator chiqadi
    delayTimer = setTimeout(() => {
      if (isNavigating.value) {
        showCenteredLoader.value = true;
      }
    }, 180);

    progressTimer = setInterval(() => {
      if (progress.value < 75) {
        progress.value += Math.random() * 12 + 6;
      } else if (progress.value < 92) {
        progress.value += Math.random() * 3 + 1;
      }
    }, 100);
  };

  const finishNavigation = () => {
    if (progressTimer) clearInterval(progressTimer);
    if (delayTimer) clearTimeout(delayTimer);

    progress.value = 100;

    setTimeout(() => {
      isNavigating.value = false;
      showCenteredLoader.value = false;
      progress.value = 0;
    }, 220);
  };

  const failNavigation = () => {
    if (progressTimer) clearInterval(progressTimer);
    if (delayTimer) clearTimeout(delayTimer);

    progress.value = 100;
    setTimeout(() => {
      isNavigating.value = false;
      showCenteredLoader.value = false;
      progress.value = 0;
    }, 300);
  };

  return {
    isNavigating,
    showCenteredLoader,
    progress,
    startNavigation,
    finishNavigation,
    failNavigation,
  };
};
