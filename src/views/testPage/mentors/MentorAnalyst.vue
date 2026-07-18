<template>
  <div class="mentor-page analyst-theme">
    <div class="mentor-container">
      <div class="back-link-container">
        <router-link to="/ai-setup" class="back-link">
          <i class="fas fa-arrow-left"></i> {{ isRus ? 'Назад к наставникам' : 'Ustozlar tanloviga qaytish' }}
        </router-link>
      </div>

      <div class="mentor-profile">
        <div class="mentor-avatar">
          <i class="fas fa-laptop-code"></i>
        </div>
        <div class="mentor-info">
          <h1>{{ isRus ? 'Кибер Аналитик' : 'Kiber Tahlilchi' }}</h1>
          <p>{{ isRus ? 'Инициализация системы... Подготовка хакерских задач и тестов завершена.' : 'Tizim ishga tushmoqda... Xakerlik topshiriqlari bazadan olinmoqda.' }}</p>
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
            <input type="text" v-model="form.topic" required :placeholder="isRus ? 'Например: Циклы for и while' : 'Masalan: for va while tsikllari'" class="topic-input" />
          </div>

          <button type="submit" class="generate-btn" :disabled="loading">
            <i class="fas fa-terminal"></i>
            <span>{{ isRus ? '> Запустить скрипт' : '> Skriptni ishga tushirish' }}</span>
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

const { loading, progressPercentage, currentStatusMessage, generateTest } = useAIGenerator('analyst', isRus);

const form = reactive({ subject: 'Dasturlash', level: 'advanced', topic: '' });
const subjects = ['English', 'O\'zbek tili', 'Matematika', 'Tarix', 'Fizika', 'Informatika', 'Dasturlash'];
const levels = [
  { id: 'elementary', nameUz: 'Boshlang\'ich', nameRu: 'Начальный', icon: 'fas fa-baby-carriage' },
  { id: 'intermediate', nameUz: 'O\'rta', nameRu: 'Средний', icon: 'fas fa-graduation-cap' },
  { id: 'advanced', nameUz: 'Yuqori', nameRu: 'Продвинутый', icon: 'fas fa-crown' }
];

const submit = () => {
  const prompt = "You are a Cyber-Analyst AI. Frame the questions as 'system diagnostics', 'mission logs', or 'data decryption tasks'. Use a robotic, highly technical, and precise tone. 💻📡";
  generateTest(form.subject, form.level, form.topic, prompt);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
.mentor-page { min-height: 100vh; padding: 2rem 1.5rem; font-family: 'Plus Jakarta Sans', sans-serif; background: #022c22; color: #10b981; }
.mentor-container { max-width: 600px; margin: 0 auto; }
.back-link { color: #34d399; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 2rem; font-family: 'Fira Code', monospace; }
.mentor-profile { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
.mentor-avatar { width: 80px; height: 80px; background: #064e3b; border: 2px solid #10b981; color: #10b981; border-radius: 0; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: 0 0 15px rgba(16,185,129,0.5); }
.mentor-info h1 { font-size: 1.8rem; font-weight: 800; color: #34d399; margin: 0 0 0.5rem 0; font-family: 'Fira Code', monospace; text-transform: uppercase; }
.mentor-info p { color: #6ee7b7; margin: 0; line-height: 1.5; font-size: 0.95rem; font-family: 'Fira Code', monospace; }
.setup-glass-card { background: #064e3b; border-radius: 0; padding: 2rem; border: 1px solid #10b981; box-shadow: 0 0 30px rgba(16,185,129,0.1); }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: 600; color: #34d399; margin-bottom: 0.5rem; font-size: 0.85rem; text-transform: uppercase; font-family: 'Fira Code', monospace; }
.select-wrapper { position: relative; }
.select-wrapper select, .topic-input { width: 100%; padding: 14px 16px; border: 1px solid #10b981; border-radius: 0; font-family: 'Fira Code', monospace; font-size: 1rem; font-weight: 600; outline: none; transition: 0.2s; background: #022c22; color: #6ee7b7;}
.select-wrapper select:focus, .topic-input:focus { box-shadow: inset 0 0 10px rgba(16,185,129,0.3); }
.select-arrow { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #10b981; pointer-events: none; }
.pills-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.level-pill { padding: 12px; border: 1px solid #10b981; background: #022c22; border-radius: 0; font-weight: 600; font-family: 'Fira Code', monospace; color: #047857; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: 0.2s; }
.level-pill.active { background: #10b981; color: #022c22; }
.level-pill:hover:not(.active) { background: #064e3b; color: #34d399; }
.generate-btn { width: 100%; padding: 16px; background: transparent; border: 2px solid #10b981; color: #10b981; border-radius: 0; font-size: 1.1rem; font-weight: 600; font-family: 'Fira Code', monospace; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; box-shadow: 0 0 15px rgba(16,185,129,0.2); }
.generate-btn:hover { background: #10b981; color: #022c22; box-shadow: 0 0 25px rgba(16,185,129,0.5); }
.loading-overlay { position: fixed; inset: 0; background: rgba(2,44,34,0.95); display: flex; align-items: center; justify-content: center; z-index: 999; color: #34d399; font-family: 'Fira Code', monospace; }
.loading-content { text-align: center; width: 100%; max-width: 400px; }
.spinner { width: 60px; height: 60px; border: 4px solid #064e3b; border-left-color: #10b981; border-radius: 0; animation: spin 1s linear infinite; margin: 0 auto 1.5rem; }
.progress-bar { width: 100%; height: 8px; background: #064e3b; overflow: hidden; margin-top: 1rem; border: 1px solid #10b981; }
.progress-inner { height: 100%; background: #10b981; transition: width 0.3s; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
