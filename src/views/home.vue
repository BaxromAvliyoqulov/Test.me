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

          <!-- STANDARD TAB -->
          <transition name="fade-slide" mode="out-in">
          <div class="tab-content" v-if="currentTab === 'standard'" key="standard">
            <div class="panel-section">
              <div class="section-header">
                <span class="step-badge">1</span>
                <h3>{{ t('chooseSubject') }}</h3>
              </div>
              
              <div v-if="loadingSubjects" class="loading-state">
                <div class="spinner"></div>
                <p>{{ t('loadingSubjects') }}</p>
              </div>

              <div class="subject-grid" v-else>
                <div
                  v-for="subject in subjects"
                  :key="subject.id"
                  :class="['subject-card', { selected: selectedSubject && selectedSubject.id === subject.id, 'goal-active': subject.id === defaultSubjectId }]"
                  :style="{ '--subject-color': getSubjectColor(subject.id) }"
                  @click="selectSubjectCard(subject)"
                >
                  <div class="card-bg-icon"><i :class="getSubjectIcon(subject.id)"></i></div>
                  <div class="card-content">
                    <div class="icon-wrapper"><i :class="getSubjectIcon(subject.id)"></i></div>
                    <h4>{{ subject.id }}</h4>
                    <span class="status-badge">{{ t('testsReady') }}</span>
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          <!-- SPECIAL TESTS TAB -->
          <div class="tab-content" v-else-if="currentTab === 'special'" key="special">
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
                <div v-for="test in specialTests" :key="test.id" class="special-test-card" @click="startSpecialTest(test)">
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
          </div>
          </transition>
        </div>

        <!-- Right Side: Sidebar Info & AI Coach -->
        <div class="sidebar-panel">
          
          <!-- Rank Progress Card -->
          <div class="premium-card rank-card">
            <div class="rank-header">
              <div class="rank-badge" :class="getRankClass(userPoints)">
                <i :class="getRankIcon(userPoints)"></i> {{ getRankName(userPoints, currentLocale) }}
              </div>
              <span class="next-rank">
                → {{ getNextRankInfo(userPoints, currentLocale).nextRankName }}
              </span>
            </div>
            <div class="progress-track">
              <div 
                class="progress-fill" 
                :style="{ width: getNextRankInfo(userPoints, currentLocale).progressPercent + '%' }"
              >
                <div class="progress-glow"></div>
              </div>
            </div>
            <div class="rank-footer">
              <span>{{ getNextRankInfo(userPoints, currentLocale).label }}</span>
              <span v-if="getNextRankInfo(userPoints, currentLocale).pointsNeeded > 0" class="points-needed">
                {{ currentLocale === 'RUS' ? `Нужно еще ${getNextRankInfo(userPoints, currentLocale).pointsNeeded} TP` : `Yana ${getNextRankInfo(userPoints, currentLocale).pointsNeeded} TP` }}
              </span>
              <span v-else class="points-needed">{{ currentLocale === 'RUS' ? 'Максимальный Ранг' : 'Maksimal Rang' }}</span>
            </div>
          </div>

          <!-- AI Coach Card -->
          <div class="premium-card ai-card">
            <div class="ai-header">
              <div class="ai-avatar">
                <i class="fas fa-robot"></i>
              </div>
              <div class="ai-title">
                <h4>{{ t('aiTutor') }}</h4>
                <span class="online-dot">{{ t('activeInSystem') }}</span>
              </div>
            </div>
            <div class="ai-body">
              <div v-if="aiAdviceLoading" class="ai-loading">
                <div class="spinner-small blue"></div>
                <span>{{ currentLocale === 'RUS' ? 'Анализ...' : 'Tahlil qilinmoqda...' }}</span>
              </div>
              <p v-else class="ai-text">
                "{{ aiAdvice.text }}"
              </p>
              <button class="btn-ai-action" v-if="!aiAdviceLoading && aiAdvice.badge" @click="handleAiBadgeClick">
                <i class="fas fa-magic"></i> {{ aiAdvice.badge }}
              </button>
            </div>
          </div>

          <!-- Daily Streak & Achievements Widget -->
          <div class="premium-card achievements-card">
            <h4>{{ t('activityAndAwards') }}</h4>
            
            <!-- Streak counter -->
            <div class="streak-box">
              <div class="fire-icon">
                <i class="fas fa-fire"></i>
              </div>
              <div class="streak-info">
                <strong>{{ getStreakText(userStreak) }}</strong>
                <span>{{ t('streakStreak') }}</span>
              </div>
            </div>

            <!-- Mini Badges preview -->
            <div class="badges-preview">
              <h5>{{ t('latestAwards') }}</h5>
              <div class="mini-badges-row" v-if="unlockedBadges.length > 0">
                <div 
                  v-for="badge in unlockedBadges.slice(0, 4)"
                  :key="badge.id"
                  class="badge-item"
                  :style="{ '--badge-color': badge.color }"
                  :title="currentLocale === 'RUS' ? badge.nameRu : badge.nameUz"
                >
                  <i :class="badge.icon"></i>
                </div>
                <router-link to="/badges" class="btn-all-badges" :title="currentLocale === 'RUS' ? 'Все награды' : 'Barcha yutuqlar'">
                  <i class="fas fa-chevron-right"></i>
                </router-link>
              </div>
              <div class="empty-state small" v-else>
                {{ t('noBadgesYet') }}
              </div>
            </div>
          </div>
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
        :subjectId="selectedSubject.id"
        :levelId="selectedLevel"
        :questionCount="selectedQuestionCount"
        @test-completed="handleTestCompletion"
        @exit-test="goBackToSelection"
      />
    </transition>
  
    <!-- Modal Wizard Overlay -->
    <transition name="modal-fade">
      <div class="premium-modal-overlay" v-if="showTestWizard" @click.self="closeWizard">
        <div class="modal-wizard-card">
          <div class="modal-header">
            <div class="modal-title-wrapper">
              <div class="m-icon-wrapper"><i :class="getSubjectIcon(selectedSubject.id)"></i></div>
              <div class="m-title-info">
                <h3>{{ selectedSubject.id }}</h3>
                <span>{{ currentLocale === 'RUS' ? 'Настройки Теста' : 'Test Sozlamalari' }}</span>
              </div>
            </div>
            <button class="m-close-btn" @click="closeWizard"><i class="fas fa-times"></i></button>
          </div>
          
          <div class="modal-body">
            <!-- Level Selection -->
            <div class="m-section">
              <div class="m-section-title">
                <span class="m-step">1</span>
                <h4>{{ t('selectLevel') }}</h4>
              </div>
              <div v-if="loadingLevels" class="loading-state small">
                <div class="spinner"></div>
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
            <transition name="expand">
            <div class="m-section" v-if="selectedLevel">
              <div class="m-section-title">
                <span class="m-step">2</span>
                <h4>{{ t('questionCount') }}</h4>
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
            </transition>
          </div>

          <div class="modal-footer">
             <button @click="startTestWithFilters" class="btn-start-premium" :disabled="!canStart">
               <span v-if="!loading">{{ t('startTest') }} <i class="fas fa-play"></i></span>
               <div v-else class="spinner-small"></div>
             </button>
          </div>
        </div>
      </div>
    </transition>
        </div>
</template>

<script>
import { db, auth } from '@/config/firebase';
import { collection, doc, getDocs, addDoc, getDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import defaultUserImage from '../assets/img/user.png';
import { useI18n } from '@/utils/i18n';
import { onErrorCaptured } from 'vue';
import { getRankName, getRankClass, getRankIcon, getNextRankInfo } from '@/utils/ranks';
import { sortLevels } from '@/utils/sorters';
import { getBadges } from '@/utils/badges';
import TestPage from './testPage/testPage.vue';
import WelcomeBanner from '@/components/home/WelcomeBanner.vue';

export default {
  name: 'SubjectTestSelection',
  components: {
    TestPage,
    WelcomeBanner
  },
  setup() {
    const { t, locale } = useI18n();

    onErrorCaptured((err, instance, info) => {
      console.error('Captured Vue Error:', err, info);
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;background:rgba(255,0,0,0.9);color:white;padding:40px;overflow:auto;font-size:20px;';
      div.innerHTML = '<h1>VUE RENDER ERROR</h1><p><strong>Message:</strong> ' + err.message + '</p><pre>' + err.stack + '</pre><p><strong>Info:</strong> ' + info + '</p>';
      document.body.appendChild(div);
      return false;
    });
    return { t, currentLocale: locale };
  },
  data() {
    return {
      selectedSubject: null,
      selectedLevel: '',
      selectedQuestionCount: '',
      showTestWizard: false,
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
      aiAdviceType: '',
      defaultSubjectId: null
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
      this.selectedSubject = subject;
      this.selectedLevel = '';
      this.selectedQuestionCount = '';
      this.showTestWizard = true;
      this.fetchLevels();
    },

    closeWizard() {
      this.showTestWizard = false;
      setTimeout(() => {
        this.selectedSubject = null;
        this.selectedLevel = '';
        this.selectedQuestionCount = '';
      }, 300);
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
        this.showTestWizard = false;
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
        this.showTestWizard = false;

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
                self.mentorType = userData.preferences.mentorType || 'standard';
              } else {
                self.mentorType = 'standard';
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
        
        const personas = {
          standard: "You are a Standard AI Assistant. You give objective, clear, and straightforward advice.",
          friendly: "You are a Friendly Mentor. You explain things softly, kindly, and with a lot of encouragement. Use emojis.",
          strict: "You are a Strict Professor. You speak formally, concisely, and strictly. You focus on discipline and facts. Never use emojis.",
          socratic: "You are a Socratic Philosopher. You don't just give the answer; you ask thought-provoking questions to make the student think. Use a wise tone.",
          motivator: "You are a Motivator Coach. You use high-energy language, exclamation marks, and hype! Motivate the student heavily. 🚀",
          innovator: "You are a Creative Genius. You suggest out-of-the-box, fun, and unconventional ways to study or view the problem. 💡",
          analyst: "You are a Cyber Analyst. You speak in a highly logical, slightly robotic, tech-savvy tone. Focus on data, algorithms, and optimization. 💻",
          sage: "You are an Ancient Sage. You speak like a wise old grandparent. Use traditional metaphors, proverbs, and tell short moral analogies. 📜"
        };
        const systemPersona = personas[this.mentorType] || personas.standard;

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
  background: linear-gradient(145deg, #ffffff 0%, #eff6ff 100%);
  border-color: #bfdbfe;
}

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
}

.ai-title h4 { margin: 0; font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.online-dot { font-size: 0.75rem; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 4px; }
.online-dot::before { content: ''; width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }

.ai-text {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.5;
  font-style: italic;
  margin: 0 0 1rem 0;
}

.btn-ai-action {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.btn-ai-action:hover { background: rgba(37, 99, 235, 0.15); transform: translateY(-2px); }

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

</style>
