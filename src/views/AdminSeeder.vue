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
        <input v-model="subjectId" type="text" placeholder="e.g. Ingliz tili" />
      </div>
      <div class="form-group">
        <label><i class="fas fa-bullseye"></i> Target Count</label>
        <input v-model.number="targetCount" type="number" />
      </div>
      <button 
        @click="startSeeding" 
        class="start-btn" 
        :disabled="isRunning"
      >
        <i class="fas" :class="isRunning ? 'fa-spinner fa-spin' : 'fa-play'"></i>
        {{ isRunning ? 'Generation in Progress...' : 'Start Generating 1000 Tests' }}
      </button>
      <button v-if="isRunning" @click="stopSeeding" class="stop-btn">
        <i class="fas fa-stop"></i> Stop
      </button>
    </div>

    <div v-if="errorMessage" class="error-banner">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>

    <div class="db-status-card">
      <div class="status-header">
        <h3><i class="fas fa-database"></i> Database Status ({{ subjectId }})</h3>
        <button @click="fetchDbStats" class="refresh-btn" title="Refresh DB Stats">
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
    </div>

    <div class="progress-grid">
      <div v-for="level in levels" :key="level.id" class="level-card">
        <div class="level-header">
          <h3>{{ level.id.toUpperCase() }}</h3>
          <span class="status-badge" :class="level.status">
            {{ level.status }}
          </span>
        </div>
        <p class="description">{{ level.desc }}</p>
        <div class="progress-wrapper">
          <div class="progress-stats">
            <span>{{ level.current }} / {{ targetCount }} generated</span>
            <span>{{ Math.round((level.current / targetCount) * 100) }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div 
              class="progress-bar-fill" 
              :style="{ width: `${Math.min((level.current / targetCount) * 100, 100)}%` }"
              :class="{ 'finished': level.current >= targetCount }"
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

export default {
  name: 'AdminSeeder',
  data() {
    return {
      geminiApiKey: localStorage.getItem('geminiApiKey') || '',
      subjectId: 'Ingliz tili',
      targetCount: 1000,
      isRunning: false,
      shouldStop: false,
      isFetchingStats: false,
      errorMessage: '',
      dbStats: [],
      levels: [
        { id: 'a1', status: 'pending', current: 0, desc: 'Basic vocab, to be, simple present.' },
        { id: 'a2', status: 'pending', current: 0, desc: 'Past simple, future, comparatives.' },
        { id: 'b1', status: 'pending', current: 0, desc: 'Present perfect, modals, 1st conditional.' },
        { id: 'b2', status: 'pending', current: 0, desc: 'Passives, 2nd/3rd conditionals.' },
        { id: 'c1', status: 'pending', current: 0, desc: 'Complex clauses, idioms, nuance.' },
        { id: 'c2', status: 'pending', current: 0, desc: 'Native-like idioms, literary terms.' },
      ]
    };
  },
  mounted() {
    this.fetchDbStats();
  },
  watch: {
    subjectId() {
      this.fetchDbStats();
    },
    geminiApiKey(newKey) {
      localStorage.setItem('geminiApiKey', newKey);
    }
  },
  methods: {
    getStatColor(count) {
      if (count < 100) return 'status-red';
      if (count < 500) return 'status-yellow';
      return 'status-green';
    },
    async fetchDbStats() {
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
    stopSeeding() {
      this.shouldStop = true;
    },
    async startSeeding() {
      if (!this.geminiApiKey) {
        this.errorMessage = "Please enter your Gemini API Key first!";
        return;
      }

      this.isRunning = true;
      this.shouldStop = false;
      this.errorMessage = '';
      
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      for (let level of this.levels) {
        if (this.shouldStop) break;
        if (level.current >= this.targetCount) continue;

        level.status = 'generating';
        
        while (level.current < this.targetCount && !this.shouldStop) {
          const batchSize = Math.min(30, this.targetCount - level.current);
          
          const prompt = `You are an expert Cambridge English examiner. 
Generate exactly ${batchSize} high-quality, strictly leveled multiple-choice questions for English proficiency level ${level.id.toUpperCase()}.
Level guidelines: ${level.desc}
Make sure the difficulty is EXACTLY tailored for ${level.id.toUpperCase()}.
A1 must be extremely easy ("I am a boy"). C2 must be extremely hard.

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
            
            questions.forEach(q => {
              const docRef = doc(testsRef);
              batch.set(docRef, {
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                createdAt: new Date()
              });
            });

            await batch.commit();
            
            level.current += questions.length;
            this.errorMessage = ''; // clear error on success
            
            // Update dbStats dynamically
            const statObj = this.dbStats.find(s => s.id === level.id);
            if (statObj) {
              statObj.count += questions.length;
            }
            
          } catch (err) {
            console.error(`Error generating for ${level.id}:`, err);
            this.errorMessage = `Error in ${level.id.toUpperCase()}: ${err.message}`;
            // Wait a bit before retrying on error
            await new Promise(r => setTimeout(r, 4000));
          }
        }
        
        if (level.current >= this.targetCount) {
          level.status = 'done';
        }
      }
      
      this.isRunning = false;
    }
  }
};
</script>

<style scoped>
.seeder-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Outfit', sans-serif;
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
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 150px;
}

.api-key-group {
  flex: 2;
  min-width: 250px;
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

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.start-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  height: 45px;
  white-space: nowrap;
  flex-shrink: 0;
}

.start-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.start-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
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
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.level-card {
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.level-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
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
.status-badge.done { background: #dcfce3; color: #10b981; }

.description {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.progress-bar-bg {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
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
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
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

.refresh-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
}

.stat-level {
  font-size: 1.25rem;
}

.stat-count {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.9;
}

.status-red {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.status-yellow {
  background: #fefce8;
  color: #eab308;
  border: 1px solid #fef08a;
}

.status-green {
  background: #f0fdf4;
  color: #22c55e;
  border: 1px solid #bbf7d0;
}
</style>
