<template>
  <div>
    <div class="test-page">
      <Toast :toasts="toasts" />

      <div v-if="loading" class="status-container loading">
        <div class="spinner"></div>
        <p>Loading tests for {{ subjectId }} - Level {{ levelId }}...</p>
      </div>

      <div v-else-if="error" class="status-container error">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="button retry-btn" @click="retryFetch">Try Again</button>
      </div>

      <div v-else-if="questions.length === 0" class="status-container warning">
        <i class="fas fa-info-circle"></i>
        <p>No questions available for this test.</p>
        <small>Please check the subject and level configuration.</small>
      </div>

      <div v-else class="questionScreen">
        <div class="test-progress">
          <span class="progress-text">
            Question {{ currentPage }} of {{ questions.length }}
          </span>
        </div>

        <h1 class="question">{{ currentQuestion.question }}</h1>
        <div class="answers">
          <div v-for="(option, index) in currentQuestion.options" :key="index">
            <input
              type="radio"
              class="answer"
              name="answer"
              :id="'answer' + (index + 1)"
              :value="index"
              v-model="selectedAnswer"
            />
            <label :for="'answer' + (index + 1)">{{ option }}</label>
            <br />
          </div>
        </div>

        <div class="pagination">
          <button
            v-for="page in questions.length"
            :key="page"
            class="pagination-button"
            :class="{
              active: currentPage === page,
              completed: isQuestionAnswered(page),
              current: currentPage === page,
            }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button class="button" id="submit-button" @click="submitAnswer">
          Submit
        </button>
      </div>

      <div v-if="questions.length > 0" class="navigation-buttons">
        <button
          class="button"
          id="prev-button"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          Prev
        </button>
        <button
          class="button"
          id="next-button"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === questions.length"
        >
          Next
        </button>
      </div>

      <transition name="modal">
        <div v-if="showConfirmModal" class="modal-overlay">
          <div class="modal-content">
            <h3>Testni yakunlashni xohlaysizmi?</h3>
            <p>
              Testni yakunlagandan so'ng, javoblarni o'zgartirish imkoni
              bo'lmaydi.
            </p>
            <div class="modal-actions">
              <button
                class="button confirm-btn"
                @click="finishTest"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Saqlanmoqda...' : 'Ha, yakunlash' }}
              </button>
              <button
                class="button cancel-btn"
                @click="showConfirmModal = false"
                :disabled="isSubmitting"
              >
                Yo'q, qaytish
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
      currentPage: 1,
      selectedAnswer: null,
      userAnswers: {},
      isSubmitting: false,
      showConfirmModal: false,
      toasts: [],
      testCompleted: false,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentPage - 1] || {};
    },
    questionCountNumber() {
      return parseInt(this.questionCount);
    },
    isAllAnswered() {
      return Object.keys(this.userAnswers).length === this.questions.length;
    },
  },
  methods: {
    async fetchTests() {
      this.loading = true;
      this.error = null;
      this.questions = [];

      try {
        const subjectRef = doc(db, 'subjects', this.subjectId);
        const levelRef = doc(subjectRef, 'levels', this.levelId);
        const testsCollection = collection(levelRef, 'tests');
        const querySnapshot = await getDocs(testsCollection);

        let allTests = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Test data:', data);
          return {
            id: doc.id,
            question: data.question,
            options: data.options,
            correctAnswer: Number(data.answer),
          };
        });

        if (allTests.length < this.questionCountNumber) {
          throw new Error(
            `Недостаточно вопросов. Найдено: ${allTests.length}, требуется: ${this.questionCountNumber}`
          );
        }

        this.questions = this.getRandomQuestions(
          allTests,
          this.questionCountNumber
        );
        console.log('Loaded questions:', this.questions);
      } catch (error) {
        console.error('Error fetching tests:', error);
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
      if (page >= 1 && page <= this.questions.length) {
        if (this.selectedAnswer !== null) {
          this.userAnswers[this.currentPage] = Number(this.selectedAnswer);
        }
        this.currentPage = page;
        this.selectedAnswer = this.userAnswers[page] ?? null;
      }
    },
    submitAnswer() {
      if (this.selectedAnswer === null) {
        this.showToast('Пожалуйста, выберите ответ', 'warning');
        return;
      }

      console.log('Submitting answer:', {
        question: this.currentPage,
        selected: this.selectedAnswer,
        correct: this.currentQuestion.correctAnswer,
      });

      this.userAnswers[this.currentPage] = Number(this.selectedAnswer);

      if (this.currentPage < this.questions.length) {
        this.goToPage(this.currentPage + 1);
      } else if (this.isAllAnswered) {
        this.showConfirmModal = true;
      }
    },
    async finishTest() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      try {
        let correctAnswers = 0;

        this.questions.forEach((question, index) => {
          const userAnswer = this.userAnswers[index + 1];
          const correctAnswer = question.correctAnswer;

          console.log(`Question ${index + 1}:`, {
            userAnswer,
            correctAnswer,
            isCorrect: userAnswer === correctAnswer,
          });

          if (userAnswer === correctAnswer) {
            correctAnswers++;
          }
        });

        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error('Пользователь не авторизован');
        }

        const resultData = {
          user_id: user.uid,
          username: user.displayName || user.email || 'anonymous',
          subject: this.subjectId,
          test_level: this.levelId,
          score: correctAnswers,
          total: this.questions.length,
          answers: this.userAnswers,
          timestamp: Timestamp.now(),
        };

        await addDoc(collection(db, 'results'), resultData);

        const percentage = Math.round(
          (correctAnswers / this.questions.length) * 100
        );
        this.testCompleted = true;

        this.showToast(
          `Тест завершен! Правильных ответов: ${correctAnswers} из ${this.questions.length} (${percentage}%)`,
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
        console.error('Error finishing test:', error);
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
    isQuestionAnswered(page) {
      return this.userAnswers[page] !== undefined;
    },
    getRandomQuestions(arr, count) {
      return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
    },
  },
  beforeDestroy() {
    this.toasts.forEach((toast) => clearTimeout(toast.timeout));
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

<style scoped>
.test-page {
  text-align: center;
  margin-top: 20px;
}

.status-container {
  margin: 40px auto;
  padding: 30px;
  max-width: 500px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status-container.loading {
  background-color: #f8f9fa;
}

.status-container.error {
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
}

.status-container.warning {
  background-color: #fffaf0;
  border: 1px solid #fbd38d;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.retry-btn {
  margin-top: 15px;
  background-color: #4299e1;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.test-progress {
  margin-bottom: 15px;
}

.progress-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.question {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.answers {
  margin-top: 20px;
  text-align: left;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.answers div {
  margin-bottom: 10px;
}

label {
  font-size: 18px;
  margin-left: 10px;
}

.button {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 10px 2px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #0056b3;
}

.button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.navigation-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-button {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
  position: relative;
}

.pagination-button.completed {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.pagination-button.completed::after {
  content: '✓';
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 12px;
  background: #fff;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #28a745;
  border: 1px solid #28a745;
}

.pagination-button.current {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
  transform: scale(1.1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.pagination-button:hover {
  background-color: #0056b3;
  color: white;
  transform: translateY(-2px);
}

.pagination-button:active {
  transform: translateY(2px);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.confirm-btn {
  background: #28a745;
}

.cancel-btn {
  background: #dc3545;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .test-page {
    margin-top: 10px;
    padding: 0 5px;
  }

  .answers {
    gap: 8px;
  }

  .navigation-buttons {
    gap: 5px;
  }

  .pagination {
    gap: 5px;
  }

  .pagination-button {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
