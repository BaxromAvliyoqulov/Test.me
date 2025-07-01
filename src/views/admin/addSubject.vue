<template>
  <div class="subject-container">
    <h3>Add Subject Tests</h3>
    <form @submit.prevent="addTests" class="form">
      <div class="form-group">
        <label>Select Subject</label>
        <select 
          v-model="selectedSubject" 
          @change="fetchLevels"
          :disabled="loading || loadingSubjects"
        >
          <option disabled value="">Choose a subject</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject">
            {{ subject.id }}
          </option>
        </select>
        <div v-if="loadingSubjects" class="loading-indicator">Loading subjects...</div>
      </div>

      <div class="form-group">
        <label>Select Level</label>
        <select 
          v-model="selectedLevel"
          :disabled="loading || !selectedSubject || loadingLevels"
        >
          <option disabled value="">Choose a level</option>
          <option v-for="level in levels" :key="level" :value="level">
            {{ level }}
          </option>
        </select>
        <div v-if="loadingLevels" class="loading-indicator">Loading levels...</div>
      </div>

      <div class="form-group">
        <label>Upload Test File (JSON)</label>
        <input
          type="file"
          @change="handleFileUpload"
          accept="application/json"
          :disabled="loading"
        />
        <small class="info-text">
          JSON formatida: [ { "question": "Savol", "options": ["Variant 1", "Variant 2", "Variant 3", "Variant 4"], "answer": "To'g'ri javob" } ]
        </small>
      </div>

      <button type="submit" class="btn" :disabled="!canSubmit">
        <span v-if="!loading">Add Tests</span>
        <span v-else class="loader"></span>
      </button>
    </form>

    <div v-if="status" :class="['status', status.type]" @click="clearStatus">
      {{ status.message }}
    </div>
  </div>
</template>

<script>
import { db } from "../../config/firebase";
import { collection, doc, setDoc, addDoc, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      selectedSubject: "",
      selectedLevel: "",
      subjects: [],
      levels: [],
      file: null,
      loading: false,
      loadingSubjects: false,
      loadingLevels: false,
      status: null,
    };
  },
  computed: {
    canSubmit() {
      return this.selectedSubject && 
             this.selectedLevel && 
             this.file && 
             !this.loading && 
             !this.loadingSubjects && 
             !this.loadingLevels;
    }
  },
  methods: {
    async fetchSubjects() {
      this.loadingSubjects = true;
      this.status = null;
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        this.subjects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (this.subjects.length === 0) {
          this.status = {
            type: "info",
            message: "⚠️ No subjects found. Please add a subject first."
          };
        }
      } catch (error) {
        console.error("❌ Error fetching subjects:", error);
        this.status = { 
          type: "error", 
          message: `❌ Error fetching subjects: ${error.message}` 
        };
      } finally {
        this.loadingSubjects = false;
      }
    },
    async fetchLevels() {
      if (!this.selectedSubject) return;
      
      this.loadingLevels = true;
      this.selectedLevel = "";
      this.levels = [];
      this.status = null;
      
      try {
        const subjectRef = doc(db, "subjects", this.selectedSubject.id);
        const levelsCollection = await getDocs(collection(subjectRef, "levels"));
        
        this.levels = levelsCollection.docs.map(doc => doc.id);
        
        if (this.levels.length === 0) {
          this.status = {
            type: "info",
            message: "⚠️ No levels found for this subject. Creating a new level will be required."
          };
        }
      } catch (error) {
        console.error("❌ Error fetching levels:", error);
        this.status = { 
          type: "error", 
          message: `❌ Error fetching levels: ${error.message}` 
        };
      } finally {
        this.loadingLevels = false;
      }
    },
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.status = null;
    },
    clearStatus() {
      this.status = null;
    },
    async addTests() {
      if (!this.canSubmit) return;
      
      this.loading = true;
      this.status = null;
      
      try {
        // Fan referensini olish
        const subjectRef = doc(db, "subjects", this.selectedSubject.id);
        
        // Level referensini olish
        const levelRef = doc(subjectRef, "levels", this.selectedLevel);
        
        // Level dokumentini yaratish yoki yangilash
        await setDoc(levelRef, { name: this.selectedLevel }, { merge: true });
        
        if (this.file) {
          const reader = new FileReader();
          
          reader.onload = async (e) => {
            try {
              const parsedData = JSON.parse(e.target.result);
              
              // JSON ma'lumotlarini tekshirish
              if (!Array.isArray(parsedData)) {
                throw new Error("JSON massiv bo'lishi kerak!");
              }
              
              // Har bir test strukturasini tekshirish
              if (!parsedData.every(item => 
                item.question && 
                Array.isArray(item.options) && 
                item.options.length === 4 && 
                item.answer)) {
                throw new Error(
                  "Har bir test obyektida 'question', 4 ta element bo'lgan 'options' massivi, va 'answer' bo'lishi kerak!"
                );
              }
              
              // Testlar kolleksiyasiga referens
              const testsCollectionRef = collection(levelRef, "tests");
              
              // Testlarni yuklash
              let addedCount = 0;
              for (const test of parsedData) {
                await addDoc(testsCollectionRef, {
                  question: test.question,
                  options: test.options,
                  answer: test.answer,
                });
                addedCount++;
              }
              
              this.status = {
                type: "success",
                message: `✅ ${addedCount} tests added successfully to ${this.selectedSubject.id} - ${this.selectedLevel}!`,
              };
              
              // Formani tozalash
              this.file = null;
              document.querySelector('input[type="file"]').value = '';
              
            } catch (error) {
              console.error("❌ JSON faylni o'qishda xatolik:", error);
              this.status = {
                type: "error",
                message: `❌ Xatolik: ${error.message}`,
              };
            }
          };
          
          reader.readAsText(this.file);
        }
      } catch (error) {
        console.error("❌ Error adding tests:", error);
        this.status = { 
          type: "error", 
          message: `❌ Error adding tests: ${error.message}` 
        };
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchSubjects();
  }
};
</script>

<style scoped>
.subject-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  background: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

input,
select {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

input:disabled,
select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.info-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.btn {
  width: 80%;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
  background-color: #007bff;
  transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loader {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-indicator {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.status {
  margin-top: 20px;
  padding: 12px;
  text-align: center;
  border-radius: 6px;
  font-weight: 500;
  transition: opacity 0.3s;
  cursor: pointer;
}

.status:hover {
  opacity: 0.9;
}

.status.success {
  background: #d4edda;
  color: #155724;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
}

.status.info {
  background: #e2f3fd;
  color: #0c5460;
}
</style>