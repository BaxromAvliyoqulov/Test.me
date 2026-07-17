<template>
  <div class="premium-layout">
    
    <!-- Floating Header -->
    <header class="dynamic-island-header">
      <div class="header-left">
        <button class="exit-pro-btn" @click="$emit('exit-test')"><i class="fas fa-arrow-left"></i></button>
        <span class="subject-name">{{ displaySubject }}</span>
        <span class="level-tag">{{ displayLevel }}</span>
      </div>
      <div class="header-right">
        <div class="timer-pill" :class="{ 'danger': state.timer < 60 }">
          <i class="far fa-clock"></i> {{ formattedTime }}
        </div>
      </div>
    </header>

    <div class="content-container">
      <!-- Loading Screen -->
      <div v-if="state.loading" class="center-content">
        <div class="spinner-xl"></div>
        <h3 class="status-title">{{ isRus ? 'Загрузка...' : 'Yuklanmoqda...' }}</h3>
      </div>

      <!-- Error / Empty Screen -->
      <div v-else-if="state.error || state.questions.length === 0" class="center-content error-card">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <h3 class="status-title">{{ state.error ? (isRus ? 'Ошибка' : 'Xatolik') : (isRus ? 'Пусто' : 'Bo\'sh') }}</h3>
        <p class="status-desc">{{ state.error || (isRus ? 'Тесты не найдены.' : 'Testlar topilmadi.') }}</p>
        <button class="btn-primary" @click="goHome">{{ isRus ? 'На главную' : 'Bosh Sahifa' }}</button>
      </div>

      <!-- Active Quiz Interface -->
      <TestQuestionCard 
        v-else-if="!state.testFinished"
        :question="currentQuestion"
        :questionNumber="state.currentPage + 1"
        :totalQuestions="state.questions.length"
        :selectedAnswer="state.selectedAnswer"
        :eliminatedOptions="state.eliminatedOptions"
        :hintText="state.hintText"
        :userTools="state.userTools"
        :using5050="state.using5050"
        :isRus="isRus"
        :isAiLoading="state.isAiLoading"
        @selectOption="selectOption"
        @use5050="use5050"
        @useAiHint="useAiHint"
        @goToPrev="goToPrev"
        @submitAnswer="submitAnswer"
      />

      <!-- Success / Results Screen -->
      <TestResults 
        v-else
        :score="score"
        :totalQuestions="state.questions.length"
        :timeSpent="timeSpent"
        :isRus="isRus"
        @goHome="goHome"
        @showReview="state.showReviewModal = true"
      />
    </div>

    <!-- Review Modal (Kept inline for simplicity since it's just an overlay) -->
    <transition name="fade">
      <div v-if="state.showReviewModal" class="review-overlay" @click.self="state.showReviewModal = false">
        <div class="review-modal">
          <div class="rm-header">
            <h3>{{ isRus ? 'Анализ ответов' : 'Javoblar Tahlili' }}</h3>
            <button class="rm-close" @click="state.showReviewModal = false"><i class="fas fa-times"></i></button>
          </div>
          <div class="rm-body">
            <div v-for="(question, index) in state.questions" :key="index" class="rm-q-card">
              <h4>{{ index + 1 }}. {{ question.question }}</h4>
              <div class="rm-opts">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" 
                     class="rm-opt"
                     :class="{
                       'is-correct': (question.answer || question.correctAnswer) === option,
                       'is-wrong': state.selectedAnswers[index] === optIndex && (question.answer || question.correctAnswer) !== option
                     }">
                  <i class="fas fa-check" v-if="(question.answer || question.correctAnswer) === option"></i>
                  <i class="fas fa-times" v-else-if="state.selectedAnswers[index] === optIndex"></i>
                  <span class="rm-dot" v-else></span>
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
import TestQuestionCard from './components/TestQuestionCard.vue';
import TestResults from './components/TestResults.vue';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc, Timestamp, query, where, doc, getDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '@/utils/i18n';
import { useToast } from 'vue-toastification';

// Router, Locale, Toast
const router = useRouter();
const route = useRoute();
const { locale } = useI18n();
const toast = useToast();

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
  userPoints: 0,
  mentorType: 'standard',
  activeGoal: null,
  isAiLoading: false
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
    if (selectedIdx !== null && selectedIdx !== undefined && q.options[selectedIdx] === (q.answer || q.correctAnswer)) {
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
  return selected !== null && selected !== undefined && q.options[selected] === (q.answer || q.correctAnswer);
};

// --- AI Tools Logic ---
// --- AI Tools Logic ---
const use5050 = async () => {
  if (state.eliminatedOptions.length > 0 || state.using5050) return;
  
  const hasInventory = state.userTools?.tool_5050 > 0;
  if (!hasInventory && state.userPoints < 20) {
    toast.error(isRus.value ? 'Недостаточно TP (нужно 20 TP)' : 'TP yetarli emas (20 TP kerak)');
    return;
  }
  
  const currentQ = currentQuestion.value;
  const incorrectIndices = [];
  currentQ.options.forEach((opt, idx) => {
    if (opt !== (currentQ.answer || currentQ.correctAnswer)) incorrectIndices.push(idx);
  });
  
  // Pick 2 random incorrect options
  incorrectIndices.sort(() => Math.random() - 0.5);
  state.eliminatedOptions = incorrectIndices.slice(0, 2);
  state.using5050 = true;

  try {
    const auth = getAuth();
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      if (hasInventory) {
        await updateDoc(userRef, { 'tools.tool_5050': increment(-1) });
      } else {
        await updateDoc(userRef, { points: increment(-20) });
        await addDoc(collection(userRef, 'transactions'), {
          action: isRus.value ? 'Покупка подсказки 50/50' : '50/50 yordamini sotib olish',
          points: -20,
          timestamp: Timestamp.now()
        });
      }
    }
  } catch (err) {
    console.error("Failed to process 5050 tool", err);
  }
};

const useAiHint = async () => {
  if (state.hintText || state.isAiLoading) return;
  
  const hasInventory = state.userTools?.tool_ai_hint > 0;
  if (!hasInventory && state.userPoints < 50) {
    toast.error(isRus.value ? 'Недостаточно TP (нужно 50 TP)' : 'TP yetarli emas (50 TP kerak)');
    return;
  }

  state.isAiLoading = true;
  
  try {
    const GEMINI_API_KEY = "AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g";
    const currentQ = currentQuestion.value;
    const ans = currentQ.answer || currentQ.correctAnswer;
    
    const personas = {
      standard: "You are a Standard AI Assistant.",
      friendly: "You are a Friendly Mentor. Add small encouragements or emojis 😊.",
      strict: "You are a Strict Professor. Speak formally and rigorously.",
      socratic: "You are a Socratic Philosopher. Ask questions to make them think.",
      motivator: "You are a Motivator Coach. Use high energy, hype, and emojis! 🚀",
      innovator: "You are a Creative Genius. Think outside the box. 💡",
      analyst: "You are a Cyber Analyst. Speak like a tech system. 💻",
      sage: "You are an Ancient Sage. Use metaphors. 📜",
      comedian: "You are a Humorous Comedian. Explain things using jokes, sarcasm, and funny analogies. 😂"
    };
    const persona = personas[state.mentorType] || personas.standard;
    const goalText = state.activeGoal ? `The user's active goal is: "${state.activeGoal}". Remind them of their goal to motivate them!` : '';
    
    const prompt = `You are a helpful AI tutor acting as this persona: ${persona}
${goalText}

The student is currently taking a test. They are stuck on this question:
"${currentQ.question}"
Options: ${JSON.stringify(currentQ.options)}

The correct answer is: "${ans}".

Your task: Provide a clever, very short hint to guide the student toward the correct answer WITHOUT explicitly stating what the correct answer is. 
Write the hint entirely in the language of the prompt (mostly Uzbek or Russian depending on the question), but keep it under 3 sentences. Be completely in character.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (response.ok) {
      const resData = await response.json();
      state.hintText = resData.candidates[0].content.parts[0].text;
      
      const auth = getAuth();
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        if (hasInventory) {
          await updateDoc(userRef, { 'tools.tool_ai_hint': increment(-1) });
        } else {
          await updateDoc(userRef, { points: increment(-50) });
          await addDoc(collection(userRef, 'transactions'), {
            action: isRus.value ? 'Покупка AI подсказки' : 'AI Yordamini sotib olish',
            points: -50,
            timestamp: Timestamp.now()
          });
        }
      }
    } else {
      throw new Error('Gemini API Error');
    }
  } catch (err) {
    console.error("Failed to generate ai hint", err);
    toast.error(isRus.value ? 'Ошибка при получении подсказки' : 'Yordam olishda xatolik yuz berdi');
  } finally {
    state.isAiLoading = false;
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
          const data = snap.data();
          state.userTools = data.tools || {};
          state.userPoints = data.points || 0;
          state.mentorType = data.preferences?.mentorType || 'standard';
          
          if (data.goals && Array.isArray(data.goals)) {
            const activeGoals = data.goals.filter(g => g.status === 'active');
            if (activeGoals.length > 0) {
              state.activeGoal = activeGoals[0].title;
            }
          }
        }
      });
    }
  });
});

onUnmounted(() => clearInterval(intervalId));

defineExpose({ initializeTest: fetchQuestions });
</script>



<style scoped>

.exit-pro-btn {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  margin-right: 8px;
  transition: all 0.2s;
}
.exit-pro-btn:hover { background: #e2e8f0; color: #0f172a; }

.premium-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
  padding: 24px;

  margin: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Dynamic Island Floating Header */
.dynamic-island-header {
  background: white;
  border-radius: 100px;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  margin-bottom: 40px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subject-name {
  font-size: 1.1rem;
  font-weight: 800;
}

.level-tag {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.timer-pill {
  background: #0f172a;
  color: white;
  padding: 8px 16px;
  border-radius: 100px;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(15,23,42,0.2);
}

.timer-pill.danger {
  background: #ef4444;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
}

.content-container {
  width: 100%;
  max-width: 800px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Fallback Screens */
.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.spinner-xl {
  width: 48px; height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-icon { font-size: 3rem; color: #ef4444; margin-bottom: 16px; }
.status-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
.status-desc { color: #64748b; margin-bottom: 24px; }

.btn-primary {
  background: #0f172a;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

/* Review Modal Overlay */
.review-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  padding: 24px;
}

.review-modal {
  background: white;
  width: 100%; max-width: 600px;
  border-radius: 24px;
  max-height: 85vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.rm-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}
.rm-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; }
.rm-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f1f5f9; cursor: pointer; }

.rm-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
.rm-q-card h4 { font-size: 1.1rem; font-weight: 700; margin: 0 0 12px 0; }
.rm-opts { display: flex; flex-direction: column; gap: 8px; }
.rm-opt { padding: 12px; border-radius: 12px; background: #f8fafc; display: flex; align-items: center; gap: 12px; font-weight: 600; color: #64748b; border: 1px solid transparent; }
.rm-opt.is-correct { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
.rm-opt.is-wrong { background: #fef2f2; color: #e11d48; border-color: #fecdd3; }
.rm-dot { width: 12px; height: 12px; border-radius: 50%; background: #cbd5e1; }

@media (max-width: 600px) {
  .premium-layout { padding: 16px; }
  .dynamic-island-header { padding: 12px 16px; }
  .subject-name { font-size: 1rem; }
}
</style>


