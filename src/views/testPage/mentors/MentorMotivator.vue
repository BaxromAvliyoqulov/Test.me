<template>
  <div class="mentor-page motivator-theme">
    <div class="mentor-container">
      <div class="back-link-container">
        <router-link to="/ai-setup" class="back-link">
          <i class="fas fa-arrow-left"></i> {{ isRus ? 'Назад к наставникам' : 'Ustozlar tanloviga qaytish' }}
        </router-link>
      </div>

      <div class="mentor-profile">
        <div class="mentor-avatar">
          <i class="fas fa-fire"></i>
        </div>
        <div class="mentor-info">
          <h1>{{ isRus ? 'Энергичный Коуч' : 'Energetik Kouch' }}</h1>
          <p>{{ isRus ? 'Эй, чемпион! Ты готов разорвать этот тест? Вперед, только к победе! 🔥🚀' : 'Qani, chempion! Bu testni yorib yuborishga tayyormisan? Faqat olg\'a! 🔥🚀' }}</p>
        </div>
      </div>

      <div class="setup-glass-card">
        <form @submit.prevent="submit" class="setup-form">
          <div class="form-group">
            <label><i class="fas fa-book"></i> {{ isRus ? 'Выберите предмет' : 'Fanni tanlang' }}</label>
            <div class="select-wrapper">
              <select v-model="form.subject" required>
                <option value="" disabled>{{ isRus ? 'Предмет' : 'Fan' }}</option>
                <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
              </select>
              <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>

          <div class="form-group">
            <label><i class="fas fa-layer-group"></i> {{ isRus ? 'Уровень сложности' : 'Qiyinchilik darajasi' }}</label>
            <div class="pills-selector">
              <button type="button" v-for="lvl in levels" :key="lvl.id" :class="['level-pill', { active: form.level === lvl.id }]" @click="form.level = lvl.id">
                <i :class="lvl.icon"></i>
                <span>{{ isRus ? lvl.nameRu : lvl.nameUz }}</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label><i class="fas fa-lightbulb"></i> {{ isRus ? 'Конкретная тема' : 'Konkret mavzu' }}</label>
            <input type="text" v-model="form.topic" required :placeholder="isRus ? 'Например: Бизнес' : 'Masalan: Biznes'" class="topic-input" />
          </div>

          <button type="submit" class="generate-btn" :disabled="loading">
            <i class="fas fa-magic"></i>
            <span>{{ isRus ? 'Создать тест' : 'Testni yaratish' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Loading Overlay -->
    <transition name="fade">
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <h2>{{ currentStatusMessage }}</h2>
          <div class="progress-bar"><div class="progress-inner" :style="{ width: progressPercentage + '%' }"></div></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useI18n } from '@/utils/i18n';
import { useAIGenerator } from '@/composables/useAIGenerator';

const { locale } = useI18n();
const isRus = computed(() => locale.value === 'RUS');

const { loading, progressPercentage, currentStatusMessage, generateTest } = useAIGenerator('motivator', isRus);

const form = reactive({ subject: '', level: 'intermediate', topic: '' });
const subjects = ['English', 'O\'zbek tili', 'Matematika', 'Tarix', 'Fizika', 'Informatika', 'Dasturlash'];
const levels = [
  { id: 'elementary', nameUz: 'Boshlang\'ich', nameRu: 'Начальный', icon: 'fas fa-baby-carriage' },
  { id: 'intermediate', nameUz: 'O\'rta', nameRu: 'Средний', icon: 'fas fa-graduation-cap' },
  { id: 'advanced', nameUz: 'Yuqori', nameRu: 'Продвинутый', icon: 'fas fa-crown' }
];

const submit = () => {
  const prompt = "You are an intense motivational coach! Frame the questions with high energy, challenge the student to 'crush' the problem, and use hype-filled scenarios. 🚀🔥";
  generateTest(form.subject, form.level, form.topic, prompt);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
.mentor-page { min-height: 100vh; padding: 2rem 1.5rem; font-family: 'Plus Jakarta Sans', sans-serif; background: #fff7ed; }
.mentor-container { max-width: 600px; margin: 0 auto; }
.back-link { color: #ea580c; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 2rem; }
.mentor-profile { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
.mentor-avatar { width: 80px; height: 80px; background: #f97316; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: 0 10px 20px -5px rgba(249,115,22,0.4); transform: rotate(-5deg); }
.mentor-info h1 { font-size: 1.8rem; font-weight: 900; color: #9a3412; margin: 0 0 0.5rem 0; text-transform: uppercase; font-style: italic; }
.mentor-info p { color: #c2410c; margin: 0; line-height: 1.5; font-size: 0.95rem; font-weight: 600; }
.setup-glass-card { background: white; border-radius: 24px; padding: 2rem; box-shadow: 0 15px 35px -10px rgba(249,115,22,0.15); border: 2px solid #fed7aa; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: 800; color: #ea580c; margin-bottom: 0.5rem; font-size: 0.85rem; text-transform: uppercase; }
.select-wrapper { position: relative; }
.select-wrapper select, .topic-input { width: 100%; padding: 14px 16px; border: 2px solid #fed7aa; border-radius: 12px; font-family: inherit; font-size: 1rem; font-weight: 700; outline: none; transition: 0.2s; background: #fff7ed; color: #9a3412;}
.select-wrapper select:focus, .topic-input:focus { border-color: #f97316; background: white; }
.select-arrow { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #fb923c; pointer-events: none; }
.pills-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.level-pill { padding: 12px; border: 2px solid #fed7aa; background: #fff7ed; border-radius: 12px; font-weight: 800; color: #fb923c; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: 0.2s; }
.level-pill.active { border-color: #f97316; color: white; background: #f97316; transform: scale(1.05); }
.level-pill:hover:not(.active) { background: #ffedd5; color: #ea580c; }
.generate-btn { width: 100%; padding: 16px; background: #f97316; color: white; border: none; border-radius: 12px; font-size: 1.2rem; font-weight: 900; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; box-shadow: 0 10px 20px -5px rgba(249,115,22,0.4); }
.generate-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 25px -5px rgba(249,115,22,0.6); }
.loading-overlay { position: fixed; inset: 0; background: rgba(255,247,237,0.95); display: flex; align-items: center; justify-content: center; z-index: 999; color: #9a3412; }
.loading-content { text-align: center; width: 100%; max-width: 300px; }
.spinner { width: 60px; height: 60px; border: 4px solid #fed7aa; border-left-color: #f97316; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem; }
.progress-bar { width: 100%; height: 10px; background: #fed7aa; border-radius: 10px; overflow: hidden; margin-top: 1rem; }
.progress-inner { height: 100%; background: #f97316; transition: width 0.2s; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
