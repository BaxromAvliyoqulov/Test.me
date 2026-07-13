<template>
  <div class="pro-test-view">
    <!-- Loading Screen -->
    <div v-if="state.loading" class="pro-center-screen">
      <div class="pro-spinner"></div>
      <h3>{{ isRus ? 'Загрузка теста...' : 'Test yuklanmoqda...' }}</h3>
    </div>

    <!-- Error / Empty Screen -->
    <div v-else-if="state.error || state.questions.length === 0" class="pro-center-screen error-state">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <h3>{{ state.error ? (isRus ? 'Ошибка загрузки' : 'Yuklashda xatolik') : (isRus ? 'Тесты не найдены' : 'Testlar topilmadi') }}</h3>
      <p>{{ state.error || (isRus ? 'В этой категории пока нет загруженных тестов.' : 'Ushbu yo\'nalishda hozircha testlar mavjud emas.') }}</p>
      <div class="pro-actions">
        <button class="pro-btn primary" @click="fetchQuestions" v-if="state.error">
          <i class="fas fa-redo"></i> {{ isRus ? 'Попробовать снова' : 'Qaytadan urinish' }}
        </button>
        <button class="pro-btn secondary" @click="goHome">
          <i class="fas fa-arrow-left"></i> {{ isRus ? 'На главную' : 'Orqaga' }}
        </button>
      </div>
    </div>

    <!-- Active Quiz Interface -->
    <div v-else-if="!state.testFinished" class="pro-quiz-layout">
      <!-- Minimalist Header -->
      <header class="pro-header">
        <div class="pro-header-left">
          <h2 class="pro-subject-title">{{ displaySubject }} <span class="pro-level-dot">•</span> <span class="pro-level">{{ displayLevel }}</span></h2>
        </div>
        <div class="pro-header-right">
          <div class="pro-timer" :class="{ 'time-low': state.timer < 60 }">
            <i class="far fa-clock"></i> {{ formattedTime }}
          </div>
        </div>
      </header>

      <!-- Super Thin Progress Line -->
      <div class="pro-progress-bar">
        <div class="pro-progress-fill" :style="{ width: ((state.currentPage + 1) / state.questions.length) * 100 + '%' }"></div>
      </div>

      <!-- Main Content Area -->
      <main class="pro-question-area">
        <div class="pro-q-meta">
          <span>{{ isRus ? 'Вопрос' : 'Savol' }} {{ state.currentPage + 1 }} / {{ state.questions.length }}</span>
        </div>
        
        <h1 class="pro-question-text">
          {{ currentQuestion?.question }}
        </h1>

        <transition name="fade">
          <div v-if="state.hintText" class="pro-hint-alert">
            <i class="fas fa-lightbulb"></i> {{ state.hintText }}
          </div>
        </transition>

        <!-- Clean Options -->
        <div class="pro-options-grid">
          <button
            v-for="(option, index) in currentQuestion?.options"
            :key="index"
            class="pro-option"
            v-show="!state.eliminatedOptions.includes(index)"
            :class="{ 'is-selected': state.selectedAnswer === index }"
            @click="selectOption(index)"
          >
            <div class="pro-opt-letter">{{ ['A', 'B', 'C', 'D'][index] }}</div>
            <div class="pro-opt-text">{{ option }}</div>
          </button>
        </div>

        <!-- AI Tools -->
        <div class="pro-tools-bar" v-if="(state.userTools && state.userTools.tool_5050 > 0) || (state.userTools && state.userTools.tool_ai_hint > 0)">
          <button 
            v-if="state.userTools && state.userTools.tool_5050 > 0" 
            class="pro-tool-btn" 
            :disabled="state.using5050 || state.eliminatedOptions.length > 0"
            @click="use5050"
          >
            50/50 ({{ state.userTools.tool_5050 }})
          </button>
          <button 
            v-if="state.userTools && state.userTools.tool_ai_hint > 0" 
            class="pro-tool-btn" 
            :disabled="state.hintText"
            @click="useAiHint"
          >
            <i class="fas fa-magic"></i> {{ isRus ? 'Подсказка AI' : 'AI Yordam' }} ({{ state.userTools.tool_ai_hint }})
          </button>
        </div>
      </main>

      <!-- Minimalist Footer -->
      <footer class="pro-footer">
        <div class="pro-pagination">
          <button class="pro-nav-btn" @click="goToPrev" :disabled="state.currentPage === 0">
            <i class="fas fa-arrow-left"></i>
          </button>
          <span class="pro-pag-text">{{ state.currentPage + 1 }} / {{ state.questions.length }}</span>
        </div>
        
        <button
          class="pro-btn-next"
          :class="{ 'is-finish': state.currentPage === state.questions.length - 1 }"
          @click="submitAnswer"
        >
          {{ state.currentPage < state.questions.length - 1 ? (isRus ? 'Далее' : 'Keyingisi') : (isRus ? 'Завершить' : 'Yakunlash') }}
          <i class="fas" :class="state.currentPage < state.questions.length - 1 ? 'fa-arrow-right' : 'fa-check'"></i>
        </button>
      </footer>
    </div>

    <!-- Stunning Full-Screen Results View -->
    <div v-else class="pro-results-view">
      <div class="pro-results-content">
        <h1 class="pro-r-title">{{ isRus ? 'Тест Завершен' : 'Test Yakunlandi' }}</h1>
        <p class="pro-r-subtitle">{{ isRus ? 'Отличная работа! Вот ваши результаты:' : 'Ajoyib natija! Sizning ko\'rsatkichlaringiz:' }}</p>

        <!-- Massive Floating Score Ring -->
        <div class="pro-score-hero">
          <svg class="pro-ring-svg" viewBox="0 0 36 36">
            <path class="pro-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="pro-ring-fill" :stroke-dasharray="((score / state.questions.length) * 100) + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div class="pro-score-text">
            <span class="p-score">{{ score }}</span>
            <span class="p-total">/ {{ state.questions.length }}</span>
          </div>
        </div>

        <!-- Clean Stats Row -->
        <div class="pro-stats-row">
          <div class="pro-stat-item">
            <span class="p-stat-val">{{ Math.round((score / state.questions.length) * 100) }}%</span>
            <span class="p-stat-lbl">{{ isRus ? 'Точность' : 'Aniqlik' }}</span>
          </div>
          <div class="pro-stat-divider"></div>
          <div class="pro-stat-item">
            <span class="p-stat-val">{{ state.questions.length - score }}</span>
            <span class="p-stat-lbl">{{ isRus ? 'Ошибки' : 'Xatolar' }}</span>
          </div>
          <div class="pro-stat-divider"></div>
          <div class="pro-stat-item">
            <span class="p-stat-val">{{ timeSpent }}</span>
            <span class="p-stat-lbl">{{ isRus ? 'Время' : 'Vaqt' }}</span>
          </div>
        </div>

        <!-- Clean Reward Row -->
        <div class="pro-reward-row" v-if="score > 0">
          <img src="../../assets/img/tpCoin.png" alt="TP" class="pro-coin" />
          <div class="pro-reward-info">
            <span class="r-amt">+{{ score }} TP Coins</span>
            <span class="r-lbl">{{ isRus ? 'заработано' : 'ishlab topildi' }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pro-results-actions">
          <button class="pro-btn secondary outline" @click="state.showReviewModal = true">
            <i class="fas fa-eye"></i> {{ isRus ? 'Анализ' : 'Tahlil' }}
          </button>
          <button class="pro-btn primary" @click="goHome">
            {{ isRus ? 'На главную' : 'Bosh Sahifa' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <transition name="fade">
      <div v-if="state.showReviewModal" class="pro-review-overlay" @click.self="state.showReviewModal = false">
        <div class="pro-review-modal">
          <div class="pr-header">
            <h3>{{ isRus ? 'Анализ ответов' : 'Javoblar Tahlili' }}</h3>
            <button class="pr-close" @click="state.showReviewModal = false"><i class="fas fa-times"></i></button>
          </div>
          <div class="pr-body">
            <div v-for="(question, index) in state.questions" :key="index" class="pr-q-card">
              <h4>{{ index + 1 }}. {{ question.question }}</h4>
              <div class="pr-opts">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" 
                     class="pr-opt"
                     :class="{
                       'is-correct': question.answer === option,
                       'is-wrong': state.selectedAnswers[index] === optIndex && question.answer !== option
                     }">
                  <i class="fas fa-check" v-if="question.answer === option"></i>
                  <i class="fas fa-times" v-else-if="state.selectedAnswers[index] === optIndex"></i>
                  <span class="pr-dot" v-else></span>
                  <span>{{ option }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc, Timestamp, query, where, doc, getDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
  specialTestId: { type: String, default: '' },
  title: { type: String, default: '' }
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
  if (subj === 'ai') return isRus.value ? 'AI Конструктор' : 'AI Testi';
  if (subj === 'special') return props.title || 'Maxsus Imtihon';
  return subj;
});

const displayLevel = computed(() => {
  const lvl = activeLevelId.value;
  if (lvl === 'ai') return isRus.value ? 'Сгенерированный' : 'AI yaratgan';
  return lvl;
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
  userTools: {},
  eliminatedOptions: [],
  hintText: null,
  using5050: false,
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
  const totalRaw = state.questions.reduce((acc, q, i) => {
    const selectedIdx = state.selectedAnswers[i];
    if (selectedIdx !== null && selectedIdx !== undefined && q.options[selectedIdx] === q.answer) {
      return acc + (q.scoreWeight || 1);
    }
    return acc;
  }, 0);
  return Math.round(totalRaw * 10) / 10;
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
  state.eliminatedOptions = [];
  state.hintText = null;
  state.using5050 = false;
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

// --- AI Tools Logic ---
const use5050 = async () => {
  if (!state.userTools || state.userTools.tool_5050 <= 0 || state.eliminatedOptions.length > 0) return;
  
  const currentQ = currentQuestion.value;
  const incorrectIndices = [];
  currentQ.options.forEach((opt, idx) => {
    if (opt !== currentQ.answer) incorrectIndices.push(idx);
  });
  
  // Pick 2 random incorrect options
  incorrectIndices.sort(() => Math.random() - 0.5);
  state.eliminatedOptions = incorrectIndices.slice(0, 2);
  state.using5050 = true;

  try {
    const auth = getAuth();
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { 'tools.tool_5050': increment(-1) });
    }
  } catch (err) {
    console.error("Failed to deduct 5050 tool", err);
  }
};

const useAiHint = async () => {
  if (!state.userTools || state.userTools.tool_ai_hint <= 0 || state.hintText) return;
  
  const currentQ = currentQuestion.value;
  // Make a simple AI hint
  const answerWords = currentQ.answer.split(' ').filter(w => w.length > 3);
  const hintKeyword = answerWords.length > 0 ? answerWords[0] : currentQ.answer;
  
  state.hintText = isRus.value 
    ? `Подсказка: Правильный ответ может быть связан с "${hintKeyword}"...`
    : `Yordam: To'g'ri javob "${hintKeyword}" so'zi yoki shunga o'xshash ma'no bilan bog'liq bo'lishi mumkin...`;

  try {
    const auth = getAuth();
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { 'tools.tool_ai_hint': increment(-1) });
    }
  } catch (err) {
    console.error("Failed to deduct ai hint tool", err);
  }
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

    const isSpecial = activeSubjectId.value === 'special';
    if (isSpecial) {
      const specialId = props.specialTestId || route?.query?.specialTestId;
      if (!specialId) throw new Error("Maxsus test ID topilmadi");

      const docRef = doc(db, 'special_tests', specialId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Maxsus test bazadan topilmadi");

      const testData = docSnap.data();
      const flatQuestions = [];
      if (testData.sections) {
        testData.sections.forEach(section => {
          if (section.questions) {
            section.questions.forEach(q => {
              flatQuestions.push({
                ...q,
                scoreWeight: section.scoreWeight || 1
              });
            });
          }
        });
      }

      if (flatQuestions.length === 0) throw new Error("Testda savollar yo'q");

      state.questions = flatQuestions;
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

    // Reward TP Coins
    const isSpecial = activeSubjectId.value === 'special';
    let coinsEarned = isSpecial ? 50 : Math.round(score.value);
    
    // V3 Economy: Perfect Score Bonus
    let perfectScoreBonus = 0;
    if (!isSpecial && state.questions.length > 20 && score.value === state.questions.length) {
      perfectScoreBonus = 5;
      coinsEarned += perfectScoreBonus;
    }
    
    if (coinsEarned > 0) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          points: increment(coinsEarned)
        });

        // Record transaction
        const txRef = collection(userDocRef, 'transactions');
        let actionMsg = isRus.value
            ? `Награда за тест (${displaySubject.value} - ${displayLevel.value})`
            : `Test yechish mukofoti (${displaySubject.value} - ${displayLevel.value})`;
            
        if (perfectScoreBonus > 0) {
          actionMsg += isRus.value ? " + Бонус за идеальный результат!" : " + Perfect Score Bonus!";
        }

        await addDoc(txRef, {
          action: actionMsg,
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

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          state.userTools = snap.data().tools || {};
        }
      });
    }
  });
});

onUnmounted(() => clearInterval(intervalId));

defineExpose({ initializeTest: fetchQuestions });
</script>


<style scoped>
/* Ultra-Minimalist Pro UI */
.pro-test-view {
  width: 100%;
  min-height: 100vh;
  background: #fdfdfd; /* Pure clean background, no boxes */
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Center Screens (Loading/Error) */
.pro-center-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}
.pro-spinner {
  width: 40px; height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Layout */
.pro-quiz-layout {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem;
}

/* Header */
.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.pro-subject-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pro-level-dot { color: #cbd5e1; }
.pro-level { font-size: 1rem; color: #64748b; font-weight: 600; }
.pro-timer {
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #334155;
  display: flex; align-items: center; gap: 6px;
}
.pro-timer.time-low { background: #fee2e2; color: #ef4444; }

/* Thin Progress */
.pro-progress-bar {
  width: 100%;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  margin-bottom: 3rem;
  overflow: hidden;
}
.pro-progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.4s ease;
}

/* Main Area */
.pro-question-area { flex: 1; display: flex; flex-direction: column; }
.pro-q-meta { font-size: 0.85rem; font-weight: 700; color: #94a3b8; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; }
.pro-question-text {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.4;
  color: #0f172a;
  margin: 0 0 3rem 0;
}

/* Options */
.pro-options-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pro-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.pro-option:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.pro-option.is-selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
}
.pro-opt-letter {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.pro-option.is-selected .pro-opt-letter {
  background: #3b82f6;
  color: #fff;
}
.pro-opt-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

/* Tools */
.pro-tools-bar { display: flex; gap: 10px; margin-top: 2rem; }
.pro-tool-btn { padding: 8px 16px; border-radius: 12px; background: #f1f5f9; border: none; font-weight: 600; color: #475569; cursor: pointer; }
.pro-tool-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pro-hint-alert { background: #fef3c7; color: #d97706; padding: 12px 16px; border-radius: 12px; font-weight: 600; margin-bottom: 2rem; }

/* Footer */
.pro-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  margin-top: 2rem;
}
.pro-pagination { display: flex; align-items: center; gap: 16px; }
.pro-nav-btn { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #e2e8f0; background: transparent; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.pro-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.pro-pag-text { font-weight: 700; color: #64748b; }

.pro-btn-next {
  padding: 16px 32px;
  border-radius: 100px;
  background: #0f172a;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pro-btn-next:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2); }
.pro-btn-next.is-finish { background: #3b82f6; }

/* Stunning Full-Screen Results */
.pro-results-view {
  flex: 1; display: flex; align-items: center; justify-content: center;
  background: #fdfdfd; padding: 2rem;
}
.pro-results-content {
  max-width: 600px; width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center;
}
.pro-r-title { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin: 0 0 8px 0; }
.pro-r-subtitle { font-size: 1.1rem; color: #64748b; font-weight: 500; margin-bottom: 3rem; }

.pro-score-hero { position: relative; width: 200px; height: 200px; margin-bottom: 3rem; display: flex; align-items: center; justify-content: center; }
.pro-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.pro-ring-bg { fill: none; stroke: #f1f5f9; stroke-width: 2.5; }
.pro-ring-fill { fill: none; stroke: #3b82f6; stroke-width: 2.5; stroke-linecap: round; transition: stroke-dasharray 1s ease-out; }
.pro-score-text { position: absolute; display: flex; flex-direction: column; align-items: center; }
.p-score { font-size: 4rem; font-weight: 900; color: #0f172a; line-height: 1; }
.p-total { font-size: 1.2rem; font-weight: 700; color: #94a3b8; }

.pro-stats-row { display: flex; align-items: center; justify-content: center; gap: 2rem; margin-bottom: 3rem; }
.pro-stat-item { display: flex; flex-direction: column; align-items: center; }
.p-stat-val { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
.p-stat-lbl { font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
.pro-stat-divider { width: 2px; height: 30px; background: #e2e8f0; }

.pro-reward-row { display: flex; align-items: center; gap: 12px; background: #fef9c3; padding: 12px 24px; border-radius: 100px; margin-bottom: 3rem; }
.pro-coin { width: 32px; height: 32px; }
.pro-reward-info { display: flex; flex-direction: column; align-items: flex-start; }
.r-amt { font-size: 1rem; font-weight: 800; color: #d97706; }
.r-lbl { font-size: 0.75rem; font-weight: 600; color: #ca8a04; }

.pro-results-actions { display: flex; gap: 16px; width: 100%; justify-content: center; }
.pro-btn { padding: 16px 32px; border-radius: 100px; font-weight: 700; font-size: 1.05rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
.pro-btn.primary { background: #0f172a; color: white; }
.pro-btn.primary:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15,23,42,0.15); }
.pro-btn.secondary.outline { background: transparent; border: 2px solid #e2e8f0; color: #475569; }
.pro-btn.secondary.outline:hover { border-color: #cbd5e1; color: #0f172a; background: #f8fafc; }

/* Review Modal */
.pro-review-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.pro-review-modal { background: white; width: 100%; max-width: 600px; border-radius: 24px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.pr-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; }
.pr-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; }
.pr-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f1f5f9; color: #64748b; cursor: pointer; }
.pr-body { padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 2rem; }
.pr-q-card h4 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem 0; line-height: 1.4; }
.pr-opts { display: flex; flex-direction: column; gap: 8px; }
.pr-opt { padding: 12px 16px; border-radius: 12px; background: #f8fafc; font-weight: 600; display: flex; align-items: center; gap: 12px; color: #64748b; border: 1px solid transparent; }
.pr-opt.is-correct { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
.pr-opt.is-wrong { background: #fef2f2; color: #e11d48; border-color: #fecdd3; }
.pr-dot { width: 16px; height: 16px; border-radius: 50%; background: #e2e8f0; }

@media (max-width: 600px) {
  .pro-quiz-layout { padding: 1.5rem 1rem; }
  .pro-question-text { font-size: 1.4rem; }
  .pro-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .pro-results-view { padding: 1rem; }
  .pro-r-title { font-size: 2rem; }
  .pro-stats-row { gap: 1rem; }
  .pro-results-actions { flex-direction: column; }
}
</style>

