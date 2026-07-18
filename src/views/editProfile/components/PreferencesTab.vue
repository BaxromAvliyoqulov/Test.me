<template>
  <div class="tab-pane-content">
    <div class="pro-pane-header">
      <h3><i class="fas fa-sliders-h text-blue"></i> {{ t('preferences') }}</h3>
      <p>{{ currentLocale === 'RUS' ? 'Настройте платформу под себя.' : 'Platformani o\'zingizga moslashtiring.' }}</p>
    </div>

    <div class="pro-form-body">
      <!-- System Language Toggle -->
      <div class="form-group">
        <label class="group-label">
          <i class="fas fa-language"></i> {{ currentLocale === 'RUS' ? 'Язык интерфейса' : 'Tizim tili' }}
        </label>
        <div class="language-selection-toggle">
          <button 
            type="button"
            :class="['lang-toggle-btn', { active: preferencesProxy.defaultLocale === 'UZB' }]"
            @click="$emit('set-interface-locale', 'UZB')"
          >
            O'zbekcha (UZB)
          </button>
          <button 
            type="button"
            :class="['lang-toggle-btn', { active: preferencesProxy.defaultLocale === 'RUS' }]"
            @click="$emit('set-interface-locale', 'RUS')"
          >
            Русский (RUS)
          </button>
        </div>
      </div>

      <!-- Default Target Subject Selection -->
      <div class="form-group">
        <label class="group-label">
          <i class="fas fa-graduation-cap"></i> {{ currentLocale === 'RUS' ? 'Предмет по умолчанию (макс. 2)' : 'Asosiy fan (maks. 2 ta)' }}
        </label>
        <div class="subject-chips-container">
          <button 
            v-for="sub in subjectsList" 
            :key="sub.id"
            type="button"
            class="subject-chip"
            :class="{ active: Array.isArray(preferencesProxy.defaultSubject) && preferencesProxy.defaultSubject.includes(sub.id) }"
            @click="toggleSubject(sub.id)"
          >
            {{ sub.id }}
          </button>
        </div>
      </div>

      <!-- Default Target Level Selection -->
      <div class="form-group">
        <label for="pref-level" class="group-label">
          <i class="fas fa-layer-group"></i> {{ currentLocale === 'RUS' ? 'Уровень сложности' : 'Qiyinchilik darajasi' }}
        </label>
        <div class="input-wrapper select-wrapper">
          <i class="fas fa-signal select-icon"></i>
          <select id="pref-level" v-model="preferencesProxy.defaultLevel" class="styled-input select-input" :disabled="!preferencesProxy.defaultSubject || !preferencesProxy.defaultSubject.length || loadingLevels">
            <option value="">
              {{ loadingLevels ? (currentLocale === 'RUS' ? 'Загрузка...' : 'Yuklanmoqda...') : (currentLocale === 'RUS' ? '-- Выберите сложность --' : '-- Qiyinchilikni tanlang --') }}
            </option>
            <option v-for="level in levelsList" :key="level.id" :value="level.id">
              {{ level.id }}
            </option>
          </select>
        </div>
      </div>

      <!-- Daily Goal Question Counts -->
      <div class="form-group">
        <label for="pref-daily-goal" class="group-label">
          <i class="fas fa-bullseye"></i> {{ currentLocale === 'RUS' ? 'Ежедневная цель (Кол-во вопросов)' : 'Kunlik maqsad (Savollar soni)' }}
        </label>
        <div class="input-wrapper select-wrapper">
          <i class="fas fa-list-ol select-icon"></i>
          <select id="pref-daily-goal" v-model="preferencesProxy.dailyGoal" class="styled-input select-input">
            <option :value="5">5 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
            <option :value="10">10 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
            <option :value="15">15 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
            <option :value="20">20 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
            <option :value="25">25 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
            <option :value="30">30 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
          </select>
        </div>
      </div>

      <!-- Offline Mode Toggle (Premium) -->
      <div class="form-group">
        <label class="group-label">
          <i class="fas fa-wifi"></i> {{ currentLocale === 'RUS' ? 'Офлайн режим (Premium)' : 'Oflayn rejim (Premium)' }}
        </label>
        <div class="offline-toggle-box" :class="{ 'locked': !profile.isPremium }">
          <label class="switch">
            <input type="checkbox" v-model="preferencesProxy.offlineMode" :disabled="!profile.isPremium">
            <span class="slider round"></span>
          </label>
          <span>{{ currentLocale === 'RUS' ? 'Кэшировать тесты для работы без интернета' : 'Internetsiz ishlash uchun testlarni keshga saqlash' }}</span>
          <i v-if="!profile.isPremium" class="fas fa-lock text-red-500 ml-2"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  preferences: Object,
  profile: Object,
  currentLocale: String,
  subjectsList: Array,
  levelsList: Array,
  loadingLevels: Boolean,
  t: Function
});

const emit = defineEmits(['update:preferences', 'set-interface-locale']);

const preferencesProxy = computed({
  get: () => props.preferences,
  set: (val) => emit('update:preferences', val)
});

const toggleSubject = (subjectId) => {
  let current = Array.isArray(preferencesProxy.value.defaultSubject) 
    ? [...preferencesProxy.value.defaultSubject] 
    : [];
    
  if (current.includes(subjectId)) {
    current = current.filter(id => id !== subjectId);
  } else {
    if (current.length >= 2) {
      current.shift(); // Remove oldest to keep max 2
    }
    current.push(subjectId);
  }
  
  preferencesProxy.value.defaultSubject = current;
};
</script>

<style scoped>
.subject-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.subject-chip {
  padding: 0.6rem 1.25rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.subject-chip:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: translateY(-2px);
}

.subject-chip.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}
</style>
