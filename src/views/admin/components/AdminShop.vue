<template>
  <div class="shop-panel">
    <!-- Tab switcher -->
    <div class="tab-bar">
      <button :class="['tab-btn', { active: tab === 'items' }]" @click="tab = 'items'">
        <i class="fas fa-box-open"></i> Shop Mahsulotlari
      </button>
      <button :class="['tab-btn', { active: tab === 'add' }]" @click="tab = 'add'">
        <i class="fas fa-plus-circle"></i> Yangi Mahsulot
      </button>
      <button :class="['tab-btn', { active: tab === 'orders' }]" @click="tab = 'orders'">
        <i class="fas fa-receipt"></i> Buyurtmalar
      </button>
    </div>

    <!-- ITEMS LIST -->
    <div v-if="tab === 'items'">
      <div class="items-toolbar">
        <select v-model="filterRarity" class="select-pill">
          <option value="">Barcha Rarity</option>
          <option value="Common">Common</option>
          <option value="Rare">Rare</option>
          <option value="Epic">Epic</option>
          <option value="Legendary">Legendary</option>
        </select>
        <select v-model="filterType" class="select-pill">
          <option value="">Barcha Tur</option>
          <option value="cosmetic">Cosmetic</option>
          <option value="booster">Booster</option>
          <option value="avatar">Avatar</option>
        </select>
        <button class="icon-btn" @click="loadItems"><i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingItems }"></i></button>
      </div>

      <div v-if="loadingItems" class="items-grid-shimmer">
        <div v-for="i in 8" :key="i" class="item-shimmer"></div>
      </div>

      <div v-else-if="filteredItems.length > 0" class="items-grid">
        <div v-for="item in filteredItems" :key="item.id" class="item-card" :class="'rarity-' + (item.rarity || 'common').toLowerCase()">
          <div class="item-rarity-badge">{{ item.rarity || 'Common' }}</div>
          <div class="item-emoji">{{ item.emoji || '🎁' }}</div>
          <div class="item-info">
            <span class="item-name">{{ item.name || item.id }}</span>
            <span class="item-type">{{ item.type || 'cosmetic' }}</span>
          </div>
          <div class="item-price">{{ (item.minValue || 0).toLocaleString() }} – {{ (item.maxValue || 0).toLocaleString() }} TP</div>
          <div class="item-actions">
            <button class="action-btn edit-btn" @click="editItem(item)"><i class="fas fa-pen"></i></button>
            <button class="action-btn delete-btn" @click="deleteItem(item)"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state-panel">
        <i class="fas fa-store-slash"></i>
        <p>Mahsulotlar topilmadi. "Yangi Mahsulot" bo'limiga o'ting.</p>
      </div>
    </div>

    <!-- ADD / EDIT FORM -->
    <div v-if="tab === 'add'" class="add-form-wrap">
      <div class="add-form-card">
        <h3>{{ editingItem ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\'shish' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Mahsulot ID *</label>
            <input v-model="form.id" placeholder="masalan: avatar_dragon" :disabled="!!editingItem" />
          </div>
          <div class="form-group">
            <label>Nomi *</label>
            <input v-model="form.name" placeholder="Mahsulot nomi" />
          </div>
          <div class="form-group">
            <label>Emoji</label>
            <input v-model="form.emoji" placeholder="🎁" maxlength="4" />
          </div>
          <div class="form-group">
            <label>Tur</label>
            <select v-model="form.type">
              <option value="cosmetic">Cosmetic</option>
              <option value="booster">Booster</option>
              <option value="avatar">Avatar</option>
            </select>
          </div>
          <div class="form-group">
            <label>Rarity</label>
            <select v-model="form.rarity">
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>
          <div class="form-group">
            <label>Min Qiymat (TP)</label>
            <input v-model.number="form.minValue" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>Max Qiymat (TP)</label>
            <input v-model.number="form.maxValue" type="number" min="0" />
          </div>
          <div class="form-group full-span">
            <label>Tavsif</label>
            <textarea v-model="form.description" placeholder="Mahsulot haqida qisqacha..." rows="3"></textarea>
          </div>
        </div>

        <div v-if="formStatus" :class="['status-msg', formStatus.type]">{{ formStatus.message }}</div>
        <div class="form-actions">
          <button v-if="editingItem" class="btn-cancel" @click="cancelEdit">Bekor qilish</button>
          <button class="btn-submit" @click="submitItem" :disabled="savingItem">
            <span v-if="!savingItem">{{ editingItem ? 'Saqlash' : 'Qo\'shish' }}</span>
            <span v-else class="loader"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- ORDERS -->
    <div v-if="tab === 'orders'" class="orders-wrap">
      <div v-if="loadingOrders" class="loading-msg"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
      <div v-else-if="orders.length > 0">
        <table class="orders-table">
          <thead><tr><th>Foydalanuvchi</th><th>Mahsulot</th><th>Miqdor (TP)</th><th>Sana</th></tr></thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.userName || order.userId }}</td>
              <td>{{ order.itemId || order.itemName || '—' }}</td>
              <td><span class="tp-badge">{{ order.amount || 0 }} TP</span></td>
              <td>{{ formatDate(order.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state-panel">
        <i class="fas fa-receipt"></i>
        <p>Buyurtmalar hali yo'q</p>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import { confirmDelete } from '@/utils/sweetalert';

const toast = useToast();

export default {
  name: 'AdminShop',
  data() {
    return {
      tab: 'items',
      allItems: [],
      orders: [],
      filterRarity: '',
      filterType: '',
      loadingItems: true,
      loadingOrders: false,
      savingItem: false,
      editingItem: null,
      formStatus: null,
      form: { id: '', name: '', emoji: '🎁', type: 'cosmetic', rarity: 'Common', minValue: 100, maxValue: 500, description: '' }
    };
  },
  computed: {
    filteredItems() {
      return this.allItems.filter(item => {
        if (this.filterRarity && (item.rarity || 'Common') !== this.filterRarity) return false;
        if (this.filterType && (item.type || 'cosmetic') !== this.filterType) return false;
        return true;
      });
    }
  },
  mounted() { this.loadItems(); },
  watch: {
    tab(val) {
      if (val === 'orders' && !this.orders.length) this.loadOrders();
    }
  },
  methods: {
    formatDate(ts) {
      if (!ts) return '—';
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('uz-UZ');
    },
    async loadItems() {
      this.loadingItems = true;
      try {
        const snap = await getDocs(collection(db, 'shopItems'));
        this.allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch(e) { console.error(e); }
      finally { this.loadingItems = false; }
    },
    async loadOrders() {
      this.loadingOrders = true;
      try {
        const snap = await getDocs(collection(db, 'shopOrders'));
        this.orders = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || 0;
          const tb = b.createdAt?.toMillis?.() || 0;
          return tb - ta;
        });
      } catch(e) { console.error(e); }
      finally { this.loadingOrders = false; }
    },
    editItem(item) {
      this.editingItem = item;
      this.form = { ...item };
      this.tab = 'add';
    },
    cancelEdit() {
      this.editingItem = null;
      this.form = { id: '', name: '', emoji: '🎁', type: 'cosmetic', rarity: 'Common', minValue: 100, maxValue: 500, description: '' };
    },
    async deleteItem(item) {
      if (!(await confirmDelete(
        'Mahsulotni o\'chirish',
        `"${item.name || item.id}" ni o'chirasizmi?`
      ))) return;
      try {
        await deleteDoc(doc(db, 'shopItems', item.id));
        this.allItems = this.allItems.filter(i => i.id !== item.id);
      } catch(e) { alert('Xatolik: ' + e.message); }
    },
    async submitItem() {
      if (!this.form.id || !this.form.name) {
        this.formStatus = { type: 'error', message: 'ID va Nomi majburiy!' };
        return;
      }
      this.savingItem = true;
      this.formStatus = null;
      try {
        const data = { name: this.form.name, emoji: this.form.emoji, type: this.form.type, rarity: this.form.rarity, minValue: this.form.minValue, maxValue: this.form.maxValue, description: this.form.description };
        await setDoc(doc(db, 'shopItems', this.form.id), data);
        this.formStatus = { type: 'success', message: this.editingItem ? 'Muvaffaqiyatli yangilandi!' : 'Yangi mahsulot qo\'shildi!' };
        await this.loadItems();
        if (!this.editingItem) this.cancelEdit();
        else this.editingItem = null;
      } catch(e) {
        this.formStatus = { type: 'error', message: 'Xatolik: ' + e.message };
      } finally { this.savingItem = false; }
    }
  }
}
</script>

<style scoped>
.shop-panel { display: flex; flex-direction: column; gap: 1.25rem; }
.tab-bar { display: flex; gap: 8px; background: #f8fafc; padding: 8px; border-radius: 16px; border: 1px solid #e2e8f0; }
.tab-btn { flex: 1; padding: 10px; border: none; border-radius: 10px; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
.tab-btn.active { background: white; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.tab-btn i { color: #3b82f6; }

.items-toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 1rem; }
.select-pill { padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; outline: none; background: white; font-weight: 600; cursor: pointer; }
.icon-btn { padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; cursor: pointer; font-size: 0.9rem; color: #64748b; transition: 0.2s; }
.icon-btn:hover { border-color: #3b82f6; color: #3b82f6; }

.items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.item-card { background: white; border-radius: 16px; padding: 1.25rem; border: 2px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; position: relative; transition: 0.3s; }
.item-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); }

.rarity-common { border-color: #e2e8f0; }
.rarity-rare { border-color: #3b82f6; box-shadow: 0 0 0 1px #bfdbfe; }
.rarity-epic { border-color: #8b5cf6; box-shadow: 0 0 0 1px #ddd6fe; }
.rarity-legendary { border-color: #f59e0b; box-shadow: 0 0 0 1px #fde68a; }

.item-rarity-badge { position: absolute; top: 10px; right: 10px; font-size: 0.65rem; font-weight: 800; padding: 3px 8px; border-radius: 99px; background: #f1f5f9; color: #64748b; }
.rarity-rare .item-rarity-badge { background: #eff6ff; color: #2563eb; }
.rarity-epic .item-rarity-badge { background: #f5f3ff; color: #7c3aed; }
.rarity-legendary .item-rarity-badge { background: #fefce8; color: #d97706; }

.item-emoji { font-size: 3rem; line-height: 1; }
.item-info { display: flex; flex-direction: column; gap: 2px; }
.item-name { font-weight: 800; color: #0f172a; font-size: 0.95rem; }
.item-type { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.item-price { font-size: 0.8rem; color: #64748b; font-weight: 700; }
.item-actions { display: flex; gap: 8px; }

.action-btn { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: 0.2s; }
.edit-btn { background: #fefce8; color: #ca8a04; }
.edit-btn:hover { background: #eab308; color: white; }
.delete-btn { background: #fef2f2; color: #ef4444; }
.delete-btn:hover { background: #ef4444; color: white; }

.items-grid-shimmer { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.item-shimmer { height: 220px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 16px; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.empty-state-panel { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #94a3b8; gap: 10px; text-align: center; }
.empty-state-panel i { font-size: 3rem; color: #e2e8f0; }

.add-form-wrap { display: flex; justify-content: center; }
.add-form-card { background: white; border-radius: 20px; padding: 2rem; border: 1px solid #f1f5f9; width: 100%; max-width: 700px; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.04); }
.add-form-card h3 { font-size: 1.2rem; color: #0f172a; margin: 0 0 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.full-span { grid-column: 1 / -1; }
.form-group label { font-weight: 700; color: #374151; font-size: 0.85rem; }
.form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; outline: none; transition: 0.2s; font-family: inherit; resize: none; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; }

.status-msg { padding: 12px 16px; border-radius: 12px; font-weight: 600; font-size: 0.9rem; margin-top: 1rem; }
.status-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.status-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem; }
.btn-cancel { padding: 12px 24px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-submit { padding: 12px 28px; border: none; border-radius: 12px; background: #3b82f6; color: white; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
.btn-submit:hover:not(:disabled) { background: #2563eb; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.orders-table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; }
.orders-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
.orders-table td { padding: 14px 16px; border-top: 1px solid #f8fafc; font-size: 0.9rem; }
.tp-badge { background: #eff6ff; color: #2563eb; font-size: 0.8rem; font-weight: 800; padding: 4px 10px; border-radius: 99px; }
.loading-msg { color: #64748b; font-size: 1rem; padding: 2rem; text-align: center; }
</style>
