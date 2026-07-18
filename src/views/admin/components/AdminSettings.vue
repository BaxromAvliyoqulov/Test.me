<template>
  <div class="settings-panel">
    <h3 class="panel-title"><i class="fas fa-cog"></i> Tizim Sozlamalari</h3>

    <div class="settings-grid">
      <!-- Platform Info -->
      <div class="settings-section">
        <div class="section-header">
          <i class="fas fa-info-circle"></i>
          <h4>Platforma Ma'lumotlari</h4>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">Platforma Nomi</span>
            <span class="setting-desc">Foydalanuvchilarga ko'rinadigan nom</span>
          </div>
          <input v-model="settings.platformName" class="setting-input" />
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">Admin Email</span>
            <span class="setting-desc">Asosiy admin elektron pochta manzili</span>
          </div>
          <input v-model="settings.adminEmail" class="setting-input" type="email" />
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">Versiya</span>
            <span class="setting-desc">Joriy platforma versiyasi</span>
          </div>
          <input v-model="settings.version" class="setting-input" />
        </div>
      </div>

      <!-- Economy Settings -->
      <div class="settings-section">
        <div class="section-header">
          <i class="fas fa-coins"></i>
          <h4>TP Coin Ekonomikasi</h4>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">Test uchun TP</span>
            <span class="setting-desc">Har bir muvaffaqiyatli test uchun beriladigan TP</span>
          </div>
          <input v-model.number="settings.tpPerTest" class="setting-input narrow" type="number" min="0" />
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">Referral bonus (TP)</span>
            <span class="setting-desc">Do'st taklif qilganda beriladigan bonus</span>
          </div>
          <input v-model.number="settings.referralBonus" class="setting-input narrow" type="number" min="0" />
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">Kunlik bonus (TP)</span>
            <span class="setting-desc">Kunlik kirish bonusi</span>
          </div>
          <input v-model.number="settings.dailyBonus" class="setting-input narrow" type="number" min="0" />
        </div>
      </div>

      <!-- Feature Toggles -->
      <div class="settings-section">
        <div class="section-header">
          <i class="fas fa-toggle-on"></i>
          <h4>Funksiyalar (Feature Flags)</h4>
        </div>
        <div v-for="toggle in featureToggles" :key="toggle.key" class="toggle-row">
          <div class="setting-info">
            <span class="setting-label">{{ toggle.label }}</span>
            <span class="setting-desc">{{ toggle.desc }}</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="settings.features[toggle.key]" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="settings-section danger-zone">
        <div class="section-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h4>Xavfli Hudud</h4>
        </div>
        <div class="danger-row">
          <div class="setting-info">
            <span class="setting-label">Barcha natijalarni tozalash</span>
            <span class="setting-desc">Bu amal qaytarilmaydi! Barcha test natijalari o'chadi.</span>
          </div>
          <button class="danger-btn" @click="resetResults">
            <i class="fas fa-trash"></i> Tozalash
          </button>
        </div>
      </div>
    </div>

    <div v-if="saveStatus" :class="['status-msg', saveStatus.type]">{{ saveStatus.message }}</div>
    <div class="save-bar">
      <span class="save-hint">O'zgarishlar hali saqlanmagan</span>
      <button class="save-btn" @click="saveSettings" :disabled="saving">
        <span v-if="!saving"><i class="fas fa-save"></i> Saqlash</span>
        <span v-else class="loader"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import { confirmDelete } from '@/utils/sweetalert';

const toast = useToast();

const saving = ref(false);
const saveStatus = ref(null);
const settings = ref({
  platformName: 'Test.me',
  adminEmail: 'avliyoqulovbaxrom99@gmail.com',
  version: '2.0.0',
  tpPerTest: 10,
  referralBonus: 50,
  dailyBonus: 5,
  features: {
    shopEnabled: true,
    friendsEnabled: true,
    rankingEnabled: true,
    certificatesEnabled: true,
    aiTestEnabled: true,
    maintenanceMode: false,
  }
});

const featureToggles = [
  { key: 'shopEnabled',        label: 'Do\'kon',          desc: 'Foydalanuvchilar uchun shop sahifasini yoqish/o\'chirish' },
  { key: 'friendsEnabled',     label: 'Do\'stlar',        desc: 'Do\'stlar va chat funksiyasini yoqish/o\'chirish' },
  { key: 'rankingEnabled',     label: 'Reytinglar',       desc: 'Rang va reyting tizimini yoqish/o\'chirish' },
  { key: 'certificatesEnabled',label: 'Sertifikatlar',    desc: 'Sertifikat olish imkoniyatini yoqish/o\'chirish' },
  { key: 'aiTestEnabled',      label: 'AI Test Generator',desc: 'AI yordamida test yaratish modulini yoqish/o\'chirish' },
  { key: 'maintenanceMode',    label: 'Texnik Ishlar Rejimi', desc: 'Yoqilsa, foydalanuvchilar kirish imkonidan mahrum bo\'ladi' },
];

const loadSettings = async () => {
  try {
    const snap = await getDoc(doc(db, 'adminSettings', 'global'));
    if (snap.exists()) {
      const data = snap.data();
      settings.value = { ...settings.value, ...data, features: { ...settings.value.features, ...(data.features || {}) } };
    }
  } catch(e) { console.error('Settings load error:', e); }
};

const saveSettings = async () => {
  saving.value = true;
  saveStatus.value = null;
  try {
    await setDoc(doc(db, 'adminSettings', 'global'), settings.value);
    saveStatus.value = { type: 'success', message: 'Sozlamalar muvaffaqiyatli saqlandi!' };
  } catch(e) {
    saveStatus.value = { type: 'error', message: 'Saqlashda xatolik: ' + e.message };
  } finally { saving.value = false; }
};

const resetResults = async () => {
  if (!(await confirmDelete(
    'Barcha natijalarni o\'chirish', 
    'DIQQAT! Barcha test natijalarini o\'chirasizmi? Bu amal qaytarilmaydi!'
  ))) return;

  const code = window.prompt("Tasdiqlash uchun xavfsizlik kodini kiriting:");
  if (code !== "123") {
    toast.error("Xavfsizlik kodi noto'g'ri! O'chirish bekor qilindi.");
    return;
  }

  toast.info("Natijalar o'chirilmoqda, kuting...");
  try {
    const snapshot = await getDocs(collection(db, 'results'));
    
    // Ommaviy o'chirish uchun Promise.all ishlatamiz
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
    
    toast.success("Barcha test natijalari muvaffaqiyatli o'chirildi.");
  } catch (e) {
    toast.error("Xatolik: " + e.message);
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.settings-panel { display: flex; flex-direction: column; gap: 1.25rem; }
.panel-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; display: flex; align-items: center; gap: 10px; }
.panel-title i { color: #64748b; }

.settings-grid { display: flex; flex-direction: column; gap: 1.25rem; }
.settings-section { background: white; border-radius: 20px; padding: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.04); }
.settings-section.danger-zone { border-color: #fecaca; }

.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
.section-header i { color: #3b82f6; font-size: 1.1rem; }
.danger-zone .section-header i { color: #ef4444; }
.section-header h4 { margin: 0; font-size: 1rem; font-weight: 800; color: #0f172a; }

.setting-row, .toggle-row, .danger-row {
  display: flex; justify-content: space-between; align-items: center; padding: 12px 0;
  border-bottom: 1px solid #f8fafc;
}
.setting-row:last-child, .toggle-row:last-child, .danger-row:last-child { border-bottom: none; }

.setting-info { display: flex; flex-direction: column; gap: 3px; }
.setting-label { font-weight: 700; color: #0f172a; font-size: 0.9rem; }
.setting-desc { font-size: 0.8rem; color: #94a3b8; }

.setting-input { padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; transition: 0.2s; min-width: 200px; }
.setting-input.narrow { min-width: 100px; }
.setting-input:focus { border-color: #3b82f6; }

/* Toggle Switch */
.toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #e2e8f0; border-radius: 99px; transition: 0.3s; }
.slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle-switch input:checked + .slider { background: #3b82f6; }
.toggle-switch input:checked + .slider::before { transform: translateX(22px); }

.danger-btn { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
.danger-btn:hover { background: #ef4444; color: white; }

.status-msg { padding: 12px 16px; border-radius: 12px; font-weight: 600; font-size: 0.9rem; }
.status-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.status-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.save-bar { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; background: white; border-radius: 16px; padding: 1rem 1.5rem; border: 1px solid #e2e8f0; }
.save-hint { color: #94a3b8; font-size: 0.85rem; font-weight: 600; }
.save-btn { padding: 12px 24px; border: none; border-radius: 12px; background: #0f172a; color: white; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
.save-btn:hover:not(:disabled) { background: #1e293b; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
