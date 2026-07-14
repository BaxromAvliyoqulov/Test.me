<template>
  <div class="upload-container">
    <div class="card-header">
      <h2><i class="fas fa-file-excel"></i> Excel Test Yuklash</h2>
      <p>Oddiy va Maxsus (DTM, Prezident) testlarni bittada yuklash</p>
    </div>

    <!-- AI Prompt Section -->
    <div class="prompt-section">
      <h3><i class="fas fa-robot"></i> AI uchun tayyor Prompt</h3>
      <p>Sun'iy intellektga (Gemini, ChatGPT) ushbu matnni berib tayyor Excel fayl yaratib olishingiz mumkin:</p>
      
      <div class="prompt-box">
        <textarea readonly v-model="aiPrompt"></textarea>
        <button class="copy-btn" @click="copyPrompt">
          <i :class="copied ? 'fas fa-check' : 'fas fa-copy'"></i> 
          {{ copied ? 'Nusxa olindi!' : 'Nusxa Olish' }}
        </button>
      </div>
    </div>

    <!-- Selection Section for Dynamic Prompt -->
    <div class="selection-grid">
      <div class="form-group">
        <label>1. Fanni tanlang (Prompt uchun)</label>
        <div class="select-wrapper">
          <i class="fas fa-book select-icon"></i>
          <select v-model="selectedSubject" @change="fetchLevels" :disabled="loadingSubjects">
            <option disabled value="">Fanni tanlang...</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject">
              {{ subject.id }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>2. Darajani tanlang (Prompt uchun)</label>
        <div class="select-wrapper">
          <i class="fas fa-layer-group select-icon"></i>
          <select v-model="selectedLevel" :disabled="!selectedSubject || loadingLevels">
            <option disabled value="">Darajani tanlang...</option>
            <option v-for="level in levels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label>3. Test soni (Prompt uchun)</label>
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
          </select>
        </div>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="upload-box" :class="{ 'disabled': !canUpload }" @dragover.prevent @drop.prevent="handleDrop">
      <input 
        type="file" 
        id="fileInput" 
        accept=".xlsx, .xls" 
        @change="handleFileUpload" 
        class="hidden-input"
        :disabled="!canUpload"
      />
      <label for="fileInput" class="upload-label">
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <h3 v-if="canUpload">Excel faylni shu yerga tashlang yoki ustiga bosing</h3>
        <h3 v-else class="text-danger">Iltimos, avval Fan va Darajani tanlang!</h3>
        <p>Faqat .xlsx yoki .xls formatidagi fayllar qabul qilinadi.</p>
      </label>
      <div v-if="selectedFile" class="file-name">
        <i class="fas fa-file-excel text-emerald"></i> {{ selectedFile.name }}
      </div>
    </div>

    <!-- Preview Section -->
    <div v-if="parsedData.length > 0" class="preview-section">
      <div class="preview-header">
        <div class="header-left">
          <h3><i class="fas fa-eye"></i> Ma'lumotlar tekshiruvi (Preview)</h3>
          <span class="badge">{{ parsedData.length }} ta savol topildi</span>
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
              <th>Tur</th>
              <th>Test Nomi</th>
              <th>Fan / Blok</th>
              <th>Sinf / Daraja</th>
              <th>Savol</th>
              <th>To'g'ri Javob</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in parsedData.slice(0, 5)" :key="idx">
              <td>
                <span :class="['type-badge', (row.TestCategory || 'Standard').toLowerCase()]">
                  {{ row.TestCategory || 'Standard' }}
                </span>
              </td>
              <td>{{ row.TestName || '-' }}</td>
              <td>{{ row.Subject }}</td>
              <td>{{ row.Level }}</td>
              <td class="truncate">{{ row.Question }}</td>
              <td class="text-emerald font-bold">{{ row.Answer }}</td>
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
import * as XLSX from 'xlsx';
import { db } from '@/config/firebase';
import { collection, writeBatch, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';

const toast = useToast();

const subjects = ref([]);
const levels = ref([]);
const selectedSubject = ref("");
const selectedLevel = ref("");
const selectedTestCount = ref("10");
const loadingSubjects = ref(false);
const loadingLevels = ref(false);

const canUpload = computed(() => {
  return selectedSubject.value && selectedLevel.value;
});

const aiPrompt = computed(() => {
  const fan = selectedSubject.value ? selectedSubject.value.id : "[FAN NOMI]";
  const daraja = selectedLevel.value ? selectedLevel.value : "[SINF/DARAJA]";
  const soni = selectedTestCount.value;

  return `Menga quyidagi qoidalarga qat'iy amal qilgan holda O'zbekiston maktab darsliklariga asoslangan ${soni} ta test savolini Excel (yoki CSV jadval) formatida tuzib ber. 

QAT'IY USTUNLAR (COLUMNS) KETMA-KETLIGI:
1. TestCategory (Faqat bittasi: Standard, DTM, Prezident)
2. TestName (Agar Standard bo'lsa bo'sh qoldir, maxsus bo'lsa nomini yoz. Masalan: DTM 2024 Blok)
3. Subject (Fan nomi. "${fan}" bo'lishi shart)
4. Level (Sinf. "${daraja}" bo'lishi shart)
5. ScoreWeight (Ball: Standard uchun 1, DTM Asosiy uchun 3.1)
6. Question (Savol matni)
7. Option A (Variant A)
8. Option B (Variant B)
9. Option C (Variant C)
10. Option D (Variant D)
11. Answer (To'g'ri javob matni. U albatta variantlardan biri bilan aynan bir xil yozilgan bo'lishi shart)

Qoshimcha talab: Hech qanday ortiqcha matnsiz faqat jadvalni taqdim et!`;
});

const copied = ref(false);
const selectedFile = ref(null);
const parsedData = ref([]);
const loading = ref(false);

const copyPrompt = () => {
  navigator.clipboard.writeText(aiPrompt.value);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};

const fetchSubjects = async () => {
  loadingSubjects.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, "subjects"));
    subjects.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    levels.value = levelsCollection.docs.map(doc => doc.id);
  } catch (error) {
    toast.error("Darajalarni yuklashda xatolik: " + error.message);
  } finally {
    loadingLevels.value = false;
  }
};

onMounted(() => {
  fetchSubjects();
});

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
  const validExts = ['.xlsx', '.xls'];
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validExts.includes(fileExt)) {
    toast.error("Faqat Excel fayllar qo'llab quvvatlanadi!");
    return;
  }

  selectedFile.value = file;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    loading.value = true;
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
      
      // Basic validation
      if (jsonData.length === 0) {
        toast.error("Fayl bo'sh!");
        return;
      }
      
      const firstRow = jsonData[0];
      if (!firstRow.Subject || !firstRow.Question || !firstRow.Answer) {
        toast.error("Ustunlar xato! Fayl strukturasi to'g'riligiga ishonch hosil qiling.");
        return;
      }

      // Fetch existing questions for Deduplication
      const testsRef = collection(db, "subjects", selectedSubject.value.id, "levels", selectedLevel.value, "tests");
      const existingDocs = await getDocs(testsRef);
      const existingQuestions = new Set();
      existingDocs.forEach(doc => {
        if (doc.data().question) {
          existingQuestions.add(String(doc.data().question).trim().toLowerCase());
        }
      });

      const newJsonData = [];
      let duplicatesCount = 0;

      // Strict Validation & Deduplication
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const category = (row.TestCategory || 'Standard').trim().toLowerCase();
        
        if (category === 'standard') {
          const rowSubject = String(row.Subject).trim();
          const rowLevel = String(row.Level).trim();
          
          if (rowSubject !== selectedSubject.value.id || rowLevel !== selectedLevel.value) {
            toast.error(`XATOLIK! ${i + 1}-qatordagi fan (${rowSubject}) yoki daraja (${rowLevel}) siz tanlaganiga (${selectedSubject.value.id} - ${selectedLevel.value}) mos kelmaydi! Axlat malumotlar kiritish taqiqlanadi.`);
            return;
          }

          if (existingQuestions.has(String(row.Question).trim().toLowerCase())) {
            duplicatesCount++;
            continue; // Skip duplicate
          }
        }
        newJsonData.push(row);
      }

      if (newJsonData.length === 0) {
        toast.error("Barcha savollar bazada allaqachon mavjud! Fayl qabul qilinmadi.");
        clearData();
        return;
      }

      parsedData.value = newJsonData;
      
      if (duplicatesCount > 0) {
        toast.warning(`${duplicatesCount} ta takroriy savol topildi va olib tashlandi. Qolgan ${newJsonData.length} tasi tayyorlandi.`);
      } else {
        toast.success(`${newJsonData.length} ta savol tayyorlandi.`);
      }
    } catch(err) {
      toast.error(`Faylni o'qishda xatolik: ${err.message}`);
      clearData();
    } finally {
      loading.value = false;
    }
  };
  
  reader.readAsArrayBuffer(file);
};

const clearData = () => {
  parsedData.value = [];
  selectedFile.value = null;
  document.getElementById('fileInput').value = '';
};

const uploadToDatabase = async () => {
  if (parsedData.value.length === 0) return;

  const result = await Swal.fire({
    title: 'Ishonchingiz komilmi?',
    text: `Ushbu ${parsedData.value.length} ta test savolini haqiqatdan ham bazaga qo'shmoqchimisiz?`,
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
    const batch = writeBatch(db);
    
    // Group tests
    const standardTests = [];
    const specialTestsMap = {}; // Grouped by TestName

    for (const row of parsedData.value) {
      const category = (row.TestCategory || 'Standard').trim().toLowerCase();
      
      const questionObj = {
        question: String(row.Question),
        options: [
          String(row['Option A']),
          String(row['Option B']),
          String(row['Option C']),
          String(row['Option D'])
        ],
        answer: String(row.Answer),
        scoreWeight: Number(row.ScoreWeight) || 1,
        createdAt: new Date().toISOString()
      };

      if (category === 'standard') {
        const subjectId = String(row.Subject).trim();
        const levelId = String(row.Level).trim();
        
        // Add to array
        standardTests.push({ subjectId, levelId, data: questionObj });

        // Ensure Subject and Level docs exist
        const subjRef = doc(db, 'subjects', subjectId);
        batch.set(subjRef, { 
          id: subjectId, 
          name: subjectId, 
          updatedAt: serverTimestamp() 
        }, { merge: true });

        const levelRef = doc(db, `subjects/${subjectId}/levels`, levelId);
        batch.set(levelRef, { 
          id: levelId, 
          name: levelId, 
          updatedAt: serverTimestamp() 
        }, { merge: true });

        // Add question to subcollection
        const testRef = doc(collection(db, `subjects/${subjectId}/levels/${levelId}/tests`));
        batch.set(testRef, {
          ...questionObj,
          createdAt: serverTimestamp() // Override with serverTimestamp for single doc
        });

      } else {
        // Special Tests (DTM, Prezident)
        const testName = String(row.TestName).trim();
        const testCategory = String(row.TestCategory).trim();
        
        if (!testName) {
          throw new Error("Maxsus testlar uchun 'TestName' ustuni to'ldirilishi shart!");
        }

        if (!specialTestsMap[testName]) {
          specialTestsMap[testName] = {
            title: testName,
            category: testCategory,
            sectionsMap: {}, // Intermediate grouping map
          };
        }

        const sectionKey = `${row.Subject}_${row.Level}`;
        if (!specialTestsMap[testName].sectionsMap[sectionKey]) {
          specialTestsMap[testName].sectionsMap[sectionKey] = {
            subject: String(row.Subject).trim(),
            level: String(row.Level).trim(),
            scoreWeight: Number(row.ScoreWeight) || 1,
            questions: []
          };
        }

        specialTestsMap[testName].sectionsMap[sectionKey].questions.push(questionObj);
      }
    }

    // Process Special Tests into the batch
    for (const testName in specialTestsMap) {
      const t = specialTestsMap[testName];
      const sectionsArray = Object.values(t.sectionsMap);
      
      const specialDocRef = doc(collection(db, 'special_tests'));
      batch.set(specialDocRef, {
        title: t.title,
        category: t.category,
        sections: sectionsArray,
        createdAt: serverTimestamp()
      });
    }

    // Execute Batch
    await batch.commit();
    toast.success("Barcha savollar muvaffaqiyatli bazaga saqlandi!");
    clearData();

  } catch (err) {
    console.error(err);
    toast.error(`Xatolik: ${err.message}`);
  } finally {
    loading.value = false;
  }
};

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
  color: #10b981;
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
  color: #3b82f6;
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
  background: #3b82f6;
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
  background: #2563eb;
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
.upload-box:hover .upload-icon {
  color: #10b981;
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
  color: #64748b;
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
  max-width: 250px;
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

.type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}
.type-badge.standard { background: #e0f2fe; color: #0369a1; }
.type-badge.dtm { background: #fef08a; color: #854d0e; }
.type-badge.prezident { background: #f3e8ff; color: #7e22ce; }

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
  background: #10b981;
  color: white;
}
.btn.primary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
}

@media (max-width: 768px) {
  .selection-grid { grid-template-columns: 1fr; }
}
</style>
