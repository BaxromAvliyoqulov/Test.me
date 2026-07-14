<template>
  <div class="notifications-panel">
    <div class="toolbar">
      <h3 class="panel-title"><i class="fas fa-bell"></i> Bildirishnoma Yuborish</h3>
      <button class="ai-magic-btn" @click="showAIPrompt = true">
        <i class="fas fa-wand-magic-sparkles"></i> AI Bilan Yozish
      </button>
    </div>

    <!-- AI Prompt Modal -->
    <div v-if="showAIPrompt" class="modal-overlay">
      <div class="modal-card">
        <h3>✨ AI Yordamida Bildirishnoma Yozish</h3>
        <p>Qanday mavzuda xabar yozmoqchisiz? Qisqacha kiriting, AI sizga chiroyli va ta'sirchan matn yaratib beradi.</p>
        <div class="form-group">
          <input v-model="aiTopic" placeholder="Masalan: Bahorgi chegirmalar, yangi testlar qo'shildi..." @keyup.enter="generateWithAI" />
        </div>
        <div v-if="aiError" class="status-msg error">{{ aiError }}</div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showAIPrompt = false" :disabled="aiLoading">Bekor qilish</button>
          <button class="btn-submit" @click="generateWithAI" :disabled="aiLoading || !aiTopic.trim()">
            <span v-if="aiLoading"><i class="fas fa-spinner fa-spin"></i> Yozilmoqda...</span>
            <span v-else><i class="fas fa-magic"></i> Yaratish</span>
          </button>
        </div>
      </div>
    </div>

    <div class="notif-grid">
      <!-- Send Notification Form -->
      <div class="notif-form-card">
        <h4>Yangi Bildirishnoma</h4>
        
        <div class="form-group">
          <label>Sarlavha *</label>
          <input v-model="form.title" placeholder="Bildirishnoma sarlavhasi..." />
        </div>
        
        <div class="form-group">
          <div class="label-with-action">
            <label>Xabar *</label>
            <button v-if="form.body" class="translate-btn" @click="translateToRu" :disabled="translating">
               <i class="fas fa-language" :class="{'fa-spin': translating}"></i> Rus tiliga o'girish
            </button>
          </div>
          <textarea v-model="form.body" rows="5" placeholder="Xabar matni..."></textarea>
        </div>
        
        <div class="form-group">
          <label>Tur</label>
          <select v-model="form.type">
            <option value="info">📢 Ma'lumot</option>
            <option value="success">✅ Muvaffaqiyat</option>
            <option value="warning">⚠️ Ogohlantirish</option>
            <option value="update">🆕 Yangilik</option>
            <option value="promo">🎁 Aksiya</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Maqsad auditoriya</label>
          <select v-model="form.target">
            <option value="all">Barcha foydalanuvchilar</option>
            <option value="active">Faol foydalanuvchilar (>100 TP)</option>
            <option value="new">Yangi foydalanuvchilar (0 TP)</option>
          </select>
        </div>
        
        <div v-if="status" :class="['status-msg', status.type]">{{ status.message }}</div>
        
        <button class="btn-submit" @click="sendNotification" :disabled="sending">
          <span v-if="!sending"><i class="fas fa-paper-plane"></i> Yuborish</span>
          <span v-else class="loader"></span>
        </button>
      </div>

      <!-- Notification History -->
      <div class="notif-history-card">
        <div class="history-header">
          <h4>Yuborilgan Bildirishnomalar</h4>
          <button class="refresh-btn" @click="loadHistory"><i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingHistory }"></i></button>
        </div>
        <div v-if="loadingHistory" class="loading-msg"><i class="fas fa-spinner fa-spin"></i></div>
        <div v-else-if="history.length > 0" class="history-list">
          <div v-for="notif in history" :key="notif.id" :class="['history-item', 'type-' + notif.type]">
            <div class="notif-type-icon">{{ typeEmoji(notif.type) }}</div>
            <div class="notif-content">
              <span class="notif-title">{{ notif.title }}</span>
              <span class="notif-body">{{ notif.body }}</span>
              <div class="notif-meta">
                <span>{{ formatDate(notif.createdAt) }}</span>
                <span class="notif-target-badge">{{ notif.target === 'all' ? 'Barchaga' : notif.target }}</span>
              </div>
            </div>
            <button class="delete-notif" @click="deleteNotification(notif)"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div v-else class="empty-history">
          <i class="fas fa-bell-slash"></i>
          <p>Hali bildirishnomalar yo'q</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import { confirmDelete } from '@/utils/sweetalert';
import { GoogleGenerativeAI } from '@google/generative-ai';

const toast = useToast();

export default {
  name: 'AdminNotifications',
  data() {
    return {
      form: { title: '', body: '', type: 'info', target: 'all' },
      sending: false,
      status: null,
      history: [],
      loadingHistory: false,
      
      // AI States
      showAIPrompt: false,
      aiTopic: '',
      aiLoading: false,
      aiError: null,
      translating: false
    };
  },
  mounted() { 
    this.loadHistory(); 
  },
  methods: {
    typeEmoji(type) {
      const map = { info: '📢', success: '✅', warning: '⚠️', update: '🆕', promo: '🎁' };
      return map[type] || '📢';
    },
    formatDate(ts) {
      if (!ts) return '';
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString('uz-UZ');
    },
    async initAI() {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY .env faylida topilmadi.");
      }
      return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-1.5-flash" });
    },
    async generateWithAI() {
      if(!this.aiTopic.trim()) return;
      this.aiLoading = true;
      this.aiError = null;
      try {
        const model = await this.initAI();
        const prompt = `Sen o'quv platformasi administratori uchun bildirishnoma yozib beruvchi sun'iy intellektsan.
Mavzu: "${this.aiTopic}"
Foydalanuvchilarga yuborish uchun qiziqarli, emojilar bilan boyitilgan, qisqa va lo'nda matn tuzib ber.
Iltimos, javobingni aynan shu JSON formatda qaytar (boshqa gaplarsiz):
{"title": "Sarlavha", "body": "Asosiy matn", "type": "info, success, warning, update yoki promo"}`;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Clean up formatting if AI returned markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        
        this.form.title = parsed.title;
        this.form.body = parsed.body;
        if(['info','success','warning','update','promo'].includes(parsed.type)) {
          this.form.type = parsed.type;
        }
        
        this.showAIPrompt = false;
        this.aiTopic = '';
      } catch (err) {
        console.error(err);
        this.aiError = err.message.includes('API_KEY') ? "API kalit kiritilmagan!" : "AI xato qildi, qayta urinib ko'ring.";
      } finally {
        this.aiLoading = false;
      }
    },
    async translateToRu() {
      if(!this.form.body.trim()) return;
      this.translating = true;
      try {
        const model = await this.initAI();
        const prompt = `Quyidagi bildirishnoma matnini ma'nosini saqlagan holda va emojilarni joyida qoldirib, rus tiliga tarjima qilib ber. Faqat tarjima qilingan matnni o'zini qaytar.
Matn: "${this.form.body}"`;
        
        const result = await model.generateContent(prompt);
        const translated = result.response.text().trim();
        
        // Update both title and body to bilingual or just Russian
        // Let's make it bilingual for better UX
        this.form.body = this.form.body + "\n\n" + translated;
      } catch(err) {
        console.error(err);
        alert("Tarjimada xatolik: " + err.message);
      } finally {
        this.translating = false;
      }
    },
    async loadHistory() {
      this.loadingHistory = true;
      try {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        this.history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch(e) {
        try {
          const snap = await getDocs(collection(db, 'notifications'));
          this.history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch(err) { console.error(err); }
      } finally { this.loadingHistory = false; }
    },
    async sendNotification() {
      if (!this.form.title.trim() || !this.form.body.trim()) {
        this.status = { type: 'error', message: 'Sarlavha va xabar matni majburiy!' };
        return;
      }
      this.sending = true;
      this.status = null;
      try {
        await addDoc(collection(db, 'notifications'), {
          title: this.form.title,
          body: this.form.body,
          type: this.form.type,
          target: this.form.target,
          createdAt: serverTimestamp(),
          read: false,
        });
        this.status = { type: 'success', message: 'Bildirishnoma muvaffaqiyatli yuborildi!' };
        this.form = { title: '', body: '', type: 'info', target: 'all' };
        await this.loadHistory();
      } catch(e) {
        this.status = { type: 'error', message: 'Xatolik: ' + e.message };
      } finally { this.sending = false; }
    },
    async deleteNotification(notif) {
      if (!(await confirmDelete('O\'chirish', 'Bu bildirishnomani o\'chirasizmi?'))) return;
      try {
        await deleteDoc(doc(db, 'notifications', notif.id));
        this.history = this.history.filter(n => n.id !== notif.id);
        toast.success("Bildirishnoma o'chirildi");
      } catch(e) { toast.error('Xatolik: ' + e.message); }
    }
  }
}
</script>

<style scoped>
.notifications-panel { display: flex; flex-direction: column; gap: 1.25rem; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.panel-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
.panel-title i { color: #f59e0b; }

.ai-magic-btn {
  background: linear-gradient(135deg, #8b5cf6, #d946ef);
  color: white; border: none; padding: 10px 18px; border-radius: 12px;
  font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); transition: 0.2s;
}
.ai-magic-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5); }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-card { background: white; padding: 2rem; border-radius: 20px; width: 90%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.modal-card h3 { margin: 0 0 10px; font-weight: 800; color: #0f172a; }
.modal-card p { color: #64748b; font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel { padding: 10px 16px; background: #f1f5f9; color: #64748b; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-cancel:hover { background: #e2e8f0; }

.notif-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
@media (max-width: 800px) { .notif-grid { grid-template-columns: 1fr; } }

.notif-form-card, .notif-history-card { background: white; border-radius: 20px; padding: 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.04); }
h4 { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 1.25rem; }

.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-weight: 700; color: #374151; font-size: 0.85rem; margin-bottom: 6px; }

.label-with-action { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; }
.label-with-action label { margin-bottom: 0; }
.translate-btn { background: transparent; border: none; color: #3b82f6; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; transition: 0.2s; }
.translate-btn:hover { color: #2563eb; text-decoration: underline; }
.translate-btn:disabled { color: #94a3b8; cursor: not-allowed; text-decoration: none; }

.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; outline: none; transition: 0.2s; font-family: inherit; resize: none; box-sizing: border-box; background: #f8fafc; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #f59e0b; background: white; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1); }

.status-msg { padding: 10px 14px; border-radius: 10px; font-weight: 600; font-size: 0.85rem; margin-bottom: 1rem; }
.status-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.status-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.btn-submit { width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: 800; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.loader { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.refresh-btn { background: #f1f5f9; border: none; color: #64748b; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.refresh-btn:hover { background: #e2e8f0; color: #0f172a; }

.history-list { display: flex; flex-direction: column; gap: 10px; max-height: 500px; overflow-y: auto; padding-right: 5px; }
.history-list::-webkit-scrollbar { width: 5px; }
.history-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.history-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border-radius: 14px; border: 1px solid #f1f5f9; position: relative; transition: 0.2s; }
.history-item:hover { background: #f8fafc; }
.type-info { border-left: 4px solid #3b82f6; }
.type-success { border-left: 4px solid #10b981; }
.type-warning { border-left: 4px solid #f59e0b; }
.type-update { border-left: 4px solid #8b5cf6; }
.type-promo { border-left: 4px solid #ec4899; }

.notif-type-icon { font-size: 1.4rem; flex-shrink: 0; background: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.notif-content { flex: 1; }
.notif-title { display: block; font-weight: 800; color: #0f172a; font-size: 0.95rem; margin-bottom: 6px; }
.notif-body { display: block; font-size: 0.85rem; color: #475569; margin-bottom: 10px; line-height: 1.5; white-space: pre-wrap; }
.notif-meta { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #94a3b8; }
.notif-target-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 99px; font-weight: 700; color: #64748b; }
.delete-notif { background: #fef2f2; border: none; color: #ef4444; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; flex-shrink: 0; transition: 0.2s; opacity: 0; }
.history-item:hover .delete-notif { opacity: 1; }
.delete-notif:hover { background: #ef4444; color: white; }

.empty-history { display: flex; flex-direction: column; align-items: center; padding: 4rem 1rem; color: #94a3b8; gap: 12px; }
.empty-history i { font-size: 3rem; color: #e2e8f0; }
.loading-msg { text-align: center; color: #94a3b8; padding: 3rem; font-size: 1.2rem; display: flex; flex-direction: column; gap: 10px; }
</style>
