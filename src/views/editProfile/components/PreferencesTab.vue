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
        <label for="pref-subject" class="group-label">
          <i class="fas fa-graduation-cap"></i> {{ currentLocale === 'RUS' ? 'Предмет по умолчанию' : 'Asosiy fan' }}
        </label>
        <div class="input-wrapper select-wrapper">
          <i class="fas fa-book select-icon"></i>
          <select id="pref-subject" v-model="preferencesProxy.defaultSubject" class="styled-input select-input">
            <option value="">{{ currentLocale === 'RUS' ? '-- Выберите предмет --' : '-- Fanni tanlang --' }}</option>
            <option v-for="sub in subjectsList" :key="sub.id" :value="sub.id">
              {{ sub.id }}
            </option>
          </select>
        </div>
      </div>

      <!-- Default Target Level Selection -->
      <div class="form-group">
        <label for="pref-level" class="group-label">
          <i class="fas fa-layer-group"></i> {{ currentLocale === 'RUS' ? 'Уровень сложности' : 'Qiyinchilik darajasi' }}
        </label>
        <div class="input-wrapper select-wrapper">
          <i class="fas fa-signal select-icon"></i>
          <select id="pref-level" v-model="preferencesProxy.defaultLevel" class="styled-input select-input" :disabled="!preferencesProxy.defaultSubject || loadingLevels">
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
</script>
