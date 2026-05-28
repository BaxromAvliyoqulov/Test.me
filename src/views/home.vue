<template>
  <div class="dashboard-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="test-container" v-if="!startTest">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1>{{ t('welcomeTitle', { name: userDisplayName || t('username') }) }}</h1>
          <p>{{ t('welcomeSubtitle') }}</p>
        </div>
        <div class="welcome-stat-chip">
          <img src="../assets/img/tpCoin.png" alt="TP Coin" class="coin-icon" />
          <div class="stat-info">
            <span class="stat-val">{{ userPoints }}</span>
            <span class="stat-lbl">TP Coins</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Left Side: Interactive Selection Panel -->
        <div class="selection-panel">
          
          <!-- Test Type Tabs -->
          <div class="test-type-tabs">
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
              <i class="fas fa-star"></i> Maxsus Testlar
            </button>
          </div>

          <!-- STANDARD TAB -->
          <div class="tab-content" v-if="currentTab === 'standard'">
            <div class="panel-section">
              <div class="section-header">
                <span class="step-badge">1</span>
                <h3>{{ t('chooseSubject') }}</h3>
              </div>
              
              <div v-if="loadingSubjects" class="loading-container">
                <span class="mini-loader"></span>
                <p>{{ t('loadingSubjects') }}</p>
              </div>

              <div class="subject-cards-grid premium-cards" v-else>
                <div
                  v-for="subject in subjects"
                  :key="subject.id"
                  :class="['subject-card premium', { selected: selectedSubject && selectedSubject.id === subject.id }]"
                  :style="{ '--card-color': getSubjectColor(subject.id) }"
                  @click="selectSubjectCard(subject)"
                >
                  <div class="subject-card-bg">
                    <i :class="getSubjectIcon(subject.id)"></i>
                  </div>
                  <div class="subject-card-icon">
                    <i :class="getSubjectIcon(subject.id)"></i>
                  </div>
                  <div class="subject-card-details">
                    <h4>{{ subject.id }}</h4>
                    <span class="subject-badge">{{ t('testsReady') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Level selection -->
            <div class="panel-section" v-if="selectedSubject">
              <div class="section-header">
                <span class="step-badge">2</span>
                <h3>{{ t('selectLevel') }}</h3>
              </div>

              <div v-if="loadingLevels" class="loading-container">
                <span class="mini-loader"></span>
                <p>{{ t('loadingLevels') }}</p>
              </div>

              <div class="pills-grid" v-else>
                <button
                  type="button"
                  v-for="level in levels"
                  :key="level"
                  :class="['pill-btn', { active: selectedLevel === level }]"
                  @click="selectedLevel = level"
                >
                  {{ level }}
                </button>
              </div>
            </div>

            <!-- Question count selection -->
            <div class="panel-section" v-if="selectedLevel">
              <div class="section-header">
                <span class="step-badge">3</span>
                <h3>{{ t('questionCount') }}</h3>
              </div>

              <div class="pills-grid">
                <button
                  type="button"
                  v-for="count in questionCounts"
                  :key="count"
                  :class="['pill-btn', { active: selectedQuestionCount === count }]"
                  @click="selectedQuestionCount = count"
                >
                  {{ count }} {{ t('questions') }}
                </button>
              </div>
            </div>

            <!-- Start Button -->
            <div class="action-section" v-if="selectedQuestionCount">
              <button @click="startTestWithFilters" class="start-test-btn" :disabled="!canStart">
                <span v-if="!loading">{{ t('startTest') }}</span>
                <span v-else class="loader"></span>
              </button>
            </div>
          </div>

          <!-- SPECIAL TESTS TAB -->
          <div class="tab-content" v-else-if="currentTab === 'special'">
            <div class="panel-section">
              <div class="section-header">
                <span class="step-badge"><i class="fas fa-crown"></i></span>
                <h3>DTM va Maxsus Imtihonlar</h3>
              </div>
              
              <div v-if="loadingSpecial" class="loading-container">
                <span class="mini-loader"></span>
                <p>Maxsus testlar yuklanmoqda...</p>
              </div>
              
              <div class="special-tests-list" v-else-if="specialTests.length > 0">
                <div v-for="test in specialTests" :key="test.id" class="special-test-card" @click="startSpecialTest(test)">
                  <div class="st-icon" :class="test.category.toLowerCase()">
                    <i class="fas fa-graduation-cap"></i>
                  </div>
                  <div class="st-details">
                    <h4>{{ test.title }}</h4>
                    <span class="st-category">{{ test.category }}</span>
                  </div>
                  <button class="st-start-btn"><i class="fas fa-play"></i> Boshlash</button>
                </div>
              </div>
              
              <div class="no-tests-banner" v-else>
                <i class="fas fa-folder-open"></i>
                <p>Hozircha maxsus testlar yo'q.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Sidebar Info & AI Coach -->
        <div class="sidebar-panel">
          
          <!-- Rank Progress Card -->
          <div class="sidebar-card rank-progress-card" style="margin-bottom: 1.5rem;">
            <div class="progress-card-header">
              <span class="nav-rank-badge" :class="getRankClass(userPoints)" style="margin:0; padding: 2px 8px; font-size: 0.70rem;">
                <i :class="getRankIcon(userPoints)"></i> {{ getRankName(userPoints, currentLocale) }}
              </span>
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
                {{ currentLocale === 'RUS' ? `Нужно еще ${getNextRankInfo(userPoints, currentLocale).pointsNeeded} TP` : `Yana ${getNextRankInfo(userPoints, currentLocale).pointsNeeded} TP` }}
              </span>
              <span v-else>{{ currentLocale === 'RUS' ? 'Максимальный Ранг' : 'Maksimal Rang' }}</span>
            </div>
          </div>

          <!-- AI Coach Card -->
          <div class="sidebar-card ai-coach-card">
            <div class="ai-header">
              <div class="ai-avatar">
                <i class="fas fa-robot"></i>
              </div>
              <div>
                <h4>{{ t('aiTutor') }}</h4>
                <span class="status-online">{{ t('activeInSystem') }}</span>
              </div>
            </div>
            <p class="ai-advice">
              <span v-if="aiAdviceLoading" class="ai-loading-text">
                <i class="fas fa-circle-notch fa-spin"></i>
                {{ currentLocale === 'RUS' ? 'ИИ-Наставник анализирует результаты...' : 'AI Ustozingiz natijalarni tahlil qilmoqda...' }}
              </span>
              <span v-else>
                "{{ aiAdvice.text }}"
              </span>
            </p>
            <div class="ai-action-badge" v-if="!aiAdviceLoading && aiAdvice.badge" @click="handleAiBadgeClick">
              <i class="fas fa-lightbulb"></i> {{ aiAdvice.badge }}
            </div>
          </div>

          <!-- Daily Streak & Achievements Widget -->
          <div class="sidebar-card streak-widget-card">
            <h4>{{ t('activityAndAwards') }}</h4>
            
            <!-- Streak counter -->
            <div class="streak-badge-container">
              <div class="streak-icon-wrap">
                <i class="fas fa-fire"></i>
              </div>
              <div class="streak-details">
                <span class="streak-num">{{ getStreakText(userStreak) }}</span>
                <span class="streak-lbl">{{ t('streakStreak') }}</span>
              </div>
            </div>

            <!-- Mini Badges preview -->
            <div class="badges-preview-sec">
              <h5>{{ t('latestAwards') }}</h5>
              <div class="mini-badges-list" v-if="unlockedBadges.length > 0">
                <div 
                  v-for="badge in unlockedBadges.slice(0, 3)"
                  :key="badge.id"
                  class="mini-badge-item"
                  :style="{ background: badge.color + '15', color: badge.color, borderColor: badge.color + '30' }"
                  :title="currentLocale === 'RUS' ? badge.nameRu : badge.nameUz"
                >
                  <i :class="badge.icon"></i>
                </div>
                <router-link to="/badges" class="all-badges-link" :title="currentLocale === 'RUS' ? 'Все награды' : 'Barcha yutuqlar'">
                  <i class="fas fa-arrow-right"></i>
                </router-link>
              </div>
              <p class="no-badges-text" v-else>
                {{ t('noBadgesYet') }}
              </p>
            </div>
          </div>

          <!-- Removed AI Widget to focus on Academics -->
        </div>
      </div>

      <div v-if="status" :class="['status', status.type]" @click="clearStatus">
        {{ status.message }}
      </div>
    </div>

    <!-- Test Component (shown after subject selection) -->
    <div class="test-view-container" v-else>
      <div class="test-header">
        <div class="test-title-info">
          <h3>
            {{ selectedSubject.id }} - {{ selectedLevel }} Test
          </h3>
          <span class="questions-count-tag">
            <i class="fas fa-question-circle"></i> {{ selectedQuestionCount }} {{ t('questions') }}
          </span>
        </div>
        <button class="back-btn" @click="goBackToSelection">
          ← {{ t('backToSelection') }}
        </button>
      </div>

      <div class="test-body-card">
        <TestPage
          ref="testPage"
          :subjectId="selectedSubject.id"
          :levelId="selectedLevel"
          :questionCount="selectedQuestionCount"
          @test-completed="handleTestCompletion"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from '@/config/firebase';
import { collection, doc, getDocs, addDoc, getDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import defaultUserImage from '../assets/img/user.png';
import { useI18n } from '@/utils/i18n';
import { getRankName, getRankClass, getRankIcon, getNextRankInfo } from '@/utils/ranks';
import { sortLevels } from '@/utils/sorters';
import { getBadges } from '@/utils/badges';
import TestPage from './testPage/testPage.vue';

export default {
  name: 'SubjectTestSelection',
  components: {
    TestPage,
  },
  setup() {
    const { t, locale } = useI18n();
    return { t, currentLocale: locale };
  },
  data() {
    return {
      selectedSubject: null,
      selectedLevel: '',
      selectedQuestionCount: '',
      questionCounts: [5, 10, 15, 20, 25, 30],
      subjects: [],
      levels: [],
      loading: false,
      loadingSubjects: false,
      loadingLevels: false,
      status: null,
      startTest: false,
      currentTab: 'standard',
      specialTests: [],
      loadingSpecial: false,

      // User details
      userDisplayName: '',
      userPoints: 0,
      aiAdvice: { text: '', badge: '' },
      aiAdviceLoading: false,
      userStreak: 0,
      unlockedBadges: [],
      weakestSubject: '',
      strongestSubject: '',
      aiAdviceType: ''
    };
  },
  computed: {
    isRus() {
      return this.currentLocale === 'RUS';
    },
    canStart() {
      return (
        this.selectedSubject &&
        this.selectedLevel &&
        this.selectedQuestionCount &&
        !this.loading &&
        !this.loadingSubjects &&
        !this.loadingLevels
      );
    },
  },
  watch: {
    currentLocale() {
      this.fetchUserStats();
    }
  },
  methods: {
    getSubjectIcon(name) {
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
    },

    getSubjectColor(name) {
      const lower = name.toLowerCase();
      if (lower.includes('matem') || lower.includes('math')) return '#8b5cf6'; // Purple
      if (lower.includes('fizik') || lower.includes('physics')) return '#f59e0b'; // Amber
      if (lower.includes('ingliz') || lower.includes('english')) return '#ef4444'; // Red
      if (lower.includes('ona tili') || lower.includes('uzbek')) return '#3b82f6'; // Blue
      if (lower.includes('kimyo') || lower.includes('chemistry')) return '#10b981'; // Green
      if (lower.includes('biolog') || lower.includes('biology')) return '#84cc16'; // Lime
      if (lower.includes('informatika') || lower.includes('computer')) return '#06b6d4'; // Cyan
      if (lower.includes('tarix') || lower.includes('history')) return '#d97706'; // Dark Amber
      if (lower.includes('geografiya') || lower.includes('geography')) return '#14b8a6'; // Teal
      if (lower.includes('adabiyot') || lower.includes('literature')) return '#ec4899'; // Pink
      return '#3b82f6'; // Default Blue
    },

    selectSubjectCard(subject) {
      if (this.selectedSubject && this.selectedSubject.id === subject.id) return;
      this.selectedSubject = subject;
      this.selectedLevel = '';
      this.selectedQuestionCount = '';
      this.fetchLevels();
    },

    async fetchSubjects() {
      this.loadingSubjects = true;
      this.status = null;
      try {
        const querySnapshot = await getDocs(collection(db, 'subjects'));
        this.subjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (this.subjects.length === 0) {
          this.status = {
            type: 'info',
            message: '⚠️ No subjects found. Please add a subject first.',
          };
        }
      } catch (error) {
        console.error('❌ Error fetching subjects:', error);
        this.status = {
          type: 'error',
          message: `❌ Error fetching subjects: ${error.message}`,
        };
      } finally {
        this.loadingSubjects = false;
      }
    },

    async fetchSpecialTests() {
      this.loadingSpecial = true;
      try {
        const querySnapshot = await getDocs(collection(db, 'special_tests'));
        this.specialTests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      } catch (error) {
        console.error('Error fetching special tests:', error);
      } finally {
        this.loadingSpecial = false;
      }
    },

    startSpecialTest(test) {
      this.loading = true;
      this.startTest = true;
      this.$nextTick(() => {
        this.$refs.testPage?.initializeTest({
          sessionId: 'special_' + Math.random().toString(36).substring(2, 9),
          subjectId: 'special',
          levelId: test.category,
          specialTestId: test.id,
          title: test.title
        });
        this.loading = false;
      });
    },

    async fetchLevels() {
      if (!this.selectedSubject) return;

      this.loadingLevels = true;
      this.selectedLevel = '';
      this.levels = [];
      this.status = null;

      try {
        const subjectRef = doc(db, 'subjects', this.selectedSubject.id);
        const levelsCollection = await getDocs(
          collection(subjectRef, 'levels')
        );

        const fetchedLevels = levelsCollection.docs.map((doc) => doc.id);
        this.levels = sortLevels(fetchedLevels);

        if (this.levels.length === 0) {
          this.status = {
            type: 'info',
            message: '⚠️ No levels found for this subject.',
          };
        }
      } catch (error) {
        console.error('❌ Error fetching levels:', error);
        this.status = {
          type: 'error',
          message: `❌ Error fetching levels: ${error.message}`,
        };
      } finally {
        this.loadingLevels = false;
      }
    },

    clearStatus() {
      this.status = null;
    },
    
    // Rank wrappers
    getRankName(pts, loc) { return getRankName(pts, loc); },
    getRankClass(pts) { return getRankClass(pts); },
    getRankIcon(pts) { return getRankIcon(pts); },
    getNextRankInfo(pts, loc) { return getNextRankInfo(pts, loc); },

    async startTestWithFilters() {
      if (!this.canStart) return;

      this.loading = true;

      try {
        const testSession = {
          subjectId: this.selectedSubject.id,
          levelId: this.selectedLevel,
          questionCount: this.selectedQuestionCount,
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

        this.startTest = true;

        this.$nextTick(() => {
          this.$refs.testPage?.initializeTest({
            sessionId,
            ...testSession,
          });
        });
      } catch (error) {
        console.error('Error starting test:', error);
        this.status = {
          type: 'error',
          message: '❌ Error starting test: ' + error.message,
        };
      } finally {
        this.loading = false;
      }
    },

    goBackToSelection() {
      this.startTest = false;
    },

    handleTestCompletion(results) {
      console.log('Test completed with results:', results);
      this.status = {
        type: 'success',
        message: `✅ Test completed! You got ${results.correctAnswers} out of ${results.totalQuestions} questions correct.`,
      };
      this.startTest = false;
      this.fetchUserStats();
    },

    fetchUserStats() {
      const self = this;
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          self.userDisplayName = user.displayName || user.email.split('@')[0];
          try {
            // Fetch user points and preferences
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              self.userPoints = userData.points || 0;
              if (userData.preferences) {
                self.applyUserPreferences(userData.preferences);
              }
            }

            // Fetch test results
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

            // Set dynamic AI advice
            self.fetchAiAdviceFromGemini(results);

            // Calculate streak
            self.userStreak = self.calculateStreak(results);

            // Compute unlocked badges list
            const totalTests = results.length;
            const perfectCount = results.filter(r => r.score === r.total).length;
            const allBadges = getBadges(totalTests, perfectCount, self.userPoints, results);
            self.unlockedBadges = allBadges.filter(b => b.unlocked);
            if (false) {
            
            const badgesConfig = [
              { id: 'first_step', nameUz: 'Birinchi qadam', nameRu: 'Первый шаг', nameEn: 'First Step', icon: 'fas fa-walking', color: '#3b82f6', unlocked: totalTests >= 1 },
              { id: 'persistent', nameUz: 'Tirishqoq', nameRu: 'Упорный', nameEn: 'Persistent', icon: 'fas fa-fire', color: '#f97316', unlocked: totalTests >= 5 },
              { id: 'scholar', nameUz: 'Bilimdon', nameRu: 'Эрудит', nameEn: 'Scholar', icon: 'fas fa-book-reader', color: '#10b981', unlocked: totalTests >= 15 },
              { id: 'perfect_score', nameUz: 'A\'lochi', nameRu: 'Отличник', nameEn: 'Perfect Score', icon: 'fas fa-star', color: '#fbbf24', unlocked: perfectCount >= 1 },
              { id: 'coin_king', nameUz: 'Koin Qiroli', nameRu: 'Король Коинов', nameEn: 'Coin King', icon: 'fas fa-coins', color: '#a855f7', unlocked: self.userPoints >= 500 },
              { id: 'super_brain', nameUz: 'Super Aql', nameRu: 'Супер Мозг', nameEn: 'Super Brain', icon: 'fas fa-brain', color: '#ec4899', unlocked: perfectCount >= 3 }
            ];

            }
          } catch (e) {
            console.error('Error fetching user stats:', e);
          }
        }
      });
    },

    applyUserPreferences(prefs) {
      if (prefs.defaultSubject && !this.selectedSubject) {
        const trySelect = () => {
          const sub = this.subjects.find(s => s.id === prefs.defaultSubject);
          if (sub) {
            this.selectSubjectCard(sub);
            
            this.$nextTick(() => {
              const checkLevels = () => {
                if (this.levels.length > 0) {
                  if (prefs.defaultLevel) {
                    this.selectedLevel = prefs.defaultLevel;
                  }
                  if (prefs.dailyGoal) {
                    this.selectedQuestionCount = prefs.dailyGoal;
                  }
                } else {
                  setTimeout(checkLevels, 100);
                }
              };
              checkLevels();
            });
          }
        };

        if (this.subjects.length > 0) {
          trySelect();
        } else {
          const unwatch = this.$watch('subjects', (newVal) => {
            if (newVal && newVal.length > 0) {
              trySelect();
              unwatch();
            }
          });
        }
      }
    },

    calculateStreak(results) {
      if (!results || results.length === 0) return 0;

      // Extract unique active date strings in YYYY-MM-DD
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

      // Check if last activity date was either today or yesterday
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
    },

    determineAdviceType(results) {
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
    },

    getFallbackAdvice(results) {
      if (!results || results.length === 0) {
        const textMap = {
          UZB: "Salom! Siz hali birorta ham test topshirmadingiz. Math yoki English fanlaridan Beginner darajasida test topshirishni tavsiya qilaman.",
          RUS: "Привет! Вы еще не прошли ни одного теста. Рекомендуем начать с диагностического теста по Math или English на уровне Beginner."
        };
        const badgeMap = {
          UZB: "Birinchi test",
          RUS: "Начать тест"
        };
        return {
          text: textMap[this.currentLocale] || textMap['UZB'],
          badge: badgeMap[this.currentLocale] || badgeMap['UZB'],
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

      let weakestSubject = '';
      let weakestPct = 101;
      let strongestSubject = '';
      let strongestPct = -1;

      Object.keys(subjectStats).forEach((sub) => {
        const pct = Math.round(
          (subjectStats[sub].score / subjectStats[sub].total) * 100
        );
        if (pct < weakestPct) {
          weakestPct = pct;
          weakestSubject = sub;
        }
        if (pct > strongestPct) {
          strongestPct = pct;
          strongestSubject = sub;
        }
      });

      this.weakestSubject = weakestSubject;
      this.strongestSubject = strongestSubject;

      const lastTest = results[0];
      const lastPct = Math.round((lastTest.score / lastTest.total) * 100);

      if (this.currentLocale === 'RUS') {
        if (overallAvg < 60) {
          return {
            text: `Привет, ${this.userDisplayName}. Ваш средний балл составляет ${overallAvg}%. Самым сложным предметом является ${weakestSubject} (${weakestPct}%). Рекомендуем начать с уровня Beginner по этому предмету.`,
            badge: "Закрепить базу",
            recommendedSubject: weakestSubject,
            recommendedLevel: 'Beginner'
          };
        } else if (overallAvg >= 85) {
          return {
            text: `Отличный результат, ${this.userDisplayName}! Средний балл — ${overallAvg}%. Особенно хороши успехи в ${strongestSubject} (${strongestPct}%). Попробуйте Advanced уровень!`,
            badge: "Сложный уровень",
            recommendedSubject: strongestSubject,
            recommendedLevel: 'Advanced'
          };
        } else {
          return {
            text: `Хороший темп, ${this.userDisplayName}! Средний балл — ${overallAvg}%. В последнем тесте по ${lastTest.subject} вы набрали ${lastPct}%. Проанализируйте ошибки.`,
            badge: "Работа над ошибками",
            recommendedSubject: lastTest.subject,
            recommendedLevel: lastTest.level
          };
        }

      } else {
        if (overallAvg < 60) {
          return {
            text: `Salom, ${this.userDisplayName}. Hozirda o'rtacha ballingiz ${overallAvg}%. Eng ko'p qiynalayotgan faningiz ${weakestSubject} (${weakestPct}%). Ushbu fandan Beginner darajasida test yechishni tavsiya qilaman.`,
            badge: "Bazani mustahkamlash",
            recommendedSubject: weakestSubject,
            recommendedLevel: 'Beginner'
          };
        } else if (overallAvg >= 85) {
          return {
            text: `Ajoyib ko'rsatkich, ${this.userDisplayName}! O'rtacha natijangiz juda yuqori (${overallAvg}%). Ayniqsa ${strongestSubject} fanidan natijangiz a'lo darajada (${strongestPct}%). Advanced darajasida urinib ko'ring!`,
            badge: "Murakkab darajalar",
            recommendedSubject: strongestSubject,
            recommendedLevel: 'Advanced'
          };
        } else {
          return {
            text: `Yaxshi natija, ${this.userDisplayName}! Bilim ko'rsatkichingiz o'rtacha ${overallAvg}%. Oxirgi topshirgan ${lastTest.subject} testingizda natijangiz ${lastPct}% bo'ldi.`,
            badge: "Xatolar ustida ishlash",
            recommendedSubject: lastTest.subject,
            recommendedLevel: lastTest.level
          };
        }
      }
    },

    async fetchAiAdviceFromGemini(results) {
      this.aiAdviceLoading = true;
      
      const fallback = this.getFallbackAdvice(results);
      this.aiAdvice = fallback;
      this.aiAdviceType = this.determineAdviceType(results);
      
      try {
        const name = this.userDisplayName || 'User';
        const locale = this.currentLocale || 'UZB';
        
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
        
        const subjectsList = this.subjects.map(s => s.id).join(', ');
        
        const prompt = `You are the expert personalized AI Advisor for the Test.me platform.
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
  "text": "Your highly personalized advice here in ${locale}. Max 2-3 sentences. Reference their stats (e.g. 'average of ${overallAvg}%') and latest test to be authentic. Avoid generic statements.",
  "badge": "Action label for button in ${locale} (max 3 words, e.g. 'Mathni boshlash' or 'Начать тест')",
  "recommendedSubject": "Exact subject ID from available subjects list (must match one of [${subjectsList}])",
  "recommendedLevel": "Exact recommended level (e.g. 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Easy', 'Medium', 'Hard')"
}`;

        const GEMINI_API_KEY = "AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g";
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
            this.aiAdvice = {
              text: adviceData.text,
              badge: adviceData.badge,
              recommendedSubject: adviceData.recommendedSubject,
              recommendedLevel: adviceData.recommendedLevel
            };
            this.aiAdviceType = 'gemini';
          }
        }
      } catch (err) {
        console.error("Failed to generate dynamic AI advice with Gemini:", err);
      } finally {
        this.aiAdviceLoading = false;
      }
    },

    handleAiBadgeClick() {
      if (this.aiAdvice.recommendedSubject && this.aiAdvice.recommendedLevel) {
        const target = this.subjects.find(
          (s) => s.id.toLowerCase() === this.aiAdvice.recommendedSubject.toLowerCase() ||
                 s.nameEn?.toLowerCase() === this.aiAdvice.recommendedSubject.toLowerCase() ||
                 s.nameUz?.toLowerCase() === this.aiAdvice.recommendedSubject.toLowerCase() ||
                 s.nameRu?.toLowerCase() === this.aiAdvice.recommendedSubject.toLowerCase()
        );
        if (target) {
          this.selectSubjectCard(target);
          setTimeout(() => {
            const recLvl = this.aiAdvice.recommendedLevel.toLowerCase();
            const foundLvl = this.levels.find(l => l.toLowerCase() === recLvl);
            if (foundLvl) {
              this.selectedLevel = foundLvl;
            } else if (this.levels.length > 0) {
              // Try to find approximate match
              const approx = this.levels.find(l => l.toLowerCase().startsWith(recLvl.substring(0, 3)));
              if (approx) {
                this.selectedLevel = approx;
              } else {
                this.selectedLevel = this.levels[0];
              }
            }
            this.selectedQuestionCount = 10;
            this.$nextTick(() => {
              document.querySelector('.start-test-btn')?.scrollIntoView({ behavior: 'smooth' });
            });
          }, 600);
          return;
        }
      }

      // Fallback handlers
      if (this.aiAdviceType === 'first_test') {
        if (this.subjects.length > 0) {
          this.selectSubjectCard(this.subjects[0]);
          this.$nextTick(() => {
            document.querySelector('.selection-panel')?.scrollIntoView({ behavior: 'smooth' });
          });
        }
      } else {
        document.querySelector('.selection-panel')?.scrollIntoView({ behavior: 'smooth' });
      }
    },

    getStreakText(streak) {
      if (this.currentLocale === 'UZB') return `${streak} kun`;
      
      // Russian pluralization rules
      const lastDigit = streak % 10;
      const lastTwoDigits = streak % 100;
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return `${streak} дней`;
      }
      if (lastDigit === 1) {
        return `${streak} день`;
      }
      if (lastDigit >= 2 && lastDigit <= 4) {
        return `${streak} дня`;
      }
      return `${streak} дней`;
    },
  },
  mounted() {
    this.fetchSubjects();
    this.fetchSpecialTests();
    this.fetchUserStats();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.dashboard-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
}

/* Background glowing elements for futuristic feel */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  z-index: 0;
  opacity: 0.06;
  pointer-events: none;
}
.glow-bg-1 {
  width: 500px;
  height: 500px;
  background: #3b82f6;
  top: -5%;
  left: -5%;
}
.glow-bg-2 {
  width: 600px;
  height: 600px;
  background: #8b5cf6;
  bottom: -5%;
  right: -5%;
}

.test-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  width: 95%;
  margin: 0 auto;
  padding: 2.5rem 0;
}

/* Welcome Banner Redesign */
.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%);
  padding: 2.5rem 2.25rem;
  border-radius: 28px;
  color: white;
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(37, 99, 235, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -60%;
  left: -20%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
}

.welcome-banner::after {
  content: '';
  position: absolute;
  bottom: -60%;
  right: -10%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
}

.welcome-text h1 {
  font-size: 2.1rem;
  font-weight: 800;
  margin: 0 0 0.6rem 0;
  letter-spacing: -0.75px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to right, #ffffff, #dbeafe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-text p {
  color: #93c5fd;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.welcome-stat-chip {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.07);
  padding: 0.85rem 1.5rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}

.welcome-stat-chip:hover {
  transform: translateY(-2px);
}

.coin-icon {
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3));
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-val {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.1;
  color: #fbbf24;
}

.stat-lbl {
  font-size: 0.72rem;
  color: #bfdbfe;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Dashboard Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.5rem;
}

.selection-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.panel-section {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  padding: 2.25rem;
  border-radius: 28px;
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.04), 0 5px 15px rgba(15, 23, 42, 0.01);
  position: relative;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.75rem;
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-size: 0.9rem;
  font-weight: 800;
  border-radius: 50%;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.4px;
}

/* Tab buttons in capsule style */
.test-type-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 18px;
  margin-bottom: 2rem;
  border: 1px solid rgba(15, 23, 42, 0.03);
}

.tab-btn {
  flex: 1;
  padding: 14px 22px;
  border-radius: 14px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.98rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn:hover {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.4);
}

.tab-btn.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 6px 15px rgba(15, 23, 42, 0.04);
}

/* Premium Subject Grid Cards */
.subject-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.subject-card.premium {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1.5px solid #f1f5f9;
  border-radius: 22px;
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.015);
}

.subject-card.premium:hover {
  transform: translateY(-6px);
  border-color: var(--card-color);
  box-shadow: 0 12px 24px -10px rgba(15, 23, 42, 0.08);
}

.subject-card.premium.selected {
  background: linear-gradient(145deg, #ffffff 0%, #eff6ff 100%);
  border-color: var(--card-color) !important;
  box-shadow: 0 12px 28px -8px rgba(37, 99, 235, 0.15);
}

.subject-card-bg {
  position: absolute;
  right: -10px;
  bottom: -15px;
  font-size: 85px;
  opacity: 0.04;
  transform: rotate(-15deg);
  pointer-events: none;
  transition: all 0.4s ease;
  color: var(--card-color);
}

.subject-card.premium:hover .subject-card-bg {
  transform: rotate(0deg) scale(1.15);
  opacity: 0.07;
}

.subject-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  background-color: var(--card-color);
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.08);
  transition: all 0.3s;
}

.subject-card.premium.selected .subject-card-icon {
  transform: scale(1.05);
  box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.25);
}

.subject-card-details h4 {
  font-size: 1.08rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.subject-badge {
  font-size: 0.76rem;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
}

/* Pills selection group */
.pills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill-btn {
  border: 1.5px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.pill-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}

.pill-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2);
}

/* Action button */
.start-test-btn {
  width: 100%;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.22);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.start-test-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.32);
}

.start-test-btn:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}

/* Sidebar panel redesign */
.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.04), 0 5px 15px rgba(15, 23, 42, 0.01);
}

/* Progress bar alignment */
.rank-progress-card {
  position: relative;
}

.progress-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-target-text {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 700;
}

.progress-bar-container {
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  border-radius: 5px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-footer-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
}

/* AI Coach widget with glow */
.ai-coach-card {
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #f5f3ff 100%);
  border: 1.5px solid #bfdbfe;
  box-shadow: 0 15px 30px rgba(59, 130, 246, 0.03);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.2rem;
}

.ai-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-size: 1.35rem;
  border-radius: 50%;
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.25);
}

.ai-header h4 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.status-online {
  font-size: 0.74rem;
  color: #10b981;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}
.status-online::before {
  content: '';
  width: 7px;
  height: 7px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.ai-advice {
  font-size: 0.92rem;
  color: #475569;
  line-height: 1.65;
  font-style: italic;
  margin: 0 0 1.25rem 0;
}

.ai-loading-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-weight: 600;
  font-style: normal;
}

.ai-loading-text i {
  color: #3b82f6;
}

.ai-action-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.ai-action-badge:hover {
  background: rgba(37, 99, 235, 0.14);
  transform: translateY(-1.5px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
}

/* Streak and Achievements widget */
.streak-widget-card h4 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
}

.streak-badge-container {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde047;
  padding: 14px;
  border-radius: 18px;
  margin-bottom: 1.5rem;
  box-shadow: 0 6px 15px rgba(253, 224, 71, 0.1);
}

.streak-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border-radius: 12px;
  font-size: 1.15rem;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.25);
}

.streak-details {
  display: flex;
  flex-direction: column;
}

.streak-num {
  font-size: 1.25rem;
  font-weight: 800;
  color: #b45309;
  line-height: 1.1;
}

.streak-lbl {
  font-size: 0.74rem;
  color: #d97706;
  font-weight: 600;
  margin-top: 1px;
}

.badges-preview-sec h5 {
  font-size: 0.88rem;
  font-weight: 800;
  color: #475569;
  margin: 0 0 12px 0;
}

.mini-badges-list {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-badge-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid;
  font-size: 1rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.02);
}

.all-badges-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.all-badges-link:hover {
  background: #cbd5e1;
  color: #0f172a;
}

.no-badges-text {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

/* Test view container */
.test-view-container {
  max-width: 950px;
  margin: 30px auto;
  padding: 0 16px;
  position: relative;
  z-index: 10;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 22px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.03);
  margin-bottom: 24px;
}

.test-title-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.test-title-info h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.questions-count-tag {
  font-size: 0.84rem;
  font-weight: 700;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(37, 99, 235, 0.08);
  padding: 5px 14px;
  border-radius: 20px;
  width: max-content;
}

.test-body-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 28px;
  padding: 2.25rem;
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.04);
}

.back-btn {
  padding: 10px 20px;
  background-color: #ffffff;
  border: 1.5px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-btn:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  transform: translateX(-4px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
}

/* Special tests custom design */
.special-tests-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.special-test-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.special-test-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 12px 28px rgba(139, 92, 246, 0.12);
  transform: translateY(-2px);
}
.st-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.st-icon.dtm { background: #fef9c3; color: #a16207; }
.st-icon.prezident { background: #f3e8ff; color: #9333ea; }
.st-details {
  flex: 1;
  margin: 0 20px;
}
.st-details h4 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 5px 0;
}
.st-category {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4f46e5;
  background: #eeebff;
  padding: 4px 10px;
  border-radius: 8px;
}
.st-start-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 11px 22px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}
.special-test-card:hover .st-start-btn {
  background: #059669;
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

.no-tests-banner {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
.no-tests-banner i {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* Loading animations */
.loading-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1rem;
}

.mini-loader {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #3b82f6;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loader {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status {
  margin-top: 20px;
  padding: 12px 16px;
  text-align: center;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.status.success {
  background: #ecfdf5;
  border: 1.5px solid #a7f3d0;
  color: #065f46;
}

.status.error {
  background: #fef2f2;
  border: 1.5px solid #fca5a5;
  color: #991b1b;
}

.status.info {
  background: #f0f9ff;
  border: 1.5px solid #bae6fd;
  color: #075985;
}

/* AI Seeder Generator Widget */
.ai-generator-widget {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.05));
  border: 1.5px solid rgba(168, 85, 247, 0.15) !important;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ai-gen-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ai-gen-header h4 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}
.gen-icon {
  color: #a855f7;
  font-size: 1.25rem;
  animation: pulse-icon 2s infinite ease-in-out;
}
.ai-gen-desc {
  font-size: 0.84rem;
  color: #64748b;
  line-height: 1.45;
  margin: 0;
}
.ai-gen-btn {
  background: linear-gradient(135deg, #a855f7, #3b82f6);
  color: white !important;
  text-decoration: none;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 12px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 6px 15px rgba(168, 85, 247, 0.18);
  transition: all 0.25s ease;
}
.ai-gen-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(168, 85, 247, 0.28);
}
@keyframes pulse-icon {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
