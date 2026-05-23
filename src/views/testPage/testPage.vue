<template>
  <div class="test-page-wrapper">
    <!-- Neon glow lights -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="test-page-container">
      <!-- Loading Screen -->
      <div v-if="state.loading" class="glass-status-card loading-card">
        <div class="orbital-spinner">
          <div class="orbit orbit-1"></div>
          <div class="orbit orbit-2"></div>
          <div class="orbit orbit-3"></div>
          <i class="fas fa-file-signature text-purple"></i>
        </div>
        <h3>{{ isRus ? 'Загрузка теста...' : 'Test yuklanmoqda...' }}</h3>
        <p>{{ isRus ? 'Пожалуйста, подождите, пока мы подготавливаем вопросы.' : 'Iltimos kuting, savollar tayyorlanmoqda.' }}</p>
      </div>

      <!-- Error Screen -->
      <div v-else-if="state.error" class="glass-status-card error-card">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>{{ isRus ? 'Ошибка загрузки' : 'Yuklashda xatolik' }}</h3>
        <p>{{ state.error }}</p>
        <button class="action-btn retry-btn" @click="fetchQuestions">
          <i class="fas fa-redo"></i> {{ isRus ? 'Попробовать снова' : 'Qaytadan urinish' }}
        </button>
        <button class="action-btn home-btn secondary" @click="goHome">
          <i class="fas fa-home"></i> {{ isRus ? 'На главную' : 'Bosh sahifaga' }}
        </button>
      </div>

      <!-- Warning/Empty Screen -->
      <div v-else-if="state.questions.length === 0" class="glass-status-card warning-card">
        <div class="warning-icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <h3>{{ isRus ? 'Тесты не найдены' : 'Testlar topilmadi' }}</h3>
        <p>{{ isRus ? 'В этой категории пока нет загруженных тестов.' : 'Ushbu yo\'nalishda hozircha testlar mavjud emas.' }}</p>
        <button class="action-btn home-btn" @click="goHome">
          <i class="fas fa-arrow-left"></i> {{ isRus ? 'Назад к выбору' : 'Orqaga qaytish' }}
        </button>
      </div>

      <!-- Active Quiz Interface -->
      <div v-else-if="!state.testFinished" class="quiz-glass-card">
        <!-- Header Info -->
        <div class="quiz-header">
          <div class="header-left">
            <h2 class="subject-title">
              {{ displaySubject }}
            </h2>
            <span class="level-badge" :class="displayLevel.toLowerCase()">
              {{ displayLevel }}
            </span>
          </div>
          <div class="header-right">
            <!-- Elegant Timer Badge -->
            <div class="timer-badge" :class="{ danger: state.timer < 60 }">
              <i class="far fa-clock"></i>
              <span>{{ formattedTime }}</span>
            </div>
          </div>
        </div>

        <!-- Custom Styled Progress Bar -->
        <div class="progress-section">
          <div class="progress-meta">
            <span class="progress-text">
              {{ isRus ? 'Вопрос' : 'Savol' }} <strong>{{ state.currentPage + 1 }}</strong> {{ isRus ? 'из' : 'dan' }} <strong>{{ state.questions.length }}</strong>
            </span>
            <span class="progress-pct">{{ Math.round(((state.currentPage + 1) / state.questions.length) * 100) }}%</span>
          </div>
          <div class="glass-progress-bar">
            <div class="progress-fill" :style="{ width: ((state.currentPage + 1) / state.questions.length) * 100 + '%' }"></div>
          </div>
        </div>

        <!-- Question Box -->
        <div class="question-container">
          <h3 class="question-title">
            {{ currentQuestion?.question }}
          </h3>

          <!-- Premium Custom Answer Options -->
          <div class="options-grid">
            <button
              v-for="(option, index) in currentQuestion?.options"
              :key="index"
              class="option-card"
              :class="{ selected: state.selectedAnswer === index }"
              @click="selectOption(index)"
            >
              <div class="option-marker">
                <span class="letter-marker">{{ ['A', 'B', 'C', 'D'][index] }}</span>
                <span class="check-marker"><i class="fas fa-check"></i></span>
              </div>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>
        </div>

        <!-- Footer Control & Pagination -->
        <div class="quiz-footer">
          <!-- Pagination List -->
          <div class="pagination-scroller">
            <button
              v-for="(q, index) in state.questions"
              :key="index"
              class="pag-dot"
              :class="{
                active: state.currentPage === index,
                answered: isQuestionAnswered(index) && state.currentPage !== index
              }"
              @click="goToPage(index)"
            >
              {{ index + 1 }}
            </button>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="footer-actions">
            <button class="action-btn secondary back-btn" @click="goToPrev" :disabled="state.currentPage === 0">
              <i class="fas fa-chevron-left"></i> {{ isRus ? 'Назад' : 'Oldingisi' }}
            </button>
            
            <button
              class="action-btn next-btn"
              :class="{ finish: state.currentPage === state.questions.length - 1 }"
              @click="submitAnswer"
            >
              <span>{{ state.currentPage < state.questions.length - 1 ? (isRus ? 'Далее' : 'Keyingisi') : (isRus ? 'Завершить' : 'Yakunlash') }}</span>
              <i class="fas" :class="state.currentPage < state.questions.length - 1 ? 'fa-chevron-right' : 'fa-flag-checkered'"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Success / Results Card -->
      <div v-else class="glass-status-card success-card">
        <div class="success-header">
          <div class="success-badge">
            <i class="fas fa-trophy trophy-anim"></i>
          </div>
          <h2>{{ isRus ? 'Тест Завершен!' : 'Test yakunlandi!' }}</h2>
          <p>{{ isRus ? 'Поздравляем с отличной попыткой! Ваши результаты:' : 'Ajoyib urinish! Sizning natijalaringiz:' }}</p>
        </div>

        <!-- Score Presentation -->
        <div class="score-ring-container">
          <div class="score-ring" :style="scoreRingStyle">
            <div class="score-ring-inner">
              <span class="score-number">{{ score }}</span>
              <span class="score-divider">/</span>
              <span class="score-total">{{ state.questions.length }}</span>
            </div>
          </div>
        </div>

        <div class="stats-overview">
          <div class="stat-box">
            <i class="fas fa-bullseye stat-icon accuracy"></i>
            <span class="stat-val">{{ Math.round((score / state.questions.length) * 100) }}%</span>
            <span class="stat-lbl">{{ isRus ? 'Точность' : 'Aniqlik' }}</span>
          </div>
          <div class="stat-box">
            <i class="fas fa-times-circle stat-icon errors"></i>
            <span class="stat-val">{{ state.questions.length - score }}</span>
            <span class="stat-lbl">{{ isRus ? 'Ошибки' : 'Xatolar' }}</span>
          </div>
          <div class="stat-box">
            <i class="fas fa-hourglass-half stat-icon duration"></i>
            <span class="stat-val">{{ timeSpent }}</span>
            <span class="stat-lbl">{{ isRus ? 'Время' : 'Vaqt' }}</span>
          </div>
        </div>

        <!-- TP Coin Reward Panel -->
        <div class="coin-reward-card" v-if="score > 0">
          <div class="coin-gold-wrapper">
            <img src="../../assets/img/tpCoin.png" alt="TP Coin" class="coin-gold-img animate-spin-slow" />
            <span class="reward-plus-badge">+{{ score }}</span>
          </div>
          <div class="reward-text-container">
            <h4>{{ isRus ? 'Вы заработали' : 'Siz qo\'lga kiritdingiz' }}</h4>
            <p>{{ score }} TP Coins</p>
          </div>
        </div>
        <div class="coin-reward-card empty-reward" v-else>
          <div class="coin-gold-wrapper opacity-50">
            <img src="../../assets/img/tpCoin.png" alt="TP Coin" class="coin-gold-img" />
          </div>
          <div class="reward-text-container">
            <h4>{{ isRus ? 'Коины не начислены' : 'Coinlar taqdim etilmadi' }}</h4>
            <p>{{ isRus ? 'Ответьте правильно хотя бы на 1 вопрос' : 'Kamida 1 ta savolga to\'g\'ri javob bering' }}</p>
          </div>
        </div>

        <div class="success-actions">
          <button class="action-btn review-trigger" @click="state.showReviewModal = true">
            <i class="fas fa-search-plus"></i> {{ isRus ? 'Анализ ответов' : 'Javoblar tahlili' }}
          </button>
          <button class="action-btn home-btn" @click="goHome">
            <i class="fas fa-home"></i> {{ isRus ? 'На главную' : 'Bosh sahifaga' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stunning Review Answers Overlay -->
    <transition name="fade">
      <div v-if="state.showReviewModal" class="modal-overlay" @click.self="state.showReviewModal = false">
        <div class="modal-glass-card review-modal-card">
          <div class="modal-header">
            <h3><i class="fas fa-tasks text-purple"></i> {{ isRus ? 'Анализ ответов' : 'Javoblar Tahlili' }}</h3>
            <button class="close-modal-btn" @click="state.showReviewModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body review-list-scroller">
            <div
              v-for="(question, index) in state.questions"
              :key="index"
              class="review-question-card"
              :class="{
                correct: isCorrectAnswer(index),
                incorrect: !isCorrectAnswer(index)
              }"
            >
              <h4 class="review-q-title">
                {{ index + 1 }}. {{ question.question }}
              </h4>

              <div class="review-options">
                <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  class="review-opt"
                  :class="{
                    'user-selected': state.selectedAnswers[index] === optIndex,
                    'is-correct': question.answer === option,
                    'is-incorrect': state.selectedAnswers[index] === optIndex && question.answer !== option
                  }"
                >
                  <div class="review-marker">
                    <i v-if="question.answer === option" class="fas fa-check-circle text-emerald"></i>
                    <i v-else-if="state.selectedAnswers[index] === optIndex" class="fas fa-times-circle text-rose"></i>
                    <span v-else class="letter-marker">{{ ['A', 'B', 'C', 'D'][optIndex] }}</span>
                  </div>
                  <span class="review-text">{{ option }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="action-btn secondary close-btn" @click="state.showReviewModal = false">
              {{ isRus ? 'Закрыть' : 'Yopish' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc, Timestamp, query, where, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '@/utils/i18n';

// Router and Locale
const router = useRouter();
const route = useRoute();
const { locale } = useI18n();

const emit = defineEmits(['test-completed']);

// Props definition
const props = defineProps({
  subjectId: { type: String, default: '' },
  levelId: { type: String, default: '' },
  questionCount: { type: Number, default: 10 },
});

const isRus = computed(() => locale.value === 'RUS');

// Compute active params dynamically (from props or route query)
const activeSubjectId = computed(() => {
  return props.subjectId || (route && route.query && route.query.subjectId) || '';
});

const activeLevelId = computed(() => {
  return props.levelId || (route && route.query && route.query.levelId) || '';
});

const activeQuestionCount = computed(() => {
  const queryCount = route && route.query && route.query.questionCount ? parseInt(route.query.questionCount) : null;
  return props.questionCount || queryCount || 10;
});

// Display names for subject and level
const displaySubject = computed(() => {
  const subj = activeSubjectId.value;
  return subj === 'ai' ? (isRus.value ? 'AI Конструктор' : 'AI Testi') : subj;
});

const displayLevel = computed(() => {
  const lvl = activeLevelId.value;
  return lvl === 'ai' ? (isRus.value ? 'Сгенерированный' : 'AI yaratgan') : lvl;
});

// State
const state = reactive({
  loading: true,
  error: null,
  questions: [],
  selectedAnswers: [],
  selectedAnswer: null,
  currentPage: 0,
  testFinished: false,
  showReviewModal: false,
  timer: 900,
  sessionId: null,
});

let intervalId = null;

// Formatted timer
const formattedTime = computed(() => {
  const m = Math.floor(state.timer / 60);
  const s = state.timer % 60;
  return `${m}:${s < 10 ? '0' + s : s}`;
});

// Time spent computed property
const timeSpent = computed(() => {
  const elapsed = 900 - state.timer;
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${s < 10 ? '0' + s : s}`;
});

// Helper to navigate home securely
const goHome = () => {
  emit('test-completed', {
    correctAnswers: score.value,
    totalQuestions: state.questions.length
  });
  router.push('/');
};

// Correct answers score
const score = computed(() => {
  return state.questions.reduce((acc, q, i) => {
    const selectedIdx = state.selectedAnswers[i];
    return selectedIdx !== null && selectedIdx !== undefined && q.options[selectedIdx] === q.answer ? acc + 1 : acc;
  }, 0);
});

// Dynamic circle border style for score ring
const scoreRingStyle = computed(() => {
  const ratio = state.questions.length ? score.value / state.questions.length : 0;
  const degrees = ratio * 360;
  return {
    background: `conic-gradient(from 0deg, #a855f7 0deg ${degrees}deg, rgba(255, 255, 255, 0.1) ${degrees}deg 360deg)`
  };
});

const currentQuestion = computed(() => {
  return state.questions && state.questions.length > state.currentPage
    ? state.questions[state.currentPage]
    : null;
});

// Methods
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const isQuestionAnswered = (index) => {
  return state.selectedAnswers[index] !== null && state.selectedAnswers[index] !== undefined;
};

const selectOption = (index) => {
  state.selectedAnswer = index;
  state.selectedAnswers[state.currentPage] = index;
};

const goToPage = (index) => {
  state.currentPage = index;
  state.selectedAnswer = state.selectedAnswers[index];
};

const goToPrev = () => {
  if (state.currentPage > 0) {
    goToPage(state.currentPage - 1);
  }
};

const submitAnswer = () => {
  if (state.selectedAnswer === null) {
    alert(isRus.value ? 'Пожалуйста, выберите ответ' : 'Iltimos, javoblardan birini tanlang');
    return;
  }

  if (state.currentPage < state.questions.length - 1) {
    goToPage(state.currentPage + 1);
  } else {
    finishTest();
  }
};

const isCorrectAnswer = (qIndex) => {
  const selected = state.selectedAnswers[qIndex];
  const q = state.questions[qIndex];
  return selected !== null && selected !== undefined && q.options[selected] === q.answer;
};

// Fetch questions safely supporting both individual docs and packaging
const fetchQuestions = async (options) => {
  if (options && options.sessionId) {
    state.sessionId = options.sessionId;
  }
  try {
    state.loading = true;
    state.error = null;

    const isAi = activeSubjectId.value === 'ai';

    if (isAi) {
      const aiTestId = route?.query?.aiTestId;
      if (!aiTestId) {
        throw new Error(isRus.value ? "Идентификатор AI теста не указан" : "AI Test ID ko'rsatilmagan");
      }

      const docRef = doc(db, 'ai_tests', aiTestId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(isRus.value ? "Тесты AI не найдены" : "AI Test savollari topilmadi");
      }

      const testData = docSnap.data();
      state.questions = testData.questions;
      state.selectedAnswers = Array(state.questions.length).fill(null);
      state.currentPage = 0;
      state.selectedAnswer = null;
      state.testFinished = false;
      return;
    }

    // Standard local tests query
    const testsRef = collection(
      db,
      'subjects',
      activeSubjectId.value,
      'levels',
      activeLevelId.value,
      'tests'
    );
    const snapshot = await getDocs(testsRef);

    // Support both document lists containing questions directly and package document formats
    const questionsList = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.questions)) {
        questionsList.push(...data.questions);
      } else if (data.question && Array.isArray(data.options)) {
        questionsList.push(data);
      }
    });

    if (!questionsList.length) {
      throw new Error(isRus.value ? 'Тесты не найдены' : 'Testlar topilmadi');
    }

    state.questions = shuffleArray(questionsList).slice(
      0,
      activeQuestionCount.value
    );
    state.selectedAnswers = Array(state.questions.length).fill(null);
    state.currentPage = 0;
    state.selectedAnswer = null;
    state.testFinished = false;
  } catch (err) {
    console.error('Error fetching questions:', err);
    state.error = err.message;
  } finally {
    state.loading = false;
  }
};

const finishTest = async () => {
  try {
    state.testFinished = true;
    clearInterval(intervalId);

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error(isRus.value ? 'Пользователь не авторизован' : 'Foydalanuvchi tizimga kirmagan');

    // Get count of user's previous test results for test_number
    const resultsRef = collection(db, 'results');
    const q = query(resultsRef, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const testNumber = snapshot.size + 1;

    // Build results object without undefined keys
    const resultData = {
      userId: user.uid,
      username: user.displayName || user.email || 'User',
      sessionId: state.sessionId || 'fallback_local',
      subject: activeSubjectId.value || 'General',
      test_level: activeLevelId.value || 'General',
      score: score.value,
      total: state.questions.length,
      answers: state.selectedAnswers.map((idx, i) => idx !== null && idx !== undefined ? state.questions[i].options[idx] : null),
      timestamp: Timestamp.now(),
      test_number: testNumber,
    };

    await addDoc(collection(db, 'results'), resultData);

    // Reward TP Coins for correct answers (1 coin per correct answer)
    const coinsEarned = score.value;
    if (coinsEarned > 0) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          points: increment(coinsEarned)
        });

        // Record transaction
        const txRef = collection(userDocRef, 'transactions');
        await addDoc(txRef, {
          action: isRus.value
            ? `Награда за тест (${displaySubject.value} - ${displayLevel.value})`
            : `Test yechish mukofoti (${displaySubject.value} - ${displayLevel.value})`,
          points: coinsEarned,
          timestamp: Timestamp.now()
        });
        console.log(`Successfully rewarded ${coinsEarned} TP Coins to user.`);
      } catch (coinErr) {
        console.error("Error rewarding TP Coins:", coinErr);
      }
    }

    // Client-side fallback for certificate evaluation
    if (score.value / state.questions.length >= 0.8) {
      try {
        const prevResults = snapshot.docs.map(doc => doc.data());
        prevResults.push(resultData);

        const elementaryCount = prevResults.filter(r => r.test_level && r.test_level.toLowerCase().includes('elem')).length;
        const intermediateCount = prevResults.filter(r => r.test_level && r.test_level.toLowerCase().includes('inter')).length;
        const advancedCount = prevResults.filter(r => r.test_level && r.test_level.toLowerCase().includes('adv')).length;
        const totalCount = prevResults.length;

        const certsToCheck = [
          {
            id: 'elementary_graduate',
            condition: elementaryCount >= 3,
            nameUz: 'Boshlang\'ich Savodxon',
            nameRu: 'Начальный Грамотей',
            descUz: 'Elementary darajasida kamida 3 ta test yechganda beriladi.',
            descRu: 'Выдается за решение не менее 3 тестов на уровне Elementary.'
          },
          {
            id: 'intermediate_expert',
            condition: intermediateCount >= 5,
            nameUz: 'O\'rta darajali Mutaxassis',
            nameRu: 'Средний Эксперт',
            descUz: 'Intermediate darajasida kamida 5 ta test yechganda beriladi.',
            descRu: 'Выдается за решение не менее 5 тестов на уровне Intermediate.'
          },
          {
            id: 'advanced_professional',
            condition: advancedCount >= 3,
            nameUz: 'Professional Bilimdon',
            nameRu: 'Продвинутый Профи',
            descUz: 'Advanced darajasida kamida 3 ta test yechganda beriladi.',
            descRu: 'Выдается за решение не менее 3 тестов на уровне Advanced.'
          },
          {
            id: 'ai_enthusiast',
            condition: totalCount >= 5,
            nameUz: 'Aktiv Bilim Oluvchi',
            nameRu: 'Активный Ученик',
            descUz: 'Platformada jami 5 tadan ortiq test yechganingizda beriladi.',
            descRu: 'Выдается за прохождение более 5 тестов на платформе.'
          }
        ];

        for (const cert of certsToCheck) {
          if (cert.condition) {
            const certsRef = collection(db, 'certificates');
            const certQ = query(certsRef, where('userId', '==', user.uid), where('certType', '==', cert.id));
            const certSnap = await getDocs(certQ);

            if (certSnap.empty) {
              const uidPart = user.uid.substring(0, 8).toUpperCase();
              const certCode = `CERT-${uidPart}-${cert.id.substring(0, 4).toUpperCase()}`;

              await addDoc(collection(db, 'certificates'), {
                certId: certCode,
                userId: user.uid,
                userName: user.displayName || user.email || 'Foydalanuvchi',
                certType: cert.id,
                nameUz: cert.nameUz,
                nameRu: cert.nameRu,
                descUz: cert.descUz,
                descRu: cert.descRu,
                issuedAt: Timestamp.now(),
              });
              console.log(`Issued cert ${cert.id} client-side`);
            }
          }
        }
      } catch (certErr) {
        console.error("Error evaluating client-side certificate issuance:", certErr);
      }
    }
  } catch (err) {
    console.error('Error saving result:', err);
    state.error = err.message;
  }
};

// Lifecycle
onMounted(() => {
  fetchQuestions();
  intervalId = setInterval(() => {
    if (state.timer > 0) state.timer--;
    else finishTest();
  }, 1000);
});

onUnmounted(() => clearInterval(intervalId));

defineExpose({ initializeTest: fetchQuestions });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.test-page-wrapper {
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

.test-page-container {
  position: relative;
  z-index: 10;
  max-width: 800px;
  margin: 0 auto;
}

/* Glass Status Cards (Loading, Error, Warning, Success) */
.glass-status-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.glass-status-card h3 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
}

.glass-status-card p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 450px;
}

/* Actions */
.action-btn {
  background: linear-gradient(135deg, #a855f7, #3b82f6);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  box-shadow: 0 10px 25px -8px rgba(168, 85, 247, 0.4);
}
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -8px rgba(168, 85, 247, 0.5);
}
.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
  box-shadow: none;
}
.action-btn.secondary:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: translateY(-2px);
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Spinner */
.orbital-spinner {
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.orbit {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}
.orbit-1 {
  width: 90px;
  height: 90px;
  border-top-color: #a855f7;
  animation: rotate 1.5s linear infinite;
}
.orbit-2 {
  width: 72px;
  height: 72px;
  border-right-color: #3b82f6;
  animation: rotate-reverse 1.2s linear infinite;
}
.orbit-3 {
  width: 54px;
  height: 54px;
  border-bottom-color: #10b981;
  animation: rotate 0.9s linear infinite;
}
.orbital-spinner i {
  font-size: 1.5rem;
}
.text-purple {
  color: #a855f7;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes rotate-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

/* Error & Warning Icons */
.error-icon {
  width: 70px;
  height: 70px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.warning-icon {
  width: 70px;
  height: 70px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

/* Quiz Interface Card */
.quiz-glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  padding: 2.5rem;
  box-shadow: 0 20px 45px -15px rgba(15, 23, 42, 0.05);
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1.5px solid rgba(226, 232, 240, 0.8);
  padding-bottom: 1.25rem;
}

.subject-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}

.level-badge {
  display: inline-block;
  padding: 5px 12px;
  font-size: 0.75rem;
  font-weight: 800;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}
.level-badge.advanced {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.level-badge.intermediate {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.timer-badge {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 10px 18px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}
.timer-badge.danger {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  animation: pulse-timer 1s infinite alternate;
}

@keyframes pulse-timer {
  from { transform: scale(1); }
  to { transform: scale(1.03); }
}

/* Progress Section */
.progress-section {
  margin-bottom: 2.25rem;
}
.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 8px;
}
.glass-progress-bar {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a855f7, #3b82f6);
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Question Section */
.question-container {
  margin-bottom: 2.5rem;
}
.question-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.5;
  margin-bottom: 1.75rem;
}

/* Options Grid */
.options-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  outline: none;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.option-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.option-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.check-marker {
  display: none;
}

.option-text {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.4;
}

/* Selected option states */
.option-card.selected {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.05);
}
.option-card.selected .option-marker {
  background: #a855f7;
  color: white;
}
.option-card.selected .letter-marker {
  display: none;
}
.option-card.selected .check-marker {
  display: inline;
}
.option-card.selected .option-text {
  color: #a855f7;
}

/* Quiz Footer */
.quiz-footer {
  border-top: 1.5px solid rgba(226, 232, 240, 0.8);
  padding-top: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pagination-scroller {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pagination-scroller::-webkit-scrollbar {
  display: none;
}

.pag-dot {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.pag-dot:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.pag-dot.active {
  background: linear-gradient(135deg, #a855f7, #3b82f6);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35);
}
.pag-dot.answered:not(.active) {
  border-color: #a855f7;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.04);
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.next-btn.finish {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.4);
}

/* Success Card Ring */
.score-ring-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}
.score-ring {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-shadow: 0 10px 25px -5px rgba(168, 85, 247, 0.2);
}
.score-ring-inner {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 2px;
}
.score-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #a855f7;
}
.score-divider {
  font-size: 1.2rem;
  color: #94a3b8;
  margin: 0 2px;
}
.score-total {
  font-size: 1.4rem;
  font-weight: 700;
  color: #64748b;
}

.success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  gap: 12px;
}

.success-badge {
  margin: 0 auto;
  width: 75px;
  height: 75px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -8px rgba(245, 158, 11, 0.5);
}
.trophy-anim {
  animation: bounce-trophy 2s infinite alternate;
}

@keyframes bounce-trophy {
  from { transform: translateY(0); }
  to { transform: translateY(-6px); }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 460px;
  margin: 1.5rem 0;
}
.stat-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-icon {
  font-size: 1.25rem;
  margin-bottom: 2px;
}
.stat-icon.accuracy {
  color: #3b82f6;
}
.stat-icon.errors {
  color: #ef4444;
}
.stat-icon.duration {
  color: #f59e0b;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 1rem;
}
.stat-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}
.stat-lbl {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-glass-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 28px;
  width: 100%;
  max-width: 650px;
  max-height: 85vh;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1.5px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}
.close-modal-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}
.close-modal-btn:hover {
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-footer {
  padding: 1.25rem;
  border-top: 1.5px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

/* Review List */
.review-question-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.25rem;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.review-question-card.correct {
  border-left: 5px solid #10b981;
}
.review-question-card.incorrect {
  border-left: 5px solid #ef4444;
}

.review-q-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
}

.review-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-opt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #475569;
}
.review-opt.is-correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.03);
  color: #065f46;
  font-weight: 600;
}
.review-opt.is-incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.03);
  color: #991b1b;
}

.review-marker {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.review-marker i {
  font-size: 1.1rem;
}
.text-emerald {
  color: #10b981;
}
.text-rose {
  color: #ef4444;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.coin-reward-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.08));
  border: 1.5px solid rgba(245, 158, 11, 0.25);
  border-radius: 24px;
  padding: 1.25rem 2rem;
  width: 100%;
  max-width: 340px;
  margin: 1.25rem 0;
  box-shadow: 0 10px 20px -8px rgba(245, 158, 11, 0.1);
  text-align: left;
}
.coin-reward-card.empty-reward {
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.06), rgba(100, 116, 139, 0.06));
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: none;
}
.coin-gold-wrapper {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.coin-gold-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.reward-plus-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #10b981;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1.5px solid white;
}
.reward-text-container h4 {
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.reward-text-container p {
  font-size: 1.3rem;
  font-weight: 800;
  color: #d97706;
  margin: 0;
}
.coin-reward-card.empty-reward .reward-text-container p {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.opacity-50 {
  opacity: 0.5;
}

@media (max-width: 600px) {
  .test-page-wrapper {
    padding: 1.5rem 0.75rem;
  }
  .quiz-glass-card {
    padding: 1.5rem 1.25rem;
  }
  .quiz-header {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    margin-bottom: 1.5rem;
  }
  .header-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }
  .subject-title {
    font-size: 1.25rem !important;
    margin-bottom: 0 !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  .level-badge {
    padding: 3px 8px !important;
    font-size: 0.65rem !important;
  }
  .header-right {
    width: auto !important;
  }
  .timer-badge {
    width: auto !important;
    padding: 6px 12px !important;
    font-size: 0.88rem !important;
    border-radius: 12px !important;
    justify-content: center;
  }
  .option-card {
    padding: 14px 18px;
    gap: 12px;
  }
  .footer-actions {
    flex-direction: column-reverse;
    gap: 10px;
    width: 100%;
  }
  .footer-actions .action-btn {
    width: 100%;
    justify-content: center;
  }
  .success-actions {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
  .success-actions .action-btn {
    width: 100%;
    justify-content: center;
  }
  .stats-overview {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .stat-box {
    padding: 8px;
  }
  .stat-val {
    font-size: 1rem;
  }
  .stat-lbl {
    font-size: 0.65rem;
  }
}
</style>
