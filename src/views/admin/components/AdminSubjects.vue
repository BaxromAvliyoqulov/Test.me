<template>
  <div class="subjects-panel">
    <div class="toolbar">
      <h3 class="panel-title"><i class="fas fa-book-open"></i> Fanlar va Testlar Boshqaruvi</h3>
      <button class="btn-new" @click="showNewSubjectForm = true"><i class="fas fa-plus"></i> Yangi Fan</button>
    </div>

    <div v-if="loading" class="loading-msg"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>

    <div v-else class="subjects-accordion">
      <div v-for="subject in subjects" :key="subject.id" class="subject-item">
        <div class="subject-header" @click="toggleSubject(subject.id)">
          <div class="subject-left">
            <i class="fas fa-book"></i>
            <span class="subject-name">{{ subject.id }}</span>
            <span class="level-count">{{ (subject.levels || []).length }} daraja</span>
          </div>
          <div class="subject-right">
            <button class="small-btn danger-btn" @click.stop="deleteSubject(subject)"><i class="fas fa-trash"></i></button>
            <i :class="['chevron', openSubjects.includes(subject.id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down']"></i>
          </div>
        </div>

        <div v-if="openSubjects.includes(subject.id)" class="levels-list">
          <div v-for="level in (subject.levels || [])" :key="level.id" class="level-row">
            <div class="level-left">
              <i class="fas fa-layer-group"></i>
              <span class="level-name">{{ level.id }}</span>
              <span class="test-count">{{ level.testCount || 0 }} test</span>
            </div>
            <div class="level-actions">
              <button class="small-btn" @click="viewTests(subject.id, level.id)"><i class="fas fa-eye"></i> Ko'rish</button>
              <button class="small-btn danger-btn" @click="deleteLevel(subject.id, level.id)"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div v-if="!(subject.levels || []).length" class="no-levels">Darajalar yo'q</div>
          <button class="add-level-btn" @click="openAddLevel(subject.id)"><i class="fas fa-plus"></i> Daraja Qo'shish</button>
        </div>
      </div>
      <div v-if="!subjects.length" class="empty-state-panel">
        <i class="fas fa-book-open"></i>
        <p>Fanlar topilmadi. Yuqoridagi "Yangi Fan" tugmasini bosing.</p>
      </div>
    </div>

    <!-- New Subject Modal -->
    <div class="modal-overlay" v-if="showNewSubjectForm" @click.self="showNewSubjectForm = false">
      <div class="modal-card">
        <h3><i class="fas fa-book-open"></i> Yangi Fan Qo'shish</h3>
        <div class="form-group">
          <label>Fan nomi (ID) *</label>
          <input v-model="newSubjectId" placeholder="masalan: English, Math, Physics" />
        </div>
        <div v-if="newSubjectStatus" :class="['status-msg', newSubjectStatus.type]">{{ newSubjectStatus.message }}</div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showNewSubjectForm = false">Bekor</button>
          <button class="btn-confirm" @click="createSubject" :disabled="savingSubject">
            <span v-if="!savingSubject">Qo'shish</span>
            <span v-else class="loader"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Level Modal -->
    <div class="modal-overlay" v-if="addingLevel" @click.self="addingLevel = null">
      <div class="modal-card">
        <h3><i class="fas fa-layer-group"></i> "{{ addingLevel }}" ga Daraja Qo'shish</h3>
        <div class="form-group">
          <label>Daraja nomi *</label>
          <input v-model="newLevelName" placeholder="masalan: Beginner, Intermediate, Advanced" />
        </div>
        <div v-if="newLevelStatus" :class="['status-msg', newLevelStatus.type]">{{ newLevelStatus.message }}</div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="addingLevel = null">Bekor</button>
          <button class="btn-confirm" @click="createLevel" :disabled="savingLevel">
            <span v-if="!savingLevel">Qo'shish</span>
            <span v-else class="loader"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Tests Modal -->
    <div class="modal-overlay wide" v-if="viewingTests" @click.self="viewingTests = null">
      <div class="modal-card wide-card">
        <div class="modal-header">
          <h3><i class="fas fa-list-alt"></i> {{ viewingTests.subjectId }} / {{ viewingTests.levelId }} — Testlar</h3>
          <button class="close-btn" @click="viewingTests = null"><i class="fas fa-times"></i></button>
        </div>
        <div v-if="loadingTests" class="loading-msg"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
        <div v-else class="tests-list">
          <div v-for="(test, i) in viewingTests.tests" :key="test.id" class="test-row">
            <span class="test-num">{{ i + 1 }}</span>
            <div class="test-content">
              <span class="test-question">{{ test.question }}</span>
              <div class="test-options">
                <span v-for="(opt, oi) in test.options" :key="oi" :class="['option', opt === test.answer ? 'correct' : '']">{{ opt }}</span>
              </div>
            </div>
            <button class="action-btn delete-btn" @click="deleteTest(test)"><i class="fas fa-trash"></i></button>
          </div>
          <div v-if="!viewingTests.tests.length" class="empty-mini">Bu darajada testlar yo'q</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

export default {
  name: 'AdminSubjects',
  data() {
    return {
      loading: true,
      loadingTests: false,
      subjects: [],
      openSubjects: [],
      showNewSubjectForm: false,
      newSubjectId: '',
      newSubjectStatus: null,
      savingSubject: false,
      addingLevel: null,
      newLevelName: '',
      newLevelStatus: null,
      savingLevel: false,
      viewingTests: null,
    };
  },
  mounted() { this.loadSubjects(); },
  methods: {
    async loadSubjects() {
      this.loading = true;
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000));
      try {
        const subjectsSnap = await Promise.race([getDocs(collection(db, 'subjects')), timeout]);
        const subjects = [];
        for (const subDoc of subjectsSnap.docs) {
          try {
            const levelsSnap = await getDocs(collection(db, 'subjects', subDoc.id, 'levels'));
            const levels = [];
            for (const lvlDoc of levelsSnap.docs) {
              try {
                const testsSnap = await getDocs(collection(db, 'subjects', subDoc.id, 'levels', lvlDoc.id, 'tests'));
                levels.push({ id: lvlDoc.id, testCount: testsSnap.size });
              } catch { levels.push({ id: lvlDoc.id, testCount: 0 }); }
            }
            subjects.push({ id: subDoc.id, levels });
          } catch { subjects.push({ id: subDoc.id, levels: [] }); }
        }
        this.subjects = subjects;
      } catch(e) { console.error('Subjects load error:', e); this.subjects = []; }
      finally { this.loading = false; }
    },
    toggleSubject(id) {
      if (this.openSubjects.includes(id)) this.openSubjects = this.openSubjects.filter(s => s !== id);
      else this.openSubjects.push(id);
    },
    openAddLevel(subjectId) { this.addingLevel = subjectId; this.newLevelName = ''; this.newLevelStatus = null; },
    async createSubject() {
      if (!this.newSubjectId.trim()) { this.newSubjectStatus = { type: 'error', message: 'Fan nomini kiriting!' }; return; }
      this.savingSubject = true;
      try {
        await setDoc(doc(db, 'subjects', this.newSubjectId.trim()), { createdAt: new Date() });
        this.newSubjectStatus = { type: 'success', message: 'Fan muvaffaqiyatli qo\'shildi!' };
        await this.loadSubjects();
        setTimeout(() => { this.showNewSubjectForm = false; this.newSubjectId = ''; this.newSubjectStatus = null; }, 1000);
      } catch(e) { this.newSubjectStatus = { type: 'error', message: 'Xatolik: ' + e.message }; }
      finally { this.savingSubject = false; }
    },
    async createLevel() {
      if (!this.newLevelName.trim()) { this.newLevelStatus = { type: 'error', message: 'Daraja nomini kiriting!' }; return; }
      this.savingLevel = true;
      try {
        await setDoc(doc(db, 'subjects', this.addingLevel, 'levels', this.newLevelName.trim()), { name: this.newLevelName.trim() });
        this.newLevelStatus = { type: 'success', message: 'Daraja qo\'shildi!' };
        await this.loadSubjects();
        setTimeout(() => { this.addingLevel = null; this.newLevelName = ''; this.newLevelStatus = null; }, 1000);
      } catch(e) { this.newLevelStatus = { type: 'error', message: 'Xatolik: ' + e.message }; }
      finally { this.savingLevel = false; }
    },
    async deleteSubject(subject) {
      if (!confirm(`"${subject.id}" fanini o'chirasizmi? Barcha darajalar va testlar ham o'chadi!`)) return;
      try { await deleteDoc(doc(db, 'subjects', subject.id)); await this.loadSubjects(); }
      catch(e) { alert('Xatolik: ' + e.message); }
    },
    async deleteLevel(subjectId, levelId) {
      if (!confirm(`"${levelId}" darajasini o'chirasizmi?`)) return;
      try { await deleteDoc(doc(db, 'subjects', subjectId, 'levels', levelId)); await this.loadSubjects(); }
      catch(e) { alert('Xatolik: ' + e.message); }
    },
    async viewTests(subjectId, levelId) {
      this.viewingTests = { subjectId, levelId, tests: [] };
      this.loadingTests = true;
      try {
        const snap = await getDocs(collection(db, 'subjects', subjectId, 'levels', levelId, 'tests'));
        this.viewingTests.tests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch(e) { console.error(e); }
      finally { this.loadingTests = false; }
    },
    async deleteTest(test) {
      if (!confirm(`Testni o'chirasizmi?`)) return;
      const { subjectId, levelId } = this.viewingTests;
      try {
        await deleteDoc(doc(db, 'subjects', subjectId, 'levels', levelId, 'tests', test.id));
        this.viewingTests.tests = this.viewingTests.tests.filter(t => t.id !== test.id);
        await this.loadSubjects();
      } catch(e) { alert('Xatolik: ' + e.message); }
    }
  }
}
</script>

<style scoped>
.subjects-panel { display: flex; flex-direction: column; gap: 1.25rem; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.panel-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
.panel-title i { color: #3b82f6; }
.btn-new { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
.btn-new:hover { background: #2563eb; }

.subjects-accordion { display: flex; flex-direction: column; gap: 10px; }
.subject-item { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 2px 10px -5px rgba(0,0,0,0.04); }

.subject-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; cursor: pointer; transition: 0.2s; }
.subject-header:hover { background: #f8fafc; }
.subject-left, .subject-right { display: flex; align-items: center; gap: 12px; }
.subject-left i { color: #3b82f6; font-size: 1.1rem; }
.subject-name { font-weight: 800; color: #0f172a; font-size: 1rem; }
.level-count { background: #eff6ff; color: #2563eb; font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: 99px; }
.chevron { color: #94a3b8; }
.small-btn { background: #f1f5f9; border: none; color: #64748b; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 700; transition: 0.2s; display: flex; align-items: center; gap: 5px; }
.small-btn:hover { background: #e2e8f0; }
.danger-btn { background: #fef2f2; color: #ef4444; }
.danger-btn:hover { background: #ef4444; color: white; }

.levels-list { border-top: 1px solid #f1f5f9; padding: 12px 20px; display: flex; flex-direction: column; gap: 8px; background: #fafbfc; }
.level-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
.level-left { display: flex; align-items: center; gap: 10px; }
.level-left i { color: #8b5cf6; }
.level-name { font-weight: 700; color: #1e293b; }
.test-count { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.level-actions { display: flex; gap: 8px; }
.no-levels { color: #94a3b8; font-size: 0.9rem; text-align: center; padding: 10px; }
.add-level-btn { margin-top: 4px; padding: 8px; border: 2px dashed #e2e8f0; border-radius: 12px; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.add-level-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }

.empty-state-panel { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #94a3b8; gap: 10px; text-align: center; background: white; border-radius: 16px; border: 1px dashed #e2e8f0; }
.empty-state-panel i { font-size: 3rem; color: #e2e8f0; }

.loading-msg { color: #64748b; font-size: 1rem; padding: 2rem; text-align: center; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-overlay.wide { align-items: flex-start; padding-top: 60px; }
.modal-card { background: white; border-radius: 20px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.wide-card { max-width: 750px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.modal-header h3 { margin: 0; font-size: 1.1rem; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.close-btn { background: #f1f5f9; border: none; color: #64748b; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
.modal-card h3 { margin: 0 0 1.25rem; font-size: 1.1rem; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 700; color: #374151; font-size: 0.85rem; margin-bottom: 6px; }
.form-group input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; outline: none; box-sizing: border-box; }
.form-group input:focus { border-color: #3b82f6; }
.status-msg { padding: 10px 14px; border-radius: 10px; font-weight: 600; font-size: 0.85rem; margin-bottom: 1rem; }
.status-msg.success { background: #f0fdf4; color: #16a34a; }
.status-msg.error { background: #fef2f2; color: #dc2626; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-cancel { padding: 10px 20px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; color: #64748b; font-weight: 700; cursor: pointer; }
.btn-confirm { padding: 10px 20px; border: none; border-radius: 12px; background: #3b82f6; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.tests-list { overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px; }
.test-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
.test-num { width: 28px; height: 28px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; flex-shrink: 0; }
.test-content { flex: 1; }
.test-question { font-weight: 700; color: #0f172a; font-size: 0.9rem; display: block; margin-bottom: 6px; }
.test-options { display: flex; flex-wrap: wrap; gap: 6px; }
.option { padding: 3px 10px; border-radius: 8px; background: white; border: 1px solid #e2e8f0; font-size: 0.8rem; color: #64748b; }
.option.correct { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; font-weight: 700; }

.action-btn { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: 0.2s; flex-shrink: 0; }
.delete-btn { background: #fef2f2; color: #ef4444; }
.delete-btn:hover { background: #ef4444; color: white; }
.empty-mini { text-align: center; color: #94a3b8; padding: 2rem; }
</style>
