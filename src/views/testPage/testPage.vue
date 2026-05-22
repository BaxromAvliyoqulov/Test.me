<template>
  <div class="test-page">
    <div v-if="state.loading" class="status-container loading">
      <div class="spinner" />
      <p>
        Loading tests for {{ props.subjectId }} - Level {{ props.levelId }}...
      </p>
    </div>

    <div v-else-if="state.error" class="status-container error">
      <p>{{ state.error }}</p>
      <button class="button retry-btn" @click="fetchQuestions">
        🔄 Try Again
      </button>
    </div>

    <div
      v-else-if="state.questions.length === 0"
      class="status-container warning"
    >
      <p>No questions available for this test.</p>
      <small>Please check subject and level configuration.</small>
    </div>

    <div v-else-if="!state.testFinished" class="question-screen">
      <ProgressBar
        :currentPage="state.currentPage"
        :total="state.questions.length"
        :formattedTime="formattedTime"
        :timeLow="state.timer < 60"
      />

      <QuestionComponent
        :question="currentQuestion"
        :selectedAnswer="state.selectedAnswer"
        @selectAnswer="(val) => (state.selectedAnswer = val)"
      />

      <div class="pagination">
        <button
          v-for="(q, index) in state.questions"
          :key="index"
          :class="{
            'pagination-button': true,
            active: state.currentPage === index,
            completed: isQuestionAnswered(index) && state.currentPage !== index,
          }"
          @click="state.currentPage = index"
        >
          {{ index + 1 }}
        </button>
      </div>

      <button
        class="button"
        :class="{
          'finish-button': state.currentPage === state.questions.length - 1,
        }"
        @click="submitAnswer"
      >
        {{
          state.currentPage < state.questions.length - 1
            ? 'Next'
            : 'Finish Test'
        }}
      </button>
    </div>

    <div v-else class="status-container success">
      <p>🎉 You finished the test!</p>
      <p>✅ Score: {{ score }}/{{ state.questions.length }}</p>

      <div class="actions">
        <button class="button" @click="state.showReviewModal = true">
          🔍 Review Answers
        </button>
        <button class="button" @click="router.push('/')">🏠 Go Home</button>
      </div>
    </div>

    <transition name="modal">
      <div v-if="state.showReviewModal" class="modal-overlay review">
        <div class="modal-review-wrapper">
          <ReviewAnswers
            :questions="state.questions"
            :selectedAnswers="state.selectedAnswers"
          />
          <div class="modal-actions">
            <button class="button" @click="state.showReviewModal = false">
              Close Review
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
import { collection, getDocs, addDoc, Timestamp, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ReviewAnswers from '@/views/testPage/reviewModal.vue';
import ProgressBar from '@/views/testPage/progressBar.vue';
import QuestionComponent from '@/views/testPage/question.vue';
import { useRouter } from 'vue-router';

// Инициализация
const router = useRouter();

// Props
const props = defineProps({
  subjectId: { type: String, required: true },
  levelId: { type: String, required: true },
  questionCount: { type: Number, default: 10 },
});

// State (reactive)
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

// Таймер
let intervalId;

// Computed
const currentQuestion = computed(
  () => state.questions[state.currentPage]
);
const formattedTime = computed(() => {
  const m = Math.floor(state.timer / 60);
  const s = state.timer % 60;
  return `${m}:${s < 10 ? '0' + s : s}`;
});

const score = computed(() => {
  return state.questions.reduce((acc, q, i) => {
    const selectedIdx = state.selectedAnswers[i];
    return selectedIdx !== null && selectedIdx !== undefined && q.options[selectedIdx] === q.answer ? acc + 1 : acc;
  }, 0);
});

// Methods
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const isQuestionAnswered = (index) => {
  return state.selectedAnswers[index] !== null && state.selectedAnswers[index] !== undefined;
};

const fetchQuestions = async (options) => {
  if (options && options.sessionId) {
    state.sessionId = options.sessionId;
  }
  try {
    state.loading = true;
    state.error = null;

    const testsRef = collection(
      db,
      'subjects',
      props.subjectId,
      'levels',
      props.levelId,
      'tests'
    );
    const snapshot = await getDocs(testsRef);

    const allTests = snapshot.docs
      .map((doc) => doc.data())
      .filter((doc) => Array.isArray(doc.questions));

    if (!allTests.length) {
      throw new Error('Тесты не найдены');
    }

    const randomTest = allTests[Math.floor(Math.random() * allTests.length)];
    state.questions = shuffleArray(randomTest.questions).slice(
      0,
      props.questionCount
    );
    state.selectedAnswers = Array(state.questions.length).fill(
      null
    );
    state.currentPage = 0;
    state.selectedAnswer = null;
    state.testFinished = false;
  } catch (err) {
    console.error('Ошибка при загрузке вопросов:', err);
    state.error = err.message;
  } finally {
    state.loading = false;
  }
};

const submitAnswer = () => {
  if (state.selectedAnswer === null) {
    return alert('Пожалуйста, выберите ответ');
  }

  state.selectedAnswers[state.currentPage] = state.selectedAnswer;

  if (state.currentPage < state.questions.length - 1) {
    state.currentPage++;
    const prev = state.selectedAnswers[state.currentPage];
    state.selectedAnswer = prev !== null && prev !== undefined ? prev : null;
  } else {
    finishTest();
  }
};

const finishTest = async () => {
  try {
    state.testFinished = true;
    clearInterval(intervalId);

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Пользователь не авторизован');

    // Get count of user's previous test results for test_number
    const resultsRef = collection(db, 'results');
    const q = query(resultsRef, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const testNumber = snapshot.size + 1;

    const resultData = {
      userId: user.uid,
      username: user.displayName || user.email || 'User',
      sessionId: state.sessionId,
      subject: props.subjectId,
      test_level: props.levelId,
      score: score.value,
      total: state.questions.length,
      answers: state.selectedAnswers.map((idx, i) => idx !== null && idx !== undefined ? state.questions[i].options[idx] : null),
      timestamp: Timestamp.now(),
      test_number: testNumber,
    };

    await addDoc(collection(db, 'results'), resultData);
  } catch (err) {
    console.error('Ошибка при сохранении результатов:', err);
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

// Expose
defineExpose({ initializeTest: fetchQuestions });
</script>

<style scoped>
.test-page {
  padding: 2rem;
}

.status-container {
  text-align: center;
  margin-top: 3rem;
}

.spinner {
  margin: 1rem auto;
  border: 5px solid #ccc;
  border-top: 5px solid #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

.button {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  border: none;
  background-color: #333;
  color: white;
  cursor: pointer;
}

.button:hover {
  background-color: #555;
}
</style>
