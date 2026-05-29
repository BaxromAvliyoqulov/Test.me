<template>
  <div class="edit-profile-wrapper">
    <!-- Glowing background blobs matching the premium theme -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <!-- Custom Toast Notifications -->
    <Transition name="toast-fade">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Ranks Modal -->
    <transition name="modal-fade">
      <div v-if="showRanksModal" class="modal-overlay" @click.self="showRanksModal = false">
        <div class="modal-content ranks-modal">
          <div class="modal-header">
            <h3><i class="fas fa-trophy"></i> {{ currentLocale === 'RUS' ? 'Система Рангов' : 'Darajalar Tizimi' }}</h3>
            <button @click="showRanksModal = false" class="close-btn"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body ranks-path-container">
            <div class="rank-path-intro">
              <p>{{ currentLocale === 'RUS' ? 'Зарабатывайте TP, проходя тесты, чтобы повышать свой ранг и открывать новые возможности!' : 'Testlarni ishlash orqali TP yig\'ing va yangi darajalarga ko\'tariling!' }}</p>
            </div>
            
            <div class="ranks-timeline">
              <div 
                v-for="(rank, index) in ranksList" 
                :key="rank.id"
                class="rank-timeline-item"
                :class="[rank.class, { 'locked': userPoints < rank.min, 'current': userPoints >= rank.min && (index === ranksList.length - 1 || userPoints < ranksList[index + 1].min) }]"
              >
                <div class="timeline-line" v-if="index < ranksList.length - 1"></div>
                
                <div class="rank-node">
                  <div class="rank-icon-bubble">
                    <i :class="rank.icon"></i>
                  </div>
                </div>
                
                <div class="rank-details">
                  <h4>{{ currentLocale === 'RUS' ? rank.nameRu : rank.nameUz }}</h4>
                  <span class="rank-req"><i class="fas fa-coins"></i> {{ rank.min }} TP {{ currentLocale === 'RUS' ? 'и выше' : 'dan boshlab' }}</span>
                  <div class="current-indicator" v-if="userPoints >= rank.min && (index === ranksList.length - 1 || userPoints < ranksList[index + 1].min)">
                    {{ currentLocale === 'RUS' ? 'Текущий ранг' : 'Sizning darajangiz' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="edit-profile-container">
      <!-- Left Column: Live ID Card Preview -->
      <div class="preview-section">
        <h2 class="section-title">
          <i class="fas fa-id-card"></i> {{ t('livePreview') }}
        </h2>
        <div 
          class="id-card-wrapper"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <div class="id-card">
            <!-- Card Header -->
            <div class="id-card-header">
              <div class="id-card-logo">Test.me</div>
              <div class="id-card-title">{{ t('studentId') }}</div>
              <i class="fas fa-microchip chip-icon"></i>
            </div>
            
            <!-- Card Body -->
            <div class="id-card-body">
              <div class="id-card-avatar-wrap">
                <img 
                  :src="selectedPhotoURL || defaultUserImage" 
                  class="id-card-avatar"
                  alt="Student Avatar"
                />
              </div>
              
              <div class="id-card-info">
                <div class="id-card-name">{{ profile.username || 'Your Name' }}</div>
                <div class="id-card-email">{{ userEmail || 'student@test.me' }}</div>
                
                <div :class="['rank-badge', getRankClass(userPoints)]">
                  <i :class="getRankIcon(userPoints)"></i>
                  <span>{{ getRankName(userPoints, currentLocale) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Card Footer -->
            <div class="id-card-footer">
              <div class="id-card-stat">
                <span class="stat-lbl">{{ t('points') }}</span>
                <span class="stat-val">{{ userPoints }} TP</span>
              </div>
              <div class="id-card-stat text-right">
                <span class="stat-lbl">{{ t('memberSince') }}</span>
                <span class="stat-val">{{ getMemberSince(memberSince) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Rank Progress Card -->
        <div class="rank-progress-card clickable-rank" @click="showRanksModal = true">
          <div class="progress-card-header">
            <span>{{ currentLocale === 'RUS' ? 'Прогресс Ранга' : 'Rang Progressi' }}</span>
            <span class="progress-target-text">
              → {{ getNextRankInfo(userPoints, currentLocale).nextRankName }}
            </span>
          </div>
          <div class="progress-bar-container">
            <div 
              class="progress-bar-fill" 
              :style="{ width: getNextRankInfo(userPoints, currentLocale).progressPercent + '%' }"
            ></div>
          </div>
          <div class="progress-footer-stats">
            <span>{{ getNextRankInfo(userPoints, currentLocale).label }}</span>
            <span v-if="getNextRankInfo(userPoints, currentLocale).pointsNeeded > 0">
              {{ currentLocale === 'RUS' ? `Нужно еще ${getNextRankInfo(userPoints, currentLocale).pointsNeeded} TP` : `Yana ${getNextRankInfo(userPoints, currentLocale).pointsNeeded} TP kerak` }}
            </span>
            <span v-else>{{ currentLocale === 'RUS' ? 'Максимальный Ранг' : 'Maksimal Rang' }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Settings Form and Tabs Hub -->
      <div class="form-section">
        <div class="form-card">
          <!-- Premium Tab Navigation -->
          <div class="tabs-nav">
            <button 
              type="button" 
              :class="['tab-link', { active: activeTab === 'profile' }]" 
              @click="activeTab = 'profile'"
            >
              <i class="fas fa-user-cog"></i> 
              <span>{{ currentLocale === 'RUS' ? 'Профиль' : 'Profil' }}</span>
            </button>
            <button 
              type="button" 
              :class="['tab-link', { active: activeTab === 'preferences' }]" 
              @click="activeTab = 'preferences'"
            >
              <i class="fas fa-sliders-h"></i> 
              <span>{{ currentLocale === 'RUS' ? 'Цели' : 'Maqsadlar' }}</span>
            </button>
            <button 
              type="button" 
              :class="['tab-link', { active: activeTab === 'achievements' }]" 
              @click="activeTab = 'achievements'"
            >
              <i class="fas fa-award"></i> 
              <span>{{ currentLocale === 'RUS' ? 'Достижения' : 'Yutuqlar' }}</span>
            </button>
          </div>

          <form @submit.prevent="saveProfile" class="profile-form">
            <!-- TAB 1: Profile Details -->
            <div v-show="activeTab === 'profile'" class="tab-pane-content">
              <!-- Avatar Selector -->
              <div class="form-group">
                <label class="group-label">
                  <i class="fas fa-user-circle"></i> {{ t('avatarSelect') }}
                </label>
                
                <!-- Avatar Preset Grid -->
                <div class="avatar-presets">
                  <button
                    type="button"
                    v-for="preset in presets"
                    :key="preset.id"
                    :class="['preset-btn', { active: selectedPhotoURL === preset.id }]"
                    @click="selectPreset(preset.id)"
                    :style="{ borderColor: selectedPhotoURL === preset.id ? preset.color : 'transparent' }"
                  >
                    <img :src="preset.id" class="preset-img" alt="Avatar Preset" />
                  </button>
                </div>

                <!-- Custom File Uploader -->
                <div class="custom-uploader-wrap">
                  <button
                    type="button"
                    class="custom-uploader-btn"
                    @click="triggerFileInput"
                  >
                    <i class="fas fa-cloud-upload-alt"></i> {{ t('customAvatar') }}
                  </button>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="onFileChange"
                    accept="image/*"
                    class="hidden-file-input"
                  />
                </div>
              </div>

              <!-- Username Field -->
              <div class="form-group">
                <label for="username" class="group-label">
                  <i class="fas fa-signature"></i> {{ t('usernameLabel') }}
                </label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    id="username"
                    v-model="profile.username"
                    class="styled-input"
                    required
                    placeholder="Enter username"
                    maxlength="16"
                    autocomplete="off"
                  />
                  <span class="char-count">{{ profile.username.length }}/16</span>
                </div>
              </div>

              <!-- Email Field (Read-only) -->
              <div class="form-group">
                <label class="group-label">
                  <i class="fas fa-envelope-open-text"></i> {{ t('emailLabel') }}
                </label>
                <div class="input-wrapper disabled-wrapper">
                  <i class="fas fa-lock input-icon"></i>
                  <input
                    type="text"
                    :value="userEmail"
                    disabled
                    class="styled-input disabled-input"
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
                    v-model="profile.password"
                    :class="['styled-input', { error: passwordError }]"
                    @input="validatePassword"
                    placeholder="••••••••"
                    autocomplete="new-password"
                  />
                  <i
                    :class="['toggle-eye-icon', showPassword ? 'fas fa-eye-slash' : 'fas fa-eye']"
                    @click="togglePasswordVisibility"
                  ></i>
                </div>
                <span class="error-message" v-if="passwordError">
                  <i class="fas fa-times-circle"></i> {{ passwordError }}
                </span>

                <!-- Password Strength Indicator -->
                <div class="strength-indicator-wrap" v-if="profile.password">
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

            <!-- TAB 2: Learning Preferences -->
            <div v-show="activeTab === 'preferences'" class="tab-pane-content">
              <!-- System Language Toggle -->
              <div class="form-group">
                <label class="group-label">
                  <i class="fas fa-language"></i> {{ currentLocale === 'RUS' ? 'Язык интерфейса' : 'Tizim tili' }}
                </label>
                <div class="language-selection-toggle">
                  <button 
                    type="button"
                    :class="['lang-toggle-btn', { active: preferences.defaultLocale === 'UZB' }]"
                    @click="setInterfaceLocale('UZB')"
                  >
                    O'zbekcha (UZB)
                  </button>
                  <button 
                    type="button"
                    :class="['lang-toggle-btn', { active: preferences.defaultLocale === 'RUS' }]"
                    @click="setInterfaceLocale('RUS')"
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
                  <select id="pref-subject" v-model="preferences.defaultSubject" class="styled-input select-input">
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
                  <select id="pref-level" v-model="preferences.defaultLevel" class="styled-input select-input" :disabled="!preferences.defaultSubject || loadingLevels">
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
                  <select id="pref-daily-goal" v-model="preferences.dailyGoal" class="styled-input select-input">
                    <option :value="5">5 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
                    <option :value="10">10 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
                    <option :value="15">15 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
                    <option :value="20">20 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
                    <option :value="25">25 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
                    <option :value="30">30 {{ currentLocale === 'RUS' ? 'Вопросов' : 'ta savol' }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- TAB 3: Academic Achievements & Milestones -->
            <div v-show="activeTab === 'achievements'" class="tab-pane-content">
              <!-- Grid Statistics Cards -->
              <div class="stats-mini-grid">
                <div class="stat-mini-card">
                  <i class="fas fa-clipboard-list stat-mini-icon text-blue"></i>
                  <div class="stat-mini-info">
                    <span class="stat-mini-lbl">{{ currentLocale === 'RUS' ? 'Всего тестов' : 'Jami testlar' }}</span>
                    <span class="stat-mini-val">{{ stats.totalTests }}</span>
                  </div>
                </div>
                
                <div class="stat-mini-card">
                  <i class="fas fa-percentage stat-mini-icon text-orange"></i>
                  <div class="stat-mini-info">
                    <span class="stat-mini-lbl">{{ currentLocale === 'RUS' ? 'Ср. Точность' : 'O\'rtacha aniqlik' }}</span>
                    <span class="stat-mini-val">{{ stats.averageAccuracy }}%</span>
                  </div>
                </div>

                <div class="stat-mini-card">
                  <i class="fas fa-trophy stat-mini-icon text-gold"></i>
                  <div class="stat-mini-info">
                    <span class="stat-mini-lbl">{{ currentLocale === 'RUS' ? 'Лучший результат' : 'Eng yuqori ball' }}</span>
                    <span class="stat-mini-val">{{ stats.highestAccuracy }}%</span>
                  </div>
                </div>

                <div class="stat-mini-card">
                  <i class="fas fa-star stat-mini-icon text-purple"></i>
                  <div class="stat-mini-info">
                    <span class="stat-mini-lbl">{{ currentLocale === 'RUS' ? 'Лучший предмет' : 'Eng yaxshi fan' }}</span>
                    <span class="stat-mini-val text-truncate" :title="stats.bestSubject">{{ stats.bestSubject }}</span>
                  </div>
                </div>
              </div>

              <!-- Unlocked Badges Gallery Grid -->
              <div class="badges-gallery-wrap">
                <h3 class="badges-gallery-title">
                  <i class="fas fa-ribbon"></i> {{ currentLocale === 'RUS' ? 'Мои Награды' : 'Mening mukofotlarim' }}
                </h3>
                <div class="badges-gallery-grid">
                  <div 
                    v-for="badge in badges" 
                    :key="badge.id" 
                    :class="['badge-gallery-item', { locked: !badge.unlocked }]"
                  >
                    <div 
                      class="badge-icon-bubble"
                      :style="{ 
                        backgroundColor: badge.unlocked ? badge.color + '15' : '#f1f5f9',
                        borderColor: badge.unlocked ? badge.color : '#e2e8f0',
                        color: badge.unlocked ? badge.color : '#94a3b8'
                      }"
                    >
                      <i :class="badge.icon"></i>
                      <i v-if="!badge.unlocked" class="fas fa-lock badge-lock-icon"></i>
                    </div>
                    <div class="badge-gallery-meta">
                      <span class="badge-gallery-name">{{ badge.name }}</span>
                      <span class="badge-gallery-desc">{{ badge.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions buttons -->
            <div class="form-actions">
              <button
                type="button"
                class="cancel-btn"
                @click="goBack"
                :disabled="loading"
              >
                <i class="fas fa-arrow-left"></i> Cancel
              </button>
              <button
                v-if="activeTab !== 'achievements'"
                type="submit"
                class="submit-btn"
                :disabled="loading || !!passwordError"
              >
                <span v-if="loading" class="btn-loading">
                  <i class="fas fa-circle-notch fa-spin"></i> {{ t('saving') }}
                </span>
                <span v-else>
                  <i class="fas fa-save"></i> {{ t('save') }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, updatePassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { useI18n } from '@/utils/i18n';
import { getRankName, getRankClass, getRankIcon, getNextRankInfo, ranksData } from '@/utils/ranks.js';
import { sortLevels } from '@/utils/sorters';
import defaultUserImage from '../../assets/img/user.png';

export default {
  name: 'EditProfile',
  setup() {
    const { t, locale, setLocale } = useI18n();
    return {
      t,
      currentLocale: locale,
      changeLocale: setLocale
    };
  },
  data() {
    return {
      activeTab: 'profile', // active tab: profile, preferences, achievements
      profile: {
        username: '',
        password: '',
      },
      userEmail: '',
      memberSince: null,
      userPoints: 0,
      selectedPhotoURL: '',
      defaultUserImage,
      showPassword: false,
      loading: false,
      passwordError: '',
      showRanksModal: false,
      ranksList: ranksData,
      
      // Toast notification status
      toast: {
        show: false,
        message: '',
        type: 'success',
      },

      // Learning preferences
      preferences: {
        defaultSubject: '',
        defaultLevel: '',
        dailyGoal: 10,
        defaultLocale: '',
      },
      subjectsList: [], // List of subjects fetched from db
      levelsList: [], // List of levels for the selected subject
      loadingLevels: false,

      // Academic metrics
      stats: {
        totalTests: 0,
        averageAccuracy: 0,
        highestAccuracy: 0,
        perfectCount: 0,
        bestSubject: '—'
      },

      // Predefined avatar selections
      presets: [
        { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cookie', color: '#3b82f6' },
        { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Buster', color: '#10b981' },
        { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Oliver', color: '#f59e0b' },
        { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Gizmo', color: '#ec4899' },
        { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bella', color: '#a855f7' },
        { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Coco', color: '#f97316' },
        { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smokey', color: '#06b6d4' },
        { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Rocky', color: '#64748b' }
      ],
    };
  },
  computed: {
    passwordStrength() {
      const pwd = this.profile.password;
      if (!pwd) return { score: 0, text: '', color: '#cbd5e1' };
      
      let score = 0;
      if (pwd.length >= 6) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

      if (score === 1) {
        return { 
          score: 1, 
          text: this.currentLocale === 'RUS' ? 'Слабый (Weak)' : 'Kuchsiz (Weak)', 
          color: '#ef4444' 
        };
      }
      if (score === 2) {
        return { 
          score: 2, 
          text: this.currentLocale === 'RUS' ? 'Средний (Medium)' : "O'rtacha (Medium)", 
          color: '#f97316' 
        };
      }
      if (score === 3) {
        return { 
          score: 3, 
          text: this.currentLocale === 'RUS' ? 'Сильный (Strong)' : 'Kuchli (Strong)', 
          color: '#10b981' 
        };
      }
      return { score: 0, text: '', color: '#cbd5e1' };
    },
    badges() {
      const total = this.stats.totalTests;
      const perfect = this.stats.perfectCount;
      const pts = this.userPoints;
      
      return [
        { 
          id: 'first_step', 
          name: this.currentLocale === 'RUS' ? 'Первый шаг' : 'Birinchi qadam', 
          desc: this.currentLocale === 'RUS' ? 'Решите хотя бы 1 тест' : 'Kamida 1 ta test yeching',
          icon: 'fas fa-walking', 
          color: '#3b82f6', 
          unlocked: total >= 1 
        },
        { 
          id: 'persistent', 
          name: this.currentLocale === 'RUS' ? 'Упорный' : 'Tirishqoq', 
          desc: this.currentLocale === 'RUS' ? 'Решите 5 тестов' : '5 ta test yeching',
          icon: 'fas fa-fire', 
          color: '#f97316', 
          unlocked: total >= 5 
        },
        { 
          id: 'scholar', 
          name: this.currentLocale === 'RUS' ? 'Эрудит' : 'Bilimdon', 
          desc: this.currentLocale === 'RUS' ? 'Решите 15 тестов' : '15 ta test yeching',
          icon: 'fas fa-book-reader', 
          color: '#10b981', 
          unlocked: total >= 15 
        },
        { 
          id: 'perfect_score', 
          name: this.currentLocale === 'RUS' ? 'Отличник' : "A'lochi", 
          desc: this.currentLocale === 'RUS' ? 'Наберите 100% в тесте' : 'Testda 100% natija ko\'rsating',
          icon: 'fas fa-star', 
          color: '#fbbf24', 
          unlocked: perfect >= 1 
        },
        { 
          id: 'coin_king', 
          name: this.currentLocale === 'RUS' ? 'Король Коинов' : 'Koin Qiroli', 
          desc: this.currentLocale === 'RUS' ? 'Наберите 500 очков' : '500 ball to\'plang',
          icon: 'fas fa-coins', 
          color: '#a855f7', 
          unlocked: pts >= 500 
        },
        { 
          id: 'super_brain', 
          name: this.currentLocale === 'RUS' ? 'Супер Мозг' : 'Super Aql', 
          desc: this.currentLocale === 'RUS' ? 'Наберите 100% в 3 тестах' : '3 ta testda 100% natija ko\'rsating',
          icon: 'fas fa-brain', 
          color: '#ec4899', 
          unlocked: perfect >= 3 
        }
      ];
    }
  },
  watch: {
    'preferences.defaultSubject'(newSub, oldSub) {
      if (newSub && newSub !== oldSub) {
        this.fetchLevelsForSubject(newSub);
      } else if (!newSub) {
        this.levelsList = [];
        this.preferences.defaultLevel = '';
      }
    }
  },
  created() {
    this.initializeProfileData();
    this.fetchSubjects();
  },
  methods: {
    initializeProfileData() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userEmail = user.email;
          this.memberSince = user.metadata.creationTime;
          
          try {
            // Load stats from results collection
            this.fetchUserResults(user.uid);

            const docSnap = await getDoc(doc(db, 'users', user.uid));
            if (docSnap.exists()) {
              const data = docSnap.data();
              this.profile.username = data.displayName || data.username || user.displayName || '';
              this.selectedPhotoURL = data.photoURL || user.photoURL || '';
              this.userPoints = data.points || 0;

              // Load preferences
              if (data.preferences) {
                this.preferences.defaultSubject = data.preferences.defaultSubject || '';
                this.preferences.defaultLevel = data.preferences.defaultLevel || '';
                this.preferences.dailyGoal = data.preferences.dailyGoal || 10;
                this.preferences.defaultLocale = data.preferences.defaultLocale || this.currentLocale;
                
                if (this.preferences.defaultSubject) {
                  this.fetchLevelsForSubject(this.preferences.defaultSubject, this.preferences.defaultLevel);
                }
              } else {
                this.preferences.defaultLocale = this.currentLocale;
              }
            } else {
              this.profile.username = user.displayName || '';
              this.selectedPhotoURL = user.photoURL || '';
              this.userPoints = 0;
              this.preferences.defaultLocale = this.currentLocale;
            }
          } catch (error) {
            console.error('Error fetching user document:', error);
            this.profile.username = user.displayName || '';
            this.selectedPhotoURL = user.photoURL || '';
          }
        } else {
          this.$router.push('/login');
        }
      });
    },
    async fetchSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, 'subjects'));
        this.subjectsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (err) {
        console.error('Error fetching subjects list:', err);
      }
    },
    async fetchLevelsForSubject(subjectId, preserveLevel = null) {
      if (!subjectId) return;
      this.loadingLevels = true;
      try {
        const querySnapshot = await getDocs(collection(db, `subjects/${subjectId}/levels`));
        const fetchedLevels = querySnapshot.docs.map(doc => ({ id: doc.id }));
        
        // Use our sort logic which handles strings. We extract IDs, sort them, then reconstruct objects
        const rawIds = fetchedLevels.map(l => l.id);
        const sortedIds = sortLevels(rawIds);
        this.levelsList = sortedIds.map(id => ({ id }));
        
        const currentSelected = preserveLevel || this.preferences.defaultLevel;
        if (currentSelected && !this.levelsList.find(l => l.id === currentSelected)) {
          this.preferences.defaultLevel = '';
        } else if (preserveLevel) {
          this.preferences.defaultLevel = preserveLevel;
        }
      } catch (err) {
        console.error('Error fetching levels:', err);
      } finally {
        this.loadingLevels = false;
      }
    },
    async fetchUserResults(userId) {
      try {
        const resultsRef = collection(db, 'results');
        const q = query(resultsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => doc.data());
        
        this.stats.totalTests = results.length;
        if (results.length > 0) {
          // Average accuracy
          const sum = results.reduce((acc, item) => acc + Math.round((item.score / item.total) * 100), 0);
          this.stats.averageAccuracy = Math.round(sum / results.length);

          // Highest accuracy
          const accuracies = results.map(item => Math.round((item.score / item.total) * 100));
          this.stats.highestAccuracy = Math.max(...accuracies);

          // Perfect tests count
          this.stats.perfectCount = results.filter(item => item.score === item.total).length;

          // Best subject
          const subjectSums = {};
          const subjectCounts = {};
          results.forEach(item => {
            const pct = Math.round((item.score / item.total) * 100);
            subjectSums[item.subject] = (subjectSums[item.subject] || 0) + pct;
            subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
          });
          
          let bestSub = '—';
          let bestAvg = -1;
          for (const sub in subjectSums) {
            const avg = subjectSums[sub] / subjectCounts[sub];
            if (avg > bestAvg) {
              bestAvg = avg;
              bestSub = sub;
            }
          }
          this.stats.bestSubject = bestSub;
        }
      } catch (err) {
        console.error('Error loading academic statistics:', err);
      }
    },
    setInterfaceLocale(lang) {
      this.preferences.defaultLocale = lang;
      this.changeLocale(lang);
    },
    selectPreset(presetUrl) {
      this.selectedPhotoURL = presetUrl;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 1.5 * 1024 * 1024) {
        const errorMsg = this.currentLocale === 'RUS' 
          ? 'Размер файла превышает 1.5 МБ' 
          : 'Fayl hajmi 1.5 MB dan oshmasligi kerak';
        this.showToast(errorMsg, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        this.selectedPhotoURL = event.target.result;
      };
      reader.readAsDataURL(file);
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    validatePassword() {
      if (this.profile.password && this.profile.password.length < 6) {
        this.passwordError = this.t('passwordLengthError');
      } else {
        this.passwordError = '';
      }
    },
    showToast(message, type = 'success') {
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;
      
      setTimeout(() => {
        this.toast.show = false;
      }, 3500);
    },
    goBack() {
      this.$router.back();
    },
    async saveProfile() {
      if (this.loading) return;
      if (this.passwordError) return;

      this.loading = true;
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          this.showToast('User session expired', 'error');
          return;
        }

        // Determine if photoURL is a Base64 string (too long for Firebase Auth)
        // Firebase Auth only accepts HTTP/HTTPS URLs for photoURL, not Base64 data URIs
        const isBase64Photo = this.selectedPhotoURL && this.selectedPhotoURL.startsWith('data:');
        
        // The URL to pass to Firebase Auth (only if it's a real URL, not Base64)
        const authPhotoURL = isBase64Photo ? (user.photoURL || '') : (this.selectedPhotoURL || '');

        // 1. Update Firestore users document — stores full photoURL including Base64
        await setDoc(
          doc(db, 'users', user.uid),
          {
            username: this.profile.username,
            displayName: this.profile.username,
            photoURL: this.selectedPhotoURL,  // Full Base64 or URL stored here
            preferences: {
              defaultSubject: this.preferences.defaultSubject,
              defaultLevel: this.preferences.defaultLevel,
              dailyGoal: Number(this.preferences.dailyGoal),
              defaultLocale: this.preferences.defaultLocale,
            },
            updatedAt: new Date(),
          },
          { merge: true }
        );

        // 2. Update Firebase Auth Profile — only pass short HTTP URLs, NOT Base64
        await updateProfile(user, {
          displayName: this.profile.username,
          photoURL: authPhotoURL,
        });

        // 3. Update Password if specified
        if (this.profile.password) {
          await updatePassword(user, this.profile.password);
        }

        this.showToast(this.t('profileUpdated'), 'success');
        this.profile.password = '';
        
        // Triggers UI navbar updates instantly using a global CustomEvent
        // Use the full selectedPhotoURL (even Base64) for the live preview
        window.dispatchEvent(new CustomEvent('profile-updated', {
          detail: {
            displayName: this.profile.username,
            photoURL: this.selectedPhotoURL
          }
        }));

        // Triggers storage backup update
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: this.profile.username,
          photoURL: this.selectedPhotoURL,
        }));

        setTimeout(() => {
          this.$router.push('/');
        }, 1500);
      } catch (err) {
        console.error('Error updating user profile:', err);
        this.showToast(this.t('profileError') + ': ' + err.message, 'error');
      } finally {
        this.loading = false;
      }
    },
    
    // External Rank Helpers wrapper
    getRankName(pts, loc) { return getRankName(pts, loc); },
    getRankClass(pts) { return getRankClass(pts); },
    getRankIcon(pts) { return getRankIcon(pts); },
    getNextRankInfo(pts, loc) { return getNextRankInfo(pts, loc); },

    // Parallax 3D Card tilt logic
    handleMouseMove(e) {
      const card = e.currentTarget.querySelector('.id-card');
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const rotateX = -(y - yc) / 8; 
      const rotateY = (x - xc) / 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    },
    handleMouseLeave(e) {
      const card = e.currentTarget.querySelector('.id-card');
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    },

    getMemberSince(creationTime) {
      if (!creationTime) return '—';
      const date = new Date(creationTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.edit-profile-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  padding: 3rem 1.5rem;
  overflow: hidden;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Background Blobs */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.22;
  z-index: 0;
  pointer-events: none;
}

.glow-bg-1 {
  top: 10%;
  left: 10%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #3b82f6 0%, #60a5fa 100%);
}

.glow-bg-2 {
  bottom: 10%;
  right: 10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #a855f7 0%, #ec4899 100%);
}

.edit-profile-container {
  position: relative;
  z-index: 1;
  max-width: 980px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 868px) {
  .edit-profile-container {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

/* Toast Notifications styling */
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-notification.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.toast-notification.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Left side Title */
.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: #3b82f6;
}

/* ID Card Styles & 3D Tilt Container */
.id-card-wrapper {
  perspective: 1000px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.id-card {
  width: 100%;
  max-width: 380px;
  height: 230px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.12), inset 0 0 0 1px rgba(255,255,255,0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  position: relative;
}

.id-card-wrapper:hover .id-card {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 30px 60px -20px rgba(37, 99, 235, 0.25);
}

.id-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(25deg);
  transition: all 0.6s ease;
  pointer-events: none;
  z-index: 2;
}

.id-card:hover::after {
  left: 120%;
}

.id-card-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
}

.id-card-logo {
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: -0.5px;
}

.id-card-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  opacity: 0.85;
}

.chip-icon {
  font-size: 1.1rem;
  color: #f59e0b;
}

.id-card-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 1.25rem;
  flex-grow: 1;
  align-items: center;
}

.id-card-avatar-wrap {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  overflow: hidden;
  background-color: #f1f5f9;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.id-card-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.id-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.id-card-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.id-card-email {
  font-size: 0.78rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Rank Badge Styles */
.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-top: 6px;
  width: fit-content;
}

.rank-newbie {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.rank-bronze {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.rank-silver {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.rank-gold {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.rank-grandmaster {
  background: #faf5ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.12);
}

.id-card-footer {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
}

.id-card-stat {
  display: flex;
  flex-direction: column;
}

.stat-lbl {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.stat-val {
  font-size: 0.85rem;
  font-weight: 800;
  color: #334155;
}

.text-right {
  text-align: right;
}

/* Rank Progress Card */
.rank-progress-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 10px 25px -10px rgba(15, 23, 42, 0.05);
  transition: all 0.3s ease;
}

.rank-progress-card:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-4px);
  box-shadow: 0 15px 35px -10px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.progress-card-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.6rem;
}

.progress-target-text {
  color: #3b82f6;
  font-weight: 800;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #a855f7 100%);
  border-radius: 10px;
  transition: width 0.4s ease;
}

.progress-footer-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  font-weight: 700;
  color: #64748b;
}

/* Tab Navigation Styling */
.tabs-nav {
  display: flex;
  background-color: #f1f5f9;
  padding: 0.35rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  gap: 0.25rem;
}

.tab-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.7rem;
  border: none;
  background: transparent;
  border-radius: 12px;
  color: #64748b;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-link:hover {
  color: #0f172a;
}

.tab-link.active {
  background-color: #ffffff;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

@media (max-width: 480px) {
  .tabs-nav {
    flex-direction: column;
  }
}

/* Form Settings card */
.form-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 2.25rem;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tab-pane-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-label i {
  color: #3b82f6;
  font-size: 0.95rem;
}

/* Avatar presets grid styling */
.avatar-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.preset-btn {
  background: #f1f5f9;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preset-btn:hover {
  transform: scale(1.08);
  background: #e2e8f0;
}

.preset-btn.active {
  background: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 4px 15px -3px rgba(59, 130, 246, 0.3);
}

.preset-img {
  width: 100%;
  max-width: 52px;
  height: auto;
  border-radius: 12px;
}

.custom-uploader-wrap {
  margin-top: 0.5rem;
}

.custom-uploader-btn {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  color: #475569;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.custom-uploader-btn:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #2563eb;
}

.hidden-file-input {
  display: none;
}

/* Language Selection Toggle */
.language-selection-toggle {
  display: flex;
  gap: 0.75rem;
}

.lang-toggle-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.88rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-toggle-btn.active {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-color: #3b82f6;
  color: #0369a1;
}

.lang-toggle-btn:not(.active):hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

/* Styled Inputs with Icons */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 0.95rem;
}

.styled-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font-size: 0.95rem;
  color: #0f172a;
  background-color: #ffffff;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}

.styled-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.styled-input.error {
  border-color: #ef4444;
}

.styled-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.char-count {
  position: absolute;
  right: 14px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
}

/* Select option styles */
.select-wrapper::after {
  content: '';
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-top-color: #64748b;
  pointer-events: none;
}

.select-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  pointer-events: none;
}

.select-input {
  appearance: none;
  cursor: pointer;
  padding-right: 2.5rem;
}

/* Disabled styling */
.disabled-wrapper {
  background-color: #f1f5f9;
  border-radius: 14px;
}

.disabled-input {
  border-color: #e2e8f0;
  background-color: transparent;
  cursor: not-allowed;
  color: #64748b;
}

.secure-badge {
  position: absolute;
  right: 14px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Toggle eye styling */
.toggle-eye-icon {
  position: absolute;
  right: 14px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.95rem;
  transition: color 0.2s;
  padding: 4px;
}

.toggle-eye-icon:hover {
  color: #3b82f6;
}

.error-message {
  color: #ef4444;
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

/* Password Strength Indicator styling */
.strength-indicator-wrap {
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.strength-bar-bg {
  flex-grow: 1;
  height: 5px;
  background-color: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.strength-bar-fg {
  height: 100%;
  width: 0;
  border-radius: 10px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-label {
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
}

.hintText {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 2px;
  font-weight: 500;
}

/* Academic stats mini-grid */
.stats-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-mini-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.01);
}

.stat-mini-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.text-blue { color: #3b82f6; background-color: #eff6ff; }
.text-orange { color: #f97316; background-color: #fff7ed; }
.text-gold { color: #eab308; background-color: #fefbeb; }
.text-purple { color: #a855f7; background-color: #faf5ff; }

.stat-mini-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-mini-lbl {
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-mini-val {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e293b;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badges gallery styling */
.badges-gallery-wrap {
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.badges-gallery-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badges-gallery-title i {
  color: #fbbf24;
}

.badges-gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 480px) {
  .badges-gallery-grid {
    grid-template-columns: 1fr;
  }
}

.badge-gallery-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0.75rem;
  transition: all 0.25s ease;
}

.badge-gallery-item:hover:not(.locked) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}

.badge-gallery-item.locked {
  background-color: #f8fafc;
  opacity: 0.65;
}

.badge-icon-bubble {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  position: relative;
  flex-shrink: 0;
}

.badge-lock-icon {
  position: absolute;
  right: -2px;
  bottom: -2px;
  font-size: 0.6rem;
  background-color: #64748b;
  color: #ffffff;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-gallery-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.badge-gallery-name {
  font-size: 0.8rem;
  font-weight: 800;
  color: #1e293b;
}

.badge-gallery-desc {
  font-size: 0.68rem;
  color: #64748b;
  line-height: 1.3;
}

/* Form actions styling */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  color: #475569;
  font-size: 0.92rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.submit-btn {
  padding: 0.75rem 1.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px -3px rgba(37, 99, 235, 0.25);
  transition: all 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
}

.submit-btn:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Ranks Modal Styles */
.clickable-rank {
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.clickable-rank:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

.ranks-modal {
  max-width: 600px !important;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 24px;
}
.ranks-path-container {
  padding: 1.5rem;
}
.rank-path-intro {
  text-align: center;
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  line-height: 1.5;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
}

.ranks-timeline {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 20px;
}

.rank-timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  position: relative;
  padding-bottom: 2.5rem;
}

.rank-timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-line {
  position: absolute;
  top: 40px;
  bottom: -10px;
  left: 20px;
  width: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.rank-node {
  position: relative;
  z-index: 2;
}

.rank-icon-bubble {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: white;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #94a3b8;
  transition: all 0.3s;
}

.rank-details {
  flex-grow: 1;
  background: #f8fafc;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  position: relative;
  transition: all 0.3s;
}

.rank-details h4 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
}

.rank-req {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rank-req i {
  color: #f59e0b;
}

.current-indicator {
  position: absolute;
  top: -10px;
  right: 15px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
  animation: pulse-badge 2s infinite;
}

/* Rank specific colors */
.rank-newbie .rank-icon-bubble { border-color: #94a3b8; color: #94a3b8; }
.rank-bronze .rank-icon-bubble { border-color: #b45309; color: #b45309; }
.rank-silver .rank-icon-bubble { border-color: #94a3b8; color: #94a3b8; }
.rank-gold .rank-icon-bubble { border-color: #f59e0b; color: #f59e0b; }
.rank-platinum .rank-icon-bubble { border-color: #14b8a6; color: #14b8a6; }
.rank-diamond .rank-icon-bubble { border-color: #3b82f6; color: #3b82f6; }
.rank-master .rank-icon-bubble { border-color: #8b5cf6; color: #8b5cf6; }
.rank-grandmaster .rank-icon-bubble { border-color: #ec4899; color: #ec4899; }
.rank-legendary .rank-icon-bubble { border-color: #f43f5e; color: #f43f5e; }
.rank-mythic .rank-icon-bubble { border-color: #10b981; color: #10b981; }

.rank-timeline-item.locked .rank-icon-bubble {
  background: #f1f5f9;
  border-color: #e2e8f0 !important;
  color: #cbd5e1 !important;
}

.rank-timeline-item.locked .rank-details {
  opacity: 0.6;
}

.rank-timeline-item.current .rank-details {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15);
}
.rank-timeline-item.current .timeline-line {
  background: #3b82f6;
}

@keyframes pulse-badge {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

</style>
