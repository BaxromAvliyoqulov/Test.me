<template>
  <div class="not-found-wrapper">
    <!-- Glowing backgrounds -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>
    <div class="glow-bg glow-bg-3"></div>

    <div class="not-found-container">
      <div class="error-code">404</div>
      <div class="error-content">
        <h2>{{ isRus ? 'Упс! Страница не найдена' : 'Obbo! Sahifa topilmadi' }}</h2>
        <p>{{ isRus ? 'Похоже, вы сбились с пути. Эта страница была удалена или никогда не существовала.' : 'Siz adashib qoldingiz shekilli. Bu sahifa o\'chirilgan yoki umuman mavjud bo\'lmagan.' }}</p>
        
        <div class="actions">
          <router-link to="/" class="btn-primary">
            <i class="fas fa-home"></i> {{ isRus ? 'На главную' : 'Asosiy sahifaga' }}
          </router-link>
          <button @click="$router.go(-1)" class="btn-secondary">
            <i class="fas fa-arrow-left"></i> {{ isRus ? 'Назад' : 'Orqaga' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '@/utils/i18n';

const { locale } = useI18n();
const isRus = computed(() => locale.value === 'RUS');
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');

.not-found-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 2rem;
}

/* Background Animations */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  animation: float-bg 20s ease-in-out infinite alternate;
  opacity: 0.5;
}

@keyframes float-bg {
  0% { transform: scale(1) translate(0, 0); }
  33% { transform: scale(1.1) translate(100px, 50px); }
  66% { transform: scale(0.9) translate(-50px, 100px); }
  100% { transform: scale(1.2) translate(50px, -50px); }
}

.glow-bg-1 {
  top: 10%; left: 20%;
  width: 400px; height: 400px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
}

.glow-bg-2 {
  bottom: 10%; right: 10%;
  width: 500px; height: 500px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
  animation-delay: -5s;
}

.glow-bg-3 {
  top: 40%; left: 60%;
  width: 300px; height: 300px;
  background: radial-gradient(circle, #10b981 0%, transparent 70%);
  animation-delay: -10s;
}

/* Content Container */
.not-found-container {
  position: relative;
  z-index: 10;
  text-align: center;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem 3rem;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 600px;
  width: 100%;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  filter: drop-shadow(0 10px 20px rgba(96, 165, 250, 0.3));
}

.error-content h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 1rem;
}

.error-content p {
  font-size: 1.1rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

@media (max-width: 500px) {
  .actions {
    flex-direction: column;
    gap: 1rem;
  }
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px -5px rgba(59, 130, 246, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}
</style>
