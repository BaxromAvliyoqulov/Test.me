<template>
  <div class="test-container">
    <!-- Subject Selection Component -->
    <div v-if="!startTest" class="subject-container">
      <h3>Select Subject for Tests</h3>
      <form @submit.prevent="startTestWithFilters" class="form">
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

        <!-- Test Quantity Selection -->
        <div class="form-group">
          <label>Number of Questions</label>
          <select 
            v-model="selectedQuestionCount"
            :disabled="loading || !selectedSubject || !selectedLevel"
          >
            <option disabled value="">Select number of questions</option>
            <option v-for="count in questionCounts" :key="count" :value="count">
              {{ count }} questions
            </option>
          </select>
        </div>

        <button type="submit" class="btn" :disabled="!canStart">
          <span v-if="!loading">Start Test</span>
          <span v-else class="loader"></span>
        </button>
      </form>

      <div v-if="status" :class="['status', status.type]" @click="clearStatus">
        {{ status.message }}
      </div>
    </div>

    <!-- Test Component (shown after subject selection) -->
    <div v-else>
      <div class="test-header">
        <h3>{{ selectedSubject.id }} - {{ selectedLevel }} Test ({{ selectedQuestionCount }} questions)</h3>
        <button class="back-btn" @click="goBackToSelection">
          ← Back to Selection
        </button>
      </div>
      
      <TestPage 
        :subjectId="selectedSubject.id"
        :levelId="selectedLevel"
        :questionCount="selectedQuestionCount"
        @test-completed="handleTestCompletion"
      />
    </div>
  </div>
</template>

<script>
import { db } from "@/config/firebase"; // Adjust this import to match your Firebase config path
import { collection, doc, getDocs } from "firebase/firestore";
import TestPage from './TestPage.vue'; // Import the TestPage component

export default {
  name: "SubjectTestSelection",
  components: {
    TestPage
  },
  data() {
    return {
      selectedSubject: "",
      selectedLevel: "",
      selectedQuestionCount: "",
      questionCounts: [5, 10, 15, 20, 25, 30, 35, 40, 45],
      subjects: [],
      levels: [],
      loading: false,
      loadingSubjects: false,
      loadingLevels: false,
      status: null,
      startTest: false
    };
  },
  computed: {
    canStart() {
      return this.selectedSubject && 
             this.selectedLevel && 
             this.selectedQuestionCount &&
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
            message: "⚠️ No levels found for this subject."
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
    
    clearStatus() {
      this.status = null;
    },
    
    startTestWithFilters() {
      if (!this.canStart) return;
      
      this.startTest = true;
    },
    
    goBackToSelection() {
      this.startTest = false;
    },
    
    handleTestCompletion(results) {
      console.log("Test completed with results:", results);
      // You can handle test completion as needed
      // For example, show results, save to user profile, etc.
      
      // Show a message about the results
      this.status = {
        type: "success",
        message: `✅ Test completed! You got ${results.correctAnswers} out of ${results.totalQuestions} questions correct.`
      };
      
      // Go back to selection
      this.startTest = false;
    }
  },
  mounted() {
    this.fetchSubjects();
  }
};
</script>

<style scoped>
.test-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.subject-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  background: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: #e9ecef;
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