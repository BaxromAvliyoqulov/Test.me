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
import { ref, computed, watch, onMounted, nextTick, onErrorCaptured } from 'vue';
import { db, auth } from '@/config/firebase';
import { collection, doc, getDocs, addDoc, getDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import defaultUserImage from '../assets/img/user.png';
import { useI18n } from '@/utils/i18n';
import { getRankName, getRankClass, getRankIcon, getNextRankInfo } from '@/utils/ranks';
import { sortLevels } from '@/utils/sorters';
import { getMentorConfig } from '@/config/mentors';
import { getBadges } from '@/utils/badges';
import TestPage from './testPage/testPage.vue';
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
const subjects = ref([]);
const levels = ref([]);
const loading = ref(false);
const loadingSubjects = ref(false);
const loadingLevels = ref(false);
const status = ref(null);
const startTest = ref(false);
const currentTab = ref('standard');
const specialTests = ref([]);
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
  loadingSubjects.value = true;
  status.value = null;
  try {
    const querySnapshot = await getDocs(collection(db, 'subjects'));
    subjects.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (subjects.value.length === 0) {
      status.value = {
        type: 'info',
        message: '⚠️ No subjects found. Please add a subject first.',
      };
    }
  } catch (error) {
    console.error('❌ Error fetching subjects:', error);
    status.value = {
      type: 'error',
      message: `❌ Error fetching subjects: ${error.message}`,
    };
  } finally {
    loadingSubjects.value = false;
  }
};

const fetchSpecialTests = async () => {
  loadingSpecial.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, 'special_tests'));
    specialTests.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  } catch (error) {
    console.error('Error fetching special tests:', error);
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
      levelId: test.category,
      specialTestId: test.id,
      title: test.title
    });
    loading.value = false;
  });
};

const fetchLevels = async () => {
  if (!selectedSubject.value) return;

  loadingLevels.value = true;
  selectedLevel.value = '';
  levels.value = [];
  status.value = null;

  try {
    const subjectRef = doc(db, 'subjects', selectedSubject.value.id);
    const levelsCollection = await getDocs(
      collection(subjectRef, 'levels')
    );

    const fetchedLevels = levelsCollection.docs.map((doc) => doc.id);
    levels.value = sortLevels(fetchedLevels);

    if (levels.value.length === 0) {
      status.value = {
        type: 'info',
        message: '⚠️ No levels found for this subject.',
      };
    }
  } catch (error) {
    console.error('❌ Error fetching levels:', error);
    status.value = {
      type: 'error',
      message: `❌ Error fetching levels: ${error.message}`,
    };
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
    const testSession = {
      subjectId: selectedSubject.value.id,
      levelId: selectedLevel.value,
      questionCount: selectedQuestionCount.value,
      userId: auth.currentUser?.uid,
      startedAt: new Date(),
      status: 'in-progress',
    };

    let sessionId = 'local_' + Math.random().toString(36).substring(2, 9);
    try {
      const sessionsRef = collection(db, 'testSessions');
      const docRef = await addDoc(sessionsRef, testSession);
      sessionId = docRef.id;
    } catch (dbErr) {
      console.warn('⚠️ Could not save testSession to Firestore (likely permission rules), using local fallback ID:', dbErr);
    }

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
  console.log('Test completed with results:', results);
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

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g";
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
      const resText = resData.candidates[0].content.parts[0].text;
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
  } catch (err) {
    console.error("Failed to generate dynamic AI advice with Gemini:", err);
  } finally {
    aiAdviceLoading.value = false;
  }
};

const fetchUserStats = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userDisplayName.value = user.displayName || user.email.split('@')[0];
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userPoints.value = userData.points || 0;
          if (userData.preferences) {
            applyUserPreferences(userData.preferences);
            mentorType.value = userData.preferences.mentorType || 'standard';
          } else {
            mentorType.value = 'standard';
          }
        }

        const resultsRef = collection(db, 'results');
        const q = query(resultsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs
          .map((doc) => doc.data())
          .sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.toDate() : 0;
            const timeB = b.timestamp ? b.timestamp.toDate() : 0;
            return timeB - timeA;
          });

        fetchAiAdviceFromGemini(results);
        userStreak.value = calculateStreak(results);

        const totalTests = results.length;
        const perfectCount = results.filter(r => r.score === r.total).length;
        const allBadges = getBadges(totalTests, perfectCount, userPoints.value, results);
        unlockedBadges.value = allBadges.filter(b => b.unlocked);
      } catch (e) {
        console.error('Error fetching user stats:', e);
      }
    }
  });
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
  fetchSubjects();
  fetchSpecialTests();
  fetchUserStats();
});
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
}

.dashboard-wrapper {
  position: relative;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #f8fafc;
  overflow: hidden;
  padding-bottom: 3rem;
}

/* Abstract Glowing Background */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.15;
  pointer-events: none;
}
.glow-bg-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
  top: -10%; left: -10%;
}
.glow-bg-2 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
  bottom: 10%; right: -10%;
}

.test-container, .test-view-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1280px;
  width: 92%;
  margin: 0 auto;
  padding-top: 2.5rem;
}

/* Glass Panel Base */
.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 28px;
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

.selection-panel {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Premium Tabs */
.premium-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 20px;
}

.tab-btn {
  flex: 1;
  padding: 14px;
  border-radius: 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn:hover {
  color: #334155;
}

.tab-btn.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* Panel Sections */
.panel-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 800;
  border-radius: 10px;
}

.step-badge.special {
  background: #fdf4ff;
  color: #c026d3;
}

.section-header h3 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}

/* Subject Grid */
.subject-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.subject-card {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.7);
  border-radius: 24px;
  padding: 1.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: flex-end;
  height: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.subject-card::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg);
  transition: all 0.7s ease;
  z-index: 1;
  pointer-events: none;
}

.subject-card:hover::before {
  left: 200%;
}

.subject-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: color-mix(in srgb, var(--subject-color) 40%, transparent);
  box-shadow: 0 20px 40px -10px color-mix(in srgb, var(--subject-color) 25%, transparent), 0 10px 20px -5px rgba(0, 0, 0, 0.05);
}

.subject-card.selected, .subject-card.goal-active {
  background: var(--subject-color);
  border-color: var(--subject-color);
  box-shadow: 0 15px 30px -5px color-mix(in srgb, var(--subject-color) 40%, transparent);
  transform: scale(1.05);
}

.subject-card.selected .card-content h4, .subject-card.goal-active .card-content h4 {
  color: #ffffff !important;
}

.subject-card.selected .status-badge, .subject-card.goal-active .status-badge {
  color: rgba(255, 255, 255, 0.8) !important;
}

.subject-card.selected .icon-wrapper, .subject-card.goal-active .icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.3);
}

.card-bg-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 110px;
  color: var(--subject-color);
  opacity: 0.04;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.subject-card.selected .card-bg-icon, .subject-card.goal-active .card-bg-icon {
  color: #ffffff;
  opacity: 0.2;
}

.subject-card:hover .card-bg-icon {
  transform: rotate(-15deg) scale(1.15) translateX(-10px);
  opacity: 0.08;
}

.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.icon-wrapper {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--subject-color), color-mix(in srgb, var(--subject-color) 60%, white));
  color: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: 0 8px 16px -4px color-mix(in srgb, var(--subject-color) 50%, transparent), inset 0 2px 4px rgba(255,255,255,0.3);
  margin-bottom: 6px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.subject-card:hover .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 20px -4px color-mix(in srgb, var(--subject-color) 60%, transparent), inset 0 2px 4px rgba(255,255,255,0.5);
}

.card-content h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  transition: color 0.3s ease;
}

.subject-card:hover .card-content h4 {
  color: var(--subject-color);
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

/* Premium Pills */
.pills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.pill-btn {
  position: relative;
  overflow: hidden;
  padding: 14px 28px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  font-size: 0.98rem;
  font-weight: 800;
  color: #64748b;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px -5px rgba(15, 23, 42, 0.03);
}

.pill-btn:hover {
  background: #ffffff;
  border-color: #93c5fd;
  color: #1e3a8a;
  transform: translateY(-4px);
  box-shadow: 0 12px 25px -8px rgba(59, 130, 246, 0.25);
}

.pill-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 14px 30px -6px rgba(37, 99, 235, 0.4);
  transform: translateY(-4px) scale(1.02);
}

/* Inner glow effect for active state */
.pill-btn::after {
  content: '';
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.5s ease;
  pointer-events: none;
}

.pill-btn.active::after {
  opacity: 1;
  transform: scale(1);
}

/* Action Section */
.action-section {
  margin-top: 1rem;
}

.btn-start-premium {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-start-premium:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px -5px rgba(37, 99, 235, 0.4);
}

.btn-start-premium:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

/* Special Tests */
.special-tests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.special-test-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.special-test-card:hover {
  transform: translateX(6px);
  border-color: #a855f7;
  box-shadow: 0 8px 25px -5px rgba(168, 85, 247, 0.15);
}

.st-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.st-icon.dtm { background: #fef9c3; color: #ca8a04; }
.st-icon.prezident { background: #f3e8ff; color: #9333ea; }

.st-details {
  flex: 1;
  margin: 0 1rem;
}

.st-details h4 {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: #0f172a;
}

.st-category {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6366f1;
  background: #e0e7ff;
  padding: 4px 10px;
  border-radius: 8px;
}

.btn-st-start {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.special-test-card:hover .btn-st-start {
  background: #059669;
}

/* Sidebar Components */
.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.premium-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 1.75rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

/* Rank Card */
.rank-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rank-badge {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Dynamic Rank Text Colors for Badge */
.rank-badge.rank-newbie { color: #94a3b8; background: rgba(148, 163, 184, 0.1); }
.rank-badge.rank-bronze { color: #d97706; background: rgba(217, 119, 6, 0.1); }
.rank-badge.rank-silver { color: #94a3b8; background: rgba(148, 163, 184, 0.1); }
.rank-badge.rank-gold { color: #facc15; background: rgba(250, 204, 21, 0.1); }
.rank-badge.rank-platinum { color: #2dd4bf; background: rgba(45, 212, 191, 0.1); }
.rank-badge.rank-diamond { color: #60a5fa; background: rgba(96, 165, 250, 0.1); }
.rank-badge.rank-master { color: #a78bfa; background: rgba(167, 139, 250, 0.1); }
.rank-badge.rank-grandmaster { color: #f472b6; background: rgba(244, 114, 182, 0.1); }
.rank-badge.rank-legendary { color: #fb7185; background: rgba(251, 113, 133, 0.1); }
.rank-badge.rank-mythic { color: #34d399; background: rgba(52, 211, 153, 0.1); }

.next-rank {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
}

.progress-track {
  height: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 6px;
  position: relative;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dynamic Rank Progress Bar Gradients */
.progress-fill.rank-newbie { background: linear-gradient(90deg, #64748b, #94a3b8); }
.progress-fill.rank-bronze { background: linear-gradient(90deg, #b45309, #d97706); }
.progress-fill.rank-silver { background: linear-gradient(90deg, #94a3b8, #cbd5e1); }
.progress-fill.rank-gold { background: linear-gradient(90deg, #ca8a04, #facc15); }
.progress-fill.rank-platinum { background: linear-gradient(90deg, #0d9488, #2dd4bf); }
.progress-fill.rank-diamond { background: linear-gradient(90deg, #2563eb, #60a5fa); }
.progress-fill.rank-master { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
.progress-fill.rank-grandmaster { background: linear-gradient(90deg, #db2777, #f472b6); }
.progress-fill.rank-legendary { background: linear-gradient(90deg, #e11d48, #fb7185); }
.progress-fill.rank-mythic { background: linear-gradient(90deg, #059669, #34d399); }

.progress-glow {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shine 2s infinite;
}

.rank-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.points-needed {
  color: #3b82f6;
}

/* AI Coach Card */
.ai-card {
  --mentor-rgb: 59, 130, 246; /* fallback */
  background: linear-gradient(145deg, #ffffff 0%, rgba(var(--mentor-rgb), 0.08) 100%);
  border-color: rgba(var(--mentor-rgb), 0.25);
  box-shadow: 0 10px 30px -10px rgba(var(--mentor-rgb), 0.12);
  transition: all 0.3s ease;
}

.ai-card.theme-standard { --mentor-rgb: 148, 163, 184; }
.ai-card.theme-friendly { --mentor-rgb: 59, 130, 246; }
.ai-card.theme-strict   { --mentor-rgb: 239, 68, 68; }
.ai-card.theme-socratic { --mentor-rgb: 168, 85, 247; }
.ai-card.theme-motivator{ --mentor-rgb: 245, 158, 11; }
.ai-card.theme-innovator{ --mentor-rgb: 16, 185, 129; }
.ai-card.theme-analyst  { --mentor-rgb: 139, 92, 246; }
.ai-card.theme-sage     { --mentor-rgb: 217, 119, 6; }
.ai-card.theme-comedian { --mentor-rgb: 236, 72, 153; }

.ai-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.ai-avatar {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transition: all 0.3s ease;
}

/* AI Themes */
.ai-avatar.theme-standard { background: linear-gradient(135deg, #94a3b8, #64748b); box-shadow: 0 4px 12px rgba(100, 116, 139, 0.25); }
.ai-avatar.theme-friendly { background: linear-gradient(135deg, #34d399, #10b981); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); }
.ai-avatar.theme-strict { background: linear-gradient(135deg, #475569, #1e293b); box-shadow: 0 4px 12px rgba(30, 41, 59, 0.25); }
.ai-avatar.theme-socratic { background: linear-gradient(135deg, #fbbf24, #d97706); box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25); }
.ai-avatar.theme-motivator { background: linear-gradient(135deg, #fb7185, #e11d48); box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25); }
.ai-avatar.theme-innovator { background: linear-gradient(135deg, #a78bfa, #7c3aed); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25); }
.ai-avatar.theme-analyst { background: linear-gradient(135deg, #38bdf8, #0284c7); box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); }
.ai-avatar.theme-sage { background: linear-gradient(135deg, #2dd4bf, #0f766e); box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25); }
.ai-avatar.theme-comedian { background: linear-gradient(135deg, #f472b6, #db2777); box-shadow: 0 4px 12px rgba(219, 39, 119, 0.25); }

.ai-title h4 { margin: 0; font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.online-dot { font-size: 0.75rem; color: rgb(var(--mentor-rgb)); font-weight: 700; display: flex; align-items: center; gap: 4px; transition: color 0.3s ease; }
.online-dot::before { content: ''; width: 6px; height: 6px; background: rgb(var(--mentor-rgb)); border-radius: 50%; display: inline-block; animation: pulse 2s infinite; transition: background 0.3s ease; }

.ai-text {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.5;
  font-style: italic;
  margin: 0 0 1rem 0;
}

.btn-ai-action {
  background: rgba(var(--mentor-rgb), 0.1);
  color: rgb(var(--mentor-rgb));
  border: 1px solid rgba(var(--mentor-rgb), 0.2);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}
.btn-ai-action:hover {
  background: rgb(var(--mentor-rgb));
  color: white;
  box-shadow: 0 4px 12px rgba(var(--mentor-rgb), 0.25);
  transform: translateY(-2px);
}

/* Streaks and Badges */
.achievements-card h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.streak-box {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fffbeb;
  border: 1px solid #fde047;
  padding: 1rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
}

.fire-icon {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: white;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}

.streak-info strong { font-size: 1.2rem; font-weight: 800; color: #b45309; display: block; }
.streak-info span { font-size: 0.8rem; font-weight: 700; color: #d97706; }

.badges-preview h5 { margin: 0 0 0.75rem 0; font-size: 0.9rem; font-weight: 700; color: #475569; }

.mini-badges-row {
  display: flex;
  gap: 10px;
}

.badge-item {
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.5);
  border: 1.5px solid var(--badge-color);
  color: var(--badge-color);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px -2px rgba(0,0,0,0.05);
}

.btn-all-badges {
  width: 40px; height: 40px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-all-badges:hover { background: #e2e8f0; color: #0f172a; }

/* Test View Header */
.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
}

.test-meta h3 { margin: 0 0 6px 0; font-size: 1.4rem; font-weight: 800; color: #0f172a; }
.test-meta .dot { color: #cbd5e1; margin: 0 8px; }
.q-count { font-size: 0.85rem; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 4px 12px; border-radius: 12px; display: inline-flex; align-items: center; gap: 6px; }

.btn-close-test {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;
}
.btn-close-test:hover { background: #ef4444; color: white; border-color: #ef4444; }

.test-body {
  padding: 2.5rem;
}

/* Utils & Animations */
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem; color: #64748b; font-weight: 600; }
.empty-state { text-align: center; padding: 2rem; color: #94a3b8; font-weight: 600; }
.empty-state i { font-size: 2.5rem; margin-bottom: 1rem; color: #cbd5e1; }
.empty-state.small { padding: 1rem; font-size: 0.85rem; }

.spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
.spinner-small { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; }
.spinner-small.blue { border-color: #bfdbfe; border-top-color: #3b82f6; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shine { 100% { transform: translateX(100%); } }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-20px); }

.expand-enter-active, .expand-leave-active { transition: all 0.4s ease; max-height: 500px; opacity: 1; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-alert { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); padding: 14px 24px; border-radius: 16px; font-weight: 700; font-size: 0.95rem; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.1); cursor: pointer; }
.toast-alert.success { background: #ecfdf5; color: #065f46; border: 1px solid #34d399; }
.toast-alert.error { background: #fef2f2; color: #991b1b; border: 1px solid #f87171; }
.toast-alert.info { background: #eff6ff; color: #1e40af; border: 1px solid #60a5fa; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translate(-50%, 100%); opacity: 0; }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}

/* Modal Wizard Styles */
.premium-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-wizard-card {
  background: #ffffff;
  width: 100%;
  max-width: 520px;
  border-radius: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.m-icon-wrapper {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.25);
}

.m-title-info h3 { margin: 0; font-size: 1.35rem; font-weight: 800; color: #0f172a; }
.m-title-info span { font-size: 0.85rem; font-weight: 600; color: #64748b; }

.m-close-btn {
  width: 36px; height: 36px;
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  color: #475569;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.m-close-btn:hover { background: #cbd5e1; color: #0f172a; transform: scale(1.05); }

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.m-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.m-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.m-step {
  width: 26px; height: 26px;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
}

.m-section-title h4 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }

.modal-footer {
  padding: 1.5rem 2rem 2rem 2rem;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-wizard-card, .modal-fade-leave-to .modal-wizard-card { transform: scale(0.95) translateY(20px); }

/* Remove old action-section */
.loading-state.small { padding: 1rem; }

@media (max-width: 768px) {
  .selection-panel {
    padding: 1.25rem !important;
  }
  .dashboard-grid {
    gap: 1.5rem !important;
  }
  .test-type-tabs {
    flex-direction: column;
  }
  .tab-btn {
    width: 100%;
    padding: 12px !important;
  }
  .subject-grid {
    grid-template-columns: 1fr;
  }
  .welcome-banner {
    padding: 1.5rem !important;
    border-radius: 1.25rem !important;
  }
  .welcome-title {
    font-size: 1.5rem !important;
  }
}
</style>

