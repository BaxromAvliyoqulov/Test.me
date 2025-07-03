<template>
  <div>
    <div class="test-page">
      <Toast :toasts="toasts" />

      <!-- LOADING STATE -->
      <div v-if="loading" class="status-container loading">
        <div class="spinner"></div>
        <p>Loading tests for {{ subjectId }} - Level {{ levelId }}...</p>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="error" class="status-container error">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="button retry-btn" @click="retryFetch">Try Again</button>
      </div>

      <!-- NO QUESTIONS -->
      <div v-else-if="questions.length === 0" class="status-container warning">
        <i class="fas fa-info-circle"></i>
        <p>No questions available for this test.</p>
        <small>Please check the subject and level configuration.</small>
      </div>

      <!-- TEST BODY -->
      <div v-else class="questionScreen">
        <!-- Progress Bar -->
        <div class="test-progress">
          <span class="progress-text">
            Question {{ currentPage + 1 }} of {{ questions.length }}
          </span>
          <progress
            class="progress-bar"
            :value="currentPage + 1"
            :max="questions.length"
          ></progress>
        </div>

        <!-- Question Text -->
        <h1 class="question">{{ currentQuestion.question }}</h1>

        <!-- Answer Options -->
        <div class="answers">
          <div
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="answer-option"
          >
            <input
              type="radio"
              :id="'answer' + (index + 1)"
              :value="index"
              v-model="selectedAnswer"
              name="answer"
            />
            <label :for="'answer' + (index + 1)">{{ option }}</label>
          </div>
        </div>

        <!-- Pagination Buttons -->
        <div class="pagination">
          <button
            v-for="(question, index) in questions"
            :key="index"
            class="pagination-button"
            :class="{
              active: currentPage === index,
              completed: isQuestionAnswered(index) && currentPage !== index,
              current: currentPage === index,
            }"
            @click="goToPage(index)"
          >
            {{ index + 1 }}
          </button>
        </div>

        <!-- Submit Answer Button -->
        <button class="button" id="submit-button" @click="submitAnswer">
          {{ currentPage < questions.length - 1 ? 'Next' : 'Finish' }}
        </button>
      </div>

      <!-- Navigation Buttons -->
      <div v-if="questions.length > 0" class="navigation-buttons">
        <button
          class="button"
          id="prev-button"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 0"
        >
          Prev
        </button>
        <button
          class="button"
          id="next-button"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === questions.length - 1"
        >
          Next
        </button>
      </div>

      <!-- Confirm Modal -->
      <transition name="modal">
        <div v-if="showConfirmModal" class="modal-overlay">
          <div class="modal-content">
            <h3>Do you want to finish the test?</h3>
            <p>
              After completing the test, you won't be able to change your
              answers.
            </p>
            <div class="modal-actions">
              <button
                class="button confirm-btn"
                @click="finishTest"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Saving...' : 'Yes, finish' }}
              </button>
              <button
                class="button cancel-btn"
                @click="showConfirmModal = false"
                :disabled="isSubmitting"
              >
                No, go back
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Toast from '@/components/Toast.vue';

export default {
  name: 'TestPage',
  components: {
    Toast,
  },
  props: {
    subjectId: String,
    levelId: String,
    questionCount: [Number, String],
  },
  data() {
    return {
      loading: true,
      error: null,
      questions: [],
      currentPage: 0,
      selectedAnswer: null,
      userAnswers: [],
      isSubmitting: false,
      showConfirmModal: false,
      toasts: [],
      testCompleted: false,
      correctAnswersCount: null,
      totalQuestionsCount: null,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentPage] || {};
    },
    questionCountNumber() {
      return parseInt(this.questionCount);
    },
    isAllAnswered() {
      return (
        this.questions.length > 0 &&
        this.userAnswers.length === this.questions.length &&
        this.userAnswers.every((a) => a !== null)
      );
    },
  },
  methods: {
    async fetchTests() {
      this.loading = true;
      this.error = null;
      this.questions = [];
      this.userAnswers = [];
      this.currentPage = 0;
      this.selectedAnswer = null;

      try {
        const subjectRef = doc(db, 'subjects', this.subjectId);
        const levelRef = doc(subjectRef, 'levels', this.levelId);
        const testsCollection = collection(levelRef, 'tests');
        const querySnapshot = await getDocs(testsCollection);

        let allTests = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            question: data.question,
            options: data.options,
            correctAnswer: parseInt(data.answer),
          };
        });

        if (allTests.length < this.questionCountNumber) {
          throw new Error(
            `Questions are not sufficient. Found: ${allTests.length}, required: ${this.questionCountNumber}`
          );
        }

        this.questions = this.getRandomQuestions(
          allTests,
          this.questionCountNumber
        );
        this.userAnswers = Array(this.questions.length).fill(null);
        this.selectedAnswer = null;
      } catch (error) {
        this.error = error.message;
        this.showToast(error.message, 'error');
      } finally {
        this.loading = false;
      }
    },

    retryFetch() {
      this.fetchTests();
    },
    goToPage(page) {
      if (page >= 0 && page < this.questions.length) {
        this.saveAnswer();
        this.currentPage = page;
        this.selectedAnswer = this.userAnswers[page] ?? null;
      }
    },
    saveAnswer() {
      if (this.selectedAnswer !== null) {
        this.userAnswers[this.currentPage] = Number(this.selectedAnswer);
      }
    },
    submitAnswer() {
      if (this.selectedAnswer === null) {
        this.showToast('Please select an answer', 'warning');
        return;
      }

      this.saveAnswer();

      const unansweredIndex = this.userAnswers.findIndex((a) => a === null);
      if (unansweredIndex !== -1) {
        this.goToPage(unansweredIndex);
      } else {
        this.showConfirmModal = true;
      }
    },

    async finishTest() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      try {
        let correctAnswers = 0;

        this.questions.forEach((question, index) => {
          const userAnswer = this.userAnswers[index];
          const correctAnswer = question.correctAnswer;

          if (parseInt(userAnswer) === parseInt(correctAnswer)) {
            correctAnswers++;
          }
        });

        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error('User is not authenticated');
        }

        const resultData = {
          user_id: user.uid,
          username: user.displayName || user.email || 'anonymous',
          subject: this.subjectId,
          test_level: this.levelId,
          score: correctAnswers,
          total: this.questions.length,
          test_number: Date.now(),
          answers: this.userAnswers,
          timestamp: Timestamp.now(),
        };

        await addDoc(collection(db, 'results'), resultData);

        const percentage = Math.round(
          (correctAnswers / this.questions.length) * 100
        );
        this.testCompleted = true;
        this.correctAnswersCount = correctAnswers;
        this.totalQuestionsCount = this.questions.length;

        this.showToast(
          `Test completed! Correct answers: ${correctAnswers} out of ${this.questions.length} (${percentage}%)`,
          'success'
        );

        this.$emit('test-completed', {
          subjectId: this.subjectId,
          levelId: this.levelId,
          score: correctAnswers,
          total: this.questions.length,
          percentage,
        });
      } catch (error) {
        this.showToast(error.message, 'error');
      } finally {
        this.isSubmitting = false;
        this.showConfirmModal = false;
      }
    },

    showToast(message, type = 'info', duration = 3000) {
      const id = Date.now();
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, duration);
    },

    isQuestionAnswered(index) {
      return this.userAnswers[index] !== null;
    },

    getRandomQuestions(arr, count) {
      return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
    },
  },
  created() {
    this.fetchTests();
  },
  watch: {
    subjectId: 'fetchTests',
    levelId: 'fetchTests',
    questionCount: 'fetchTests',
  },
};
</script>
<!-- === script end -->

<style scoped>
.test-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.status-container {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ccc;
  border-top-color: #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.question {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.answers {
  margin-bottom: 2rem;
}

.answer-option {
  margin: 0.5rem 0;
}

.answer-option input[type='radio'] {
  margin-right: 0.5rem;
}

.pagination {
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #eee;
  cursor: pointer;
}

.pagination-button.active,
.pagination-button.current {
  background-color: #2196f3;
  color: white;
}

.pagination-button.completed {
  background-color: #4caf50;
  color: white;
}

.button {
  padding: 0.6rem 1.2rem;
  margin: 0.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  background-color: #2196f3;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #1976d2;
}

.progress-bar {
  width: 100%;
  height: 10px;
  appearance: none;
  margin-top: 0.5rem;
}

progress::-webkit-progress-bar {
  background-color: #f3f3f3;
  border-radius: 5px;
}

progress::-webkit-progress-value {
  background-color: #2196f3;
  border-radius: 5px;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-around;
}

.confirm-btn {
  background-color: #4caf50;
}

.cancel-btn {
  background-color: #f44336;
}
</style>
