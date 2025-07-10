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

        <!-- !!! Pagination Buttons !!! -->
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
      <!-- <div v-if="questions.length > 0" class="navigation-buttons">
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
      </div> -->

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
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  increment,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Toast from '@/components/Toast.vue';

export default {
  name: 'TestPage',
  components: { Toast },
  props: {
    subjectId: { type: String, required: true },
    levelId: { type: String, required: true },
    questionCount: { type: Number, required: true },
  },
  data() {
    return {
      loading: true,
      error: null,
      questions: [],
      currentPage: 0,
      selectedAnswers: [],
      selectedAnswer: null,
      showConfirmModal: false,
      isSubmitting: false,
      toasts: [],
      startTime: null,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentPage];
    },
  },
  methods: {
    async fetchQuestions() {
      this.loading = true;
      this.error = null;

      try {
        const testsRef = collection(
          db,
          'subjects',
          this.subjectId,
          'levels',
          this.levelId,
          'tests'
        );

        const snapshot = await getDocs(testsRef);
        let allQuestions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (allQuestions.length === 0) {
          this.questions = [];
          return;
        }

        allQuestions = this.shuffleArray(allQuestions).slice(
          0,
          this.questionCount
        );
        this.questions = allQuestions;
      } catch (err) {
        console.error('❌ Fetch error:', err);
        this.error = 'Could not load test questions.';
      } finally {
        this.loading = false;
      }
    },

    shuffleArray(array) {
      return array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    },

    retryFetch() {
      this.error = null;
      this.fetchQuestions();
    },

    goToPage(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentPage = index;
        this.selectedAnswer = this.selectedAnswers[index] ?? null;
      }
    },

    isQuestionAnswered(index) {
      return this.selectedAnswers[index] !== undefined;
    },

    submitAnswer() {
      if (this.selectedAnswer === null) {
        this.showToast('⚠️ Please select an answer first!', 'warning');
        return;
      }

      this.selectedAnswers[this.currentPage] = this.selectedAnswer;
      this.selectedAnswer = null;

      if (this.currentPage < this.questions.length - 1) {
        this.currentPage++;
        this.selectedAnswer = this.selectedAnswers[this.currentPage] ?? null;
      } else {
        this.showConfirmModal = true;
      }
    },

    async finishTest() {
      this.isSubmitting = true;

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('User not found');

        const endTime = Date.now();
        const durationInSeconds = Math.floor((endTime - this.startTime) / 1000);
        const allowedTime = this.questions.length * 60;

        let correctCount = 0;
        this.questions.forEach((q, index) => {
          const selectedIndex = this.selectedAnswers[index];
          const selectedOption = q.options[selectedIndex];
          if (selectedOption === q.answer) correctCount++;
        });

        const result = {
          userId: user.uid,
          username: user.displayName || user.email,
          subject: this.subjectId,
          test_level: this.levelId,
          test_number: 1,
          score: correctCount,
          total: this.questions.length,
          timestamp: Timestamp.now(),
          durationInSeconds,
        };

        // ⏱ Anti-cheat: Juda tez tugatganmi?
        if (durationInSeconds < allowedTime * 0.5) {
          result.suspicious = true;
          this.showToast(
            '❗ Juda tez tugatdingiz. Bu test shubhali deb belgilandi.',
            'error'
          );
        }

        // 📝 Save to Firestore
        await addDoc(collection(db, 'results'), result);

        // 🎁 TP ballarni qo‘shish
        const totalPoints = correctCount * 10;
        const userRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userRef, {
            points: increment(totalPoints),
          });
        } catch (err) {
          await setDoc(userRef, { points: totalPoints }, { merge: true });
        }

        this.showToast(
          `🎉 Test yakunlandi! Siz ${totalPoints} TP yutdingiz!`,
          'success'
        );

        this.$emit('test-completed', {
          correctAnswers: correctCount,
          totalQuestions: this.questions.length,
        });

        this.showConfirmModal = false;
      } catch (err) {
        this.showToast('❌ Error saving results: ' + err.message, 'error');
        console.error('❌ finishTest error:', err);
      } finally {
        this.isSubmitting = false;
      }
    },

    showToast(message, type = 'info') {
      this.toasts.push({ message, type });
    },

    handleTabSwitch() {
      if (document.hidden) {
        this.showToast("⚠️ Siz boshqa tabga o'tdingiz!", 'warning');
      }
    },
  },

  mounted() {
    this.startTime = Date.now();
    this.fetchQuestions();

    // Anti-tab va inspect
    document.addEventListener('visibilitychange', this.handleTabSwitch);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U') ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        alert('🚫 Developer Tools bloklangan!');
      }
    });
  },

  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.handleTabSwitch);
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
