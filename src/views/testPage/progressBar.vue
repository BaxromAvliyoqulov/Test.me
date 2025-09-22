<template>
    <div class="test-progress">
        <span class="progress-info">
            Question {{ currentPage + 1 }} of {{ total }}
        </span>
        <progress class="progress-bar" :value="currentPage + 1" :max="total"></progress>
        <span class="timer">⏱ Time left: {{ formattedTime }}</span>
    </div>
</template>

<script setup>
const props = defineProps({
    currentPage: Number,
    total: Number,
    formattedTime: String
});
</script>

<style scoped>
.test-progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.progress-bar {
    flex: 1;
    height: 10px;
    margin: 0 1rem;
    background-color: #eee;
    border-radius: 5px;
}

.progress-info {
    font-weight: 500;
}

.timer {
    font-family: monospace;
    color: #444;
    white-space: nowrap;
}
</style>
