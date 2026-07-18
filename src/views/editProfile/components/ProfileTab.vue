<template>
  <div class="tab-pane-content">
    <!-- Minimal Rank Progress Banner -->
    <div class="minimal-rank-progress-banner" @click="$emit('go-to-ranks-page')">
      <div class="minimal-rank-header">
        <span class="rank-lbl">{{ currentLocale === 'RUS' ? 'Ваш Ранг' : 'Sizning Rangingiz' }}</span>
        <span class="rank-val">{{ getRankName(userPoints, currentLocale) }}</span>
      </div>
      <div class="minimal-progress-bar">
        <div class="minimal-progress-fill" :style="{ width: getNextRankInfo(userPoints, currentLocale).progressPercent + '%' }"></div>
      </div>
      <div class="minimal-rank-footer">
        <span>{{ userPoints }} TP</span>
        <span class="text-blue-500">→ {{ getNextRankInfo(userPoints, currentLocale).nextRankName }}</span>
      </div>
    </div>

    <!-- ID Card Action -->
    <button class="id-card-btn" type="button" @click="$emit('open-id-card')">
      <i class="fas fa-id-badge"></i>
      <span>{{ currentLocale === 'RUS' ? 'Показать ID Карту' : 'ID Kartani Ko\'rish' }}</span>
    </button>

    <div class="pro-pane-header">
      <h3>{{ currentLocale === 'RUS' ? 'Личные Данные' : 'Shaxsiy Ma\'lumotlar' }}</h3>
      <p>{{ currentLocale === 'RUS' ? 'Обновите свое фото и личные данные.' : 'O\'z rasmingiz va ma\'lumotlaringizni yangilang.' }}</p>
    </div>

    <!-- Avatar Settings Row -->
    <div class="pro-avatar-section">
      <div class="pro-avatar-preview">
        <img :src="selectedPhotoURL || defaultUserImage" alt="Avatar" />
      </div>
      <div class="pro-avatar-actions">
        <div class="custom-uploader-wrap">
          <button type="button" class="pro-btn-outline" @click="triggerFileInput">
            <i class="fas fa-cloud-upload-alt"></i> {{ t('customAvatar') }}
          </button>
          <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" class="hidden-file-input" />
        </div>
        <div class="avatar-presets-mini">
          <button
            type="button"
            v-for="preset in presets.slice(0, 4)"
            :key="preset.id"
            :class="['preset-btn-mini', { active: selectedPhotoURL === preset.id }]"
            @click="$emit('update:selectedPhotoURL', preset.id)"
          >
            <img :src="preset.id" class="preset-img" alt="Preset" />
          </button>
        </div>
      </div>
    </div>

    <div class="pro-form-body">
      <!-- Username Field -->
      <div class="form-group">
        <label for="username" class="group-label">
          <i class="fas fa-user"></i> {{ t('usernameLabel') }}
        </label>
        <div class="input-wrapper">
          <i class="fas fa-user-edit input-icon"></i>
          <input
            type="text"
            id="username"
            v-model="profileProxy.username"
            class="styled-input"
            style="padding-right: 3.5rem;"
            required
            placeholder="Enter username"
            maxlength="16"
            autocomplete="off"
          />
          <span class="char-count">{{ profileProxy.username.length }}/16</span>
        </div>
      </div>

      <!-- Email Field (Read-only) -->
      <div class="form-group">
        <label class="group-label">
          <i class="fas fa-envelope"></i> {{ t('emailLabel') }}
        </label>
        <div class="input-wrapper disabled-wrapper">
          <i class="fas fa-at input-icon"></i>
          <input
            type="text"
            :value="userEmail"
            disabled
            class="styled-input disabled-input"
            style="padding-right: 6rem;"
          />
          <span class="secure-badge">
            <i class="fas fa-shield-alt"></i> Secure
          </span>
        </div>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password" class="group-label">
          <i class="fas fa-key"></i> {{ t('password') }}
        </label>
        <div class="input-wrapper">
          <i class="fas fa-lock input-icon"></i>
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="profileProxy.password"
            :class="['styled-input', { error: passwordError }]"
            style="padding-right: 3rem;"
            @input="$emit('validate-password')"
            :placeholder="currentLocale === 'RUS' ? '••••••••' : '••••••••'"
            autocomplete="new-password"
          />
          <i
            :class="['toggle-eye-icon', showPassword ? 'fas fa-eye-slash' : 'fas fa-eye']"
            @click="$emit('toggle-password-visibility')"
          ></i>
        </div>
        <span class="error-message" v-if="passwordError">
          <i class="fas fa-times-circle"></i> {{ passwordError }}
        </span>

        <!-- Password Strength Indicator -->
        <div class="strength-indicator-wrap" v-if="profileProxy.password">
          <div class="strength-bar-bg">
            <div 
              class="strength-bar-fg" 
              :style="{ 
                width: (passwordStrength.score * 33.3) + '%', 
                backgroundColor: passwordStrength.color 
              }"
            ></div>
          </div>
          <span class="strength-label" :style="{ color: passwordStrength.color }">
            {{ passwordStrength.text }}
          </span>
        </div>
        
        <p class="hintText">{{ t('passwordHint') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getRankName, getNextRankInfo } from '@/utils/ranks';

const props = defineProps({
  profile: Object,
  userPoints: Number,
  currentLocale: String,
  selectedPhotoURL: String,
  defaultUserImage: String,
  presets: Array,
  userEmail: String,
  showPassword: Boolean,
  passwordError: String,
  passwordStrength: Object,
  t: Function
});

const emit = defineEmits([
  'update:profile',
  'go-to-ranks-page',
  'update:selectedPhotoURL',
  'validate-password',
  'toggle-password-visibility',
  'file-change',
  'open-id-card'
]);

const profileProxy = computed({
  get: () => props.profile,
  set: (val) => emit('update:profile', val)
});

const fileInput = ref(null);

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const onFileChange = (e) => {
  emit('file-change', e);
};
</script>

<style scoped>
.id-card-btn {
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  padding: 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.id-card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
}
</style>
