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
      <div class="form-group">
        <label>Subject ID</label>
        <input v-model="subjectId" type="text" placeholder="e.g. Ingliz tili" />
      </div>
      <div class="form-group">
        <label>Target Count per Level</label>
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
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

export default {
  name: 'AdminSeeder',
  data() {
    return {
      subjectId: 'Ingliz tili',
      targetCount: 1000,
      isRunning: false,
      shouldStop: false,
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
  methods: {
    stopSeeding() {
      this.shouldStop = true;
    },
    async startSeeding() {
      this.isRunning = true;
      this.shouldStop = false;
      
      const GEMINI_API_KEY = "AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g";
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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
            
          } catch (err) {
            console.error(`Error generating for ${level.id}:`, err);
            // Wait a bit before retrying on error
            await new Promise(r => setTimeout(r, 2000));
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
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.form-group label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
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
</style>
