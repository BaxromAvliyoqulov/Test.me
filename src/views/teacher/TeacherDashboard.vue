<template>
  <div class="teacher-dashboard-wrapper">
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="teacher-container">
      <!-- Header Banner -->
      <div class="teacher-header-banner">
        <div class="banner-left">
          <div class="teacher-badge">
            <i class="fas fa-chalkboard-teacher"></i>
            <span>{{ isRus ? 'Кабинет Учителя' : 'O\'qituvchilar Kabineti' }}</span>
          </div>
          <h1>{{ isRus ? 'Управление классами и тестами' : 'Sinflar va Testlar Boshqaruvi' }}</h1>
          <p>{{ isRus ? 'Создавайте классы, делитесь инвайт-кодами и назначайте тесты своим ученикам.' : 'Sinf yarating, taklif kodini ulashing va o\'quvchilaringizga testlar biriktiring.' }}</p>
        </div>
        <div class="banner-actions">
          <button class="btn-primary-action" @click="showCreateClassModal = true">
            <i class="fas fa-plus-circle"></i> {{ isRus ? 'Новый Класс' : 'Yangi Sinf Yaratish' }}
          </button>
          <button class="btn-secondary-action" @click="activeTab = 'library'">
            <i class="fas fa-file-excel"></i> {{ isRus ? 'Импорт из Excel' : 'Excel Import' }}
          </button>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="teacher-nav-tabs">
        <button 
          :class="['nav-tab-btn', { active: activeTab === 'classes' }]"
          @click="activeTab = 'classes'"
        >
          <i class="fas fa-users-class"></i>
          <span>{{ isRus ? 'Мои Классы' : 'Mening Sinflarim' }}</span>
          <span class="tab-count">{{ classes.length }}</span>
        </button>

        <button 
          :class="['nav-tab-btn', { active: activeTab === 'library' }]"
          @click="activeTab = 'library'"
        >
          <i class="fas fa-books"></i>
          <span>{{ isRus ? 'Библиотека Тестов' : 'Testlar Kutubxonasi' }}</span>
        </button>

        <button 
          :class="['nav-tab-btn', { active: activeTab === 'assignments' }]"
          @click="activeTab = 'assignments'"
        >
          <i class="fas fa-tasks"></i>
          <span>{{ isRus ? 'Задания и Результаты' : 'Topshiriqlar va Natijalar' }}</span>
        </button>
      </div>

      <!-- TAB 1: CLASSES -->
      <div v-if="activeTab === 'classes'" class="tab-content-section">
        <div v-if="loadingClasses" class="classes-grid">
          <div v-for="i in 3" :key="i" class="class-card skeleton-card">
            <div class="skeleton-shimmer"></div>
            <div class="skeleton-line title"></div>
            <div class="skeleton-line badge"></div>
          </div>
        </div>

        <div v-else-if="classes.length > 0" class="classes-grid">
          <div v-for="cls in classes" :key="cls.id" class="class-card">
            <div class="class-card-top">
              <div class="class-grade-tag">{{ cls.grade || 'Umumiy' }}</div>
              <div class="join-code-badge" @click="copyJoinCode(cls.join_code)" title="Kodni nusxalash">
                <i class="fas fa-key"></i>
                <span class="code-text">{{ cls.join_code }}</span>
                <i class="fas fa-copy copy-icon"></i>
              </div>
            </div>

            <div class="class-card-body">
              <h3>{{ cls.name }}</h3>
              <p class="class-meta">
                <i class="fas fa-graduation-cap"></i> {{ cls.subjects?.name_uz || cls.subject_id || 'Barcha fanlar' }}
                <span class="dot">•</span>
                <i class="fas fa-calendar-alt"></i> {{ cls.academic_year || '2026-2027' }}
              </p>
            </div>

            <div class="class-card-footer">
              <div class="student-count">
                <i class="fas fa-user-graduate"></i>
                <span>{{ cls.student_count || 0 }} {{ isRus ? 'учеников' : 'o\'quvchi' }}</span>
              </div>
              <button class="btn-class-open" @click="openClassDetails(cls)">
                {{ isRus ? 'Открыть' : 'Ko\'rish' }} <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-classes-card">
          <div class="empty-icon-wrap">
            <i class="fas fa-school"></i>
          </div>
          <h3>{{ isRus ? 'У вас пока нет классов' : 'Sizda hali sinflar mavjud emas' }}</h3>
          <p>{{ isRus ? 'Создайте свой первый класс за 30 секунд и отправьте код ученикам.' : 'Birinchi sinfingizni 30 soniyada yarating va o\'quvchilaringizga taklif kodini ulashing.' }}</p>
          <button class="btn-create-first" @click="showCreateClassModal = true">
            <i class="fas fa-plus"></i> {{ isRus ? 'Создать первый класс' : 'Birinchi sinfni yaratish' }}
          </button>
        </div>
      </div>

      <!-- TAB 2: TEST LIBRARY -->
      <div v-else-if="activeTab === 'library'" class="tab-content-section">
        <div class="library-header-bar">
          <div class="library-search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="librarySearch" 
              :placeholder="isRus ? 'Поиск по тестам...' : 'Testlar bo\'yicha qidirish...'"
            />
          </div>
          <div class="library-actions">
            <router-link to="/admin" class="btn-secondary-sm">
              <i class="fas fa-cog"></i> {{ isRus ? 'Управление предметами' : 'Fanlar boshqaruvi' }}
            </router-link>
            <button class="btn-primary-sm" @click="openQuickTestCreator">
              <i class="fas fa-plus"></i> {{ isRus ? 'Создать тест' : 'Yangi Test Yaratish' }}
            </button>
          </div>
        </div>

        <div class="library-cards-list">
          <div class="library-card">
            <div class="lib-icon math"><i class="fas fa-calculator"></i></div>
            <div class="lib-info">
              <h4>Matematika — 9-Sinf Yakuniy Nazorat</h4>
              <p>Algebraik tenglamalar, trigonometriya asoslari va geometriya masalalari</p>
              <div class="lib-tags">
                <span class="lib-tag">25 savol</span>
                <span class="lib-tag">45 daqiqa</span>
                <span class="lib-tag status-pub">Nashr etilgan</span>
              </div>
            </div>
            <div class="lib-actions">
              <button class="btn-action-icon" title="Sinfga biriktirish"><i class="fas fa-share-alt"></i></button>
              <button class="btn-action-icon" title="Tahrirlash"><i class="fas fa-edit"></i></button>
            </div>
          </div>

          <div class="library-card">
            <div class="lib-icon english"><i class="fas fa-globe"></i></div>
            <div class="lib-info">
              <h4>English Grammar & Reading Comprehension (B1)</h4>
              <p>Past Perfect, Conditionals, Relative clauses and reading exercises</p>
              <div class="lib-tags">
                <span class="lib-tag">30 savol</span>
                <span class="lib-tag">40 daqiqa</span>
                <span class="lib-tag status-pub">Nashr etilgan</span>
              </div>
            </div>
            <div class="lib-actions">
              <button class="btn-action-icon" title="Sinfga biriktirish"><i class="fas fa-share-alt"></i></button>
              <button class="btn-action-icon" title="Tahrirlash"><i class="fas fa-edit"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: ASSIGNMENTS -->
      <div v-else-if="activeTab === 'assignments'" class="tab-content-section">
        <div class="assignments-overview-card">
          <div class="assign-stat">
            <span class="stat-num">{{ classes.length }}</span>
            <span class="stat-lbl">{{ isRus ? 'Активных классов' : 'Faol sinflar' }}</span>
          </div>
          <div class="assign-divider"></div>
          <div class="assign-stat">
            <span class="stat-num">2</span>
            <span class="stat-lbl">{{ isRus ? 'Назначенных тестов' : 'Berilgan testlar' }}</span>
          </div>
          <div class="assign-divider"></div>
          <div class="assign-stat">
            <span class="stat-num">87%</span>
            <span class="stat-lbl">{{ isRus ? 'Средняя успеваемость' : 'O\'rtacha o\'zlashtirish' }}</span>
          </div>
        </div>

        <div class="assignments-table-card">
          <h3>{{ isRus ? 'Текущие задания' : 'Joriy Topshiriqlar' }}</h3>
          <table class="premium-table">
            <thead>
              <tr>
                <th>{{ isRus ? 'Класс' : 'Sinf' }}</th>
                <th>{{ isRus ? 'Тест' : 'Test Nomi' }}</th>
                <th>{{ isRus ? 'Дедлайн' : 'Muddat' }}</th>
                <th>{{ isRus ? 'Сдано' : 'Topshirildi' }}</th>
                <th>{{ isRus ? 'Действия' : 'Amallar' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>9-A Sinf</strong></td>
                <td>Matematika — 9-Sinf Yakuniy Nazorat</td>
                <td><span class="badge-deadline">30-Oktabr, 2026</span></td>
                <td>24 / 28 o'quvchi</td>
                <td>
                  <button class="btn-view-results"><i class="fas fa-chart-bar"></i> Tahlil</button>
                </td>
              </tr>
              <tr>
                <td><strong>11-B Sinf</strong></td>
                <td>English Grammar & Reading (B1)</td>
                <td><span class="badge-deadline">02-Noyabr, 2026</span></td>
                <td>18 / 22 o'quvchi</td>
                <td>
                  <button class="btn-view-results"><i class="fas fa-chart-bar"></i> Tahlil</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CREATE CLASS MODAL -->
    <transition name="modal-fade">
      <div v-if="showCreateClassModal" class="modal-overlay" @click.self="showCreateClassModal = false">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3><i class="fas fa-chalkboard-teacher"></i> {{ isRus ? 'Создать Новый Класс' : 'Yangi Sinf Yaratish' }}</h3>
            <button class="btn-close" @click="showCreateClassModal = false"><i class="fas fa-times"></i></button>
          </div>
          <form @submit.prevent="handleCreateClass" class="modal-body">
            <div class="form-group">
              <label>{{ isRus ? 'Название класса / группы' : 'Sinf yoki guruh nomi' }} *</label>
              <input 
                type="text" 
                v-model="newClass.name" 
                :placeholder="isRus ? 'Например: 9-A Sinf yoki IELTS Band 7' : 'Masalan: 9-A Sinf yoki DTM Fizika'"
                required 
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ isRus ? 'Предмет' : 'Asosiy Fan' }}</label>
                <select v-model="newClass.subject_id">
                  <option value="">{{ isRus ? '-- Выберите предмет --' : '-- Fanni tanlang --' }}</option>
                  <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
                    {{ isRus ? (sub.nameRu || sub.name) : (sub.nameUz || sub.name) }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>{{ isRus ? 'Класс / Уровень' : 'Sinf / Kurs' }}</label>
                <input 
                  type="text" 
                  v-model="newClass.grade" 
                  :placeholder="isRus ? 'Например: 9-sinf' : 'Masalan: 9-sinf yoki Foundation'" 
                />
              </div>
            </div>

            <div class="form-group">
              <label>{{ isRus ? 'Учебный год' : 'O\'quv yili' }}</label>
              <input type="text" v-model="newClass.academic_year" placeholder="2026-2027" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="showCreateClassModal = false">
                {{ isRus ? 'Отмена' : 'Bekor qilish' }}
              </button>
              <button type="submit" class="btn-submit" :disabled="creatingClass">
                <span v-if="!creatingClass"><i class="fas fa-check"></i> {{ isRus ? 'Создать' : 'Sinfni yaratish' }}</span>
                <span v-else class="spinner-small"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '@/utils/i18n';
import { authService } from '@/services/supabaseService';
import { teacherService } from '@/services/teacherService';
import { DEFAULT_SUBJECTS } from '@/config/defaultSubjects';
import Swal from 'sweetalert2';

const { locale: currentLocale } = useI18n();
const isRus = computed(() => currentLocale.value === 'RUS');

const activeTab = ref('classes');
const classes = ref([]);
const loadingClasses = ref(false);
const librarySearch = ref('');
const showCreateClassModal = ref(false);
const creatingClass = ref(false);

const subjects = ref(DEFAULT_SUBJECTS);

const newClass = ref({
  name: '',
  subject_id: '',
  grade: '',
  academic_year: '2026-2027'
});

const loadClasses = async () => {
  loadingClasses.value = true;
  try {
    const user = await authService.getUser();
    if (user) {
      const data = await teacherService.getClasses(user.id);
      classes.value = data || [];
    } else {
      // Namuna uchun lokal sinflar
      classes.value = [
        {
          id: 'demo-1',
          name: '9-A Sinf (Aniq Fanlar)',
          grade: '9-sinf',
          subject_id: 'matematika',
          subjects: { name_uz: 'Matematika' },
          join_code: 'TM-9A42',
          student_count: 28,
          academic_year: '2026-2027'
        },
        {
          id: 'demo-2',
          name: '11-B CEFR English Group',
          grade: '11-sinf',
          subject_id: 'ingliz-tili',
          subjects: { name_uz: 'Ingliz tili' },
          join_code: 'TM-B108',
          student_count: 22,
          academic_year: '2026-2027'
        }
      ];
    }
  } catch (err) {
    console.error('Sinflarni yuklashda xatolik:', err);
  } finally {
    loadingClasses.value = false;
  }
};

const handleCreateClass = async () => {
  if (!newClass.value.name) return;
  creatingClass.value = true;
  try {
    const user = await authService.getUser();
    const payload = {
      ...newClass.value,
      teacher_id: user?.id || 'demo_teacher'
    };

    const created = await teacherService.createClass(payload);
    classes.value.unshift({
      ...created,
      subjects: subjects.value.find(s => s.id === created.subject_id) || { name_uz: 'Umumiy' },
      student_count: 0
    });

    showCreateClassModal.value = false;
    newClass.value = { name: '', subject_id: '', grade: '', academic_year: '2026-2027' };

    Swal.fire({
      icon: 'success',
      title: isRus.value ? 'Класс успешно создан!' : 'Sinf muvaffaqiyatli yaratildi!',
      text: isRus.value 
        ? `Код для входа: ${created.join_code}. Отправьте его ученикам.` 
        : `Taklif kodi: ${created.join_code}. Ushbu kodni o'quvchilaringizga ulashing.`,
      confirmButtonColor: '#2563eb'
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Xatolik',
      text: err.message
    });
  } finally {
    creatingClass.value = false;
  }
};

const copyJoinCode = (code) => {
  if (!code) return;
  navigator.clipboard.writeText(code);
  Swal.fire({
    icon: 'success',
    title: isRus.value ? 'Код скопирован!' : 'Kod nusxalandi!',
    text: `${code}`,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000
  });
};

const openClassDetails = (cls) => {
  Swal.fire({
    title: cls.name,
    html: `
      <div style="text-align: left; padding: 10px;">
        <p><strong>Taklif kodi:</strong> <span style="font-size: 1.2rem; color: #2563eb; font-weight: bold;">${cls.join_code}</span></p>
        <p><strong>Fan:</strong> ${cls.subjects?.name_uz || cls.subject_id}</p>
        <p><strong>O'quvchilar soni:</strong> ${cls.student_count || 0} nafar</p>
        <p><strong>O'quv yili:</strong> ${cls.academic_year || '2026-2027'}</p>
      </div>
    `,
    confirmButtonText: 'Tushunarli',
    confirmButtonColor: '#2563eb'
  });
};

const openQuickTestCreator = () => {
  Swal.fire({
    title: isRus.value ? 'Создание теста' : 'Yangi Test Yaratish',
    text: isRus.value 
      ? 'Вы можете загрузить вопросы через Excel или воспользоваться конструктором тестов.' 
      : 'Savollarni Excel orqali yuklashingiz yoki yangi savollar kiritishingiz mumkin.',
    showCancelButton: true,
    confirmButtonText: isRus.value ? 'Excel Import' : 'Excel Import',
    cancelButtonText: isRus.value ? 'Yopish' : 'Yopish',
    confirmButtonColor: '#10b981'
  }).then((res) => {
    if (res.isConfirmed) {
      window.location.href = '/admin';
    }
  });
};

onMounted(() => {
  loadClasses();
});
</script>

<style scoped>
.teacher-dashboard-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 4rem;
  overflow: hidden;
}

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
  background: radial-gradient(circle, #2563eb 0%, transparent 70%);
  top: -10%; left: -5%;
}
.glow-bg-2 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #10b981 0%, transparent 70%);
  bottom: 10%; right: -5%;
}

.teacher-container {
  position: relative;
  z-index: 10;
  max-width: 1240px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header Banner */
.teacher-header-banner {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
  border-radius: 28px;
  padding: 2.5rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  box-shadow: 0 15px 35px -10px rgba(37, 99, 235, 0.35);
}

.teacher-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.banner-left h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.banner-left p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  max-width: 600px;
}

.banner-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-primary-action, .btn-secondary-action {
  padding: 12px 22px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-primary-action {
  background: #ffffff;
  color: #1e40af;
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary-action:hover {
  transform: translateY(-2px);
  background: #f8fafc;
}

.btn-secondary-action {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary-action:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Navigation Tabs */
.teacher-nav-tabs {
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  padding: 8px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.nav-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-tab-btn:hover {
  color: #1e293b;
}

.nav-tab-btn.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.tab-count {
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
}

/* Classes Grid */
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.class-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.class-card:hover {
  transform: translateY(-4px);
  border-color: #cbd5e1;
  box-shadow: 0 12px 24px -5px rgba(0, 0, 0, 0.06);
}

.class-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.class-grade-tag {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 8px;
}

.join-code-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.join-code-badge:hover {
  background: #dbeafe;
}

.class-card-body h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.class-meta {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.class-card-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.student-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-class-open {
  background: transparent;
  color: #2563eb;
  border: none;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.btn-class-open:hover {
  color: #1d4ed8;
  transform: translateX(3px);
}

/* Empty State */
.empty-classes-card {
  background: #ffffff;
  border: 2px dashed #cbd5e1;
  border-radius: 28px;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.empty-classes-card h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.empty-classes-card p {
  color: #64748b;
  max-width: 450px;
  margin: 0;
}

.btn-create-first {
  margin-top: 10px;
  padding: 12px 24px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-create-first:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

/* Library Section */
.library-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.library-search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 16px;
}

.library-search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
}

.library-actions {
  display: flex;
  gap: 10px;
}

.btn-primary-sm, .btn-secondary-sm {
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.btn-primary-sm {
  background: #2563eb;
  color: #ffffff;
  border: none;
}

.btn-secondary-sm {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.library-cards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.library-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.lib-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.lib-icon.math { background: #eff6ff; color: #2563eb; }
.lib-icon.english { background: #ecfdf5; color: #10b981; }

.lib-info {
  flex: 1;
}

.lib-info h4 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.lib-info p {
  margin: 0 0 8px 0;
  color: #64748b;
  font-size: 0.9rem;
}

.lib-tags {
  display: flex;
  gap: 8px;
}

.lib-tag {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.lib-tag.status-pub {
  background: #ecfdf5;
  color: #059669;
}

.btn-action-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-action-icon:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

/* Assignments Section */
.assignments-overview-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 1.5rem;
}

.assign-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.assign-stat .stat-num {
  font-size: 2rem;
  font-weight: 800;
  color: #2563eb;
}

.assign-stat .stat-lbl {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
}

.assign-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

.assignments-table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.75rem;
}

.assignments-table-card h3 {
  margin: 0 0 1.25rem 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
}

.premium-table th {
  text-align: left;
  padding: 12px;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 700;
  border-bottom: 2px solid #f1f5f9;
}

.premium-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.95rem;
}

.badge-deadline {
  background: #fef3c7;
  color: #b45309;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.btn-view-results {
  background: #eff6ff;
  color: #2563eb;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
}

.modal-body {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.form-group input, .form-group select {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-group input:focus, .form-group select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-footer {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-submit {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-submit:hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .teacher-header-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .banner-actions {
    width: 100%;
  }
  .teacher-nav-tabs {
    flex-direction: column;
  }
}
</style>
