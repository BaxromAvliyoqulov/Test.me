<template>
  <div class="about-wrapper">
    <!-- Glowing backgrounds matching the premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="about-container">
      <div class="about-hero">
        <h1 class="about-title">
          <span class="gradient-text">Test.me</span> {{ isRus ? 'платформына кош келипсиз!' : 'platformasiga xush kelibsiz!' }}
        </h1>
        <p class="about-subtitle">
          {{ isRus ? 'Инновационная платформа для увлекательного, интерактивного и эффективного обучения' : 'Qiziqarli, interaktiv va samarali ta\'lim olish uchun innovatsion platforma' }}
        </p>
      </div>

      <!-- Features Grid -->
      <div class="features-grid">
        <div 
          v-for="(feature, idx) in localizedFeatures" 
          :key="idx" 
          class="feature-card"
        >
          <div class="feature-icon-wrapper" :style="{ background: feature.iconBg, color: feature.iconColor }">
            <i :class="feature.icon"></i>
          </div>
          <div class="feature-info">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="about-cta-card">
        <div class="cta-content">
          <h2>{{ isRus ? 'Готовы проверить свои знания?' : 'Bilimingizni sinab ko\'rishga tayyormisiz?' }}</h2>
          <p>
            {{ isRus ? 'Готовитесь ли вы к экзаменам, хотите проверить свои знания или просто любите учиться – наша платформа создана именно для вас!' : 'Imtihonga tayyorgarlik ko\'rayotgan bo\'lsangiz, bilimingizni tekshirmoqchi bo\'lsangiz yoki shunchaki yangi narsalarni o\'rganishni istasangiz – bizning platforma aynan siz uchun yaratilgan!' }}
          </p>
          <div class="button-container">
            <button class="cta-button" @click="navigateToTest">
              <span>{{ isRus ? 'Начать тест' : 'Sinovni boshlash' }}</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/utils/i18n';

const { locale } = useI18n();
const router = useRouter();

const isRus = computed(() => locale.value === 'RUS');

const localizedFeatures = computed(() => {
  return [
    {
      icon: 'fas fa-graduation-cap',
      iconBg: 'linear-gradient(135deg, #f5f3ff 0%, #edd9ff 100%)',
      iconColor: '#7c3aed',
      title: isRus.value ? 'Разнообразные тесты' : 'Xilma-xil testlar',
      desc: isRus.value 
        ? 'Коллекция тестов по различным предметам и уровням сложности.' 
        : 'Turli fanlar va har xil qiyinlik darajasidagi testlar to\'plami.'
    },
    {
      icon: 'fas fa-chart-line',
      iconBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      iconColor: '#3b82f6',
      title: isRus.value ? 'Мгновенные результаты' : 'Tezkor natijalar',
      desc: isRus.value 
        ? 'Получение результатов за секунды и глубокий анализ ошибок.' 
        : 'Natijalarni soniyalarda olish va xatolaringiz ustida chuqur tahlil.'
    },
    {
      icon: 'fas fa-user-graduate',
      iconBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      iconColor: '#10b981',
      title: isRus.value ? 'Личный подход' : 'Shaxsiy yondashuv',
      desc: isRus.value 
        ? 'Система обучения и тестов, адаптированная под ваш уровень знаний.' 
        : 'Sizning bilim darajangizga moslashtirilgan o\'qitish va testlar tizimi.'
    },
    {
      icon: 'fas fa-award',
      iconBg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      iconColor: '#f97316',
      title: isRus.value ? 'Система достижений' : 'Yutuqlar tizimi',
      desc: isRus.value 
        ? 'Ваши достижения, результаты, сертификаты и система серий дней (streak).' 
        : 'Erishgan yutuqlaringiz, cheksiz natijalar, sertifikatlar va streak tizimi.'
    },
    {
      icon: 'fas fa-mobile-alt',
      iconBg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      iconColor: '#db2777',
      title: isRus.value ? 'Премиум интерфейс' : 'Premium UI/UX',
      desc: isRus.value 
        ? 'Простой, красивый и адаптивный интерфейс под любые устройства.' 
        : 'Sodda, chiroyli va har qanday qurilmaga moslashuvchan interfeys.'
    },
    {
      icon: 'fas fa-wallet',
      iconBg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
      iconColor: '#0d9488',
      title: isRus.value ? 'Кошелек TP Coins' : 'TP Coins Hamyoni',
      desc: isRus.value 
        ? 'Приглашайте друзей, решайте тесты и получайте отличные награды.' 
        : 'Do\'stlarni taklif qiling, test yeching va ajoyib mukofotlarga ega bo\'ling.'
    }
  ];
});

const navigateToTest = () => {
  router.push('/');
};
</script>

<style scoped>
.about-wrapper {
  position: relative;
  min-height: 90vh;
  padding: 4rem 1.5rem;
  overflow: hidden;
  background: #f8fafc;
  font-family: 'Outfit', 'Inter', sans-serif;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
  z-index: 0;
  pointer-events: none;
}

.glow-bg-1 {
  top: 10%;
  left: 5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #3b82f6 0%, #60a5fa 100%);
}

.glow-bg-2 {
  bottom: 10%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #10b981 0%, #34d399 100%);
}

.about-container {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.about-hero {
  text-align: center;
}

.about-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
  margin: 0 0 1rem 0;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.about-subtitle {
  font-size: 1.15rem;
  color: #64748b;
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.03);
}

.feature-card:hover {
  transform: translateY(-5px);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);
}

.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.1);
}

.feature-info {
  flex-grow: 1;
}

.feature-info h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.feature-info p {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.about-cta-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border-radius: 30px;
  padding: 3.5rem 2.5rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px -15px rgba(15, 23, 42, 0.3);
}

.about-cta-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 1.85rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  letter-spacing: -0.5px;
}

.cta-content p {
  font-size: 0.98rem;
  line-height: 1.6;
  opacity: 0.85;
  margin: 0 0 2.25rem 0;
}

.button-container {
  display: flex;
  justify-content: center;
}

.cta-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1.1rem 3rem;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 18px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 25px -5px rgba(37, 99, 235, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px -5px rgba(37, 99, 235, 0.6);
}

.cta-button i {
  transition: transform 0.2s;
}

.cta-button:hover i {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .about-wrapper {
    padding: 2.5rem 1rem;
  }

  .about-container {
    gap: 2.5rem;
  }

  .about-title {
    font-size: 2.2rem;
  }

  .about-subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .about-cta-card {
    padding: 2.5rem 1.5rem;
  }

  .cta-content h2 {
    font-size: 1.5rem;
  }
}
</style>
