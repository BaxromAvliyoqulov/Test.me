<template>
  <div class="subjects-panel">
    <div class="toolbar">
      <div class="toolbar-left">
        <h3 class="panel-title"><i class="fas fa-layer-group text-primary"></i> Fanlar va Testlar</h3>
        <p class="panel-subtitle">Ta'lim yo'nalishlari va ularning qiyinlik darajalarini boshqaring</p>
      </div>
      <button class="btn-new" @click="showNewSubjectForm = true">
        <i class="fas fa-plus"></i> Yangi Fan
      </button>
    </div>

    <!-- Loading State for Subjects (Skeleton) -->
    <div v-if="loading && subjects.length === 0" class="subjects-grid">
      <div v-for="i in 8" :key="i" class="subject-card">
        <div class="subject-card-header">
          <div class="subject-icon-box skeleton-box"></div>
          <div class="subject-info skeleton-info">
             <div class="skeleton-line skeleton-w75"></div>
             <div class="skeleton-line skeleton-w40"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subjects Grid -->
    <div v-else class="subjects-grid">
      <div v-for="subject in subjects" :key="subject.id" :class="['subject-card', { 'is-open': openSubjects.includes(subject.id) }]">
        
        <!-- Card Header (Always Visible) -->
        <div class="subject-card-header" @click="toggleSubject(subject)" @mouseenter="prefetchSubject(subject)">
          <div class="subject-icon-box">
            <i class="fas fa-book"></i>
          </div>
          <div class="subject-info">
            <h4>{{ subject.id }}</h4>
            <div class="subject-badges" v-if="subject.levelsLoaded">
              <span class="badge-blue">{{ subject.levels.length }} ta daraja</span>
              <span class="badge-purple">{{ getTotalTests(subject) }} ta test</span>
            </div>
          </div>
          
          <div class="subject-actions">
            <button class="icon-btn btn-trash" @click.stop="deleteSubject(subject)" title="Fanni o'chirish">
              <i class="fas fa-trash"></i>
            </button>
            <button class="icon-btn btn-expand">
              <i :class="['fas', openSubjects.includes(subject.id) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
            </button>
          </div>
        </div>

        <!-- Card Body (Visible when Expanded) -->
        <div v-if="openSubjects.includes(subject.id)" class="subject-card-body fade-in">
          
          <div v-if="subject.loadingLevels" class="mini-loader">
            <i class="fas fa-circle-notch fa-spin"></i> Darajalar tekshirilmoqda...
          </div>
          
          <div v-else>
            <div class="levels-container" v-if="subject.levels && subject.levels.length > 0">
              <div v-for="level in subject.levels" :key="level.id" class="level-item">
                <div class="level-details">
                  <strong>{{ level.id }}</strong>
                  <span class="test-count-badge">{{ level.testCount || 0 }} ta test</span>
                </div>
                <div class="level-actions">
                  <button class="btn-sm btn-view" @click="viewTests(subject.id, level.id)"><i class="fas fa-list"></i> Ko'rish</button>
                  <button class="btn-sm btn-clear" @click="clearTests(subject.id, level.id)" title="Tozalash"><i class="fas fa-broom"></i></button>
                  <button class="btn-sm btn-delete" @click="deleteLevel(subject.id, level.id)"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-levels">
              <i class="fas fa-ghost"></i> Hali darajalar qo'shilmagan
            </div>
            
            <button class="btn-add-level" @click="openAddLevel(subject.id)">
              <i class="fas fa-plus-circle"></i> Yangi Daraja
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="subjects.length === 0" class="empty-state-full">
        <div class="empty-icon-wrap"><i class="fas fa-folder-open"></i></div>
        <h3>Tizimda fanlar yo'q</h3>
        <p>Hozircha hech qanday fan bazaga kiritilmagan. Birinchisini yarating!</p>
        <button class="btn-new mt-3" @click="showNewSubjectForm = true"><i class="fas fa-plus"></i> Fan Qo'shish</button>
      </div>
    </div>

    <!-- Modals -->
    <!-- New Subject Modal -->
    <div class="modal-overlay" v-if="showNewSubjectForm" @click.self="showNewSubjectForm = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3><i class="fas fa-book-open text-primary"></i> Yangi Fan Qo'shish</h3>
          <button class="close-btn" @click="showNewSubjectForm = false"><i class="fas fa-times"></i></button>
        </div>
        <p class="modal-subtitle">Fanga aniq nom bering (inglizcha yoki lotincha bo'lgani ma'qul).</p>
        
        <div class="form-group">
          <label>Fan nomi (Masalan: Matematika, English)</label>
          <input v-model="newSubjectId" placeholder="Matematika" autofocus />
        </div>
        
        <div class="modal-actions">
          <button class="btn-cancel" @click="showNewSubjectForm = false">Bekor qilish</button>
          <button class="btn-submit" @click="createSubject" :disabled="savingSubject">
            <span v-if="!savingSubject">Saqlash</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Level Modal -->
    <div class="modal-overlay" v-if="addingLevel" @click.self="addingLevel = null">
      <div class="modal-card">
        <div class="modal-header">
          <h3><i class="fas fa-layer-group text-primary"></i> Daraja Qo'shish</h3>
          <button class="close-btn" @click="addingLevel = null"><i class="fas fa-times"></i></button>
        </div>
        <p class="modal-subtitle"><strong>{{ addingLevel }}</strong> fani uchun qiyinlik darajasi yaratyapsiz.</p>
        
        <div class="form-group">
          <label>Daraja nomi (Masalan: Beginner, Hard, 5-sinf)</label>
          <input v-model="newLevelName" placeholder="Beginner" />
        </div>
        
        <div class="modal-actions">
          <button class="btn-cancel" @click="addingLevel = null">Bekor qilish</button>
          <button class="btn-submit" @click="createLevel" :disabled="savingLevel">
            <span v-if="!savingLevel">Qo'shish</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- View Tests Modal -->
    <div class="modal-overlay wide" v-if="viewingTests" @click.self="viewingTests = null">
      <div class="modal-card wide-card">
        <div class="modal-header">
          <h3>
            <span class="badge-blue">{{ viewingTests.subjectId }}</span> 
            <i class="fas fa-angle-right mx-2 text-gray"></i> 
            <span class="badge-purple">{{ viewingTests.levelId }}</span>
            <span class="tests-count-header">({{ viewingTests.tests.length }} test)</span>
          </h3>
          <button class="close-btn" @click="viewingTests = null"><i class="fas fa-times"></i></button>
        </div>
        
        <div v-if="loadingTests" class="loading-state-mini">
          <i class="fas fa-spinner fa-spin"></i> Testlar yuklanmoqda...
        </div>
        
        <div v-else class="tests-list">
          <div v-for="(test, i) in viewingTests.tests" :key="test.id" class="test-row">
            <div class="test-num">{{ i + 1 }}</div>
            <div class="test-content">
              <strong class="test-q">{{ test.question }}</strong>
              <div class="test-opts">
                <span v-for="(opt, oi) in test.options" :key="oi" :class="['opt-chip', opt === test.answer ? 'is-correct' : '']">
                  <i v-if="opt === test.answer" class="fas fa-check-circle"></i> {{ opt }}
                </span>
              </div>
            </div>
            <button class="icon-btn btn-trash ml-auto" @click="deleteTest(test)" title="O'chirish">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <div v-if="viewingTests.tests.length === 0" class="empty-tests">
            <i class="fas fa-box-open"></i>
            <p>Bu darajaga hali testlar yuklanmagan.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, getCountFromServer } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import { confirmDelete } from '@/utils/sweetalert';
import { sortLevels } from '@/utils/sorters';

const toast = useToast();

const loading = ref(true);
const subjects = ref([]);
const openSubjects = ref([]);

const showNewSubjectForm = ref(false);
const newSubjectId = ref('');
const savingSubject = ref(false);

const addingLevel = ref(null);
const newLevelName = ref('');
const savingLevel = ref(false);

const viewingTests = ref(null);
const loadingTests = ref(false);

const getTotalTests = (subject) => {
  if (!subject.levels) return 0;
  return subject.levels.reduce((sum, lvl) => sum + (lvl.testCount || 0), 0);
};

const loadSubjects = async () => {
  const cached = localStorage.getItem('admin_subjects_cache');
  if (cached) {
    try {
      subjects.value = JSON.parse(cached);
      loading.value = false;
    } catch(e) { console.error(e); }
  } else {
    loading.value = true;
  }
  
  try {
    const snap = await getDocs(collection(db, 'subjects'));
    
    const promises = snap.docs.map(async (docSnap) => {
      const subject = { id: docSnap.id, levels: [], levelsLoaded: false, loadingLevels: true };
      try {
         const levelsSnap = await getDocs(collection(db, 'subjects', docSnap.id, 'levels'));
         const levels = [];
         for (const lvlDoc of levelsSnap.docs) {
           const countSnap = await getCountFromServer(collection(db, 'subjects', docSnap.id, 'levels', lvlDoc.id, 'tests'));
           levels.push({ id: lvlDoc.id, testCount: countSnap.data().count });
         }
         subject.levels = sortLevels(levels);
         subject.levelsLoaded = true;
      } catch(e) {
         console.error("Failed to load levels for", docSnap.id);
      } finally {
         subject.loadingLevels = false;
      }
      return subject;
    });

    subjects.value = await Promise.all(promises);
    localStorage.setItem('admin_subjects_cache', JSON.stringify(subjects.value));
  } catch(e) { 
    toast.error('Fanlarni yuklashda xatolik: ' + e.message); 
  } finally { 
    loading.value = false; 
  }
};

const prefetchSubject = (subject) => {
  if (!subject.levelsLoaded && !subject.loadingLevels) {
    subject.loadingLevels = true;
    getDocs(collection(db, 'subjects', subject.id, 'levels')).then(async (levelsSnap) => {
      const levels = [];
      for (const lvlDoc of levelsSnap.docs) {
        const countSnap = await getCountFromServer(collection(db, 'subjects', subject.id, 'levels', lvlDoc.id, 'tests'));
        levels.push({ id: lvlDoc.id, testCount: countSnap.data().count });
      }
      subject.levels = sortLevels(levels);
      subject.levelsLoaded = true;
    }).catch(e => {
      console.warn('Prefetch failed:', e);
    }).finally(() => {
      subject.loadingLevels = false;
    });
  }
};

const toggleSubject = async (subject) => {
  const isOpen = openSubjects.value.includes(subject.id);
  
  if (isOpen) {
    openSubjects.value = openSubjects.value.filter(id => id !== subject.id);
  } else {
    openSubjects.value.push(subject.id);
    
    if (!subject.levelsLoaded && !subject.loadingLevels) {
      subject.loadingLevels = true;
      try {
        const levelsSnap = await getDocs(collection(db, 'subjects', subject.id, 'levels'));
        const levels = [];
        for (const lvlDoc of levelsSnap.docs) {
          const countSnap = await getCountFromServer(collection(db, 'subjects', subject.id, 'levels', lvlDoc.id, 'tests'));
          levels.push({ id: lvlDoc.id, testCount: countSnap.data().count });
        }
        subject.levels = sortLevels(levels);
        subject.levelsLoaded = true;
      } catch (e) {
        toast.error(`Darajalarni yuklashda xatolik: ${e.message}`);
      } finally {
        subject.loadingLevels = false;
      }
    }
  }
};

const createSubject = async () => {
  if (!newSubjectId.value.trim()) { 
    toast.warning('Fan nomini kiriting!'); 
    return; 
  }
  savingSubject.value = true;
  try {
    const subId = newSubjectId.value.trim();
    await setDoc(doc(db, 'subjects', subId), { createdAt: new Date() });
    toast.success(`"${subId}" fani muvaffaqiyatli qo'shildi!`);
    
    if (!subjects.value.find(s => s.id === subId)) {
      subjects.value.push({ id: subId, levels: [], levelsLoaded: true, loadingLevels: false });
    }
    
    showNewSubjectForm.value = false;
    newSubjectId.value = '';
  } catch(e) { 
    toast.error('Xatolik: ' + e.message); 
  } finally { 
    savingSubject.value = false; 
  }
};

const openAddLevel = (subjectId) => { 
  addingLevel.value = subjectId; 
  newLevelName.value = ''; 
};

const createLevel = async () => {
  if (!newLevelName.value.trim()) { 
    toast.warning('Daraja nomini kiriting!'); 
    return; 
  }
  savingLevel.value = true;
  try {
    const lvlName = newLevelName.value.trim();
    await setDoc(doc(db, 'subjects', addingLevel.value, 'levels', lvlName), { name: lvlName });
    toast.success('Yangi daraja yaratildi!');
    
    const subject = subjects.value.find(s => s.id === addingLevel.value);
    if (subject) {
      subject.levels.push({ id: lvlName, testCount: 0 });
      if(!subject.levelsLoaded) subject.levelsLoaded = true;
    }
    
    addingLevel.value = null;
    newLevelName.value = '';
  } catch(e) { 
    toast.error('Xatolik: ' + e.message); 
  } finally { 
    savingLevel.value = false; 
  }
};

const deleteSubject = async (subject) => {
  if (!(await confirmDelete(
    'Fanni o\'chirish', 
    `DIQQAT: "${subject.id}" fanini butunlay o'chirasizmi? Barcha testlar yo'qoladi!`
  ))) return;
  try { 
    await deleteDoc(doc(db, 'subjects', subject.id)); 
    subjects.value = subjects.value.filter(s => s.id !== subject.id);
    toast.info(`Fanni tizimdan o'chirdingiz.`);
  } catch(e) { 
    toast.error('Xatolik: ' + e.message); 
  }
};

const deleteLevel = async (subjectId, levelId) => {
  if (!(await confirmDelete(
    'Darajani o\'chirish',
    `"${levelId}" darajasini o'chirasizmi?`
  ))) return;
  try { 
    await deleteDoc(doc(db, 'subjects', subjectId, 'levels', levelId)); 
    
    const subject = subjects.value.find(s => s.id === subjectId);
    if (subject) {
      subject.levels = subject.levels.filter(l => l.id !== levelId);
    }
    toast.info(`Daraja o'chirildi.`);
  } catch(e) { 
    toast.error('Xatolik: ' + e.message); 
  }
};

const clearTests = async (subjectId, levelId) => {
  if (!(await confirmDelete(
    'Darajani Tozalash',
    `DIQQAT: "${levelId}" darajasidagi barcha testlar o'chib ketadi! Buni qaytarib bo'lmaydi. Davom etamizmi?`
  ))) return;
  try {
    const testsRef = collection(db, 'subjects', subjectId, 'levels', levelId, 'tests');
    const snap = await getDocs(testsRef);
    if (snap.empty) {
       toast.info("Bu darajada testlar yo'q!");
       return;
    }
    toast.info("Testlar tozalanmoqda, kuting...");
    
    let batch = writeBatch(db);
    let count = 0;
    for (const docSnap of snap.docs) {
       batch.delete(docSnap.ref);
       count++;
       if (count % 400 === 0) {
          await batch.commit();
          batch = writeBatch(db);
       }
    }
    if (count % 400 !== 0) {
       await batch.commit();
    }
    
    const subject = subjects.value.find(s => s.id === subjectId);
    if(subject) {
      const lvl = subject.levels.find(l => l.id === levelId);
      if(lvl) lvl.testCount = 0;
    }
    toast.success(`${count} ta test muvaffaqiyatli tozalandi!`);
  } catch(e) {
    toast.error('Xatolik: ' + e.message);
  }
};

const viewTests = async (subjectId, levelId) => {
  viewingTests.value = { subjectId, levelId, tests: [] };
  loadingTests.value = true;
  try {
    const snap = await getDocs(collection(db, 'subjects', subjectId, 'levels', levelId, 'tests'));
    viewingTests.value.tests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { 
    toast.error('Testlarni yuklashda xatolik yuz berdi.'); 
  } finally { 
    loadingTests.value = false; 
  }
};

const deleteTest = async (test) => {
  if (!(await confirmDelete(
    'Testni o\'chirish',
    `Ushbu test savolini bazadan butunlay o'chirib yuborasizmi?`
  ))) return;
  const { subjectId, levelId } = viewingTests.value;
  try {
    await deleteDoc(doc(db, 'subjects', subjectId, 'levels', levelId, 'tests', test.id));
    viewingTests.value.tests = viewingTests.value.tests.filter(t => t.id !== test.id);
    
    const subject = subjects.value.find(s => s.id === subjectId);
    if(subject) {
      const lvl = subject.levels.find(l => l.id === levelId);
      if(lvl) lvl.testCount = Math.max(0, (lvl.testCount || 1) - 1);
    }
    
    toast.success(`Test o'chirildi.`);
  } catch(e) { 
    toast.error('Xatolik: ' + e.message); 
  }
};

onMounted(() => {
  loadSubjects();
});
</script>

<style scoped>
.subjects-panel { display: flex; flex-direction: column; gap: 1.5rem; }

/* Toolbar */
.toolbar { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1.5rem; border-radius: 20px; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; flex-wrap: wrap; gap: 15px; }
.toolbar-left { display: flex; flex-direction: column; gap: 4px; }
.panel-title { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
.text-primary { color: #3b82f6; }
.panel-subtitle { margin: 0; color: #64748b; font-size: 0.95rem; }

.btn-new { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.4); transition: 0.2s; }
.btn-new:hover { transform: translateY(-2px); box-shadow: 0 12px 20px -4px rgba(59, 130, 246, 0.5); }
.mt-3 { margin-top: 1rem; }

/* Loading & Empty */
.loading-state { text-align: center; padding: 4rem; color: #64748b; }
.loading-state i { font-size: 2.5rem; margin-bottom: 1rem; color: #cbd5e1; }
.empty-state-full { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; background: white; border-radius: 24px; border: 2px dashed #e2e8f0; text-align: center; }
.empty-icon-wrap { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: #94a3b8; margin-bottom: 1.5rem; }
.empty-state-full h3 { font-size: 1.3rem; color: #0f172a; margin: 0 0 8px; font-weight: 800; }
.empty-state-full p { color: #64748b; max-width: 400px; margin: 0; }

/* Grid Cards & Skeletons */
.subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.25rem; align-items: start; }

.skeleton-box { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skeleton-info { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.skeleton-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skeleton-w75 { width: 75%; height: 16px; }
.skeleton-w40 { width: 40%; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.subject-card { background: white; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.subject-card:hover { border-color: #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06); transform: translateY(-2px); }
.subject-card.is-open { border-color: #bfdbfe; box-shadow: 0 15px 35px rgba(59, 130, 246, 0.08); }

.subject-card-header { display: flex; align-items: center; padding: 1.25rem; cursor: pointer; user-select: none; }
.subject-icon-box { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; margin-right: 1rem; }
.subject-info { flex: 1; min-width: 0; }
.subject-info h4 { margin: 0 0 4px; font-size: 1.1rem; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.subject-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.badge-blue { background: #eff6ff; color: #2563eb; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; display: inline-block; }
.badge-purple { background: #f5f3ff; color: #7c3aed; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; display: inline-block; }

.subject-actions { display: flex; gap: 6px; }
.icon-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: 0.2s; background: #f8fafc; color: #64748b; }
.icon-btn:hover { background: #e2e8f0; color: #0f172a; }
.btn-trash:hover { background: #fee2e2; color: #dc2626; }
.btn-expand { background: transparent; }
.is-open .btn-expand { color: #3b82f6; transform: rotate(180deg); }

/* Card Body */
.subject-card-body { border-top: 1px dashed #e2e8f0; padding: 1.25rem; background: #fafbfc; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

.mini-loader { text-align: center; color: #64748b; font-size: 0.9rem; font-weight: 600; padding: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; }

.levels-container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem; }
.level-item { display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; transition: 0.2s; }
.level-item:hover { border-color: #cbd5e1; }
.level-details { display: flex; flex-direction: column; gap: 2px; }
.level-details strong { color: #1e293b; font-size: 0.95rem; }
.test-count-badge { font-size: 0.75rem; color: #64748b; font-weight: 600; }

.level-actions { display: flex; gap: 6px; }
.btn-sm { padding: 6px 10px; border-radius: 8px; border: none; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 4px; }
.btn-view { background: #eff6ff; color: #2563eb; } .btn-view:hover { background: #dbeafe; }
.btn-clear { background: #fffbeb; color: #d97706; } .btn-clear:hover { background: #fef3c7; }
.btn-delete { background: #fef2f2; color: #dc2626; } .btn-delete:hover { background: #fee2e2; }

.empty-levels { text-align: center; color: #94a3b8; padding: 1.5rem 1rem; font-size: 0.9rem; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.empty-levels i { font-size: 1.5rem; color: #cbd5e1; }

.btn-add-level { width: 100%; padding: 10px; background: transparent; border: 2px dashed #cbd5e1; color: #64748b; font-weight: 700; border-radius: 12px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px; }
.btn-add-level:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-overlay.wide { align-items: flex-start; padding-top: 4vh; }
.modal-card { background: white; border-radius: 24px; padding: 2rem; width: 100%; max-width: 440px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.wide-card { max-width: 800px; height: 90vh; display: flex; flex-direction: column; }

.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; }
.modal-subtitle { color: #64748b; font-size: 0.95rem; margin: 0 0 1.5rem 0; line-height: 1.5; }
.close-btn { background: #f1f5f9; border: none; color: #64748b; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.close-btn:hover { background: #e2e8f0; color: #0f172a; }

.form-group label { display: block; font-weight: 700; color: #334155; margin-bottom: 8px; font-size: 0.9rem; }
.form-group input { width: 100%; padding: 14px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; font-weight: 500; outline: none; box-sizing: border-box; transition: 0.2s; }
.form-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 2rem; }
.btn-cancel { padding: 12px 20px; border: none; border-radius: 12px; background: #f1f5f9; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-cancel:hover { background: #e2e8f0; color: #0f172a; }
.btn-submit { padding: 12px 24px; border: none; border-radius: 12px; background: #3b82f6; color: white; font-weight: 700; cursor: pointer; min-width: 120px; transition: 0.2s; }
.btn-submit:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3); }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

/* Tests List View */
.text-gray { color: #cbd5e1; }
.mx-2 { margin: 0 8px; }
.tests-count-header { font-size: 0.9rem; color: #64748b; font-weight: 600; margin-left: auto; }

.loading-state-mini { text-align: center; color: #64748b; padding: 4rem; font-size: 1.1rem; }
.tests-list { flex: 1; overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column; gap: 12px; margin-top: 1rem; }
.tests-list::-webkit-scrollbar { width: 6px; }
.tests-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.test-row { display: flex; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; transition: 0.2s; }
.test-row:hover { border-color: #cbd5e1; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.test-num { width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
.test-content { flex: 1; }
.test-q { display: block; font-size: 1rem; color: #0f172a; margin-bottom: 12px; line-height: 1.5; }
.test-opts { display: flex; flex-wrap: wrap; gap: 8px; }
.opt-chip { padding: 6px 12px; border-radius: 8px; background: white; border: 1px solid #e2e8f0; font-size: 0.85rem; color: #475569; font-weight: 500; }
.opt-chip.is-correct { background: #f0fdf4; border-color: #10b981; color: #059669; font-weight: 700; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1); }

.ml-auto { margin-left: auto; }
.empty-tests { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #94a3b8; padding: 4rem 2rem; }
.empty-tests i { font-size: 3rem; color: #e2e8f0; }
</style>
