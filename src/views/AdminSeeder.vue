<template>
  <div class="seeder-container">
    <div class="seeder-header">
      <div class="header-icon">
        <i class="fas fa-robot"></i>
      </div>
      <div>
        <h2>AI Test Generator (Admin)</h2>
        <p>Auto-generate strictly leveled questions via Gemini API.</p>
      </div>
    </div>

    <SeederControls 
      v-model:geminiApiKey="geminiApiKey"
      v-model:subjectId="subjectId"
      v-model:globalTargetCount="globalTargetCount"
      :subjects="subjects"
      :isRunning="isRunning"
      :isPaused="isPaused"
      :levels="levels"
      @start="startSeeding"
      @pause="pauseSeeding"
      @resume="resumeSeeding"
      @stop="stopSeeding"
    />

    <ActivityConsole 
      :activityLogs="activityLogs"
      :isRunning="isRunning"
      :isPaused="isPaused"
    />

    <div v-if="errorMessage" class="error-banner">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>

    <DbStatus 
      :dbStats="dbStats"
      :subjectId="subjectId"
      :isFetchingStats="isFetchingStats"
      @fetch-stats="fetchDbStats"
    />

    <ProgressGrid 
      :levels="levels"
      :isRunning="isRunning"
      @update-level="onLevelUpdate"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/config/firebase';
import { collection, doc, writeBatch, getDocs, getCountFromServer } from 'firebase/firestore';
import { sortLevels } from '@/utils/sorters';

import SeederControls from '@/components/admin/SeederControls.vue';
import ActivityConsole from '@/components/admin/ActivityConsole.vue';
import DbStatus from '@/components/admin/DbStatus.vue';
import ProgressGrid from '@/components/admin/ProgressGrid.vue';

const geminiApiKey = ref(localStorage.getItem('geminiApiKey') || '');
const subjectId = ref(localStorage.getItem('adminSeederSubjectId') || '');
const subjects = ref([]);
const globalTargetCount = ref(parseInt(localStorage.getItem('adminSeederTargetCount')) || 1000);
const isRunning = ref(false);
const isPaused = ref(false);
const shouldStop = ref(false);
const isFetchingStats = ref(false);
const errorMessage = ref('');
const dbStats = ref([]);
const levels = ref([]);
const activityLogs = ref([]);

watch(geminiApiKey, (newKey) => localStorage.setItem('geminiApiKey', newKey));
watch(subjectId, (newVal) => localStorage.setItem('adminSeederSubjectId', newVal || ''));
watch(globalTargetCount, (newVal) => {
  localStorage.setItem('adminSeederTargetCount', newVal || 1000);
  levels.value.forEach(level => level.targetCount = newVal || 1000);
});
watch(subjectId, async (newVal) => {
  if (!newVal) return;
  levels.value = [];
  dbStats.value = [];
  try {
    const subjectRef = doc(db, 'subjects', newVal);
    const levelsCollection = await getDocs(collection(subjectRef, 'levels'));
    const fetchedLevels = levelsCollection.docs.map((doc) => doc.id);
    const sorted = sortLevels(fetchedLevels);
    levels.value = sorted.map(id => ({ id, status: 'pending', current: 0, targetCount: globalTargetCount.value }));
    fetchDbStats();
  } catch (error) {
    console.error('Error fetching levels:', error);
    errorMessage.value = 'Failed to load levels for subject.';
  }
});

const fetchSubjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'subjects'));
    subjects.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    errorMessage.value = 'Failed to load subjects.';
  }
};

onMounted(async () => {
  await fetchSubjects();
  if (subjectId.value && subjects.value.some(s => s.id === subjectId.value)) {
    // Manually trigger the fetch for the initial loaded subject ID
    const subjectRef = doc(db, 'subjects', subjectId.value);
    const levelsCollection = await getDocs(collection(subjectRef, 'levels'));
    const fetchedLevels = levelsCollection.docs.map((doc) => doc.id);
    const sorted = sortLevels(fetchedLevels);
    levels.value = sorted.map(id => ({ id, status: 'pending', current: 0, targetCount: globalTargetCount.value }));
    fetchDbStats();
  } else {
    subjectId.value = '';
  }
});

const onLevelUpdate = ({ id, count }) => {
  const lvl = levels.value.find(l => l.id === id);
  if (lvl) lvl.targetCount = count;
};

const fetchDbStats = async () => {
  if (!subjectId.value || levels.value.length === 0) return;
  isFetchingStats.value = true;
  const stats = [];
  for (let level of levels.value) {
    try {
      const coll = collection(db, 'subjects', subjectId.value, 'levels', level.id, 'tests');
      const snapshot = await getCountFromServer(coll);
      stats.push({ id: level.id, count: snapshot.data().count });
    } catch (err) {
      stats.push({ id: level.id, count: 0 });
    }
  }
  dbStats.value = stats;
  isFetchingStats.value = false;
};

const pauseSeeding = () => { isPaused.value = true; logActivity('Generation Paused by Admin.', 'warn'); };
const resumeSeeding = () => { isPaused.value = false; errorMessage.value = ''; logActivity('Generation Resumed.', 'success'); };
const stopSeeding = () => { shouldStop.value = true; isPaused.value = false; logActivity('Generation manually Stopped.', 'error'); };

const logActivity = (msg, type = 'info') => {
  const time = new Date().toLocaleTimeString([], { hour12: false });
  activityLogs.value.unshift({ id: Date.now() + Math.random(), time, msg, type });
  if (activityLogs.value.length > 50) activityLogs.value.pop();
};

const startSeeding = async () => {
  if (!geminiApiKey.value) { errorMessage.value = "Please enter your Gemini API Key first!"; return; }
  if (!subjectId.value) { errorMessage.value = "Please select a subject!"; return; }

  isRunning.value = true;
  isPaused.value = false;
  shouldStop.value = false;
  errorMessage.value = '';
  activityLogs.value = [];
  
  logActivity(`Session started for ${subjectId.value}.`, 'success');
  
  const genAI = new GoogleGenerativeAI(geminiApiKey.value);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  for (let level of levels.value) {
    if (shouldStop.value) break;
    if (level.current >= level.targetCount) continue;

    level.status = 'generating';
    logActivity(`Fetching existing tests for ${level.id.toUpperCase()} to prevent duplicates...`, 'info');
    const seenQuestions = new Set();
    try {
      const existingDocs = await getDocs(collection(db, 'subjects', subjectId.value, 'levels', level.id, 'tests'));
      existingDocs.forEach(doc => {
        if (doc.data().question) seenQuestions.add(doc.data().question.trim().toLowerCase());
      });
      logActivity(`Loaded ${seenQuestions.size} existing questions for deduplication.`, 'success');
    } catch(e) {
      logActivity(`Warning: Could not fetch existing docs.`, 'warn');
    }
    
    while (level.current < level.targetCount && !shouldStop.value) {
      while (isPaused.value && !shouldStop.value) {
        level.status = 'paused';
        await new Promise(r => setTimeout(r, 1000));
      }
      if (shouldStop.value) break;
      
      level.status = 'generating';
      const batchSize = Math.min(30, level.targetCount - level.current);
      logActivity(`Requesting Gemini for ${batchSize} tests for ${level.id.toUpperCase()}...`, 'info');
      
      const prompt = `Siz professional test tuzuvchisiz. "${subjectId.value}" fani bo'yicha "${level.id.toUpperCase()}" qiyinchilik darajasiga HAQIQIY va QAT'IY mos keladigan ${batchSize} ta test savolini O'zbek tilida tuzing.

QAT'IY TALABLAR:
1. Savollar butunlay yangi bo'lishi va bir-birini umuman takrorlamasligi shart.
2. Qiyinchilik darajasi aynan ${level.id.toUpperCase()} uchun mos bo'lishi shart.
3. Javob qaytarish formati FAQAT JSON massiv bo'lishi shart. Boshqa hech qanday izoh qo'shmang.

Format:
[
  {
    "question": "Savol matni?",
    "options": ["A javob", "B javob", "C javob", "D javob"],
    "correctAnswer": "To'g'ri javob matni (options ichidagi bilan aynan bir xil bo'lishi shart)",
    "explanation": "Qisqacha o'zbek tilida tushuntirish"
  }
]`;

      try {
        const result = await model.generateContent(prompt);
        let jsonString = result.response.text();
        if (jsonString.includes('```json')) jsonString = jsonString.split('```json')[1].split('```')[0].trim();
        else if (jsonString.includes('```')) jsonString = jsonString.split('```')[1].split('```')[0].trim();
        
        const questions = JSON.parse(jsonString);
        if (!Array.isArray(questions) || questions.length === 0) throw new Error("Invalid output format");

        const batch = writeBatch(db);
        const testsRef = collection(db, 'subjects', subjectId.value, 'levels', level.id, 'tests');
        
        let insertedCount = 0;
        let skippedCount = 0;
        
        questions.forEach(q => {
          const normalizedQ = q.question.trim().toLowerCase();
          if (seenQuestions.has(normalizedQ)) { skippedCount++; return; }
          seenQuestions.add(normalizedQ);
          insertedCount++;
          batch.set(doc(testsRef), {
            question: q.question, options: q.options, correctAnswer: q.correctAnswer,
            explanation: q.explanation, createdAt: new Date()
          });
        });

        if (insertedCount > 0) await batch.commit();
        level.current += insertedCount;
        errorMessage.value = ''; 
        
        logActivity(`Success: +${insertedCount} added. ${skippedCount > 0 ? `(Skipped ${skippedCount} duplicates)` : ''}`, 'success');
        
        const statObj = dbStats.value.find(s => s.id === level.id);
        if (statObj) statObj.count += insertedCount;
        
        if (level.current < level.targetCount) {
          logActivity(`Applying 4.5s smart delay to avoid API limits...`, 'info');
          await new Promise(r => setTimeout(r, 4500));
        }
      } catch (err) {
        console.error(`Error generating for ${level.id}:`, err);
        const errMsg = err.message || "";
        if (errMsg.includes('PerDay') || errMsg.includes('GenerateRequestsPerDay')) {
          logActivity(`FATAL: Daily API Limit Reached! Limit is exhausted for today.`, 'error');
          errorMessage.value = `KUNLIK LIMIT TUGADI! Google API ushbu kalit uchun kunlik limitni (Daily Quota) tugatdi. Iltimos, boshqa Google akkauntdan yangi API Key oling yoki ertagacha kuting.`;
          shouldStop.value = true; 
          isRunning.value = false;
          break;
        } else if (errMsg.includes('429') || errMsg.includes('quota')) {
          logActivity(`API Quota reached. Halting for 60 seconds to clear 1-minute limit...`, 'error');
          for (let i = 60; i > 0; i--) {
            if (shouldStop.value) break;
            errorMessage.value = `API Limit (15 requests/min) reached. Waiting ${i} seconds to reset...`;
            await new Promise(r => setTimeout(r, 1000));
          }
          errorMessage.value = `Retrying ${level.id.toUpperCase()} now...`;
          logActivity(`Resuming generation after 60s wait...`, 'info');
        } else if (errMsg.includes('503') || errMsg.includes('high demand')) {
          logActivity(`Google Server busy (503). Retrying in 10 seconds...`, 'warn');
          errorMessage.value = `Google API band (503). 10 soniyadan so'ng qayta urinilmoqda...`;
          for (let i = 10; i > 0; i--) {
            if (shouldStop.value) break;
            await new Promise(r => setTimeout(r, 1000));
          }
        } else {
          logActivity(`Error: ${errMsg}`, 'error');
          errorMessage.value = `Error in ${level.id.toUpperCase()}: ${errMsg}`;
          await new Promise(r => setTimeout(r, 4000));
        }
      }
    }
    if (level.current >= level.targetCount) {
      level.status = 'done';
      logActivity(`Completed all targets for ${level.id.toUpperCase()}!`, 'success');
    }
  }
  isRunning.value = false;
  logActivity('Generation Session Ended.', 'info');
};
</script>
\n<style scoped>
.seeder-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.seeder-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.controls-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr auto;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
@media (max-width: 900px) {
  .controls-card {
    grid-template-columns: 1fr;
  }
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #f87171;
  color: #b91c1c;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

/* Activity Console */
.activity-log-card {
  background: #0f172a;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2);
  color: #e2e8f0;
  font-family: 'Consolas', 'Courier New', monospace;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #334155;
  padding-bottom: 0.75rem;
}

.log-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Outfit', sans-serif;
}

.pulse-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #64748b;
}

.pulse-indicator.active {
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
  animation: logPulse 1.5s infinite;
}

@keyframes logPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.log-window {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding-right: 0.5rem;
}

.log-window::-webkit-scrollbar {
  width: 6px;
}
.log-window::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 4px;
}
.log-window::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.log-item {
  display: flex;
  gap: 0.75rem;
  line-height: 1.4;
}

.log-time {
  color: #64748b;
  flex-shrink: 0;
}

.log-info .log-msg { color: #38bdf8; }
.log-success .log-msg { color: #34d399; }
.log-warn .log-msg { color: #fbbf24; }
.log-error .log-msg { color: #f87171; }

.log-empty {
  color: #64748b;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}

.api-key-group {
  width: 100%;
}

.form-group label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.form-group label i {
  color: #3b82f6;
}

.form-group input, .subject-select {
  padding: 0.85rem 1.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8fafc;
  color: #0f172a;
  font-weight: 500;
}

.form-group input:focus, .subject-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Hide spin buttons for all browsers */
.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinners {
  -moz-appearance: textfield;
}

.start-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 52px;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(16, 185, 129, 0.35);
}

.start-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.pause-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 45px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s;
}

.pause-btn:hover {
  background: #d97706;
}

.resume-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 45px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s;
}

.resume-btn:hover {
  background: #2563eb;
}

.stop-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 45px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s;
}

.stop-btn:hover {
  background: #dc2626;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.level-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1.75rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
}
.level-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.level-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.level-target-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.level-target-input label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.level-target-input label i {
  color: #8b5cf6;
}

.level-target-input input {
  width: 100px;
  padding: 0.6rem 1rem;
  border: 2px solid transparent;
  border-radius: 10px;
  text-align: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: #0f172a;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.level-target-input input:focus {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  outline: none;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.pending { background: #f1f5f9; color: #64748b; }
.status-badge.generating { background: #dbeafe; color: #3b82f6; animation: pulse 2s infinite; }
.status-badge.paused { background: #fefce8; color: #d97706; }
.status-badge.done { background: #dcfce3; color: #10b981; }

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.progress-bar-bg {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
  background-size: 200% 100%;
  border-radius: 6px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: gradientMove 3s infinite linear;
}
@keyframes gradientMove {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

.progress-bar-fill.finished {
  background: #10b981;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.db-status-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 1.75rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e293b;
}

.status-header h3 i {
  color: #8b5cf6;
}

.refresh-btn {
  background: #f1f5f9;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  padding: 1.25rem 1rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-level {
  font-size: 1.5rem;
  z-index: 1;
}

.stat-count {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.9;
  z-index: 1;
  background: rgba(255, 255, 255, 0.6);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.status-red {
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  color: #e11d48;
  border: 1px solid #fecdd3;
  box-shadow: 0 4px 15px rgba(225, 29, 72, 0.1);
}

.status-yellow {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #d97706;
  border: 1px solid #fde68a;
  box-shadow: 0 4px 15px rgba(217, 119, 6, 0.1);
}

.status-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce3 100%);
  color: #16a34a;
  border: 1px solid #bbf7d0;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.1);
}
.empty-stats {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-weight: 500;
  background: rgba(241, 245, 249, 0.5);
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}
</style>
