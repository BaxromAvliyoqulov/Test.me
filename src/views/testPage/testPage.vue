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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import ReviewAnswers from '@/views/testPage/reviewModal.vue';
import ProgressBar from '@/views/testPage/progressBar.vue';
import QuestionComponent from '@/views/testPage/question.vue';
import { useRouter } from 'vue-router';

// Инициализация
const store = useStore();
const router = useRouter();

// Props
const props = defineProps({
  subjectId: { type: String, required: true },
  levelId: { type: String, required: true },
  questionCount: { type: Number, default: 10 },
});

// State
const state = {
  loading: ref(true),
  error: ref(null),
  questions: ref([]),
  selectedAnswers: ref([]),
  selectedAnswer: ref(null),
  currentPage: ref(0),
  testFinished: ref(false),
  showReviewModal: ref(false),
  timer: ref(900),
  sessionId: ref(null),
};

// Таймер
let intervalId;

// Computed
const currentQuestion = computed(
  () => state.questions.value[state.currentPage.value]
);
const formattedTime = computed(() => {
  const m = Math.floor(state.timer.value / 60);
  const s = state.timer.value % 60;
  return `${m}:${s < 10 ? '0' + s : s}`;
});

const score = computed(() => {
  return state.questions.value.reduce((acc, q, i) => {
    return state.selectedAnswers.value[i] === q.answer ? acc + 1 : acc;
  }, 0);
});

// Methods
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const fetchQuestions = async () => {
  try {
    state.loading.value = true;
    state.error.value = null;

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
    state.questions.value = shuffleArray(randomTest.questions).slice(
      0,
      props.questionCount
    );
    state.selectedAnswers.value = Array(state.questions.value.length).fill(
      null
    );
    state.currentPage.value = 0;
    state.selectedAnswer.value = null;
    state.testFinished.value = false;
  } catch (err) {
    console.error('Ошибка при загрузке вопросов:', err);
    state.error.value = err.message;
  } finally {
    state.loading.value = false;
  }
};

const submitAnswer = () => {
  if (state.selectedAnswer.value === null) {
    return alert('Пожалуйста, выберите ответ');
  }

  state.selectedAnswers.value[state.currentPage.value] =
    state.questions.value[state.currentPage.value].options[
      state.selectedAnswer.value
    ];

  if (state.currentPage.value < state.questions.value.length - 1) {
    state.currentPage.value++;
    const prev = state.selectedAnswers.value[state.currentPage.value];
    state.selectedAnswer.value = prev
      ? state.questions.value[state.currentPage.value].options.indexOf(prev)
      : null;
  } else {
    finishTest();
  }
};

const finishTest = async () => {
  try {
    state.testFinished.value = true;
    clearInterval(intervalId);

    const user = store.state.user;
    if (!user) throw new Error('Пользователь не авторизован');

    const resultData = {
      userId: user.uid,
      sessionId: state.sessionId.value,
      subjectId: props.subjectId,
      levelId: props.levelId,
      score: score.value,
      totalQuestions: state.questions.value.length,
      answers: state.selectedAnswers.value,
      completedAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'results'), resultData);
  } catch (err) {
    console.error('Ошибка при сохранении результатов:', err);
    state.error.value = err.message;
  }
};

// Lifecycle
onMounted(() => {
  fetchQuestions();
  intervalId = setInterval(() => {
    if (state.timer.value > 0) state.timer.value--;
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
