<template>
  <div class="shop-manager">
    <div class="header">
      <h3><i class="fas fa-box-open"></i> Case Manager</h3>
      <p>Manage mystery cases, drop rates, and specific items inside them.</p>
      
      <button @click="seedDatabase" class="seed-btn" :disabled="loading">
        <i class="fas fa-magic"></i> Seed 10 Default Cases
      </button>
      <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
    </div>

    <!-- Case List -->
    <div v-if="!selectedBox" class="cases-view">
      <div class="boxes-grid">
        <!-- New Box Form Card -->
        <div class="box-card new-box" @click="createNewBox">
          <i class="fas fa-plus"></i>
          <h4>Create New Case</h4>
        </div>
        
        <!-- Existing Boxes -->
        <div v-for="box in boxes" :key="box.id" class="box-card" @click="selectBox(box)">
          <div class="box-visual" v-html="box.svg"></div>
          <h4>{{ box.name }}</h4>
          <p class="price"><i class="fas fa-coins"></i> {{ box.price }} TP</p>
          <p class="item-count">{{ (box.items || []).length }} Items</p>
          <button @click.stop="deleteBox(box.id)" class="btn-delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>

    <!-- Single Case Manager -->
    <div v-else class="case-detail-view">
      <div class="detail-header">
        <button @click="selectedBox = null" class="btn-back"><i class="fas fa-arrow-left"></i> Back</button>
        <h3>Editing: {{ selectedBox.name || 'New Case' }}</h3>
        <button @click="saveBox" class="btn-save"><i class="fas fa-save"></i> Save Case</button>
      </div>

      <div class="case-forms">
        <!-- Case Info -->
        <div class="form-section">
          <h4>Case Details</h4>
          <div class="form-group">
            <label>Case Name</label>
            <input v-model="selectedBox.name" placeholder="e.g. Dragon Case" />
          </div>
          <div class="form-group">
            <label>Price (TP)</label>
            <input type="number" v-model.number="selectedBox.price" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input v-model="selectedBox.description" />
          </div>
          <div class="form-group">
            <label>Theme Color (Hex)</label>
            <input v-model="selectedBox.color" placeholder="#ff0000" />
          </div>
          <div class="form-group">
            <label>Box SVG Code</label>
            <textarea v-model="selectedBox.svg" rows="3"></textarea>
          </div>
          
          <h4>Drop Rates (%)</h4>
          <div class="drop-rates-inputs">
            <div class="form-group"><label>Common</label><input type="number" v-model.number="selectedBox.drops.common" /></div>
            <div class="form-group"><label>Rare</label><input type="number" v-model.number="selectedBox.drops.rare" /></div>
            <div class="form-group"><label>Epic</label><input type="number" v-model.number="selectedBox.drops.epic" /></div>
            <div class="form-group"><label>Legendary</label><input type="number" v-model.number="selectedBox.drops.legendary" /></div>
          </div>
        </div>

        <!-- Case Items -->
        <div class="form-section">
          <h4>Items inside this Case</h4>
          
          <div class="items-list">
            <div v-for="(item, index) in selectedBox.items" :key="index" class="item-row" :class="item.rarity">
              <div class="item-preview" v-html="item.svg"></div>
              <div class="item-info">
                <strong>{{ item.name }}</strong>
                <span>{{ item.type }} - {{ item.rarity }}</span>
              </div>
              <button @click="removeItem(index)" class="btn-delete"><i class="fas fa-times"></i></button>
            </div>
          </div>

          <!-- Add Item Form -->
          <div class="add-item-form">
            <h5>Add New Item to Case</h5>
            <div class="form-group">
              <input v-model="newItem.name" placeholder="Item Name" />
            </div>
            <div class="split">
              <select v-model="newItem.type">
                <option value="frame">Frame</option>
                <option value="badge">Badge</option>
              </select>
              <select v-model="newItem.rarity">
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            <textarea v-model="newItem.svg" placeholder="SVG Code..." rows="2"></textarea>
            <button @click="addItem" class="btn-add"><i class="fas fa-plus"></i> Add to Case</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { starterBoxes } from '@/config/shopSeedData';

export default {
  data() {
    return {
      boxes: [],
      loading: false,
      successMsg: '',
      selectedBox: null,
      newItem: {
        id: '',
        name: '',
        type: 'frame',
        rarity: 'common',
        svg: ''
      }
    };
  },
  mounted() {
    this.fetchBoxes();
  },
  methods: {
    async fetchBoxes() {
      try {
        const snap = await getDocs(collection(db, 'shop_boxes'));
        this.boxes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => a.price - b.price);
      } catch (err) {
        console.error("Error fetching boxes", err);
      }
    },
    createNewBox() {
      this.selectedBox = {
        name: '',
        price: 100,
        description: '',
        color: '#94a3b8',
        svg: '',
        drops: { common: 60, rare: 30, epic: 10, legendary: 0 },
        items: []
      };
    },
    selectBox(box) {
      // Deep copy to allow editing without mutating original list until save
      this.selectedBox = JSON.parse(JSON.stringify(box));
    },
    addItem() {
      if (!this.newItem.name || !this.newItem.svg) return;
      const id = Date.now().toString(); // unique enough for local items
      this.selectedBox.items.push({ ...this.newItem, id });
      this.newItem = { id: '', name: '', type: 'frame', rarity: 'common', svg: '' };
    },
    removeItem(index) {
      this.selectedBox.items.splice(index, 1);
    },
    async saveBox() {
      this.loading = true;
      try {
        if (this.selectedBox.id) {
          await updateDoc(doc(db, 'shop_boxes', this.selectedBox.id), this.selectedBox);
        } else {
          await addDoc(collection(db, 'shop_boxes'), this.selectedBox);
        }
        this.successMsg = "Case saved successfully!";
        this.selectedBox = null;
        await this.fetchBoxes();
        setTimeout(() => this.successMsg = '', 3000);
      } catch (err) {
        alert("Error saving box: " + err.message);
      } finally {
        this.loading = false;
      }
    },
    async deleteBox(id) {
      if (!confirm("Are you sure you want to delete this case completely?")) return;
      await deleteDoc(doc(db, 'shop_boxes', id));
      await this.fetchBoxes();
    },
    async seedDatabase() {
      if (!confirm("This will add the 10 starter Cases. Proceed?")) return;
      this.loading = true;
      try {
        for (const box of starterBoxes) {
          await addDoc(collection(db, 'shop_boxes'), box);
        }
        this.successMsg = "10 Starter Cases generated!";
        await this.fetchBoxes();
        setTimeout(() => this.successMsg = '', 3000);
      } catch (err) {
        console.error(err);
        alert("Failed to seed DB.");
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.shop-manager { padding: 20px; font-family: 'Plus Jakarta Sans', sans-serif; }
.header { margin-bottom: 25px; }
.seed-btn { margin-top: 10px; background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.success-msg { color: #10b981; font-weight: bold; margin-top: 10px; }

.boxes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.box-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; position: relative; }
.box-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.box-visual { width: 80px; height: 80px; margin: 0 auto 10px; }
.box-visual :deep(svg) { width: 100%; height: 100%; }
.new-box { display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; color: #94a3b8; border-style: dashed; }
.new-box i { font-size: 2rem; margin-bottom: 10px; }
.item-count { font-size: 0.85rem; color: #64748b; }
.btn-delete { position: absolute; top: 10px; right: 10px; background: #fee2e2; color: #ef4444; border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; }

.case-detail-view { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
.btn-back { background: #f1f5f9; border: none; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-save { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }

.case-forms { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.form-section h4 { margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }

.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
.form-group label { font-weight: bold; font-size: 0.85rem; color: #475569; }
input, select, textarea { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; }

.drop-rates-inputs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }

.items-list { display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto; margin-bottom: 20px; }
.item-row { display: flex; align-items: center; gap: 15px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
.item-row.common { border-left: 4px solid #94a3b8; }
.item-row.rare { border-left: 4px solid #3b82f6; }
.item-row.epic { border-left: 4px solid #a855f7; }
.item-row.legendary { border-left: 4px solid #f59e0b; }

.item-preview { width: 40px; height: 40px; }
.item-preview :deep(svg) { width: 100%; height: 100%; }
.item-info { flex-grow: 1; display: flex; flex-direction: column; }
.item-info span { font-size: 0.8rem; color: #64748b; text-transform: capitalize; }

.add-item-form { background: #f8fafc; padding: 15px; border-radius: 12px; }
.add-item-form h5 { margin-top: 0; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
.btn-add { background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 10px; }
</style>
