<template>
  <div class="app-root-container">
    <div class="dashboard-wrapper" v-show="!startTest">
      <!-- Glowing background elements for premium feel -->
      <div class="glow-bg glow-bg-1"></div>
      <div class="glow-bg glow-bg-2"></div>

      <div class="test-container">
        <!-- Welcome Banner -->
        <WelcomeBanner 
          :welcomeTitle="t('welcomeTitle', { name: userDisplayName || t('username') })"
          :welcomeSubtitle="t('welcomeSubtitle')"
          :points="userPoints"
        />

        <div class="dashboard-grid">
          <!-- Left Side: Interactive Selection Panel -->
          <div class="selection-panel">
            <!-- Test Type Tabs -->
            <div class="test-type-tabs premium-tabs">
              <button 
                :class="['tab-btn', { active: currentTab === 'standard' }]" 
                @click="currentTab = 'standard'"
              >
                <i class="fas fa-book-open"></i> {{ t('chooseSubject') || 'Asosiy Fanlar' }}
              </button>
              <button 
                :class="['tab-btn', { active: currentTab === 'special' }]" 
                @click="currentTab = 'special'"
              >
                <i class="fas fa-crown"></i> Maxsus Testlar
              </button>
            </div>

            <transition name="fade-slide" mode="out-in">
              <!-- STANDARD TAB -->
              <SubjectSelection 
                v-if="currentTab === 'standard'"
                key="standard"
                :subjects="subjects"
                :loadingSubjects="loadingSubjects"
                :selectedSubject="selectedSubject"
                :defaultSubjectId="defaultSubjectId"
                @select="selectSubjectCard"
                @reload="fetchSubjects"
              />

              <!-- SPECIAL TESTS TAB -->
              <SpecialTests
                v-else-if="currentTab === 'special'"
                key="special"
                :specialTests="specialTests"
                :loadingSpecial="loadingSpecial"
                @start-test="startSpecialTest"
              />
            </transition>
          </div>

          <!-- Right Side: Sidebar Info & AI Coach -->
          <div class="sidebar-panel">
            <RankProgress 
              :userPoints="userPoints"
              :currentLocale="currentLocale"
            />
            
            <AiCoach 
              :aiMentorInfo="aiMentorInfo"
              :aiAdviceLoading="aiAdviceLoading"
              :aiAdvice="aiAdvice"
              :currentLocale="currentLocale"
              @ai-action="handleAiBadgeClick"
            />
            
            <DailyAchievements 
              :userStreak="userStreak"
              :unlockedBadges="unlockedBadges"
              :currentLocale="currentLocale"
            />
          </div>
        </div>

        <transition name="slide-up">
          <div v-if="status" :class="['toast-alert', status.type]" @click="clearStatus">
            {{ status.message }}
          </div>
        </transition>
      </div>
    </div>

    <!-- Test Component -->
    <transition name="fade">
      <TestPage
        v-if="startTest"
        ref="testPage"
        :subjectId="selectedSubject?.id || 'special'"
        :levelId="selectedLevel"
        :questionCount="selectedQuestionCount"
        @test-completed="handleTestCompletion"
        @exit-test="goBackToSelection"
      />
    </transition>
  
    <!-- Modal Wizard Overlay -->
    <TestSetupModal
      :showTestWizard="showTestWizard"
      :selectedSubject="selectedSubject"
      :currentLocale="currentLocale"
      :loadingLevels="loadingLevels"
      :levels="levels"
      :selectedLevel="selectedLevel"
      @update:selectedLevel="selectedLevel = $event"
      :questionCounts="questionCounts"
      :selectedQuestionCount="selectedQuestionCount"
      @update:selectedQuestionCount="selectedQuestionCount = $event"
      :canStart="canStart"
      :loading="loading"
      @close="closeWizard"
      @start="startTestWithFilters"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onErrorCaptured, defineAsyncComponent } from 'vue';
import { supabase, authService, profileService, subjectService, resultService } from '@/services/supabaseService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import defaultUserImage from '../assets/img/user.png';
import { useI18n } from '@/utils/i18n';
import { getRankName, getRankClass, getRankIcon, getNextRankInfo } from '@/utils/ranks';
import { sortLevels } from '@/utils/sorters';
import { getMentorConfig } from '@/config/mentors';
import { getBadges } from '@/utils/badges';
import { DEFAULT_SUBJECTS, DEFAULT_SPECIAL_TESTS, getFallbackLevelsForSubject } from '@/config/defaultSubjects';
import { offlineDb } from '@/services/offlineDb';
const TestPage = defineAsyncComponent(() => import('./testPage/testPage.vue'));
import WelcomeBanner from '@/components/home/WelcomeBanner.vue';
import SubjectSelection from '@/components/home/SubjectSelection.vue';
import SpecialTests from '@/components/home/SpecialTests.vue';
import RankProgress from '@/components/home/RankProgress.vue';
import AiCoach from '@/components/home/AiCoach.vue';
import DailyAchievements from '@/components/home/DailyAchievements.vue';
import TestSetupModal from '@/components/home/TestSetupModal.vue';

const { t, locale: currentLocale } = useI18n();

onErrorCaptured((err, instance, info) => {
  console.error('Captured Vue Error:', err, info);
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;background:rgba(255,0,0,0.9);color:white;padding:40px;overflow:auto;font-size:20px;';
  div.innerHTML = '<h1>VUE RENDER ERROR</h1><p><strong>Message:</strong> ' + err.message + '</p><pre>' + err.stack + '</pre><p><strong>Info:</strong> ' + info + '</p>';
  document.body.appendChild(div);
  return false;
});

const testPage = ref(null);

const selectedSubject = ref(null);
const selectedLevel = ref('');
const selectedQuestionCount = ref('');
const showTestWizard = ref(false);
const questionCounts = ref([5, 10, 15, 20, 25, 30]);
const subjects = ref([...DEFAULT_SUBJECTS]);
const levels = ref([]);
const loading = ref(false);
const loadingSubjects = ref(false);
const loadingLevels = ref(false);
const status = ref(null);
const startTest = ref(false);
const currentTab = ref('standard');
const specialTests = ref([...DEFAULT_SPECIAL_TESTS]);
const loadingSpecial = ref(false);

const userDisplayName = ref('');
const userPoints = ref(0);
const aiAdvice = ref({ text: '', badge: '' });
const aiAdviceLoading = ref(false);
const userStreak = ref(0);
const unlockedBadges = ref([]);
const weakestSubject = ref('');
const strongestSubject = ref('');
const aiAdviceType = ref('');
const defaultSubjectId = ref(null);
const mentorType = ref('standard');

const isRus = computed(() => currentLocale.value === 'RUS');

const canStart = computed(() => {
  return (
    selectedSubject.value &&
    selectedLevel.value &&
    selectedQuestionCount.value &&
    !loading.value &&
    !loadingSubjects.value &&
    !loadingLevels.value
  );
});

const aiMentorInfo = computed(() => {
  const type = mentorType.value || 'standard';
  const mentor = getMentorConfig(type);
  
  return {
    name: mentor.name[currentLocale.value] || mentor.name['UZB'],
    icon: mentor.icon,
    colorClass: `theme-${mentor.id}`
  };
});

watch(currentLocale, () => {
  aiAdvice.value = getFallbackAdvice([]);
  fetchUserStats();
});

const getSubjectIcon = (name) => {
  if (!name) return 'fas fa-graduation-cap';
  const lower = name.toLowerCase();
  if (lower.includes('matem') || lower.includes('math')) return 'fas fa-calculator';
  if (lower.includes('fizik') || lower.includes('physics')) return 'fas fa-atom';
  if (lower.includes('ingliz') || lower.includes('english')) return 'fas fa-globe';
  if (lower.includes('ona tili') || lower.includes('uzbek')) return 'fas fa-book';
  if (lower.includes('kimyo') || lower.includes('chemistry')) return 'fas fa-flask';
  if (lower.includes('biolog') || lower.includes('biology')) return 'fas fa-dna';
  if (lower.includes('informatika') || lower.includes('computer')) return 'fas fa-laptop-code';
  if (lower.includes('tarix') || lower.includes('history')) return 'fas fa-landmark';
  if (lower.includes('geografiya') || lower.includes('geography')) return 'fas fa-globe-americas';
  if (lower.includes('adabiyot') || lower.includes('literature')) return 'fas fa-feather-alt';
  return 'fas fa-graduation-cap';
};

const getSubjectColor = (name) => {
  if (!name) return '#3b82f6';
  const lower = name.toLowerCase();
  if (lower.includes('matem') || lower.includes('math')) return '#8b5cf6';
  if (lower.includes('fizik') || lower.includes('physics')) return '#f59e0b';
  if (lower.includes('ingliz') || lower.includes('english')) return '#ef4444';
  if (lower.includes('ona tili') || lower.includes('uzbek')) return '#3b82f6';
  if (lower.includes('kimyo') || lower.includes('chemistry')) return '#10b981';
  if (lower.includes('biolog') || lower.includes('biology')) return '#84cc16';
  if (lower.includes('informatika') || lower.includes('computer')) return '#06b6d4';
  if (lower.includes('tarix') || lower.includes('history')) return '#d97706';
  if (lower.includes('geografiya') || lower.includes('geography')) return '#14b8a6';
  if (lower.includes('adabiyot') || lower.includes('literature')) return '#ec4899';
  return '#3b82f6';
};

const selectSubjectCard = (subject, showModal = true) => {
  if (selectedSubject.value?.id !== subject.id) {
    selectedLevel.value = '';
    selectedQuestionCount.value = '';
  }
  selectedSubject.value = subject;
  if (showModal) {
    showTestWizard.value = true;
  }
  fetchLevels();
};

const closeWizard = () => {
  showTestWizard.value = false;
  setTimeout(() => {
    selectedSubject.value = null;
    selectedLevel.value = '';
    selectedQuestionCount.value = '';
  }, 300);
};

const fetchSubjects = async () => {
  if (!subjects.value || subjects.value.length === 0) {
    loadingSubjects.value = true;
  }
  status.value = null;

  try {
    // 1. Try Supabase with strict 1s timeout
    const fetchPromise = subjectService.getSubjects();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase timeout')), 1000)
    );
    const sbSubjects = await Promise.race([fetchPromise, timeoutPromise]);
    if (sbSubjects && sbSubjects.length > 0) {
      subjects.value = sbSubjects.map(s => ({
        id: s.id,
        name: s.name_uz,
        nameUz: s.name_uz,
        nameRu: s.name_ru,
        icon: s.icon,
        color: s.color,
        description: s.description,
      }));
      offlineDb.cacheMetadata('subjects', subjects.value);
      return;
    }

    // 2. Try IndexedDB offline cache
    const cached = await offlineDb.getCachedMetadata('subjects');
    if (cached && cached.length > 0) {
      subjects.value = cached;
      return;
    }

    // 3. Guaranteed Default Fallback
    subjects.value = [...DEFAULT_SUBJECTS];
    offlineDb.cacheMetadata('subjects', DEFAULT_SUBJECTS);
  } catch {
    // Sokin fallback: tarmoq sekin bo'lsa darhol DEFAULT_SUBJECTS taqdim etiladi
    if (!subjects.value || subjects.value.length === 0) {
      subjects.value = [...DEFAULT_SUBJECTS];
    }
  } finally {
    loadingSubjects.value = false;
  }
};

const fetchSpecialTests = async () => {
  if (!specialTests.value || specialTests.value.length === 0) {
    loadingSpecial.value = true;
  }
  try {
    const fetchPromise = supabase.from('special_tests').select('*').order('created_at', { ascending: false });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Special tests timeout')), 1000)
    );
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
    if (!error && data && data.length > 0) {
      specialTests.value = data;
      offlineDb.cacheMetadata('special_tests', data);
      return;
    }

    const cached = await offlineDb.getCachedMetadata('special_tests');
    if (cached && cached.length > 0) {
      specialTests.value = cached;
      return;
    }

    specialTests.value = [...DEFAULT_SPECIAL_TESTS];
  } catch {
    if (!specialTests.value || specialTests.value.length === 0) {
      specialTests.value = [...DEFAULT_SPECIAL_TESTS];
    }
  } finally {
    loadingSpecial.value = false;
  }
};

const startSpecialTest = (test) => {
  loading.value = true;
  startTest.value = true;
  showTestWizard.value = false;
  nextTick(() => {
    testPage.value?.initializeTest({
      sessionId: 'special_' + Math.random().toString(36).substring(2, 9),
      subjectId: 'special',
      levelId: test.category || 'DTM',
      specialTestId: test.id,
      title: test.title
    });
    loading.value = false;
  });
};

const fetchLevels = async () => {
  if (!selectedSubject.value) return;

  const defaultLvls = sortLevels(getFallbackLevelsForSubject(selectedSubject.value.id || selectedSubject.value.name));
  levels.value = defaultLvls; // Darhol ko'rsatish

  loadingLevels.value = true;
  selectedLevel.value = '';
  status.value = null;

  try {
    // 1. Try Supabase with strict 1s timeout
    const fetchPromise = subjectService.getLevels(selectedSubject.value.id);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Levels timeout')), 1000)
    );
    const sbLevels = await Promise.race([fetchPromise, timeoutPromise]);
    if (sbLevels && sbLevels.length > 0) {
      const fetchedLevels = sbLevels.map(l => l.name || l.id);
      levels.value = sortLevels(fetchedLevels);
      offlineDb.cacheMetadata(`levels_${selectedSubject.value.id}`, levels.value);
      return;
    }

    // 2. Try IndexedDB offline cache
    const cached = await offlineDb.getCachedMetadata(`levels_${selectedSubject.value.id}`);
    if (cached && cached.length > 0) {
      levels.value = sortLevels(cached);
      return;
    }

    levels.value = defaultLvls;
    offlineDb.cacheMetadata(`levels_${selectedSubject.value.id}`, levels.value);
  } catch {
    levels.value = defaultLvls;
  } finally {
    loadingLevels.value = false;
  }
};

const clearStatus = () => {
  status.value = null;
};

const startTestWithFilters = async () => {
  if (!canStart.value) return;

  loading.value = true;

  try {
    const user = await authService.getUser();
    const testSession = {
      subjectId: selectedSubject.value.id,
      levelId: selectedLevel.value,
      questionCount: selectedQuestionCount.value,
      userId: user?.id,
      startedAt: new Date(),
      status: 'in-progress',
    };

    const sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    startTest.value = true;
    showTestWizard.value = false;

    nextTick(() => {
      testPage.value?.initializeTest({
        sessionId,
        ...testSession,
      });
    });
  } catch (error) {
    console.error('Error starting test:', error);
    status.value = {
      type: 'error',
      message: '❌ Error starting test: ' + error.message,
    };
  } finally {
    loading.value = false;
  }
};

const goBackToSelection = () => {
  startTest.value = false;
};

const handleTestCompletion = (results) => {
  status.value = {
    type: 'success',
    message: `✅ Test completed! You got ${results.correctAnswers} out of ${results.totalQuestions} questions correct.`,
  };
  startTest.value = false;
  fetchUserStats();
};

const applyUserPreferences = (prefs) => {
  let prefSubArray = [];
  if (Array.isArray(prefs.defaultSubject)) {
    prefSubArray = prefs.defaultSubject;
  } else if (typeof prefs.defaultSubject === 'string' && prefs.defaultSubject) {
    prefSubArray = [prefs.defaultSubject];
  }

  if (prefSubArray.length > 0) {
    defaultSubjectId.value = prefSubArray;
  }

  if (prefSubArray.length > 0 && !selectedSubject.value) {
    const trySelect = () => {
      const sub = subjects.value.find(s => s.id === prefSubArray[0]);
      if (sub) {
        selectSubjectCard(sub, false);
        
        nextTick(() => {
          const checkLevels = () => {
            if (levels.value.length > 0) {
              if (prefs.defaultLevel) {
                selectedLevel.value = prefs.defaultLevel;
              }
              if (prefs.dailyGoal) {
                selectedQuestionCount.value = prefs.dailyGoal;
              }
            } else {
              setTimeout(checkLevels, 100);
            }
          };
          checkLevels();
        });
      }
    };

    if (subjects.value.length > 0) {
      trySelect();
    } else {
      const unwatch = watch(subjects, (newVal) => {
        if (newVal && newVal.length > 0) {
          trySelect();
          unwatch();
        }
      });
    }
  }
};

const calculateStreak = (results) => {
  if (!results || results.length === 0) return 0;

  const uniqueDates = Array.from(
    new Set(
      results
        .map((res) => {
          if (!res.timestamp) return null;
          const date = res.timestamp.toDate();
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => new Date(b) - new Date(a));

  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatDateStr = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = formatDateStr(today);
  const yesterdayStr = formatDateStr(yesterday);

  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  let checkDate = new Date(uniqueDates[0]);
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedStr = formatDateStr(checkDate);
    if (uniqueDates[i] === expectedStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

const determineAdviceType = (results) => {
  if (!results || results.length === 0) return 'first_test';
  let totalCorrect = 0;
  let totalQuestions = 0;
  results.forEach((res) => {
    totalCorrect += res.score;
    totalQuestions += res.total;
  });
  const overallAvg = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  if (overallAvg < 60) return 'weak';
  if (overallAvg >= 85) return 'strong';
  return 'normal';
};

const getFallbackAdvice = (results) => {
  const type = mentorType.value || 'standard';
  const mentor = getMentorConfig(type);

  if (!results || results.length === 0) {
    const badgeMap = {
      UZB: "Birinchi test",
      RUS: "Начать тест"
    };

    return {
      text: mentor.greeting[currentLocale.value] || mentor.greeting['UZB'],
      badge: badgeMap[currentLocale.value] || badgeMap['UZB'],
      recommendedSubject: 'English',
      recommendedLevel: 'Beginner'
    };
  }

  let totalCorrect = 0;
  let totalQuestions = 0;
  const subjectStats = {};

  results.forEach((res) => {
    totalCorrect += res.score;
    totalQuestions += res.total;

    if (!subjectStats[res.subject]) {
      subjectStats[res.subject] = { score: 0, total: 0 };
    }
    subjectStats[res.subject].score += res.score;
    subjectStats[res.subject].total += res.total;
  });

  const overallAvg = Math.round((totalCorrect / totalQuestions) * 100);

  let wSubject = '';
  let wPct = 101;
  let sSubject = '';
  let sPct = -1;

  Object.keys(subjectStats).forEach((sub) => {
    const pct = Math.round(
      (subjectStats[sub].score / subjectStats[sub].total) * 100
    );
    if (pct < wPct) {
      wPct = pct;
      wSubject = sub;
    }
    if (pct > sPct) {
      sPct = pct;
      sSubject = sub;
    }
  });

  weakestSubject.value = wSubject;
  strongestSubject.value = sSubject;

  const lastTest = results[0];
  const lastPct = Math.round((lastTest.score / lastTest.total) * 100);

  if (currentLocale.value === 'RUS') {
    if (overallAvg < 60) {
      let text = `Привет, ${userDisplayName.value}. Ваш средний балл составляет ${overallAvg}%. Самым сложным предметом является ${wSubject} (${wPct}%). Рекомендуем начать с уровня Beginner по этому предмету.`;
      if (mentorType.value === 'comedian') text = `Привет, ${userDisplayName.value}! Средний балл ${overallAvg}%. С ${wSubject} (${wPct}%) у нас пока комедия, но не переживай! Погнали решать Beginner тесты, пока никто не заметил 😂`;
      return {
        text,
        badge: "Закрепить базу",
        recommendedSubject: wSubject,
        recommendedLevel: 'Beginner'
      };
    } else if (overallAvg >= 85) {
      let text = `Отличный результат, ${userDisplayName.value}! Средний балл — ${overallAvg}%. Особенно хороши успехи в ${sSubject} (${sPct}%). Попробуйте Advanced уровень!`;
      if (mentorType.value === 'comedian') text = `Ого, ${userDisplayName.value}, да ты гений! Средний балл ${overallAvg}%. А в ${sSubject} (${sPct}%) вообще монстр. Давай-ка попробуем Advanced, если не боишься! 😎`;
      return {
        text,
        badge: "Сложный уровень",
        recommendedSubject: sSubject,
        recommendedLevel: 'Advanced'
      };
    } else {
      let text = `Хороший темп, ${userDisplayName.value}! Средний балл — ${overallAvg}%. В последнем тесте по ${lastTest.subject} вы набрали ${lastPct}%. Проанализируйте ошибки.`;
      if (mentorType.value === 'comedian') text = `Нормальный полет, ${userDisplayName.value}! Средний балл ${overallAvg}%. За последний тест по ${lastTest.subject} у тебя ${lastPct}%. Главное — не сдаваться, ну и посмеяться над ошибками! 😜`;
      return {
        text,
        badge: "Работа над ошибками",
        recommendedSubject: lastTest.subject,
        recommendedLevel: lastTest.level
      };
    }

  } else {
    if (overallAvg < 60) {
      let text = `Salom, ${userDisplayName.value}. Hozirda o'rtacha ballingiz ${overallAvg}%. Eng ko'p qiynalayotgan faningiz ${wSubject} (${wPct}%). Ushbu fandan Beginner darajasida test yechishni tavsiya qilaman.`;
      if (mentorType.value === 'comedian') text = `Salom, ${userDisplayName.value}! O'rtacha ballingiz ${overallAvg}%. ${wSubject} fanidagi (${wPct}%) holatimiz biroz yig'lagudek, lekin xavotir olmang! Beginner testlarini yechib o'zimizga kelib olamiz 😂`;
      return {
        text,
        badge: "Bazani mustahkamlash",
        recommendedSubject: wSubject,
        recommendedLevel: 'Beginner'
      };
    } else if (overallAvg >= 85) {
      let text = `Ajoyib ko'rsatkich, ${userDisplayName.value}! O'rtacha natijangiz juda yuqori (${overallAvg}%). Ayniqsa ${sSubject} fanidan natijangiz a'lo darajada (${sPct}%). Advanced darajasida urinib ko'ring!`;
      if (mentorType.value === 'comedian') text = `Vooov, ${userDisplayName.value}, siz daho ekansiz-ku! O'rtacha ${overallAvg}%. ${sSubject} (${sPct}%) fani bo'yicha sizga yetadigani yo'q! Qani, Advanced darajada ham omadni sinab ko'ramizmi? 😎`;
      return {
        text,
        badge: "Murakkab darajalar",
        recommendedSubject: sSubject,
        recommendedLevel: 'Advanced'
      };
    } else {
      let text = `Yaxshi natija, ${userDisplayName.value}! Bilim ko'rsatkichingiz o'rtacha ${overallAvg}%. Oxirgi topshirgan ${lastTest.subject} testingizda natijangiz ${lastPct}% bo'ldi.`;
      if (mentorType.value === 'comedian') text = `Zo'r ketyapmiz, ${userDisplayName.value}! O'rtacha ball ${overallAvg}%. Oxirgi ${lastTest.subject} testida ${lastPct}% oldik. Asosiysi - xatolardan kulib to'g'ri xulosa chiqarish! 😜`;
      return {
        text,
        badge: "Xatolar ustida ishlash",
        recommendedSubject: lastTest.subject,
        recommendedLevel: lastTest.level
      };
    }
  }
};

const fetchAiAdviceFromGemini = async (results) => {
  aiAdviceLoading.value = true;
  
  const fallback = getFallbackAdvice(results);
  aiAdvice.value = fallback;
  aiAdviceType.value = determineAdviceType(results);
  
  try {
    const name = userDisplayName.value || 'User';
    const locale = currentLocale.value || 'UZB';
    
    let totalCorrect = 0;
    let totalQuestions = 0;
    const subjectStats = {};
    
    results.forEach((res) => {
      totalCorrect += res.score;
      totalQuestions += res.total;
      if (!subjectStats[res.subject]) {
        subjectStats[res.subject] = { score: 0, total: 0 };
      }
      subjectStats[res.subject].score += res.score;
      subjectStats[res.subject].total += res.total;
    });
    
    const overallAvg = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const subjectSummary = Object.keys(subjectStats).map(sub => {
      const pct = Math.round((subjectStats[sub].score / subjectStats[sub].total) * 100);
      return `${sub}: ${pct}%`;
    }).join(', ');
    
    const latestTest = results.length > 0 ? results[0] : null;
    const latestInfo = latestTest ? `${latestTest.subject} (${latestTest.level}) with score ${Math.round((latestTest.score / latestTest.total)*100)}%` : 'None';
    
    const subjectsList = subjects.value.map(s => s.id).join(', ');
    
    const systemPersona = getMentorConfig(mentorType.value).systemPrompt;

    const prompt = `${systemPersona}
You are acting as this persona for the Test.me platform.
Analyze the student's history stats and generate a tailored recommendation.

Student Profile:
Name: ${name}
Language Locale: ${locale} (CRITICAL: You MUST write the "text" and "badge" values in this language! If locale is 'UZB', use Uzbek. If 'RUS', use Russian).
Total tests taken: ${results.length}
Overall average accuracy: ${overallAvg}%
Subject breakdowns: [${subjectSummary}]
Latest test: [${latestInfo}]
Available subjects on platform: [${subjectsList}]

Recommend one subject and one difficulty level to practice next.
For students with low average accuracy (< 65%), recommend a beginner level (e.g. 'Beginner' or 'Elementary' or 'Easy') for their weakest subject.
For students with high average accuracy (>= 85%), recommend a higher level (e.g. 'Advanced' or 'Intermediate' or 'Hard') for their strongest subject.
Otherwise, recommend standard practice.

Return a valid JSON object matching this schema exactly (no markdown formatting, no code block backticks):
{
  "text": "Your highly personalized advice here in ${locale}. YOU MUST ADAPT YOUR TONE TO MATCH YOUR PERSONA! Max 2-3 sentences. Reference their stats (e.g. 'average of ${overallAvg}%') and latest test to be authentic.",
  "badge": "Action label for button in ${locale} (max 3 words, e.g. 'Mathni boshlash' or 'Начать тест')",
  "recommendedSubject": "Exact subject ID from available subjects list (must match one of [${subjectsList}])",
  "recommendedLevel": "Exact recommended level (e.g. 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Easy', 'Medium', 'Hard')"
}`;

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('CHHiOonsKHa1Ds0k92cgl1wd')) {
      // Kalit mavjud emas yoki eskirgan, offline mentor tavsiyasi ishlatiladi
      return;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );
    
    if (response.ok) {
      const resData = await response.json();
      const resText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (resText) {
        const adviceData = JSON.parse(resText.trim());
        if (adviceData.text && adviceData.badge) {
          aiAdvice.value = {
            text: adviceData.text,
            badge: adviceData.badge,
            recommendedSubject: adviceData.recommendedSubject,
            recommendedLevel: adviceData.recommendedLevel
          };
          aiAdviceType.value = 'gemini';
        }
      }
    }
  } catch {
    // Sokin fallback: konsolni qizil xatoliklar bilan to'ldirmaydi
  } finally {
    aiAdviceLoading.value = false;
  }
};

const fetchUserStats = async () => {
  try {
    const user = await authService.getUser();
    if (user) {
      userDisplayName.value = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Foydalanuvchi';
      
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        userPoints.value = profile.points || 0;
        if (profile.preferences) {
          applyUserPreferences(profile.preferences);
          mentorType.value = profile.preferences.mentorType || 'standard';
        } else {
          mentorType.value = 'standard';
        }
      }

      const results = (await resultService.getUserResults(user.id)) || [];
      results.sort((a, b) => {
        const timeA = new Date(a.created_at || a.timestamp || 0).getTime();
        const timeB = new Date(b.created_at || b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      fetchAiAdviceFromGemini(results);
      userStreak.value = calculateStreak(results);

      const totalTests = results.length;
      const perfectCount = results.filter(r => r.score === r.total).length;
      const allBadges = getBadges(totalTests, perfectCount, userPoints.value, results);
      unlockedBadges.value = allBadges.filter(b => b.unlocked);
    } else {
      userDisplayName.value = t('username') || 'Foydalanuvchi';
      aiAdvice.value = getFallbackAdvice([]);
    }
  } catch (e) {
    console.error('Error fetching user stats:', e);
    aiAdvice.value = getFallbackAdvice([]);
  }
};

const handleAiBadgeClick = () => {
  if (aiAdvice.value.recommendedSubject && aiAdvice.value.recommendedLevel) {
    const target = subjects.value.find(
      (s) => s.id.toLowerCase() === aiAdvice.value.recommendedSubject.toLowerCase() ||
             s.nameEn?.toLowerCase() === aiAdvice.value.recommendedSubject.toLowerCase() ||
             s.nameUz?.toLowerCase() === aiAdvice.value.recommendedSubject.toLowerCase() ||
             s.nameRu?.toLowerCase() === aiAdvice.value.recommendedSubject.toLowerCase()
    );
    if (target) {
      selectSubjectCard(target);
      setTimeout(() => {
        const recLvl = aiAdvice.value.recommendedLevel.toLowerCase();
        const foundLvl = levels.value.find(l => l.toLowerCase() === recLvl);
        if (foundLvl) {
          selectedLevel.value = foundLvl;
        } else if (levels.value.length > 0) {
          const approx = levels.value.find(l => l.toLowerCase().startsWith(recLvl.substring(0, 3)));
          if (approx) {
            selectedLevel.value = approx;
          } else {
            selectedLevel.value = levels.value[0];
          }
        }
        selectedQuestionCount.value = 10;
        nextTick(() => {
          document.querySelector('.start-test-btn')?.scrollIntoView({ behavior: 'smooth' });
        });
      }, 600);
      return;
    }
  }

  if (aiAdviceType.value === 'first_test') {
    if (subjects.value.length > 0) {
      selectSubjectCard(subjects.value[0]);
      nextTick(() => {
        document.querySelector('.selection-panel')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  } else {
    document.querySelector('.selection-panel')?.scrollIntoView({ behavior: 'smooth' });
  }
};

onMounted(() => {
  aiAdvice.value = getFallbackAdvice([]);
  fetchSubjects();
  fetchSpecialTests();
  fetchUserStats();
});
</script>

<style src="./home.css"></style>
