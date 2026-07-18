<template>
  <component :is="activeMentor" v-if="activeMentor" />
  <div v-else class="not-found-container">
    <h2>404 - AI Ustoz topilmadi!</h2>
    <router-link to="/ai-setup">Ortga qaytish</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import MentorStandard from './mentors/MentorStandard.vue';
import MentorFriendly from './mentors/MentorFriendly.vue';
import MentorStrict from './mentors/MentorStrict.vue';
import MentorSocratic from './mentors/MentorSocratic.vue';
import MentorMotivator from './mentors/MentorMotivator.vue';
import MentorInnovator from './mentors/MentorInnovator.vue';
import MentorAnalyst from './mentors/MentorAnalyst.vue';
import MentorSage from './mentors/MentorSage.vue';
import MentorComedian from './mentors/MentorComedian.vue';

const route = useRoute();

const mentorsMap = {
  standard: MentorStandard,
  friendly: MentorFriendly,
  strict: MentorStrict,
  socratic: MentorSocratic,
  motivator: MentorMotivator,
  innovator: MentorInnovator,
  analyst: MentorAnalyst,
  sage: MentorSage,
  comedian: MentorComedian
};

const activeMentor = computed(() => mentorsMap[route.params.mentorId]);
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.not-found-container a {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: bold;
}
</style>
