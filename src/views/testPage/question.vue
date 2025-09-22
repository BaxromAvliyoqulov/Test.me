<template>
    <div class="question-container" v-if="question && question.options">
        <h2 class="question-text">{{ question.question }}</h2>

        <div class="answers" role="radiogroup" aria-label="Answer options">
            <div v-for="(option, index) in question.options" :key="index" class="answer-option">
                <input type="radio" :id="'answer' + index" :value="index" :checked="selectedAnswer === index"
                    :aria-checked="selectedAnswer === index" @change="$emit('selectAnswer', index)"
                    name="answer-options" />
                <label :for="'answer' + index">{{ option }}</label>
            </div>
        </div>
    </div>
    <div v-else class="question-container">
        <p>Loading question...</p>
    </div>
</template>

<script setup>
import { watch } from 'vue';

const props = defineProps({
    question: Object,
    selectedAnswer: Number
});

watch(() => props.question, (val) => {
    console.log('🧠 Question received in component:', val);
});
</script>

<style scoped>
.question-container {
    margin-bottom: 2rem;
}

.question-text {
    font-weight: bold;
    margin-bottom: 1rem;
}

.answers {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.answer-option input[type='radio'] {
    margin-right: 0.5rem;
}
</style>
