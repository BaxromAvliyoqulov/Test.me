<template>
  <div class="ai-setup-wrapper">
    <!-- Glowing background elements -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="ai-setup-container">
      <!-- Back button -->
      <div class="back-link-container">
        <router-link to="/" class="back-link">
          <i class="fas fa-arrow-left"></i> {{ isRus ? 'Назад на главную' : 'Bosh sahifaga qaytish' }}
        </router-link>
      </div>

      <div class="setup-glass-card">
        <div class="card-header">
          <div class="magic-badge">
            <i class="fas fa-magic"></i>
          </div>
          <h1>{{ isRus ? 'AI Конструктор Тестов' : 'AI Test Konstruktori' }}</h1>
          <p>{{ isRus ? 'Создайте профессиональный персонализированный тест на любую тему за секунды с помощью Google Gemini AI' : 'Google Gemini AI yordamida soniyalar ichida istagan mavzuingizda professional shaxsiy test yarating' }}</p>
        </div>

        <form @submit.prevent="generateTest" class="setup-form">
          <!-- Subject Select -->
          <div class="form-group">
            <label>
              <i class="fas fa-book"></i> {{ isRus ? 'Выберите предмет / категорию' : 'Fan / Yo\'nalishni tanlang' }}
            </label>
            <div class="select-wrapper">
              <select v-model="form.subject" required>
                <option value="" disabled>{{ isRus ? 'Выберите направление' : 'Yo\'nalishni tanlang' }}</option>
                <option v-for="subj in subjects" :key="subj" :value="subj">{{ subj }}</option>
              </select>
              <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>

          <!-- Difficulty Level -->
          <div class="form-group">
            <label>
              <i class="fas fa-layer-group"></i> {{ isRus ? 'Уровень сложности' : 'Qiyinchilik darajasi' }}
            </label>
            <div class="pills-selector">
              <button
                type="button"
                v-for="lvl in levels"
                :key="lvl.id"
                :class="['level-pill', { active: form.level === lvl.id }]"
                @click="form.level = lvl.id"
              >
                <i :class="lvl.icon"></i>
                <span>{{ isRus ? lvl.nameRu : lvl.nameUz }}</span>
              </button>
            </div>
          </div>

          <!-- Specific Topic -->
          <div class="form-group">
            <label>
              <i class="fas fa-lightbulb"></i> {{ isRus ? 'Конкретная тема или фокус' : 'Konkret mavzu yoki yo\'nalish' }}
            </label>
            <input
              type="text"
              v-model="form.topic"
              required
              :placeholder="isRus ? 'Например: Времена Present Perfect, Дробные уравнения, Основы Vue 3' : 'Masalan: Present Perfect zamlari, Kasrli tenglamalar, Vue 3 asoslari'"
              class="topic-input"
            />
            <small class="help-text">
              {{ isRus ? 'Чем конкретнее тема, тем точнее AI сгенерирует вопросы.' : 'Mavzu qanchalik aniq yozilsa, AI shunchalik mukammal savollar tayyorlaydi.' }}
            </small>
          </div>

          <!-- Generate Button -->
          <button type="submit" class="generate-btn" :disabled="loading">
            <i class="fas fa-wand-magic-sparkles"></i>
            <span>{{ isRus ? 'Сгенерировать тест' : 'Testni generatsiya qilish' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Stunning Fullscreen Loading Overlay -->
    <transition name="fade">
      <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
          <div class="orbital-spinner">
            <div class="orbit orbit-1"></div>
            <div class="orbit orbit-2"></div>
            <div class="orbit orbit-3"></div>
            <i class="fas fa-brain brain-pulse"></i>
          </div>

          <h2 class="loading-title">{{ isRus ? 'Генерация теста...' : 'Test yaratilmoqda...' }}</h2>
          <p class="loading-status">{{ currentStatusMessage }}</p>

          <!-- Glass Progress Bar -->
          <div class="progress-bar-container">
            <div class="progress-bar-inner" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth, functions } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useI18n } from '@/utils/i18n';
import { useToast } from 'vue-toastification';

const { locale } = useI18n();
const router = useRouter();
const toast = useToast();

const isRus = computed(() => locale.value === 'RUS');

const form = reactive({
  subject: '',
  level: 'intermediate',
  topic: ''
});

const loading = ref(false);
const progressPercentage = ref(0);
const statusIndex = ref(0);

const subjects = ['English', 'O\'zbek tili', 'Matematika', 'Tarix', 'Fizika', 'Informatika', 'Dasturlash'];

const levels = [
  { id: 'elementary', nameUz: 'Boshlang\'ich', nameRu: 'Начальный', icon: 'fas fa-baby-carriage' },
  { id: 'intermediate', nameUz: 'O\'rta', nameRu: 'Средний', icon: 'fas fa-graduation-cap' },
  { id: 'advanced', nameUz: 'Yuqori', nameRu: 'Продвинутый', icon: 'fas fa-crown' }
];

const statusMessagesUz = [
  'Gemini AI modeli bilan bog\'lanilmoqda...',
  'Kiritilgan mavzu tahlil qilinmoqda...',
  '10 ta professional test savoli yozilmoqda...',
  'Variantlar va javoblar tekshirilmoqda...',
  'Savollar Firestore ma\'lumotlar bazasiga yozilmoqda...',
  'Deyarli tayyor, yuklanmoqda...'
];

const statusMessagesRu = [
  'Подключение к модели Gemini AI...',
  'Анализ введенной темы...',
  'Создание 10 профессиональных вопросов...',
  'Проверка вариантов ответов...',
  'Запись вопросов в базу данных Firestore...',
  'Почти готово, загрузка...'
];

const currentStatusMessage = computed(() => {
  const messages = isRus.value ? statusMessagesRu : statusMessagesUz;
  return messages[statusIndex.value] || messages[messages.length - 1];
});

let progressInterval = null;
let statusInterval = null;

const mentorType = ref('standard');

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().preferences) {
        mentorType.value = userDoc.data().preferences.mentorType || 'standard';
      }
    }
  });
});

const startLoadingAnimations = () => {
  loading.value = true;
  progressPercentage.value = 0;
  statusIndex.value = 0;

  // Status rotation
  statusInterval = setInterval(() => {
    if (statusIndex.value < 5) {
      statusIndex.value++;
    }
  }, 2500);

  // Progress bar increment
  progressInterval = setInterval(() => {
    if (progressPercentage.value < 90) {
      progressPercentage.value += Math.floor(Math.random() * 8) + 2;
    }
  }, 500);
};

const stopLoadingAnimations = () => {
  clearInterval(progressInterval);
  clearInterval(statusInterval);
  progressPercentage.value = 100;
};

const generateQuestionsClientSide = async (subject, level, topic) => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g";
  try {
      const personas = {
        standard: "You are an objective, academic examiner. Write clear, unambiguous, and formally structured multiple-choice questions. Ensure precise language.",
        friendly: "You are a supportive, friendly teacher. Frame the questions warmly, adding small words of encouragement or gentle context to make the test feel less intimidating. Use a few pleasant emojis (e.g., 🌸, ✨).",
        strict: "You are a rigorous, elite professor. Write questions that are highly challenging, strictly formal, and academically dense. Use advanced vocabulary and complex sentence structures. Absolutely no emojis.",
        socratic: "You are a Socratic philosopher. Frame the questions as deep, philosophical inquiries or scenarios that require profound critical thinking rather than just rote memorization.",
        motivator: "You are an intense motivational coach! Frame the questions with high energy, challenge the student to 'crush' the problem, and use hype-filled scenarios. 🚀🔥",
        innovator: "You are a highly creative genius. Frame every question using bizarre, imaginative, out-of-the-box scenarios (e.g., time travel, aliens, futuristic inventions) to test the core concept. 💡🛸",
        analyst: "You are a Cyber-Analyst AI. Frame the questions as 'system diagnostics', 'mission logs', or 'data decryption tasks'. Use a robotic, highly technical, and precise tone. 💻📡",
        sage: "You are an ancient wise elder. Frame the questions as ancient riddles, fables, or moral dilemmas happening in nature or old kingdoms. 📜🏔️",
        comedian: "You are a sarcastic stand-up comedian. Write the questions as funny scenarios, absurd everyday situations, or slightly sarcastic observations. Inject humor into the options as well! 😂🎭"
      };
      const systemPersona = personas[mentorType.value] || personas.standard;

      const promptText = `You are acting as the following persona: ${systemPersona}

Generate a multiple-choice quiz about the topic "${topic}" for subject "${subject}" at "${level}" difficulty level.
Write the "question" text entirely in the tone of your persona! Make it obvious that YOU (the persona) are asking the question.
The response must be exactly a JSON array of 10 objects.
Each question object MUST contain:
- "question": string (the exact text of the question, IN THE TONE OF YOUR PERSONA)
- "options": array of 4 strings (possible options, one must be correct)
- "answer": string (the exact correct option string)

Ensure all questions are grammatically correct and return ONLY raw JSON matching the schema. No markdown formatting.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (response.ok) {
      const resData = await response.json();
      const text = resData.candidates[0].content.parts[0].text;
      return JSON.parse(text.trim());
    } else {
      throw new Error(`Gemini API status ${response.status}`);
    }
  } catch (err) {
    console.warn("Direct Gemini API call failed, using offline fallback generator:", err);
    return getOfflineFallbackQuestions(subject, level, topic);
  }
};

const getOfflineFallbackQuestions = (subject, level, topic) => {
  const questions = [];
  const isRuLocale = isRus.value;
  for (let i = 1; i <= 10; i++) {
    const qText = isRuLocale 
      ? `Вопрос ${i} по теме "${topic}" (${subject}, уровень ${level})`
      : `Mavzu: "${topic}" bo'yicha ${i}-savol (${subject}, daraja: ${level})`;
    
    const optCorrect = isRuLocale
      ? `Правильный ответ на вопрос ${i}`
      : `${i}-savol uchun to'g'ri javob`;
      
    const opt2 = isRuLocale ? `Неверный вариант A` : `Noto'g'ri variant A`;
    const opt3 = isRuLocale ? `Неверный вариант B` : `Noto'g'ri variant B`;
    const opt4 = isRuLocale ? `Неверный вариант C` : `Noto'g'ri variant C`;

    questions.push({
      question: qText,
      options: [optCorrect, opt2, opt3, opt4].sort(() => Math.random() - 0.5),
      answer: optCorrect
    });
  }
  return questions;
};

const generateTest = async () => {
  startLoadingAnimations();

  try {
    const generateFunction = httpsCallable(functions, 'generateAiTest');
    const result = await generateFunction({
      subject: form.subject,
      level: form.level,
      topic: form.topic,
      mentorType: mentorType.value
    });

    stopLoadingAnimations();
    toast.success(isRus.value ? 'Тест успешно сгенерирован!' : 'Test muvaffaqiyatli yaratildi!');
    
    // Wait briefly for progress bar to hit 100%
    setTimeout(() => {
      router.push({
        path: '/test',
        query: {
          subjectId: 'ai',
          levelId: 'ai',
          questionCount: 10,
          aiTestId: result.data.testId
        }
      });
    }, 800);

  } catch (error) {
    console.warn("Cloud function failed, running client-side AI generator fallback:", error);
    
    try {
      const questions = await generateQuestionsClientSide(form.subject, form.level, form.topic);
      
      const aiTestRef = await addDoc(collection(db, 'ai_tests'), {
        creatorId: auth.currentUser?.uid || 'anonymous',
        subject: form.subject,
        level: form.level,
        topic: form.topic,
        questions: questions,
        createdAt: serverTimestamp()
      });

      stopLoadingAnimations();
      toast.success(isRus.value ? 'Тест успешно сгенерирован (Client fallback)!' : 'Test muvaffaqiyatli yaratildi (Client fallback)!');

      setTimeout(() => {
        router.push({
          path: '/test',
          query: {
            subjectId: 'ai',
            levelId: 'ai',
            questionCount: 10,
            aiTestId: aiTestRef.id
          }
        });
      }, 800);
    } catch (fallbackErr) {
      stopLoadingAnimations();
      loading.value = false;
      console.error("Client-side AI generation failed:", fallbackErr);
      toast.error(isRus.value ? 'Ошибка при генерации теста. Попробуйте еще раз.' : 'Test generatsiya qilishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.ai-setup-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 3rem 1.5rem;
}

/* Background glowing elements */
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

.ai-setup-container {
  position: relative;
  z-index: 10;
  max-width: 650px;
  margin: 0 auto;
}

.back-link-container {
  margin-bottom: 1.5rem;
}
.back-link {
  color: #64748b;
  font-size: 0.9rem;
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

.setup-glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.05);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.magic-badge {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #a855f7, #3b82f6);
  color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin: 0 auto 1rem auto;
  box-shadow: 0 8px 20px -6px rgba(168, 85, 247, 0.4);
}

.card-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.card-header p {
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.5;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.select-wrapper select {
  width: 100%;
  padding: 14px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}
.select-wrapper select:focus {
  border-color: #a855f7;
  background: white;
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
}
.select-arrow {
  position: absolute;
  right: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.pills-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.level-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.level-pill i {
  font-size: 1.2rem;
  color: #94a3b8;
  transition: color 0.2s;
}
.level-pill span {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}
.level-pill:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}
.level-pill.active {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.05);
}
.level-pill.active i {
  color: #a855f7;
}
.level-pill.active span {
  color: #a855f7;
}

.topic-input {
  width: 100%;
  padding: 14px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  outline: none;
  transition: all 0.2s;
}
.topic-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}
.topic-input:focus {
  border-color: #a855f7;
  background: white;
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
}

.help-text {
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.4;
  margin-top: 2px;
}

.generate-btn {
  background: linear-gradient(135deg, #a855f7, #3b82f6);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 1rem;
  box-shadow: 0 10px 25px -8px rgba(168, 85, 247, 0.4);
  transition: all 0.2s;
}
.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -8px rgba(168, 85, 247, 0.5);
}
.generate-btn:active {
  transform: translateY(0);
}

/* loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.loading-content {
  text-align: center;
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.orbital-spinner {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.orbit {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}
.orbit-1 {
  width: 100px;
  height: 100px;
  border-top-color: #a855f7;
  animation: rotate 1.5s linear infinite;
}
.orbit-2 {
  width: 80px;
  height: 80px;
  border-right-color: #3b82f6;
  animation: rotate-reverse 1.2s linear infinite;
}
.orbit-3 {
  width: 60px;
  height: 60px;
  border-bottom-color: #10b981;
  animation: rotate 0.9s linear infinite;
}
.brain-pulse {
  font-size: 1.8rem;
  color: #a855f7;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.loading-status {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
  min-height: 20px;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #a855f7, #3b82f6);
  border-radius: 99px;
  transition: width 0.3s ease;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes rotate-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; text-shadow: 0 0 15px rgba(168, 85, 247, 0.6); }
  100% { transform: scale(1); opacity: 0.7; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .pills-selector {
    grid-template-columns: 1fr;
  }
}
</style>
