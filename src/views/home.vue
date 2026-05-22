<template>
  <div class="dashboard-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="test-container" v-if="!startTest">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1>Salom, {{ userDisplayName || 'Foydalanuvchi' }}! 👋</h1>
          <p>Bugun qaysi yo'nalishda bilimingizni sinab ko'rmoqchisiz? Quyidan fanni tanlang.</p>
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
          <div class="panel-section">
            <div class="section-header">
              <span class="step-badge">1</span>
              <h3>{{ t('chooseSubject') }}</h3>
            </div>
            
            <div v-if="loadingSubjects" class="loading-container">
              <span class="mini-loader"></span>
              <p>{{ t('loadingSubjects') }}</p>
            </div>

            <div class="subject-cards-grid" v-else>
              <div
                v-for="subject in subjects"
                :key="subject.id"
                :class="['subject-card', { selected: selectedSubject && selectedSubject.id === subject.id }]"
                @click="selectSubjectCard(subject)"
              >
                <div class="subject-card-icon">
                  <i :class="getSubjectIcon(subject.id)"></i>
                </div>
                <div class="subject-card-details">
                  <h4>{{ subject.id }}</h4>
                  <span class="subject-badge">Testlar tayyor</span>
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

        <!-- Right Side: Sidebar Info & AI Coach -->
        <div class="sidebar-panel">
          <!-- AI Coach Card -->
          <div class="sidebar-card ai-coach-card">
            <div class="ai-header">
              <div class="ai-avatar">
                <i class="fas fa-robot"></i>
              </div>
              <div>
                <h4>AI Ustozingiz</h4>
                <span class="status-online">Tizimda faol</span>
              </div>
            </div>
            <p class="ai-advice">
              "{{ aiAdvice.text }}"
            </p>
            <div class="ai-action-badge" v-if="aiAdvice.badge">
              <i class="fas fa-lightbulb"></i> {{ aiAdvice.badge }}
            </div>
          </div>

          <!-- Daily Streak & Achievements Widget -->
          <div class="sidebar-card streak-widget-card">
            <h4>{{ isRus ? 'Активность и Награды' : 'Faollik va Yutuqlar' }}</h4>
            
            <!-- Streak counter -->
            <div class="streak-badge-container">
              <div class="streak-icon-wrap">
                <i class="fas fa-fire"></i>
              </div>
              <div class="streak-details">
                <span class="streak-num">{{ userStreak }} {{ isRus ? 'дней' : 'kun' }}</span>
                <span class="streak-lbl">{{ isRus ? 'Ударный темп' : 'Ketma-ket faollik' }}</span>
              </div>
            </div>

            <!-- Mini Badges preview -->
            <div class="badges-preview-sec">
              <h5>{{ isRus ? 'Последние награды' : 'So\'nggi yutuqlar' }}</h5>
              <div class="mini-badges-list" v-if="unlockedBadges.length > 0">
                <div 
                  v-for="badge in unlockedBadges.slice(0, 3)"
                  :key="badge.id"
                  class="mini-badge-item"
                  :style="{ background: badge.color + '15', color: badge.color, borderColor: badge.color + '30' }"
                  :title="isRus ? badge.nameRu : badge.nameUz"
                >
                  <i :class="badge.icon"></i>
                </div>
                <router-link to="/badges" class="all-badges-link" :title="isRus ? 'Все награды' : 'Barcha yutuqlar'">
                  <i class="fas fa-arrow-right"></i>
                </router-link>
              </div>
              <p class="no-badges-text" v-else>
                {{ isRus ? 'У вас пока нет открытых наград. Пройдите тест!' : 'Sizda hali ochilgan yutuqlar yo\'q. Test yeching!' }}
              </p>
            </div>
          </div>

          <!-- AI Test Generator widget -->
          <div class="sidebar-card ai-generator-widget">
            <div class="ai-gen-header">
              <i class="fas fa-magic gen-icon"></i>
              <h4>{{ isRus ? 'AI Конструктор Тестов' : 'AI Test Konstruktori' }}</h4>
            </div>
            <p class="ai-gen-desc">{{ isRus ? 'Создайте персональный тест на любую тему с помощью искусственного интеллекта!' : 'Istagan mavzuingiz bo\'yicha sun\'iy intellekt yordamida shaxsiy test yarating!' }}</p>
            <router-link to="/ai-setup" class="ai-gen-btn">
              <i class="fas fa-cog"></i> {{ isRus ? 'Настроить AI Тест' : 'AI Testni Sozlash' }}
            </router-link>
          </div>
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
import TestPage from './testPage/testPage.vue';
import { useI18n } from '@/utils/i18n';

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

      // User details
      userDisplayName: '',
      userPoints: 0,
      aiAdvice: { text: '', badge: '' },
      userStreak: 0,
      unlockedBadges: []
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
      return 'fas fa-graduation-cap';
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

        this.levels = levelsCollection.docs.map((doc) => doc.id);

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

        const sessionsRef = collection(db, 'testSessions');
        const docRef = await addDoc(sessionsRef, testSession);
        const sessionId = docRef.id;

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
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userDisplayName = user.displayName || user.email.split('@')[0];
          try {
            // Fetch user points
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              this.userPoints = userDoc.data().points || 0;
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
            this.aiAdvice = this.generateAIAdvice(results);

            // Calculate streak
            this.userStreak = this.calculateStreak(results);

            // Compute unlocked badges list
            const totalTests = results.length;
            const perfectCount = results.filter(r => r.score === r.total).length;
            
            const badgesConfig = [
              { id: 'first_step', nameUz: 'Birinchi qadam', nameRu: 'Первый шаг', icon: 'fas fa-walking', color: '#3b82f6', unlocked: totalTests >= 1 },
              { id: 'persistent', nameUz: 'Tirishqoq', nameRu: 'Упорный', icon: 'fas fa-fire', color: '#f97316', unlocked: totalTests >= 5 },
              { id: 'scholar', nameUz: 'Bilimdon', nameRu: 'Эрудит', icon: 'fas fa-book-reader', color: '#10b981', unlocked: totalTests >= 15 },
              { id: 'perfect_score', nameUz: 'A\'lochi', nameRu: 'Отличник', icon: 'fas fa-star', color: '#fbbf24', unlocked: perfectCount >= 1 },
              { id: 'coin_king', nameUz: 'Koin Qiroli', nameRu: 'Король Коинов', icon: 'fas fa-coins', color: '#a855f7', unlocked: this.userPoints >= 500 },
              { id: 'super_brain', nameUz: 'Super Aql', nameRu: 'Супер Мозг', icon: 'fas fa-brain', color: '#ec4899', unlocked: perfectCount >= 3 }
            ];

            this.unlockedBadges = badgesConfig.filter(b => b.unlocked);
          } catch (e) {
            console.error('Error fetching user stats:', e);
          }
        }
      });
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

    generateAIAdvice(results) {
      if (!results || results.length === 0) {
        return {
          text: this.currentLocale === 'RUS'
            ? "Привет! Вы еще не прошли ни одного теста. Рекомендуем начать с диагностического теста по предмету Math или English на уровне Beginner, чтобы оценить свой стартовый уровень."
            : "Salom! Siz hali birorta ham test yechmadingiz. Bilim darajangizni aniqlash uchun Math yoki English fanlaridan Beginner darajasida diagnostik test topshirishni tavsiya qilaman.",
          badge: this.currentLocale === 'RUS' ? "Начните первый тест" : "Birinchi testni boshlang"
        };
      }

      // Calculate statistics
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

      // Find weakest and strongest subjects
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

      const lastTest = results[0];
      const lastPct = Math.round((lastTest.score / lastTest.total) * 100);

      if (this.currentLocale === 'RUS') {
        if (overallAvg < 60) {
          return {
            text: `Ваш средний балл составляет ${overallAvg}%. Самым сложным предметом для вас является ${weakestSubject} (${weakestPct}%). Советуем повторить базу и решать тесты уровня Elementary.`,
            badge: "Укрепите базовые знания"
          };
        } else if (overallAvg >= 85) {
          return {
            text: `Отличный результат! Ваш средний показатель — ${overallAvg}%. Вы отлично справляетесь с предметом ${strongestSubject} (${strongestPct}%). Попробуйте свои силы на уровне Advanced или пройдите квалификационные тесты!`,
            badge: "Продвинутый уровень"
          };
        } else {
          return {
            text: `Хороший темп! Ваш средний балл — ${overallAvg}%. В последнем тесте (${lastTest.subject}) вы набрали ${lastPct}%. Проработайте ошибочные вопросы в отчете, чтобы довести результат до идеала.`,
            badge: "Анализируйте ошибки"
          };
        }
      } else {
        // Uzbek (default)
        if (overallAvg < 60) {
          return {
            text: `Bilim ko'rsatkichingiz o'rtacha ${overallAvg}% ni tashkil etmoqda. Siz uchun eng qiyin bo'lgan fan: ${weakestSubject} (${weakestPct}%). Elementary darajadagi testlarni qayta yechib, bazani mustahkamlashni maslahat beraman.`,
            badge: "Bazani mustahkamlang"
          };
        } else if (overallAvg >= 85) {
          return {
            text: `Ajoyib ko'rsatkich! O'rtacha natijangiz juda yuqori (${overallAvg}%). Ayniqsa ${strongestSubject} fanidan natijangiz a'lo darajada (${strongestPct}%). O'zingizni Advanced yoki toifa testlarida sinab ko'rish vaqti keldi!`,
            badge: "Murakkab darajalar"
          };
        } else {
          return {
            text: `Yaxshi natija! Umumiy bilim ko'rsatkichingiz o'rtacha ${overallAvg}% ni tashkil etmoqda. Oxirgi topshirgan ${lastTest.subject} testingizda natijangiz ${lastPct}% bo'ldi. Noto'g'ri javoblarni tahlil qilib, natijani a'loga yetkazing.`,
            badge: "Xatolar ustida ishlash"
          };
        }
      }
    },
  },
  mounted() {
    this.fetchSubjects();
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

/* Background glowing elements */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.08;
}
.glow-bg-1 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  top: 10%;
  left: 5%;
}
.glow-bg-2 {
  width: 500px;
  height: 500px;
  background: #8b5cf6;
  bottom: 10%;
  right: 5%;
}

.test-container {
  position: relative;
  z-index: 10;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Welcome Banner */
.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 2rem;
  border-radius: 20px;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.15);
}

.welcome-text h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.welcome-text p {
  color: #bfdbfe;
  font-size: 0.95rem;
  margin: 0;
}

.welcome-stat-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.12);
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.coin-icon {
  width: 32px;
  height: 32px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-val {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.2;
}

.stat-lbl {
  font-size: 0.7rem;
  color: #bfdbfe;
  font-weight: 600;
  text-transform: uppercase;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2rem;
}

.selection-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.25rem;
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background-color: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  font-size: 0.85rem;
  font-weight: 800;
  border-radius: 50%;
}

.section-header h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

/* Subject Grid Cards */
.subject-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1rem;
}

.subject-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.subject-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.subject-card.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.08);
}

.subject-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1.2rem;
  color: #3b82f6;
  transition: all 0.25s ease;
}

.subject-card.selected .subject-card-icon {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.subject-card-details h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
}

.subject-badge {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 500;
}

.subject-card.selected .subject-badge {
  color: #2563eb;
  font-weight: 600;
}

/* Pills selection group */
.pills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill-btn {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.pill-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

/* Action button */
.start-test-btn {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.25);
  transition: all 0.2s ease;
}

.start-test-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.start-test-btn:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}

/* Sidebar cards */
.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);
}

.ai-coach-card {
  background: linear-gradient(to bottom right, #ffffff 0%, #eff6ff 100%);
  border-color: #bfdbfe;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.ai-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #3b82f6;
  color: white;
  font-size: 1.25rem;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.ai-header h4 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.status-online {
  font-size: 0.7rem;
  color: #10b981;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}
.status-online::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
}

.ai-advice {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.6;
  font-style: italic;
  margin: 0 0 1rem 0;
}

.ai-action-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  padding: 6px 12px;
  border-radius: 8px;
}

/* Streak and Achievements widget */
.streak-widget-card h4 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
}

.streak-badge-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 12px;
  border-radius: 14px;
  margin-bottom: 1.25rem;
}

.streak-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: #f59e0b;
  color: white;
  border-radius: 10px;
  font-size: 1.1rem;
  box-shadow: 0 3px 8px rgba(245, 158, 11, 0.2);
}

.streak-details {
  display: flex;
  flex-direction: column;
}

.streak-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: #b45309;
  line-height: 1.2;
}

.streak-lbl {
  font-size: 0.72rem;
  color: #d97706;
  font-weight: 600;
}

.badges-preview-sec h5 {
  font-size: 0.85rem;
  font-weight: 800;
  color: #475569;
  margin: 0 0 10px 0;
}

.mini-badges-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-badge-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.95rem;
}

.all-badges-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.all-badges-link:hover {
  background: #cbd5e1;
  color: #0f172a;
}

.no-badges-text {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}

/* Test view styles */
.test-view-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 16px;
  position: relative;
  z-index: 10;
}

.test-title-info h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.questions-count-tag {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.test-body-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
}

.back-btn {
  padding: 8px 16px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
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

.status {
  margin-top: 20px;
  padding: 12px 16px;
  text-align: center;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.status.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.status.error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.status.info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #075985;
}

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
  font-size: 1.2rem;
  animation: pulse-icon 2s infinite ease-in-out;
}
.ai-gen-desc {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}
.ai-gen-btn {
  background: linear-gradient(135deg, #a855f7, #3b82f6);
  color: white !important;
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
  transition: all 0.2s ease;
}
.ai-gen-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(168, 85, 247, 0.25);
}
@keyframes pulse-icon {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
