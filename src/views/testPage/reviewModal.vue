<template>
  <div class="test-page review-mode">
    <h2 class="status-container">Test Review</h2>

    <div class="stats">
      <p>✅ Correct: {{ correctCount }}</p>
      <p>❌ Incorrect: {{ incorrectCount }}</p>
    </div>

    <div
      v-for="(question, index) in questions"
      :key="index"
      class="question-block"
    >
      <p class="question">{{ index + 1 }}. {{ question.question }}</p>

      <div class="answers">
        <div
          v-for="(option, optIndex) in question.options"
          :key="optIndex"
          class="answer-option"
          :class="{
            correct: isCorrectAnswer(index, optIndex),
            incorrect: isSelectedIncorrect(index, optIndex),
          }"
        >
          <label>
            <span v-if="selectedAnswers[index] === optIndex">
              <span v-if="isCorrectAnswer(index, optIndex)">✅ </span>
              <span v-else>❌ </span>
            </span>
            <span v-else-if="isCorrectAnswer(index, optIndex)">👉 </span>
            {{ option }}
          </label>
        </div>
      </div>
    </div>

    <div class="navigation-buttons">
      <button class="button" @click="$router.push('/')">Go to Home</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  questions: { type: Array, required: true },
  selectedAnswers: { type: Array, required: true },
});

const router = useRouter();

const correctCount = computed(() => {
  return props.questions.reduce((count, q, i) => {
    const selected = props.selectedAnswers[i];
    return q.options[selected] === q.answer ? count + 1 : count;
  }, 0);
});

const incorrectCount = computed(() => {
  return props.questions.length - correctCount.value;
});

const isCorrectAnswer = (qIndex, optIndex) => {
  return props.questions[qIndex].answer === props.questions[qIndex].options[optIndex];
};

const isSelectedIncorrect = (qIndex, optIndex) => {
  return props.selectedAnswers[qIndex] === optIndex && !isCorrectAnswer(qIndex, optIndex);
};
</script>

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
  font-size: 1.5rem;
}

.stats {
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.question {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.answers {
  margin-bottom: 2rem;
}

.answer-option {
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.3rem;
  background-color: #f0f0f0;
}

.answer-option.correct {
  background-color: #c8e6c9;
}

.answer-option.incorrect {
  background-color: #ffcdd2;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.button {
  padding: 0.6rem 1.2rem;
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

@media (max-width: 600px) {
  .test-page {
    padding: 1rem;
  }

  .question {
    font-size: 1.1rem;
  }

  .stats {
    font-size: 1rem;
  }

  .answer-option {
    font-size: 0.95rem;
  }

  .button {
    width: 100%;
  }
}
</style>
