<template>
    <div class="test-progress">
        <span class="progress-info">
            Question {{ currentPage + 1 }} of {{ total }}
        </span>
        <progress class="progress-bar" :value="currentPage + 1" :max="total"></progress>
        <span :class="['timer', { pulse: timeLow }]">⏱ Time left: {{ formattedTime }}</span>
    </div>
</template>

<script setup>
const props = defineProps({
    currentPage: Number,
    total: Number,
    formattedTime: String,
    timeLow: Boolean
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
    transition: color 0.3s ease;
}

.timer.pulse {
    color: #dc3545;
    font-weight: bold;
    animation: pulse 1s infinite alternate;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    100% {
        transform: scale(1.05);
    }
}
</style>
