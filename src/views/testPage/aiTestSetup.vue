<template>
  <div class="ai-hub-wrapper">
    <!-- Glowing background elements -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="ai-hub-container">
      <div class="back-link-container">
        <router-link to="/" class="back-link">
          <i class="fas fa-arrow-left"></i> {{ isRus ? 'Назад на главную' : 'Bosh sahifaga qaytish' }}
        </router-link>
      </div>

      <div class="hub-header">
        <div class="magic-badge">
          <i class="fas fa-robot"></i>
        </div>
        <h1>{{ isRus ? 'Выберите своего AI-Наставника' : 'AI Ustozingizni tanlang' }}</h1>
        <p>{{ isRus ? 'Каждый наставник имеет уникальный стиль и подход к созданию тестов.' : 'Har bir ustoz test yaratishda o\'zining betakror uslubiga ega.' }}</p>
      </div>

      <div class="mentors-grid">
        <div 
          v-for="mentor in mentors" 
          :key="mentor.id"
          class="mentor-card"
          :class="mentor.id"
          @click="selectMentor(mentor.id)"
        >
          <div class="card-glow" :style="{ background: mentor.color }"></div>
          <div class="mentor-icon" :style="{ color: mentor.color, backgroundColor: mentor.bgLight }">
            <i :class="mentor.icon"></i>
          </div>
          <h3 class="mentor-name">{{ isRus ? mentor.nameRu : mentor.nameUz }}</h3>
          <p class="mentor-desc">{{ isRus ? mentor.descRu : mentor.descUz }}</p>
          <div class="mentor-tag" :style="{ color: mentor.color, borderColor: mentor.color }">
            {{ isRus ? mentor.tagRu : mentor.tagUz }}
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

const mentors = [
  {
    id: 'standard',
    icon: 'fas fa-graduation-cap',
    color: '#3b82f6',
    bgLight: '#eff6ff',
    nameUz: 'Professor Standard',
    nameRu: 'Профессор Стандарт',
    descUz: 'Obyektiv, rasmiy va klassik uslubdagi testlar tuzadi.',
    descRu: 'Создает объективные, формальные и классические тесты.',
    tagUz: 'Rasmiy',
    tagRu: 'Формальный'
  },
  {
    id: 'friendly',
    icon: 'fas fa-smile-beam',
    color: '#ec4899',
    bgLight: '#fdf2f8',
    nameUz: 'Do\'stona Buddy',
    nameRu: 'Дружелюбный Бадди',
    descUz: 'Sizni doim qo\'llab-quvvatlovchi va iliq so\'zlar bilan test oladi.',
    descRu: 'Поддерживает вас теплыми словами и проводит тест дружелюбно.',
    tagUz: 'Iliq',
    tagRu: 'Теплый'
  },
  {
    id: 'strict',
    icon: 'fas fa-gavel',
    color: '#ef4444',
    bgLight: '#fef2f2',
    nameUz: 'Qattiqqo\'l Sensei',
    nameRu: 'Строгий Сенсей',
    descUz: 'Xatoga o\'rin yo\'q! O\'ta murakkab va jiddiy testlar tayyorlaydi.',
    descRu: 'Нет права на ошибку! Готовит очень сложные и серьезные тесты.',
    tagUz: 'Qiyin',
    tagRu: 'Сложный'
  },
  {
    id: 'socratic',
    icon: 'fas fa-landmark',
    color: '#f59e0b',
    bgLight: '#fffbeb',
    nameUz: 'Faylasuf Sokrat',
    nameRu: 'Философ Сократ',
    descUz: 'Savollarni chuqur mantiq va o\'ylashga majbur qiluvchi holatda tuzadi.',
    descRu: 'Задает вопросы, требующие глубокой логики и размышлений.',
    tagUz: 'Mantiqiy',
    tagRu: 'Логический'
  },
  {
    id: 'motivator',
    icon: 'fas fa-fire',
    color: '#f97316',
    bgLight: '#fff7ed',
    nameUz: 'Energetik Kouch',
    nameRu: 'Энергичный Коуч',
    descUz: 'Sen buni uddalaysan! Juda yuqori energiya va motivatsiya beradi.',
    descRu: 'Ты справишься! Дает огромный заряд энергии и мотивации.',
    tagUz: 'Motivatsiya',
    tagRu: 'Мотивация'
  },
  {
    id: 'innovator',
    icon: 'fas fa-rocket',
    color: '#8b5cf6',
    bgLight: '#f5f3ff',
    nameUz: 'Innovator Genius',
    nameRu: 'Инноватор Гений',
    descUz: 'Kelajak g\'oyalari, kosmos va noodatiy fantastik savollar.',
    descRu: 'Идеи будущего, космос и необычные фантастические вопросы.',
    tagUz: 'Fantastik',
    tagRu: 'Фантастика'
  },
  {
    id: 'analyst',
    icon: 'fas fa-laptop-code',
    color: '#10b981',
    bgLight: '#ecfdf5',
    nameUz: 'Kiber Tahlilchi',
    nameRu: 'Кибер Аналитик',
    descUz: 'Matrix uslubidagi kodlar va xakerlik topshiriqlari shaklida test.',
    descRu: 'Тесты в стиле Матрицы, кодов и хакерских заданий.',
    tagUz: 'Texnologik',
    tagRu: 'Технологичный'
  },
  {
    id: 'sage',
    icon: 'fas fa-leaf',
    color: '#84cc16',
    bgLight: '#f7fee7',
    nameUz: 'Dono Qariya',
    nameRu: 'Мудрый Старец',
    descUz: 'Qadimiy topishmoqlar va ibratli ertaklar uslubida.',
    descRu: 'В стиле древних загадок и поучительных сказок.',
    tagUz: 'Qadimiy',
    tagRu: 'Древний'
  },
  {
    id: 'comedian',
    icon: 'fas fa-theater-masks',
    color: '#06b6d4',
    bgLight: '#ecfeff',
    nameUz: 'Hazilkash Joey',
    nameRu: 'Комик Джоуи',
    descUz: 'Test ishlayotganda kulgidan o\'zingizni to\'xtata olmaysiz!',
    descRu: 'Не сможете сдержать смех во время прохождения теста!',
    tagUz: 'Qiziqarli',
    tagRu: 'Смешной'
  }
];

const selectMentor = (id) => {
  router.push(`/ai-setup/${id}`);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.ai-hub-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 3rem 1.5rem;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  z-index: 0;
  opacity: 0.08;
}
.glow-bg-1 {
  width: 500px;
  height: 500px;
  background: #a855f7;
  top: -10%;
  left: -5%;
}
.glow-bg-2 {
  width: 500px;
  height: 500px;
  background: #3b82f6;
  bottom: -10%;
  right: -5%;
}

.ai-hub-container {
  position: relative;
  z-index: 10;
  max-width: 1100px;
  margin: 0 auto;
}

.back-link-container {
  margin-bottom: 2rem;
}
.back-link {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}
.back-link:hover {
  color: #0f172a;
}

.hub-header {
  text-align: center;
  margin-bottom: 3rem;
}

.magic-badge {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #a855f7, #3b82f6);
  color: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 10px 25px -8px rgba(168, 85, 247, 0.5);
}

.hub-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.8rem;
  letter-spacing: -0.5px;
}

.hub-header p {
  color: #64748b;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.mentors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.mentor-card {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s;
  mix-blend-mode: multiply;
  pointer-events: none;
}

.mentor-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.1);
  border-color: transparent;
}
.mentor-card:hover .card-glow {
  opacity: 0.05;
}

.mentor-icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  transition: transform 0.3s;
}

.mentor-card:hover .mentor-icon {
  transform: scale(1.1) rotate(5deg);
}

.mentor-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.mentor-desc {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  flex-grow: 1;
  margin-bottom: 1.5rem;
}

.mentor-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .hub-header h1 {
    font-size: 2rem;
  }
  .mentors-grid {
    grid-template-columns: 1fr;
  }
}
</style>
