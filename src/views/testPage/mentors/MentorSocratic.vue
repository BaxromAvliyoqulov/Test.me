<template>
  <div class="mentor-page socratic-theme">
    <div class="mentor-container">
      <div class="back-link-container">
        <router-link to="/ai-setup" class="back-link">
          <i class="fas fa-arrow-left"></i> {{ isRus ? 'Назад к наставникам' : 'Ustozlar tanloviga qaytish' }}
        </router-link>
      </div>

      <div class="mentor-profile">
        <div class="mentor-avatar">
          <i class="fas fa-landmark"></i>
        </div>
        <div class="mentor-info">
          <h1>{{ isRus ? 'Философ Сократ' : 'Faylasuf Sokrat' }}</h1>
          <p>{{ isRus ? 'Познай самого себя! Мои вопросы заставят вас мыслить глубоко и логично.' : 'O\'zingni angla! Mening savollarim sizni chuqur mantiqiy o\'ylashga majbur qiladi.' }}</p>
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
            <input type="text" v-model="form.topic" required :placeholder="isRus ? 'Например: Древняя история' : 'Masalan: Qadimgi tarix'" class="topic-input" />
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

const { loading, progressPercentage, currentStatusMessage, generateTest } = useAIGenerator('socratic', isRus);

const form = reactive({ subject: '', level: 'advanced', topic: '' });
const subjects = ['English', 'O\'zbek tili', 'Matematika', 'Tarix', 'Fizika', 'Informatika', 'Dasturlash'];
const levels = [
  { id: 'elementary', nameUz: 'Boshlang\'ich', nameRu: 'Начальный', icon: 'fas fa-baby-carriage' },
  { id: 'intermediate', nameUz: 'O\'rta', nameRu: 'Средний', icon: 'fas fa-graduation-cap' },
  { id: 'advanced', nameUz: 'Yuqori', nameRu: 'Продвинутый', icon: 'fas fa-crown' }
];

const submit = () => {
  const prompt = "You are a Socratic philosopher. Frame the questions as deep, philosophical inquiries or scenarios that require profound critical thinking rather than just rote memorization.";
  generateTest(form.subject, form.level, form.topic, prompt);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
.mentor-page { min-height: 100vh; padding: 2rem 1.5rem; font-family: 'Plus Jakarta Sans', sans-serif; background: #fffbeb; }
.mentor-container { max-width: 600px; margin: 0 auto; }
.back-link { color: #b45309; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 2rem; }
.mentor-profile { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
.mentor-avatar { width: 80px; height: 80px; background: #f59e0b; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: 0 10px 20px -5px rgba(245,158,11,0.4); }
.mentor-info h1 { font-size: 1.8rem; font-weight: 800; color: #78350f; margin: 0 0 0.5rem 0; }
.mentor-info p { color: #92400e; margin: 0; line-height: 1.5; font-size: 0.95rem; }
.setup-glass-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 15px 35px -10px rgba(245,158,11,0.15); border: 2px solid #fde68a; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: 800; color: #b45309; margin-bottom: 0.5rem; font-size: 0.85rem; text-transform: uppercase; }
.select-wrapper { position: relative; }
.select-wrapper select, .topic-input { width: 100%; padding: 14px 16px; border: 2px solid #fde68a; border-radius: 8px; font-family: inherit; font-size: 1rem; font-weight: 600; outline: none; transition: 0.2s; background: #fffbeb; color: #78350f;}
.select-wrapper select:focus, .topic-input:focus { border-color: #f59e0b; background: white; }
.select-arrow { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #fbbf24; pointer-events: none; }
.pills-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.level-pill { padding: 12px; border: 2px solid #fde68a; background: #fffbeb; border-radius: 8px; font-weight: 800; color: #fbbf24; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: 0.2s; }
.level-pill.active { border-color: #f59e0b; color: white; background: #f59e0b; }
.level-pill:hover:not(.active) { background: #fef3c7; color: #d97706; }
.generate-btn { width: 100%; padding: 16px; background: #f59e0b; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; box-shadow: 0 10px 20px -5px rgba(245,158,11,0.4); }
.generate-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(245,158,11,0.5); }
.loading-overlay { position: fixed; inset: 0; background: rgba(255,251,235,0.95); display: flex; align-items: center; justify-content: center; z-index: 999; color: #78350f; }
.loading-content { text-align: center; width: 100%; max-width: 300px; }
.spinner { width: 60px; height: 60px; border: 4px solid #fde68a; border-left-color: #f59e0b; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem; }
.progress-bar { width: 100%; height: 8px; background: #fde68a; border-radius: 10px; overflow: hidden; margin-top: 1rem; }
.progress-inner { height: 100%; background: #f59e0b; transition: width 0.3s; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
