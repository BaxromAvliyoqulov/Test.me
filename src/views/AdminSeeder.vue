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

    <div class="controls-card">
      <div class="form-group api-key-group">
        <label><i class="fas fa-key"></i> Gemini API Key</label>
        <input v-model="geminiApiKey" type="password" placeholder="Paste your AIza... key here" />
      </div>
      <div class="form-group">
        <label><i class="fas fa-book"></i> Subject ID</label>
        <select v-model="subjectId" @change="onSubjectChange" class="subject-select" :disabled="isRunning || subjects.length === 0">
          <option value="" disabled>Select a subject</option>
          <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.title || sub.id }}</option>
        </select>
      </div>
      <div class="form-group">
        <label><i class="fas fa-bullseye"></i> Target Count (All)</label>
        <input v-model.number="globalTargetCount" type="number" @input="updateAllTargets" class="no-spinners" />
      </div>
      <button 
        @click="startSeeding" 
        class="start-btn" 
        :disabled="isRunning || !subjectId || levels.length === 0"
        v-if="!isRunning"
      >
        <i class="fas fa-play"></i>
        Start Generating Tests
      </button>
      
      <div v-if="isRunning" class="action-buttons">
        <button v-if="!isPaused" @click="pauseSeeding" class="pause-btn">
          <i class="fas fa-pause"></i> Pause
        </button>
        <button v-if="isPaused" @click="resumeSeeding" class="resume-btn">
          <i class="fas fa-play"></i> Resume
        </button>
        <button @click="stopSeeding" class="stop-btn">
          <i class="fas fa-stop"></i> Stop
        </button>
      </div>
    </div>

    <!-- Live Activity Console -->
    <div class="activity-log-card" v-if="isRunning || activityLogs.length > 0">
      <div class="log-header">
        <h3><i class="fas fa-terminal"></i> Live Activity Console</h3>
        <span class="pulse-indicator" :class="{ active: isRunning && !isPaused }"></span>
      </div>
      <div class="log-window">
        <div v-for="log in activityLogs" :key="log.id" :class="['log-item', 'log-' + log.type]">
          <span class="log-time">[{{ log.time }}]</span>
          <span class="log-msg">{{ log.msg }}</span>
        </div>
        <div v-if="activityLogs.length === 0" class="log-empty">Waiting for tasks to begin...</div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-banner">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>

    <div class="db-status-card">
      <div class="status-header">
        <h3><i class="fas fa-database"></i> Database Status <span v-if="subjectId">({{ subjectId }})</span></h3>
        <button @click="fetchDbStats" class="refresh-btn" title="Refresh DB Stats" :disabled="!subjectId">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isFetchingStats }"></i> Refresh
        </button>
      </div>
      <div class="stats-grid" v-if="dbStats.length > 0">
        <div 
          v-for="stat in dbStats" 
          :key="stat.id" 
          class="stat-item" 
          :class="getStatColor(stat.count)"
        >
          <span class="stat-level">{{ stat.id.toUpperCase() }}</span>
          <span class="stat-count">{{ stat.count }} tests</span>
        </div>
      </div>
      <div v-else class="empty-stats">
        Please select a subject to see database status.
      </div>
    </div>

    <div class="progress-grid">
      <div v-for="level in levels" :key="level.id" class="level-card">
        <div class="level-header">
          <h3>{{ level.id.toUpperCase() }}</h3>
          <span class="status-badge" :class="level.status">
            {{ level.status }}
          </span>
        </div>
        
        <div class="level-target-input">
          <label><i class="fas fa-bullseye"></i> Target Tests</label>
          <input v-model.number="level.targetCount" type="number" class="no-spinners" :disabled="isRunning" />
        </div>

        <div class="progress-wrapper">
          <div class="progress-stats">
            <span>{{ level.current }} / {{ level.targetCount }} generated</span>
            <span>{{ Math.round((level.current / Math.max(1, level.targetCount)) * 100) }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div 
              class="progress-bar-fill" 
              :style="{ width: `${Math.min((level.current / Math.max(1, level.targetCount)) * 100, 100)}%` }"
              :class="{ 'finished': level.current >= level.targetCount }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/config/firebase';
import { collection, doc, writeBatch, getDocs, getCountFromServer } from 'firebase/firestore';
import { sortLevels } from '@/utils/sorters';

export default {
  name: 'AdminSeeder',
  data() {
    return {
      geminiApiKey: localStorage.getItem('geminiApiKey') || '',
      subjectId: localStorage.getItem('adminSeederSubjectId') || '',
      subjects: [],
      globalTargetCount: parseInt(localStorage.getItem('adminSeederTargetCount')) || 1000,
      isRunning: false,
      isPaused: false,
      shouldStop: false,
      isFetchingStats: false,
      errorMessage: '',
      dbStats: [],
      levels: [],
      activityLogs: []
    };
  },
  async mounted() {
    await this.fetchSubjects();
  },
  watch: {
    geminiApiKey(newKey) {
      localStorage.setItem('geminiApiKey', newKey);
    },
    subjectId(newVal) {
      localStorage.setItem('adminSeederSubjectId', newVal || '');
    },
    globalTargetCount(newVal) {
      localStorage.setItem('adminSeederTargetCount', newVal || 1000);
    }
  },
  methods: {
    async fetchSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, 'subjects'));
        this.subjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Auto-load previously selected subject if it still exists
        if (this.subjectId && this.subjects.some(s => s.id === this.subjectId)) {
          await this.onSubjectChange();
        } else {
          this.subjectId = '';
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        this.errorMessage = 'Failed to load subjects.';
      }
    },
    async onSubjectChange() {
      if (!this.subjectId) return;
      this.levels = [];
      this.dbStats = [];
      
      try {
        const subjectRef = doc(db, 'subjects', this.subjectId);
        const levelsCollection = await getDocs(collection(subjectRef, 'levels'));
        
        const fetchedLevels = levelsCollection.docs.map((doc) => doc.id);
        const sorted = sortLevels(fetchedLevels);
        
        this.levels = sorted.map(id => ({
          id: id,
          status: 'pending',
          current: 0,
          targetCount: this.globalTargetCount
        }));
        
        this.fetchDbStats();
      } catch (error) {
        console.error('Error fetching levels:', error);
        this.errorMessage = 'Failed to load levels for subject.';
      }
    },
    updateAllTargets() {
      if (!this.globalTargetCount) return;
      this.levels.forEach(level => {
        level.targetCount = this.globalTargetCount;
      });
    },
    getStatColor(count) {
      if (count < 100) return 'status-red';
      if (count < 500) return 'status-yellow';
      return 'status-green';
    },
    async fetchDbStats() {
      if (!this.subjectId || this.levels.length === 0) return;
      
      this.isFetchingStats = true;
      const stats = [];
      for (let level of this.levels) {
        try {
          const coll = collection(db, 'subjects', this.subjectId, 'levels', level.id, 'tests');
          const snapshot = await getCountFromServer(coll);
          stats.push({ id: level.id, count: snapshot.data().count });
        } catch (err) {
          stats.push({ id: level.id, count: 0 });
        }
      }
      this.dbStats = stats;
      this.isFetchingStats = false;
    },
    pauseSeeding() {
      this.isPaused = true;
      this.logActivity('Generation Paused by Admin.', 'warn');
    },
    resumeSeeding() {
      this.isPaused = false;
      this.errorMessage = '';
      this.logActivity('Generation Resumed.', 'success');
    },
    stopSeeding() {
      this.shouldStop = true;
      this.isPaused = false;
      this.logActivity('Generation manually Stopped.', 'error');
    },
    logActivity(msg, type = 'info') {
      const time = new Date().toLocaleTimeString([], { hour12: false });
      this.activityLogs.unshift({ id: Date.now() + Math.random(), time, msg, type });
      if (this.activityLogs.length > 50) {
        this.activityLogs.pop();
      }
    },
    async startSeeding() {
      if (!this.geminiApiKey) {
        this.errorMessage = "Please enter your Gemini API Key first!";
        return;
      }
      if (!this.subjectId) {
        this.errorMessage = "Please select a subject!";
        return;
      }

      this.isRunning = true;
      this.isPaused = false;
      this.shouldStop = false;
      this.errorMessage = '';
      this.activityLogs = [];
      
      this.logActivity(`Session started for ${this.subjectId}.`, 'success');
      
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      for (let level of this.levels) {
        if (this.shouldStop) break;
        if (level.current >= level.targetCount) continue;

        level.status = 'generating';
        
        // 1. Fetch all existing questions for deduplication
        this.logActivity(`Fetching existing tests for ${level.id.toUpperCase()} to prevent duplicates...`, 'info');
        const seenQuestions = new Set();
        try {
          const existingDocs = await getDocs(collection(db, 'subjects', this.subjectId, 'levels', level.id, 'tests'));
          existingDocs.forEach(doc => {
            if (doc.data().question) {
              seenQuestions.add(doc.data().question.trim().toLowerCase());
            }
          });
          this.logActivity(`Loaded ${seenQuestions.size} existing questions for deduplication.`, 'success');
        } catch(e) {
          this.logActivity(`Warning: Could not fetch existing docs.`, 'warn');
          console.warn("Could not fetch existing docs for deduplication:", e);
        }
        
        while (level.current < level.targetCount && !this.shouldStop) {
          
          while (this.isPaused && !this.shouldStop) {
            level.status = 'paused';
            await new Promise(r => setTimeout(r, 1000));
          }
          if (this.shouldStop) break;
          
          level.status = 'generating';
          
          const batchSize = Math.min(30, level.targetCount - level.current);
          
          this.logActivity(`Requesting Gemini for ${batchSize} tests for ${level.id.toUpperCase()}...`, 'info');
          
          const prompt = `You are an expert examiner for the subject: ${this.subjectId}.
Generate exactly ${batchSize} high-quality, strictly leveled multiple-choice questions for proficiency/academic level ${level.id.toUpperCase()}.
Make sure the difficulty is EXACTLY tailored for ${level.id.toUpperCase()}.

Return ONLY a valid JSON array of objects. Do not include markdown \`\`\`json wrappers.
Each object must have this exact structure:
{
  "question": "The question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "The exact string of the correct option",
  "explanation": "Short explanation in Uzbek of why it's correct"
}`;

          try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Clean markdown if AI included it
            let jsonString = responseText;
            if (jsonString.includes('```json')) {
              jsonString = jsonString.split('```json')[1].split('```')[0].trim();
            } else if (jsonString.includes('```')) {
              jsonString = jsonString.split('```')[1].split('```')[0].trim();
            }
            
            const questions = JSON.parse(jsonString);
            
            if (!Array.isArray(questions) || questions.length === 0) {
              throw new Error("Invalid output format");
            }

            // Save to Firestore in a batch
            const batch = writeBatch(db);
            const testsRef = collection(db, 'subjects', this.subjectId, 'levels', level.id, 'tests');
            
            let insertedCount = 0;
            let skippedCount = 0;
            
            questions.forEach(q => {
              const normalizedQ = q.question.trim().toLowerCase();
              if (seenQuestions.has(normalizedQ)) {
                // Deduplication: skip duplicate question
                skippedCount++;
                return;
              }
              
              seenQuestions.add(normalizedQ);
              insertedCount++;
              
              const docRef = doc(testsRef);
              batch.set(docRef, {
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                createdAt: new Date()
              });
            });

            if (insertedCount > 0) {
              await batch.commit();
            }
            
            level.current += insertedCount;
            this.errorMessage = ''; // clear error on success
            
            this.logActivity(`Success: +${insertedCount} added. ${skippedCount > 0 ? `(Skipped ${skippedCount} duplicates)` : ''}`, 'success');
            
            // Update dbStats dynamically
            const statObj = this.dbStats.find(s => s.id === level.id);
            if (statObj) {
              statObj.count += insertedCount;
            }
            
            // Smart Rate Limiting: 60 seconds / 15 requests = 4 seconds per request.
            // By waiting 4.5 seconds here, we naturally throttle ourselves and NEVER hit the limit!
            if (level.current < level.targetCount) {
              this.logActivity(`Applying 4.5s smart delay to avoid API limits...`, 'info');
              await new Promise(r => setTimeout(r, 4500));
            }
            
          } catch (err) {
            console.error(`Error generating for ${level.id}:`, err);
            
            const errMsg = err.message || "";
            if (errMsg.includes('PerDay') || errMsg.includes('GenerateRequestsPerDay')) {
              this.logActivity(`FATAL: Daily API Limit Reached! Limit is exhausted for today.`, 'error');
              this.errorMessage = `KUNLIK LIMIT TUGADI! Google API ushbu kalit uchun kunlik limitni (Daily Quota) tugatdi. Iltimos, boshqa Google akkauntdan yangi API Key oling yoki ertagacha kuting.`;
              this.shouldStop = true; // Stop everything
              this.isRunning = false;
              break;
            } else if (errMsg.includes('429') || errMsg.includes('quota')) {
              this.logActivity(`API Quota reached. Halting for 60 seconds to clear 1-minute limit...`, 'error');
              // Visible countdown so the user doesn't think it's frozen
              for (let i = 60; i > 0; i--) {
                if (this.shouldStop) break;
                this.errorMessage = `API Limit (15 requests/min) reached. Waiting ${i} seconds to reset...`;
                await new Promise(r => setTimeout(r, 1000));
              }
              this.errorMessage = `Retrying ${level.id.toUpperCase()} now...`;
              this.logActivity(`Resuming generation after 60s wait...`, 'info');
            } else if (errMsg.includes('503') || errMsg.includes('high demand')) {
              this.logActivity(`Google Server busy (503). Retrying in 10 seconds...`, 'warn');
              this.errorMessage = `Google API band (503). 10 soniyadan so'ng qayta urinilmoqda...`;
              for (let i = 10; i > 0; i--) {
                if (this.shouldStop) break;
                await new Promise(r => setTimeout(r, 1000));
              }
            } else {
              this.logActivity(`Error: ${errMsg}`, 'error');
              this.errorMessage = `Error in ${level.id.toUpperCase()}: ${errMsg}`;
              await new Promise(r => setTimeout(r, 4000));
            }
          }
        }
        
        if (level.current >= level.targetCount) {
          level.status = 'done';
          this.logActivity(`Completed all targets for ${level.id.toUpperCase()}!`, 'success');
        }
      }
      
      this.isRunning = false;
      this.logActivity('Generation Session Ended.', 'info');
    }
  }
};
</script>

<style scoped>
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
