<template>
  <div class="edit-profile-wrapper">
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <Transition name="toast-fade">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <div class="edit-profile-container layout-v4">
      <nav class="pro-top-navbar">
        <button type="button" :class="['pro-nav-link', { active: activeTab === 'profile' }]" @click="activeTab = 'profile'">
          <i class="fas fa-user-cog"></i> <span>{{ currentLocale === 'RUS' ? 'Профиль' : 'Profil' }}</span>
        </button>
        <button type="button" :class="['pro-nav-link', { active: activeTab === 'preferences' }]" @click="activeTab = 'preferences'">
          <i class="fas fa-sliders-h"></i> <span>{{ currentLocale === 'RUS' ? 'Настройки' : 'Sozlamalar' }}</span>
        </button>
        <button type="button" :class="['pro-nav-link', { active: activeTab === 'goals' }]" @click="activeTab = 'goals'">
          <i class="fas fa-bullseye"></i> <span>{{ currentLocale === 'RUS' ? 'Цели' : 'Maqsadlar' }}</span>
        </button>
        <button type="button" :class="['pro-nav-link', { active: activeTab === 'mentor' }]" @click="activeTab = 'mentor'">
          <i class="fas fa-robot"></i> <span>{{ currentLocale === 'RUS' ? 'AI Ментор' : 'AI Ustoz' }}</span>
        </button>
        <button type="button" :class="['pro-nav-link', { active: activeTab === 'achievements' }]" @click="activeTab = 'achievements'">
          <i class="fas fa-award"></i> <span>{{ currentLocale === 'RUS' ? 'Достижения' : 'Yutuqlar' }}</span>
        </button>
      </nav>

      <main class="profile-main-v4">
        <div class="pro-form-card">
          <form @submit.prevent="saveProfile" class="profile-form">
            
            <ProfileTab
              v-show="activeTab === 'profile'"
              v-model:profile="profile"
              v-model:selectedPhotoURL="selectedPhotoURL"
              :userPoints="userPoints"
              :currentLocale="currentLocale"
              :defaultUserImage="defaultUserImage"
              :presets="presets"
              :userEmail="userEmail"
              :showPassword="showPassword"
              :passwordError="passwordError"
              :passwordStrength="passwordStrength"
              :t="t"
              @go-to-ranks-page="goToRanksPage"
              @validate-password="validatePassword"
              @toggle-password-visibility="togglePasswordVisibility"
              @file-change="onFileChange"
              @open-id-card="showIdCard = true"
            />

            <PreferencesTab
              v-show="activeTab === 'preferences'"
              v-model:preferences="preferences"
              :profile="profile"
              :currentLocale="currentLocale"
              :subjectsList="subjectsList"
              :levelsList="levelsList"
              :loadingLevels="loadingLevels"
              :t="t"
              @set-interface-locale="setInterfaceLocale"
            />

            <div v-show="activeTab === 'goals'" class="tab-pane-content">
              <div class="pro-form-body">
                <GoalsEditor v-model="goalsList" :t="t" />
              </div>
            </div>

            <div v-show="activeTab === 'mentor'" class="tab-pane-content">
              <div class="pro-pane-header">
                <h3><i class="fas fa-robot text-purple"></i> {{ currentLocale === 'RUS' ? 'AI Ментор' : 'AI Ustoz' }}</h3>
                <p>{{ currentLocale === 'RUS' ? 'Выберите характер вашего ИИ-наставника.' : 'O\'zingiz uchun AI ustoz xarakterini tanlang.' }}</p>
              </div>
              <div class="pro-form-body">
                <AIMentorEditor 
                  v-model="preferences.mentorType" 
                  :is-premium="profile.isPremium" 
                  :current-locale="currentLocale" 
                />
              </div>
            </div>

            <AchievementsTab
              v-show="activeTab === 'achievements'"
              :currentLocale="currentLocale"
              :stats="stats"
              :badges="badges"
              :rawResults="rawResults"
              :profile="profile"
              :t="t"
            />

            <div class="pro-form-actions">
              <button type="button" class="pro-btn-secondary" @click="goBack" :disabled="loading">
                Cancel
              </button>
              <button v-if="activeTab !== 'achievements'" type="submit" class="pro-btn-primary" :disabled="loading || !!passwordError">
                <span v-if="loading"><i class="fas fa-circle-notch fa-spin"></i> {{ t('saving') }}</span>
                <span v-else>{{ t('save') }}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <!-- ID Card Component -->
      <ProfileIdCard
        :show="showIdCard"
        @close="showIdCard = false"
        :userName="profile.username"
        :profilePhoto="selectedPhotoURL || defaultUserImage"
        :userPoints="userPoints"
        :shortId="shortId"
        :userRankName="getRankName(userPoints, currentLocale)"
        :userRankIcon="getRankIcon(userPoints)"
        :joinedDate="memberSinceStr"
        :isRus="currentLocale === 'RUS'"
        :defaultUserImage="defaultUserImage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { supabase, authService, profileService, subjectService, resultService } from '@/services/supabaseService';
import { useI18n } from '@/utils/i18n';
import { getRankName, getRankClass, getRankIcon, getNextRankInfo, ranksData } from '@/utils/ranks.js';
import { sortLevels } from '@/utils/sorters';

import defaultUserImage from '../../assets/img/user.png';
import GoalsEditor from './components/GoalsEditor.vue';
import AIMentorEditor from './components/AIMentorEditor.vue';
import ProfileTab from './components/ProfileTab.vue';
import PreferencesTab from './components/PreferencesTab.vue';
import AchievementsTab from './components/AchievementsTab.vue';
import ProfileIdCard from './components/ProfileIdCard.vue';

const { t, locale: currentLocale, setLocale } = useI18n();
const router = useRouter();
const store = useStore();

const activeTab = ref('profile');
const profile = reactive({
  username: '',
  password: '',
  isPremium: true,
});
const userEmail = ref('');
const memberSince = ref(null);
const userPoints = ref(0);
const selectedPhotoURL = ref('');
const showPassword = ref(false);
const loading = ref(false);
const passwordError = ref('');
const goalsList = ref([]);
const showIdCard = ref(false);
const shortId = ref('');
const memberSinceStr = computed(() => {
  if (!memberSince.value) return currentLocale.value === 'RUS' ? 'Недавно' : 'Yaqinda';
  const d = new Date(memberSince.value);
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
});

const toast = reactive({ show: false, message: '', type: 'success' });

const preferences = reactive({
  defaultSubject: [],
  defaultLevel: '',
  dailyGoal: 10,
  defaultLocale: '',
  mentorType: 'friendly',
  offlineMode: false,
  unlockedMentors: ['friendly']
});
const subjectsList = ref([]);
const levelsList = ref([]);
const loadingLevels = ref(false);

const stats = reactive({
  totalTests: 0,
  averageAccuracy: 0,
  highestAccuracy: 0,
  perfectCount: 0,
  bestSubject: '—',
  streak: 0,
  streakFreezes: 0,
});
const rawResults = ref([]);

const presets = [
  { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cookie', color: '#3b82f6' },
  { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Buster', color: '#10b981' },
  { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Oliver', color: '#f59e0b' },
  { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Gizmo', color: '#ec4899' },
  { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bella', color: '#a855f7' },
  { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Coco', color: '#f97316' },
  { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smokey', color: '#06b6d4' },
  { id: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Rocky', color: '#64748b' }
];

const passwordStrength = computed(() => {
  const pwd = profile.password;
  if (!pwd) return { score: 0, text: '', color: '#cbd5e1' };
  
  let score = 0;
  if (pwd.length >= 6) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

  if (score === 1) return { score: 1, text: currentLocale.value === 'RUS' ? 'Слабый (Weak)' : 'Kuchsiz (Weak)', color: '#ef4444' };
  if (score === 2) return { score: 2, text: currentLocale.value === 'RUS' ? 'Средний (Medium)' : "O'rtacha (Medium)", color: '#f97316' };
  if (score === 3) return { score: 3, text: currentLocale.value === 'RUS' ? 'Сильный (Strong)' : 'Kuchli (Strong)', color: '#10b981' };
  return { score: 0, text: '', color: '#cbd5e1' };
});

const badges = computed(() => {
  const total = stats.totalTests;
  const perfect = stats.perfectCount;
  const pts = userPoints.value;
  return [
    { id: 'first_step', name: currentLocale.value === 'RUS' ? 'Первый шаг' : 'Birinchi qadam', desc: currentLocale.value === 'RUS' ? 'Решите хотя бы 1 тест' : 'Kamida 1 ta test yeching', icon: 'fas fa-walking', color: '#3b82f6', unlocked: total >= 1 },
    { id: 'persistent', name: currentLocale.value === 'RUS' ? 'Упорный' : 'Tirishqoq', desc: currentLocale.value === 'RUS' ? 'Решите 5 тестов' : '5 ta test yeching', icon: 'fas fa-fire', color: '#f97316', unlocked: total >= 5 },
    { id: 'scholar', name: currentLocale.value === 'RUS' ? 'Эрудит' : 'Bilimdon', desc: currentLocale.value === 'RUS' ? 'Решите 15 тестов' : '15 ta test yeching', icon: 'fas fa-book-reader', color: '#10b981', unlocked: total >= 15 },
    { id: 'perfect_score', name: currentLocale.value === 'RUS' ? 'Отличник' : "A'lochi", desc: currentLocale.value === 'RUS' ? 'Наберите 100% в тесте' : 'Testda 100% natija ko\'rsating', icon: 'fas fa-star', color: '#fbbf24', unlocked: perfect >= 1 },
    { id: 'coin_king', name: currentLocale.value === 'RUS' ? 'Король Коинов' : 'Koin Qiroli', desc: currentLocale.value === 'RUS' ? 'Наберите 500 очков' : '500 ball to\'plang', icon: 'fas fa-coins', color: '#a855f7', unlocked: pts >= 500 },
    { id: 'super_brain', name: currentLocale.value === 'RUS' ? 'Супер Мозг' : 'Super Aql', desc: currentLocale.value === 'RUS' ? 'Наберите 100% в 3 тестах' : '3 ta testda 100% natija ko\'rsating', icon: 'fas fa-brain', color: '#ec4899', unlocked: perfect >= 3 }
  ];
});

watch(() => preferences.defaultSubject, (newSub) => {
  if (newSub && newSub.length > 0) {
    fetchLevelsForSubject(newSub[0]);
  } else {
    levelsList.value = [];
    preferences.defaultLevel = '';
  }
}, { deep: true });

const showToast = (message, type = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => toast.show = false, 3500);
};

const goBack = () => router.back();
const goToRanksPage = () => router.push('/ranks');

const fetchLevelsForSubject = async (subjectId, preserveLevel = null) => {
  if (!subjectId) return;
  loadingLevels.value = true;
  try {
    const sbLevels = await subjectService.getLevels(subjectId);
    const rawIds = (sbLevels || []).map(l => l.name || l.id);
    const sortedIds = sortLevels(rawIds);
    levelsList.value = sortedIds.map(id => ({ id }));
    
    const currentSelected = preserveLevel || preferences.defaultLevel;
    if (currentSelected && !levelsList.value.find(l => l.id === currentSelected)) {
      preferences.defaultLevel = '';
    } else if (preserveLevel) {
      preferences.defaultLevel = preserveLevel;
    }
  } catch (err) {
    console.error('Error fetching levels:', err);
  } finally {
    loadingLevels.value = false;
  }
};

const fetchSubjects = async () => {
  try {
    const sbSubjects = await subjectService.getSubjects();
    subjectsList.value = (sbSubjects || []).map((s) => ({
      id: s.id,
      name: s.title_uz || s.name || s.title,
      nameUz: s.title_uz || s.name || s.title,
      nameRu: s.title_ru || s.name || s.title,
      icon: s.icon_url || s.icon || 'fas fa-book'
    }));
  } catch (err) {
    console.error('Error fetching subjects list:', err);
  }
};

const fetchUserResults = async (userId) => {
  try {
    const results = (await resultService.getUserResults(userId)) || [];
    rawResults.value = results;
    stats.totalTests = results.length;
    if (results.length > 0) {
      const sum = results.reduce((acc, item) => acc + Math.round((item.score / item.total) * 100), 0);
      stats.averageAccuracy = Math.round(sum / results.length);

      const accuracies = results.map(item => Math.round((item.score / item.total) * 100));
      stats.highestAccuracy = Math.max(...accuracies);
      stats.perfectCount = results.filter(item => item.score === item.total).length;

      const subjectSums = {};
      const subjectCounts = {};
      results.forEach(item => {
        const sub = item.subject_id || item.subject || 'Test';
        const pct = Math.round((item.score / item.total) * 100);
        subjectSums[sub] = (subjectSums[sub] || 0) + pct;
        subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
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
      stats.bestSubject = bestSub;

      const sorted = results
        .map(r => new Date(r.created_at || r.timestamp || Date.now()))
        .sort((a, b) => b - a);
      
      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0,0,0,0);
      
      let dateSet = new Set(sorted.map(d => {
        const dt = new Date(d);
        dt.setHours(0,0,0,0);
        return dt.getTime();
      }));

      let hasTodayOrYesterday = dateSet.has(checkDate.getTime()) || dateSet.has(checkDate.getTime() - 86400000);
      if (hasTodayOrYesterday) {
        let testDate = checkDate.getTime();
        if (!dateSet.has(testDate)) testDate -= 86400000;
        while (dateSet.has(testDate)) {
          currentStreak++;
          testDate -= 86400000;
        }
      }
      stats.streak = currentStreak;
    }
  } catch (err) {
    console.error('Error loading academic statistics:', err);
  }
};

const initializeProfileData = async () => {
  try {
    const user = await authService.getUser();
    if (user) {
      userEmail.value = user.email || '';
      memberSince.value = user.created_at || null;
      
      await fetchUserResults(user.id);
      await store.dispatch('user/fetchUserData');
      if (store.state.user?.goals) {
        goalsList.value = JSON.parse(JSON.stringify(store.state.user.goals));
      }

      const data = await profileService.getProfile(user.id);
      if (data) {
        profile.username = data.full_name || data.username || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        selectedPhotoURL.value = data.avatar_url || user.user_metadata?.avatar_url || '';
        userPoints.value = data.points || 0;
        shortId.value = data.short_id || user.id.substring(0, 8).toUpperCase();
        profile.isPremium = true;

        if (data.preferences) {
          let prefSub = data.preferences.defaultSubject;
          if (typeof prefSub === 'string') {
            preferences.defaultSubject = prefSub ? [prefSub] : [];
          } else if (Array.isArray(prefSub)) {
            preferences.defaultSubject = prefSub;
          } else {
            preferences.defaultSubject = [];
          }

          preferences.defaultLevel = data.preferences.defaultLevel || '';
          preferences.dailyGoal = data.preferences.defaultGoal || data.preferences.dailyGoal || 10;
          preferences.defaultLocale = data.preferences.defaultLocale || currentLocale.value;
          preferences.mentorType = data.preferences.mentorType || 'friendly';
          preferences.offlineMode = data.preferences.offlineMode || false;
          preferences.unlockedMentors = data.preferences.unlockedMentors || ['friendly'];
          
          if (preferences.defaultSubject.length > 0) {
            fetchLevelsForSubject(preferences.defaultSubject[0], preferences.defaultLevel);
          }
        } else {
          preferences.defaultLocale = currentLocale.value;
        }
      }
    } else {
      router.push('/login');
    }
  } catch (error) {
    console.error('Error fetching user document:', error);
  }
};

onMounted(() => {
  initializeProfileData();
  fetchSubjects();
});

const setInterfaceLocale = (lang) => {
  preferences.defaultLocale = lang;
  setLocale(lang);
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 1.5 * 1024 * 1024) {
    showToast(currentLocale.value === 'RUS' ? 'Размер файла превышает 1.5 МБ' : 'Fayl hajmi 1.5 MB dan oshmasligi kerak', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => selectedPhotoURL.value = event.target.result;
  reader.readAsDataURL(file);
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const validatePassword = () => {
  if (profile.password && profile.password.length < 6) {
    passwordError.value = t('passwordLengthError');
  } else {
    passwordError.value = '';
  }
};

const saveProfile = async () => {
  if (loading.value || passwordError.value) return;
  loading.value = true;
  try {
    const user = await authService.getUser();
    if (!user) {
      showToast('User session expired', 'error');
      return;
    }

    await profileService.updateProfile(user.id, {
      full_name: profile.username,
      avatar_url: selectedPhotoURL.value,
      preferences: {
        defaultSubject: preferences.defaultSubject,
        defaultLevel: preferences.defaultLevel,
        dailyGoal: Number(preferences.dailyGoal),
        defaultLocale: preferences.defaultLocale,
        mentorType: preferences.mentorType,
        offlineMode: preferences.offlineMode,
        unlockedMentors: preferences.unlockedMentors,
      }
    });

    if (profile.password && profile.password.trim() !== '') {
      await supabase.auth.updateUser({ password: profile.password });
    }

    await store.dispatch('user/saveGoals', goalsList.value);

    showToast(t('profileUpdated'), 'success');
    profile.password = '';
    
    window.dispatchEvent(new CustomEvent('profile-updated', {
      detail: { displayName: profile.username, photoURL: selectedPhotoURL.value }
    }));

    localStorage.setItem('user', JSON.stringify({
      uid: user.id,
      email: user.email,
      displayName: profile.username,
      photoURL: selectedPhotoURL.value,
    }));

    setTimeout(() => router.push('/'), 1500);
  } catch (err) {
    console.error('Error updating profile:', err);
    showToast(t('profileError') + ': ' + err.message, 'error');
  } finally {
    loading.value = false;
  }
};
</script>
<style src="./editProfile.css"></style>
