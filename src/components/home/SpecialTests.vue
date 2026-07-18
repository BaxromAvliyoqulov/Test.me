<template>
  <div class="panel-section">
    <div class="section-header">
      <span class="step-badge special"><i class="fas fa-star"></i></span>
      <h3>DTM va Maxsus Imtihonlar</h3>
    </div>
    
    <div v-if="loadingSpecial" class="loading-state">
      <div class="spinner"></div>
      <p>Maxsus testlar yuklanmoqda...</p>
    </div>
    
    <div class="special-tests-list" v-else-if="specialTests.length > 0">
      <div v-for="test in specialTests" :key="test.id" class="special-test-card" @click="$emit('start-test', test)">
        <div class="st-icon" :class="test.category.toLowerCase()">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="st-details">
          <h4>{{ test.title }}</h4>
          <span class="st-category">{{ test.category }}</span>
        </div>
        <button class="btn-st-start"><i class="fas fa-play"></i> Boshlash</button>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <i class="fas fa-box-open"></i>
      <p>Hozircha maxsus testlar yo'q.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  specialTests: { type: Array, required: true },
  loadingSpecial: { type: Boolean, default: false }
});

const emit = defineEmits(['start-test']);
</script>

<style scoped>
/* Scoped styles will be maintained globally or in home.vue for now */
</style>
