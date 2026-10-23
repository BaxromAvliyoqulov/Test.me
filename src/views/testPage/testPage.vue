<template>
  <div class="premium-layout">
    
    <!-- Floating Header -->
    <header class="dynamic-island-header">
      <div class="header-left">
        <button class="exit-pro-btn" @click="$emit('exit-test')"><i class="fas fa-arrow-left"></i></button>
        <span class="subject-name">{{ displaySubject }}</span>
        <span class="level-tag">{{ displayLevel }}</span>
        <span v-if="isDuelMode" class="duel-pill animate-pulse">⚔️ 1v1 DUEL</span>
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
        :mentorType="state.mentorType"
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
            <!-- AI Review Section -->
            <div class="ai-review-section">
              <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">
                <button 
                  v-if="!state.postTestReviewText && !state.isPostTestReviewLoading" 
                  class="btn-primary" 
                  @click="generatePostTestReview"
                >
                  <i class="fas fa-magic"></i> {{ isRus ? 'Запросить AI-анализ' : 'AI Tahlilini so\'rash' }}
                </button>
                <button 
                  v-if="state.postTestReviewText" 
                  class="btn-primary" 
                  style="background:#8b5cf6;"
                  @click="speakReviewText"
                >
                  <i class="fas fa-volume-up"></i> {{ isRus ? 'Озвучить (Voice)' : 'Ovozli Eshitish' }}
                </button>
              </div>
              
              <transition name="fade">
                <div v-if="state.postTestReviewText || state.isPostTestReviewLoading" class="ai-hint-wrapper">
                  <AIBubble 
                    :message="state.postTestReviewText" 
                    :loading="state.isPostTestReviewLoading" 
                    :mentorId="state.mentorType" 
                    :locale="isRus ? 'RUS' : 'UZB'" 
                  />
                </div>
              </transition>
            </div>

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
import AIBubble from '@/components/common/AIBubble.vue';
import { generateMentorMessage } from '@/services/aiService';
import { 
  supabase,
  authService, 
  profileService, 
  resultService, 
  certificateService,
  subjectService 
} from '@/services/supabaseService';
import { offlineDb } from '@/services/offlineDb';
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

const isDuelMode = computed(() => {
  return !!(route && route.query && route.query.duelId);
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
  isAiLoading: false,
  postTestReviewText: null,
  isPostTestReviewLoading: false
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
    const user = await authService.getUser();
    if (user) {
      await profileService.addPoints(user.id, -20, isRus.value ? 'Покупка подсказки 50/50' : '50/50 yordamini sotib olish');
      state.userPoints = Math.max(0, state.userPoints - 20);
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
    const currentQ = currentQuestion.value;
    
    const response = await generateMentorMessage({
      mentorId: state.mentorType,
      context: 'hint',
      locale: locale.value || 'UZB',
      data: { question: currentQ }
    });

    if (response && response.text) {
      state.hintText = response.text;
      
      const user = await authService.getUser();
      if (user) {
        await profileService.addPoints(user.id, -50, isRus.value ? 'Покупка AI подсказки' : 'AI Yordamini sotib olish');
        state.userPoints = Math.max(0, state.userPoints - 50);
      }
    } else {
      throw new Error('AI Service Error');
    }
  } catch (err) {
    console.error("Failed to generate ai hint", err);
    toast.error(isRus.value ? 'Ошибка при получении подсказки' : 'Yordam olishda xatolik yuz berdi');
  } finally {
    state.isAiLoading = false;
  }
};

const generatePostTestReview = async () => {
  if (state.postTestReviewText || state.isPostTestReviewLoading) return;
  state.isPostTestReviewLoading = true;
  
  try {
    const response = await generateMentorMessage({
      mentorId: state.mentorType,
      context: 'post_test',
      locale: locale.value || 'UZB',
      data: { 
        score: score.value, 
        totalQuestions: state.questions.length,
        timeSpent: timeSpent.value
      }
    });

    if (response && response.text) {
      state.postTestReviewText = response.text;
    } else {
      throw new Error('AI Service Error');
    }
  } catch (err) {
    console.error("Failed to generate post test review", err);
    toast.error(isRus.value ? 'Ошибка AI анализа' : 'AI tahlilida xatolik yuz berdi');
  } finally {
    state.isPostTestReviewLoading = false;
  }
};

const speakReviewText = () => {
  if (!state.postTestReviewText) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(state.postTestReviewText);
    utterance.lang = isRus.value ? 'ru-RU' : 'uz-UZ';
    window.speechSynthesis.speak(utterance);
    toast.info(isRus.value ? 'Озвучивание...' : 'Ovozli o\'qish boshlandi...');
  } else {
    toast.error(isRus.value ? 'Озвучивание не поддерживается' : 'Ovozli o\'qish qo\'llab-quvvatlanmaydi');
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

      const { data: aiData, error: aiErr } = await supabase
        .from('ai_tests')
        .select('*')
        .eq('id', aiTestId)
        .maybeSingle();

      if (aiErr || !aiData || !aiData.questions) {
        throw new Error(isRus.value ? "Тесты AI не найдены" : "AI Test savollari topilmadi");
      }

      state.questions = aiData.questions;
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

      const { data: testData, error: spErr } = await supabase
        .from('special_tests')
        .select('*')
        .eq('id', specialId)
        .maybeSingle();

      if (spErr || !testData) throw new Error("Maxsus test bazadan topilmadi");

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

    // 1. Oflayn keshni tekshirish (IndexedDB)
    const cachedQuestions = await offlineDb.getCachedQuestions(activeSubjectId.value, activeLevelId.value);
    if (!navigator.onLine && cachedQuestions && cachedQuestions.length > 0) {
      state.questions = shuffleArray(cachedQuestions).slice(0, activeQuestionCount.value);
      state.selectedAnswers = Array(state.questions.length).fill(null);
      state.currentPage = 0;
      state.selectedAnswer = null;
      state.testFinished = false;
      toast.info(isRus.value ? "Тесты загружены из оффлайн-кэша" : "Testlar oflayn keshdan yuklandi");
      return;
    }

    let questionsList = [];

    // 2. Supabase bazasidan testlarni olishga urinish
    try {
      const tests = await subjectService.getTests(activeSubjectId.value, activeLevelId.value);
      if (tests && tests.length > 0) {
        for (const t of tests) {
          const qs = await subjectService.getQuestions(t.id);
          if (qs && qs.length > 0) {
            questionsList.push(...qs);
          }
        }
      }
    } catch {
      // Offline yoki tarmoq uzilishi
    }

    // 3. Agar Supabase'da savollar bo'lmasa, keshdan yoki lokal test.json dan olish
    if (!questionsList.length) {
      if (cachedQuestions && cachedQuestions.length > 0) {
        questionsList = cachedQuestions;
      } else {
        try {
          const res = await fetch('/test.json');
          if (res.ok) {
            questionsList = await res.json();
          }
        } catch {
          // fetch error
        }
      }
    }

    if (!questionsList.length) {
      throw new Error(isRus.value ? 'Тесты не найдены' : 'Testlar topilmadi');
    }

    // 4. Savollarni darhol kelajakda oflayn ishlash uchun IndexedDB keshiga yozish
    offlineDb.cacheQuestions(activeSubjectId.value, activeLevelId.value, questionsList);

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

    const user = await authService.getUser();
    const userId = user?.id || 'offline_user';

    // Reward TP Coins
    const isSpecial = activeSubjectId.value === 'special';
    let coinsEarned = isSpecial ? 50 : Math.round(score.value);
    
    // V3 Economy: Perfect Score Bonus
    let perfectScoreBonus = 0;
    if (!isSpecial && state.questions.length > 20 && score.value === state.questions.length) {
      perfectScoreBonus = 5;
      coinsEarned += perfectScoreBonus;
    }

    const resultPayload = {
      user_id: userId,
      subject_id: activeSubjectId.value || 'General',
      test_level: activeLevelId.value || 'General',
      score: score.value,
      total: state.questions.length,
      duration_seconds: timeSpent.value || 0,
      coinsEarned,
      created_at: new Date().toISOString()
    };

    // Agar internet bo'lmasa yoki tarmoq uzilsa:
    if (!navigator.onLine || !user) {
      await offlineDb.queuePendingResult(resultPayload);
      toast.info(
        isRus.value
          ? "Тест завершен оффлайн. Ваши баллы синхронизируются при подключении к сети."
          : "Test oflayn yakunlandi. Natijangiz internet ulanganda avtomatik hisobingizga qo'shiladi!"
      );
    } else {
      try {
        await resultService.saveResult({
          user_id: userId,
          subject_id: resultPayload.subject_id,
          test_level: resultPayload.test_level,
          score: score.value,
          total: state.questions.length,
          duration_seconds: timeSpent.value || 0
        });

        if (coinsEarned > 0) {
          await profileService.addPoints(
            userId, 
            coinsEarned, 
            `Test mukofoti (${displaySubject.value} - ${displayLevel.value})`
          );
        }

        // Sertifikat berish
        if (score.value / state.questions.length >= 0.8) {
          try {
            const uidPart = userId.substring(0, 8).toUpperCase();
            const certCode = `CERT-${uidPart}-${Date.now().toString().slice(-4)}`;
            await certificateService.issueCertificate({
              cert_code: certCode,
              user_id: userId,
              user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Bilimdon',
              cert_type: 'achievement',
              name_uz: `${displaySubject.value} Muvaffaqiyat Sertifikati`,
              name_ru: `Сертификат Успеха (${displaySubject.value})`,
              desc_uz: `${displayLevel.value} darajasidagi test sinovidan muvaffaqiyatli o'tganligi uchun.`,
              desc_ru: `За успешное прохождение теста на уровне ${displayLevel.value}.`
            });
          } catch {
            // Ignored cert error
          }
        }
      } catch {
        // Tarmoq xatosi yuz berganda avtomatik oflayn navbatga saqlash
        await offlineDb.queuePendingResult(resultPayload);
        toast.info("Natija oflayn saqlandi va internet ulanganda bazaga yuboriladi.");
      }
    }
  } catch (err) {
    console.error('Error saving result:', err);
    state.error = err.message;
  }
};

// Lifecycle
onMounted(async () => {
  fetchQuestions();
  intervalId = setInterval(() => {
    if (state.timer > 0) state.timer--;
    else finishTest();
  }, 1000);

  try {
    const user = await authService.getUser();
    if (user) {
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        state.userPoints = profile.points || 0;
        state.mentorType = 'standard';
      }
    }
  } catch {
    // Offline user
  }
});

onUnmounted(() => clearInterval(intervalId));

defineExpose({ initializeTest: fetchQuestions });
</script>



<style scoped>

.duel-pill {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
  margin-left: 0.5rem;
}

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
  border: none;
  font-weight: 700;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 12px;
}
.btn-primary:hover { background: #1e293b; }

.ai-review-section {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
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
  .premium-layout {
    padding: 10px 8px calc(24px + env(safe-area-inset-bottom, 0px)) 8px !important;
  }
  .dynamic-island-header {
    padding: 8px 12px !important;
    margin-bottom: 14px !important;
    border-radius: 16px !important;
  }
  .header-left {
    gap: 6px !important;
    min-width: 0 !important;
  }
  .subject-name {
    font-size: 0.95rem !important;
    max-width: 120px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  .level-tag {
    font-size: 0.7rem !important;
    padding: 2px 8px !important;
  }
  .timer-pill {
    padding: 6px 10px !important;
    font-size: 0.82rem !important;
    gap: 5px !important;
  }
  .exit-pro-btn {
    width: 32px !important;
    height: 32px !important;
    margin-right: 4px !important;
  }
  .review-overlay {
    padding: 10px !important;
    align-items: flex-end !important;
  }
  .review-modal {
    max-height: 90vh !important;
    border-radius: 20px 20px 0 0 !important;
  }
}
</style>


