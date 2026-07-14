<template>
  <div class="upload-container">
    <div class="card-header">
      <h2><i class="fas fa-file-code"></i> JSON Test Yuklash</h2>
      <p>Muayyan fan va daraja uchun tayyor JSON faylni bazaga yuklang</p>
    </div>

    <!-- AI Prompt Section -->
    <div class="prompt-section">
      <h3><i class="fas fa-robot"></i> AI uchun tayyor Prompt (JSON)</h3>
      <p>Sun'iy intellektga ushbu matnni berib, to'g'ridan-to'g'ri tizimga mos JSON fayl yarating:</p>
      
      <div class="prompt-box">
        <textarea readonly v-model="aiPrompt"></textarea>
        <button class="copy-btn" @click="copyPrompt">
          <i :class="copied ? 'fas fa-check' : 'fas fa-copy'"></i> 
          {{ copied ? 'Nusxa olindi!' : 'Nusxa Olish' }}
        </button>
      </div>
    </div>

    <!-- Selection Section -->
    <div class="selection-grid">
      <div class="form-group">
        <label>1. Fanni tanlang</label>
        <div class="select-wrapper">
          <i class="fas fa-book select-icon"></i>
          <select v-model="selectedSubject" @change="fetchLevels" :disabled="loading || loadingSubjects">
            <option disabled value="">Fanni tanlang...</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject">
              {{ subject.id }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>2. Darajani tanlang</label>
        <div class="select-wrapper">
          <i class="fas fa-layer-group select-icon"></i>
          <select v-model="selectedLevel" @change="fetchTestCount" :disabled="loading || !selectedSubject || loadingLevels">
            <option disabled value="">Darajani tanlang...</option>
            <option v-for="level in levels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>
        <div v-if="selectedLevel" class="live-count-badge" :class="{'loading': loadingCount}">
          <i class="fas fa-database" :class="{'fa-spin': loadingCount}"></i> 
          Bazada: <strong>{{ currentTestCount }}</strong> ta savol
        </div>
      </div>

      <div class="form-group">
        <label>3. Test sonini tanlang</label>
        <div class="select-wrapper">
          <i class="fas fa-list-ol select-icon"></i>
          <select v-model="selectedTestCount">
            <option value="5">5 ta savol</option>
            <option value="10">10 ta savol</option>
            <option value="15">15 ta savol</option>
            <option value="20">20 ta savol</option>
            <option value="25">25 ta savol</option>
            <option value="30">30 ta savol</option>
            <option value="50">50 ta savol</option>
            <option value="75">75 ta savol</option>
            <option value="100">100 ta savol</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="upload-box" :class="{ 'disabled': !canUpload }" @dragover.prevent @drop.prevent="handleDrop">
      <input 
        type="file" 
        id="fileInput" 
        accept="application/json" 
        @change="handleFileUpload" 
        class="hidden-input"
        :disabled="!canUpload"
      />
      <label for="fileInput" class="upload-label">
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <h3 v-if="!canUpload" class="text-danger">Iltimos, avval Fan va Darajani tanlang!</h3>
        <h3 v-else>JSON faylni shu yerga tashlang yoki bosing</h3>
        <p v-if="canUpload">Faqat .json formatidagi fayllar qabul qilinadi.</p>
      </label>
      <div v-if="selectedFile" class="file-name">
        <i class="fas fa-file-code text-blue"></i> {{ selectedFile.name }}
      </div>
    </div>

    <!-- Preview Section -->
    <div v-if="parsedData.length > 0" class="preview-section">
      <div class="preview-header">
        <div class="header-left">
          <h3><i class="fas fa-eye"></i> Ma'lumotlar tekshiruvi (Preview)</h3>
          <span class="badge">{{ parsedData.length }} ta savol tayyor</span>
          <span class="badge destination-badge" v-if="canUpload">
            <i class="fas fa-bullseye"></i> Qabul qilinuvchi manzil: {{ selectedSubject.id }} &rarr; {{ selectedLevel }}
          </span>
        </div>
        
        <!-- Action Buttons Moved to Header -->
        <div class="action-buttons">
          <button class="btn secondary btn-sm" @click="clearData" :disabled="loading">
            <i class="fas fa-times"></i> Bekor qilish
          </button>
          <button class="btn primary btn-sm" @click="uploadToDatabase" :disabled="loading">
            <span v-if="!loading"><i class="fas fa-database"></i> Bazaga Yuklash</span>
            <i v-else class="fas fa-circle-notch fa-spin"></i>
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Savol</th>
              <th>To'g'ri Javob</th>
              <th>Variantlar soni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in parsedData.slice(0, 5)" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td class="truncate">{{ row.question }}</td>
              <td class="text-emerald font-bold">{{ row.answer }}</td>
              <td>{{ row.options?.length || 0 }} ta</td>
            </tr>
          </tbody>
        </table>
        <p class="table-footer" v-if="parsedData.length > 5">
          ... va yana {{ parsedData.length - 5 }} ta savol.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { doc, getDocs, collection, writeBatch, setDoc, getCountFromServer } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import { sortLevels } from '@/utils/sorters';

const toast = useToast();

const aiPrompt = computed(() => {
  const fan = selectedSubject.value ? selectedSubject.value.id : "[FAN NOMI]";
  const daraja = selectedLevel.value ? selectedLevel.value : "[SINF/DARAJA]";
  const soni = selectedTestCount.value;
  
  return `Menga O'zbekiston maktab darsliklariga asoslangan, "${fan}" fani bo'yicha "${daraja}" qiyinchilik darajasiga HAQIQIY va QAT'IY mos keladigan ${soni} ta test savolini tuzib ber.
DIQQAT: Savollar mutlaqo yangi, sifatli bo'lishi va bir-birini umuman takrorlamasligi shart!
Javobni faqat quyidagi JSON massiv formatida (boshqa hech qanday matn yoki markdown izohlarsiz) qaytar:

[
  {
    "question": "Savol matni",
    "options": ["Variant A", "Variant B", "Variant C", "Variant D"],
    "answer": "To'g'ri javob (options ichidagi matn bilan aynan bir xil bo'lishi shart)"
  }
]`;
});

const copied = ref(false);
const subjects = ref([]);
const levels = ref([]);
const selectedSubject = ref("");
const selectedLevel = ref("");
const selectedTestCount = ref("10");
const loadingSubjects = ref(false);
const loadingLevels = ref(false);
const loading = ref(false);
const selectedFile = ref(null);
const parsedData = ref([]);
const currentTestCount = ref(0);
const loadingCount = ref(false);

const canUpload = computed(() => selectedSubject.value && selectedLevel.value);

const fetchTestCount = async () => {
  if (!selectedSubject.value || !selectedLevel.value) {
    currentTestCount.value = 0;
    return;
  }
  loadingCount.value = true;
  try {
    const coll = collection(db, "subjects", selectedSubject.value.id, "levels", selectedLevel.value, "tests");
    const snapshot = await getCountFromServer(coll);
    currentTestCount.value = snapshot.data().count;
  } catch(e) {
    console.error("Test sonini olishda xatolik:", e);
    currentTestCount.value = 0;
  } finally {
    loadingCount.value = false;
  }
};

const copyPrompt = () => {
  navigator.clipboard.writeText(aiPrompt.value);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};

const fetchSubjects = async () => {
  loadingSubjects.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, "subjects"));
    subjects.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    toast.error("Fanlarni yuklashda xatolik: " + error.message);
  } finally {
    loadingSubjects.value = false;
  }
};

const fetchLevels = async () => {
  if (!selectedSubject.value) return;
  loadingLevels.value = true;
  selectedLevel.value = "";
  levels.value = [];
  try {
    const levelsCollection = await getDocs(collection(db, "subjects", selectedSubject.value.id, "levels"));
    const fetchedLevels = levelsCollection.docs.map(doc => doc.id);
    levels.value = sortLevels(fetchedLevels);
  } catch (error) {
    toast.error("Darajalarni yuklashda xatolik: " + error.message);
  } finally {
    loadingLevels.value = false;
  }
};

const handleDrop = (e) => {
  if (!canUpload.value) return;
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
};

const handleFileUpload = (e) => {
  if (!canUpload.value) return;
  const file = e.target.files[0];
  if (file) processFile(file);
};

const processFile = (file) => {
  if (file.type !== "application/json" && !file.name.endsWith('.json')) {
    toast.error("Faqat JSON fayllar qo'llab-quvvatlanadi!");
    return;
  }

  selectedFile.value = file;
  const reader = new FileReader();
  reader.onload = async (e) => {
    loading.value = true;
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("JSON ma'lumoti massiv (array) bo'lishi kerak!");
      
      const isValid = data.every(item => 
        item.question && 
        Array.isArray(item.options) && 
        item.options.length === 4 && 
        item.answer
      );

      if (!isValid) throw new Error("Test strukturasida xato! 'question', 4 ta 'options' va 'answer' bo'lishi shart.");
      
      // --- Deduplication Logic ---
      const testsRef = collection(db, "subjects", selectedSubject.value.id, "levels", selectedLevel.value, "tests");
      const existingDocs = await getDocs(testsRef);
      const existingQuestions = new Set();
      existingDocs.forEach(doc => {
        if (doc.data().question) {
          existingQuestions.add(doc.data().question.trim().toLowerCase());
        }
      });

      // 1. Fayl ichidagi takroriy savollarni tozalash (Internal deduplication)
      const uniqueData = [];
      const seenInFile = new Set();
      data.forEach(item => {
        const qText = item.question.trim().toLowerCase();
        if (!seenInFile.has(qText)) {
          seenInFile.add(qText);
          uniqueData.push(item);
        }
      });

      // 2. Bazadagi eski savollar bilan solishtirish (External deduplication)
      const newTests = uniqueData.filter(item => !existingQuestions.has(item.question.trim().toLowerCase()));
      const duplicatesCount = data.length - newTests.length; // umumiy olib tashlanganlar

      if (newTests.length === 0) {
         toast.error("Barcha savollar bazada allaqachon mavjud! Fayl qabul qilinmadi.");
         clearData();
         return;
      }

      parsedData.value = newTests;
      
      if (duplicatesCount > 0) {
         toast.warning(`${duplicatesCount} ta takroriy savol (fayl ichida yoki bazada) topildi va olib tashlandi. Qolgan ${newTests.length} tasi tayyorlandi.`);
      } else {
         toast.success(`${newTests.length} ta savol tayyorlandi.`);
      }
      // ----------------------------

    } catch (err) {
      toast.error(`JSON faylni o'qishda xatolik: ${err.message}`);
      clearData();
    } finally {
      loading.value = false;
    }
  };
  reader.readAsText(file);
};

const clearData = async () => {
  parsedData.value = [];
  selectedFile.value = null;
  const input = document.getElementById('fileInput');
  if (input) input.value = '';
  await fetchTestCount();
};

const uploadToDatabase = async () => {
  if (!canUpload.value || parsedData.value.length === 0) return;
  
  const result = await Swal.fire({
    title: 'Ishonchingiz komilmi?',
    text: `Ushbu ${parsedData.value.length} ta test savolini ${selectedSubject.value.id} -> ${selectedLevel.value} bazasiga aniq qo'shmoqchimisiz?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Ha, tasdiqlayman!',
    cancelButtonText: 'Bekor qilish'
  });

  if (!result.isConfirmed) return;

  loading.value = true;
  try {
    const subjectRef = doc(db, "subjects", selectedSubject.value.id);
    const levelRef = doc(subjectRef, "levels", selectedLevel.value);
    
    // Make sure level exists
    await setDoc(levelRef, { name: selectedLevel.value }, { merge: true });
    
    // Batch is much faster!
    const batch = writeBatch(db);
    
    parsedData.value.forEach(test => {
      const newTestRef = doc(collection(levelRef, "tests"));
      batch.set(newTestRef, {
        question: test.question,
        options: test.options,
        answer: test.answer
      });
    });
    
    await batch.commit();
    const uploadedCount = parsedData.value.length;
    toast.success(`✅ ${uploadedCount} ta test savoli muvaffaqiyatli yuklandi!`);
    
    // UI-da raqamni darhol yangilash (tezkor javob uchun)
    currentTestCount.value += uploadedCount;
    
    clearData();
  } catch (error) {
    toast.error("Bazaga yuklashda xatolik: " + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSubjects();
});
</script>

<style scoped>
.upload-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  font-family: 'Plus Jakarta Sans', sans-serif;
  text-align: left;
}

.card-header {
  margin-bottom: 2rem;
}
.card-header h2 {
  font-size: 1.5rem;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-header h2 i {
  color: #3b82f6; /* Blue for JSON */
}
.card-header p {
  color: #64748b;
  margin-top: 5px;
}

.prompt-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.prompt-section h3 {
  font-size: 1.1rem;
  color: #8b5cf6;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.prompt-section p {
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 1rem;
}

.prompt-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.prompt-box textarea {
  width: 100%;
  height: 120px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.85rem;
  color: #334155;
  resize: none;
}
.copy-btn {
  align-self: flex-end;
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.copy-btn:hover {
  background: #7c3aed;
}

/* Selection Grid */
.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 2rem;
}
.form-group label {
  display: block;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.live-count-badge {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #059669;
  background: #ecfdf5;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  border: 1px solid #d1fae5;
  animation: fadeIn 0.3s ease;
}
.live-count-badge strong {
  font-weight: 800;
  font-size: 1rem;
}
.live-count-badge.loading {
  color: #64748b;
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.select-icon {
  position: absolute;
  left: 15px;
  color: #94a3b8;
}
.select-wrapper select {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  font-family: inherit;
  color: #1e293b;
  appearance: none;
  background: #f8fafc url('data:image/svg+xml;utf8,<svg fill="%2394a3b8" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>') no-repeat right 10px center;
  transition: all 0.2s;
  cursor: pointer;
}
.select-wrapper select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.select-wrapper select:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Upload Box */
.upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  background: #f8fafc;
  transition: all 0.3s;
  position: relative;
  margin-bottom: 2rem;
}
.upload-box:hover:not(.disabled) {
  border-color: #3b82f6;
  background: #eff6ff;
}
.upload-box.disabled {
  border-color: #f1f5f9;
  background: #f8fafc;
  cursor: not-allowed;
  opacity: 0.6;
}
.upload-box.disabled .upload-label {
  cursor: not-allowed;
}
.text-danger {
  color: #ef4444 !important;
}
.hidden-input {
  display: none;
}
.upload-label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.upload-icon {
  font-size: 3rem;
  color: #94a3b8;
  transition: color 0.3s;
}
.upload-box:not(.disabled):hover .upload-icon {
  color: #3b82f6;
}
.upload-label h3 {
  color: #0f172a;
  font-size: 1.2rem;
}
.upload-label p {
  color: #64748b;
  font-size: 0.9rem;
}
.file-name {
  margin-top: 20px;
  font-weight: 600;
  color: #0f172a;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.text-blue { color: #3b82f6; }

/* Preview Section */
.preview-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 15px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.preview-header h3 {
  font-size: 1.2rem;
  color: #0f172a;
  margin: 0;
}
.badge {
  background: #dbeafe;
  color: #2563eb;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
}
.destination-badge {
  background: #fefce8;
  color: #ca8a04;
  font-weight: 700;
  border: 1px solid #fef08a;
}
.destination-badge i {
  color: #eab308;
  margin-right: 4px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
}
.preview-table {
  width: 100%;
  border-collapse: collapse;
}
.preview-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 0.85rem;
  color: #1d4ed8;
  font-weight: 600;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
}
.preview-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
}
.truncate {
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.text-emerald {
  color: #10b981;
}
.font-bold {
  font-weight: bold;
}
.table-footer {
  text-align: center;
  padding: 10px;
  color: #64748b;
  font-size: 0.9rem;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}
.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;
}
.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn.secondary {
  background: #f1f5f9;
  color: #475569;
}
.btn.secondary:hover:not(:disabled) {
  background: #e2e8f0;
}
.btn.primary {
  background: #3b82f6;
  color: white;
}
.btn.primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
  .selection-grid { grid-template-columns: 1fr; }
}
</style>