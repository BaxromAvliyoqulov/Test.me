<template>
  <div class="certificates-panel">
    <!-- Header & Actions Toolbar -->
    <div class="header-toolbar">
      <div class="search-wrap">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          placeholder="Sertifikat kodi, foydalanuvchi ismi yoki fan bo'yicha..." 
          @input="applyFilters" 
        />
      </div>

      <div class="toolbar-right">
        <button class="action-btn-primary" @click="showIssueModal = true">
          <i class="fas fa-plus"></i> Yangi Sertifikat Berish
        </button>
        <button class="icon-btn export-btn" @click="exportCSV" title="CSV yuklab olish">
          <i class="fas fa-file-csv"></i> Export
        </button>
        <button class="icon-btn" @click="loadCertificates" title="Yangilash">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="filters-row">
      <select v-model="filterType" @change="applyFilters" class="select-pill">
        <option value="all">Barcha Turlar</option>
        <option value="subject_mastery">Fan Chempioni (Mastery)</option>
        <option value="tournament">Turnir G'olibi</option>
        <option value="special">Maxsus Yutuq</option>
      </select>

      <select v-model="sortBy" @change="applyFilters" class="select-pill">
        <option value="issued_desc">Eng Yangi Oldin</option>
        <option value="issued_asc">Eng Eski Oldin</option>
        <option value="name_asc">Ism (A-Z)</option>
        <option value="name_desc">Ism (Z-A)</option>
      </select>

      <div class="stats-counter">
        Jami: <strong>{{ filteredCertificates.length }}</strong> ta sertifikat
      </div>
    </div>

    <!-- Table or Grid -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Sertifikatlar yuklanmoqda...</p>
      </div>

      <div v-else-if="filteredCertificates.length === 0" class="empty-state">
        <i class="fas fa-award"></i>
        <h4>Hech qanday sertifikat topilmadi</h4>
        <p>Qidiruv so'zini o'zgartiring yoki yangi sertifikat bering.</p>
      </div>

      <table v-else class="cert-table">
        <thead>
          <tr>
            <th>KOD</th>
            <th>FOYDALANUVCHI</th>
            <th>SERTIFIKAT NOMI</th>
            <th>TURI</th>
            <th>BERILGAN SANA</th>
            <th class="text-right">AMALLAR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cert in paginatedCertificates" :key="cert.id">
            <td class="code-cell">
              <span class="cert-code-badge" @click="copyCode(cert.cert_code)">
                <i class="fas fa-barcode"></i> {{ cert.cert_code }}
              </span>
            </td>
            <td class="user-cell">
              <div class="user-info">
                <strong>{{ cert.user_name || 'Noma\'lum o\'quvchi' }}</strong>
                <span class="user-id">ID: {{ (cert.user_id || '').slice(0, 8) }}...</span>
              </div>
            </td>
            <td>
              <div class="cert-title">
                <i class="fas fa-certificate text-warning"></i>
                <span>{{ cert.name_uz || cert.name_ru || 'Sertifikat' }}</span>
              </div>
              <small class="cert-desc">{{ cert.desc_uz || cert.desc_ru || '' }}</small>
            </td>
            <td>
              <span class="type-pill" :class="cert.cert_type">
                {{ formatType(cert.cert_type) }}
              </span>
            </td>
            <td>{{ formatDate(cert.issued_at) }}</td>
            <td class="text-right">
              <div class="action-buttons">
                <button class="btn-sm btn-view" @click="openViewModal(cert)" title="Ko'rish">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-sm btn-delete" @click="deleteCertificate(cert)" title="O'chirish">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="currentPage--" class="page-nav-btn">
        <i class="fas fa-chevron-left"></i> Oldingi
      </button>
      <span>Sahifa {{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++" class="page-nav-btn">
        Keyingi <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Issue Certificate Modal -->
    <div v-if="showIssueModal" class="modal-overlay" @click.self="showIssueModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3><i class="fas fa-award text-warning"></i> Yangi Sertifikat Berish</h3>
          <button class="close-btn" @click="showIssueModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Foydalanuvchi UUID yoki Tanlang:</label>
            <input v-model="newCert.user_id" placeholder="Foydalanuvchi ID sini kiriting..." />
          </div>
          <div class="form-group">
            <label>Foydalanuvchi Ismi (Sertifikatda chiqadigan):</label>
            <input v-model="newCert.user_name" placeholder="Masalan: Azizbek Karimov" />
          </div>
          <div class="form-group">
            <label>Sertifikat Turi:</label>
            <select v-model="newCert.cert_type">
              <option value="subject_mastery">Fan Chempioni (Mastery)</option>
              <option value="tournament">Turnir G'olibi</option>
              <option value="special">Maxsus Yutuq</option>
            </select>
          </div>
          <div class="form-group">
            <label>Sertifikat Nomi (O'zbekcha):</label>
            <input v-model="newCert.name_uz" placeholder="Masalan: Fizika fani a'lochisi" />
          </div>
          <div class="form-group">
            <label>Tavsif (O'zbekcha):</label>
            <textarea v-model="newCert.desc_uz" rows="2" placeholder="Sertifikat berilish sababi..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showIssueModal = false">Bekor qilish</button>
          <button class="btn-submit" :disabled="isSubmitting" @click="issueCertificate">
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
            <span v-else>Sertifikatni Tasdiqlash va Berish</span>
          </button>
        </div>
      </div>
    </div>

    <!-- View Certificate Modal -->
    <div v-if="selectedCert" class="modal-overlay" @click.self="selectedCert = null">
      <div class="modal-card cert-preview-card">
        <div class="modal-header">
          <h3>Sertifikat Tafsilotlari</h3>
          <button class="close-btn" @click="selectedCert = null">&times;</button>
        </div>
        <div class="cert-preview-body">
          <div class="cert-diploma-frame">
            <div class="cert-inner-border">
              <i class="fas fa-certificate cert-watermark"></i>
              <div class="cert-badge-top">TEST.ME RASMIY SERTIFIKATI</div>
              <h2 class="cert-awarded-to">{{ selectedCert.user_name }}</h2>
              <p class="cert-presented-text">quyidagi yutuq uchun taqdirlanadi:</p>
              <h3 class="cert-main-title">{{ selectedCert.name_uz }}</h3>
              <p class="cert-main-desc">{{ selectedCert.desc_uz }}</p>
              <div class="cert-meta-footer">
                <div>Kod: <strong>{{ selectedCert.cert_code }}</strong></div>
                <div>Sana: <strong>{{ formatDate(selectedCert.issued_at) }}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/config/supabase';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';

const toast = useToast();

const certificates = ref([]);
const filteredCertificates = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const filterType = ref('all');
const sortBy = ref('issued_desc');

const currentPage = ref(1);
const pageSize = 10;

const showIssueModal = ref(false);
const selectedCert = ref(null);
const isSubmitting = ref(false);

const newCert = ref({
  user_id: '',
  user_name: '',
  cert_type: 'subject_mastery',
  name_uz: '',
  desc_uz: '',
});

const generateCertCode = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TM-${num}`;
};

const loadCertificates = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false });

    if (error) {
      console.warn('loadCertificates xatosi:', error.message);
      // Fallback bo'sh ro'yxat
      certificates.value = [];
    } else {
      certificates.value = data || [];
    }
    applyFilters();
  } catch (err) {
    console.error('Sertifikatlarni yuklashda xatolik:', err);
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  let list = [...certificates.value];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(c => 
      (c.cert_code && c.cert_code.toLowerCase().includes(q)) ||
      (c.user_name && c.user_name.toLowerCase().includes(q)) ||
      (c.name_uz && c.name_uz.toLowerCase().includes(q))
    );
  }

  if (filterType.value !== 'all') {
    list = list.filter(c => c.cert_type === filterType.value);
  }

  if (sortBy.value === 'issued_desc') {
    list.sort((a, b) => new Date(b.issued_at || 0) - new Date(a.issued_at || 0));
  } else if (sortBy.value === 'issued_asc') {
    list.sort((a, b) => new Date(a.issued_at || 0) - new Date(b.issued_at || 0));
  } else if (sortBy.value === 'name_asc') {
    list.sort((a, b) => (a.user_name || '').localeCompare(b.user_name || ''));
  } else if (sortBy.value === 'name_desc') {
    list.sort((a, b) => (b.user_name || '').localeCompare(a.user_name || ''));
  }

  filteredCertificates.value = list;
  currentPage.value = 1;
};

const totalPages = computed(() => {
  return Math.ceil(filteredCertificates.value.length / pageSize) || 1;
});

const paginatedCertificates = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredCertificates.value.slice(start, start + pageSize);
});

const formatType = (type) => {
  const map = {
    subject_mastery: 'Fan Chempioni',
    tournament: 'Turnir G\'olibi',
    special: 'Maxsus Yutuq',
  };
  return map[type] || type;
};

const formatDate = (isoStr) => {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const copyCode = (code) => {
  if (!code) return;
  navigator.clipboard.writeText(code);
  toast.success(`Kod nusxalandi: ${code}`);
};

const openViewModal = (cert) => {
  selectedCert.value = cert;
};

const deleteCertificate = async (cert) => {
  const confirm = await Swal.fire({
    title: 'Sertifikatni o\'chirmoqchimisiz?',
    text: `Kod: ${cert.cert_code} - ${cert.user_name}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ha, o\'chirish',
    cancelButtonText: 'Bekor qilish',
    confirmButtonColor: '#ef4444',
  });

  if (!confirm.isConfirmed) return;

  try {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', cert.id);

    if (error) throw error;

    certificates.value = certificates.value.filter(c => c.id !== cert.id);
    applyFilters();
    toast.success('Sertifikat muvaffaqiyatli o\'chirildi');
  } catch (err) {
    toast.error('O\'chirishda xatolik yuz berdi: ' + err.message);
  }
};

const issueCertificate = async () => {
  if (!newCert.value.user_id || !newCert.value.user_name || !newCert.value.name_uz) {
    toast.error('Barcha majburiy maydonlarni to\'ldiring!');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      cert_code: generateCertCode(),
      user_id: newCert.value.user_id,
      user_name: newCert.value.user_name,
      cert_type: newCert.value.cert_type,
      name_uz: newCert.value.name_uz,
      desc_uz: newCert.value.desc_uz || 'A\'lo darajadagi bilim va natijalar uchun taqdirlandi.',
      issued_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('certificates')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    certificates.value.unshift(data || payload);
    applyFilters();
    toast.success('Yangi sertifikat muvaffaqiyatli berildi!');
    showIssueModal.value = false;
    newCert.value = {
      user_id: '',
      user_name: '',
      cert_type: 'subject_mastery',
      name_uz: '',
      desc_uz: '',
    };
  } catch (err) {
    toast.error('Sertifikat berishda xatolik: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};

const exportCSV = () => {
  if (filteredCertificates.value.length === 0) {
    toast.warning('Eksport qilish uchun ma\'lumot yo\'q');
    return;
  }

  const rows = [
    ['Kod', 'Foydalanuvchi', 'Nomi', 'Turi', 'Sana'],
    ...filteredCertificates.value.map(c => [
      c.cert_code,
      c.user_name,
      c.name_uz,
      c.cert_type,
      c.issued_at,
    ]),
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `certificates_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  loadCertificates();
});
</script>

<style scoped>
.certificates-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-wrap i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-wrap input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.9rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.action-btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.icon-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.select-pill {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.88rem;
  color: #334155;
}

.stats-counter {
  margin-left: auto;
  font-size: 0.88rem;
  color: #64748b;
}

.table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.cert-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.cert-table th {
  text-align: left;
  padding: 14px 18px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.cert-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.cert-code-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 8px;
  font-weight: 700;
  font-family: monospace;
  font-size: 0.85rem;
  cursor: pointer;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-id {
  font-size: 0.75rem;
  color: #94a3b8;
}

.cert-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.cert-desc {
  color: #64748b;
  font-size: 0.8rem;
}

.type-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
}

.type-pill.subject_mastery {
  background: #ecfdf5;
  color: #059669;
}

.type-pill.tournament {
  background: #fef3c7;
  color: #d97706;
}

.type-pill.special {
  background: #f3e8ff;
  color: #7c3aed;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.btn-delete:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.text-right {
  text-align: right;
}

.loading-state, .empty-state {
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
}

.empty-state i {
  font-size: 2.5rem;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  font-size: 0.88rem;
  color: #64748b;
}

.page-nav-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
}

.page-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  overflow: hidden;
}

.modal-header {
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #94a3b8;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-weight: 600;
}

.btn-submit {
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Certificate Preview Diploma */
.cert-preview-card {
  max-width: 600px;
}

.cert-preview-body {
  padding: 24px;
  background: #0f172a;
}

.cert-diploma-frame {
  background: linear-gradient(135deg, #fef9c3, #fef08a);
  border: 8px solid #ca8a04;
  border-radius: 12px;
  padding: 16px;
}

.cert-inner-border {
  border: 2px dashed #a16207;
  padding: 24px 16px;
  text-align: center;
  position: relative;
  background: rgba(255, 255, 255, 0.4);
}

.cert-watermark {
  position: absolute;
  font-size: 8rem;
  color: rgba(202, 138, 4, 0.08);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.cert-badge-top {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: #854d0e;
  margin-bottom: 12px;
}

.cert-awarded-to {
  font-size: 1.6rem;
  font-weight: 900;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.cert-presented-text {
  font-size: 0.85rem;
  color: #713f12;
  margin: 0 0 10px 0;
}

.cert-main-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e3a8a;
  margin: 0 0 8px 0;
}

.cert-main-desc {
  font-size: 0.85rem;
  color: #475569;
  max-width: 420px;
  margin: 0 auto 16px auto;
}

.cert-meta-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #854d0e;
  border-top: 1px solid rgba(161, 98, 7, 0.3);
  padding-top: 10px;
}
</style>
