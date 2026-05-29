<template>
  <div class="inventory-wrapper">
    <!-- Glowing background blobs matching the premium theme -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="inventory-container">
      <!-- Hero Header Section -->
      <div class="inventory-hero">
        <h1 class="inventory-title">
          <span class="gradient-text"><i class="fas fa-box-open"></i> {{ t('inventory') || 'My Inventory' }}</span>
        </h1>
        <p class="inventory-subtitle">
          {{ currentLocale === 'RUS' ? 'Экипируйте косметические предметы, продавайте дубликаты или дарите друзьям.' : 'Profil elementlarini taqing, nusxalarni soting yoki do\'stlaringizga sovg\'a qiling.' }}
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
            <i class="fas fa-border-all"></i> {{ currentLocale === 'RUS' ? 'Все предметы' : 'Barcha' }}
          </button>
          <button :class="{ active: activeFilter === 'frame' }" @click="activeFilter = 'frame'">
            <i class="fas fa-circle-notch"></i> {{ currentLocale === 'RUS' ? 'Рамки Аватара' : 'Avatar ramkalari' }}
          </button>
          <button :class="{ active: activeFilter === 'badge' }" @click="activeFilter = 'badge'">
            <i class="fas fa-shield-alt"></i> {{ currentLocale === 'RUS' ? 'Значки Профиля' : 'Profil nishonlari' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="state-card">
        <div class="spinner"></div>
        <p class="state-text">{{ currentLocale === 'RUS' ? 'Загрузка инвентаря...' : 'Inventar yuklanmoqda...' }}</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredItems.length === 0" class="state-card empty-state">
        <div class="state-icon error-icon">
          <i class="fas fa-box-open"></i>
        </div>
        <h3 class="state-title">{{ currentLocale === 'RUS' ? 'Ваш инвентарь пуст' : 'Inventaringiz bo\'sh' }}</h3>
        <p class="state-text">{{ currentLocale === 'RUS' ? 'Откройте коробки в магазине, чтобы получить новые предметы!' : 'Yangi narsalar olish uchun do\'konda qutilarni oching!' }}</p>
        <router-link to="/shop" class="premium-btn">
          <i class="fas fa-store"></i> {{ currentLocale === 'RUS' ? 'В магазин' : 'Do\'konga o\'tish' }}
        </router-link>
      </div>
      
      <!-- Items Grid -->
      <div v-else class="inventory-grid">
        <div 
          v-for="item in filteredItems" 
          :key="item.docId" 
          class="item-card" 
          :class="[item.rarity, { equipped: isEquipped(item) }]"
        >
          <div class="equipped-badge" v-if="isEquipped(item)">
            <i class="fas fa-check-circle"></i> {{ currentLocale === 'RUS' ? 'Экипировано' : 'Taqilgan' }}
          </div>
          
          <div class="item-preview-wrapper" :class="item.rarity + '-bg'">
            <div class="item-preview" v-html="item.svg"></div>
          </div>
          
          <div class="item-info">
            <span :class="['rarity-pill', item.rarity]">{{ item.rarity }}</span>
            <h4 class="item-name">{{ item.name }}</h4>
          </div>

          <div class="item-actions">
            <button v-if="!isEquipped(item)" @click="equipItem(item)" class="action-btn equip-btn">
              <i class="fas fa-user-plus"></i> {{ currentLocale === 'RUS' ? 'Экипировать' : 'Taqish' }}
            </button>
            <button v-else @click="unequipItem(item)" class="action-btn unequip-btn">
              <i class="fas fa-user-minus"></i> {{ currentLocale === 'RUS' ? 'Снять' : 'Yechish' }}
            </button>
            
            <button class="action-btn sell-btn" @click="sellItem(item)" :title="currentLocale === 'RUS' ? `Продать системе за ${getItemPrice(item)} TP` : `Tizimga ${getItemPrice(item)} TP ga sotish`">
              <i class="fas fa-coins"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { useI18n } from '@/utils/i18n';
import { cosmetics } from '@/utils/cosmetics';

export default {
  name: 'InventoryPage',
  setup() {
    const { locale: currentLocale, t } = useI18n();
    
    const inventory = ref([]);
    const loading = ref(true);
    const activeFilter = ref('all');
    const equippedFrame = ref(null);
    const equippedBadge = ref(null);
    let unsubInv = null;
    let unsubUser = null;

    const filteredItems = computed(() => {
      if (activeFilter.value === 'all') return inventory.value;
      return inventory.value.filter(i => i.type === activeFilter.value);
    });

    const fetchInventory = (uid) => {
      const invRef = collection(db, 'users', uid, 'inventory');
      unsubInv = onSnapshot(invRef, (snap) => {
        inventory.value = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        loading.value = false;
      }, (error) => {
        console.error("Error fetching inventory:", error);
        loading.value = false;
      });
    };

    const fetchUserPrefs = (uid) => {
      const userRef = doc(db, 'users', uid);
      unsubUser = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          equippedFrame.value = data.equippedFrame || null;
          equippedBadge.value = data.equippedBadge || null;
        }
      });
    };

    onMounted(() => {
      const auth = getAuth();
      auth.onAuthStateChanged(user => {
        if (user) {
          fetchInventory(user.uid);
          fetchUserPrefs(user.uid);
        } else {
          loading.value = false;
        }
      });
    });

    onUnmounted(() => {
      if (unsubInv) unsubInv();
      if (unsubUser) unsubUser();
    });

    const isEquipped = (item) => {
      if (item.type === 'frame') return equippedFrame.value === item.docId;
      if (item.type === 'badge') return equippedBadge.value === item.docId;
      return false;
    };

    const getItemPrice = (item) => {
      const originalItem = cosmetics.find(c => c.id === item.itemId);
      return originalItem ? originalItem.price : 10;
    };

    const equipItem = async (item) => {
      try {
        const auth = getAuth();
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const updateData = {};
        if (item.type === 'frame') updateData.equippedFrame = item.docId;
        if (item.type === 'badge') updateData.equippedBadge = item.docId;
        await updateDoc(userRef, updateData);
      } catch (e) {
        console.error("Error equipping item:", e);
      }
    };

    const unequipItem = async (item) => {
      try {
        const auth = getAuth();
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const updateData = {};
        if (item.type === 'frame') updateData.equippedFrame = null;
        if (item.type === 'badge') updateData.equippedBadge = null;
        await updateDoc(userRef, updateData);
      } catch (e) {
        console.error("Error unequipping item:", e);
      }
    };

    const sellItem = async (item) => {
      const price = getItemPrice(item);
      const confirmMsg = currentLocale.value === 'RUS' 
        ? `Вы уверены, что хотите продать ${item.name} за ${price} TP?` 
        : `Rostdan ham ${item.name} ni ${price} TP ga sotmoqchimisiz?`;
        
      if (!confirm(confirmMsg)) return;
      
      try {
        const auth = getAuth();
        const uid = auth.currentUser.uid;
        
        if (isEquipped(item)) {
          await unequipItem(item);
        }
        
        await deleteDoc(doc(db, 'users', uid, 'inventory', item.docId));
        await updateDoc(doc(db, 'users', uid), {
          points: increment(price)
        });
      } catch (e) {
        console.error("Error selling item:", e);
      }
    };

    return {
      t,
      currentLocale,
      inventory,
      loading,
      activeFilter,
      filteredItems,
      isEquipped,
      getItemPrice,
      equipItem,
      unequipItem,
      sellItem
    };
  }
};
</script>

<style scoped>
.inventory-wrapper {
  position: relative;
  min-height: 90vh;
  padding: 3rem 1.5rem;
  overflow: hidden;
  background: #f8fafc;
  font-family: 'Outfit', 'Inter', sans-serif;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
}

.glow-bg-1 {
  top: 5%;
  left: 5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #3b82f6 0%, #60a5fa 100%);
}

.glow-bg-2 {
  bottom: 5%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #10b981 0%, #34d399 100%);
}

.inventory-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.inventory-hero {
  text-align: center;
}

.inventory-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
  margin: 0 0 0.5rem 0;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.inventory-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

.tabs-container {
  display: flex;
  justify-content: center;
}

.tabs {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  gap: 0.5rem;
}

.tabs button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #64748b;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

.tabs button:hover {
  background: rgba(241, 245, 249, 0.8);
  color: #334155;
}

.tabs button.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.state-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.02);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.state-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #94a3b8;
  box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.05);
}

.state-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.state-text {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
}

.premium-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 0.9rem 1.8rem;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 8px 20px -4px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
}

.premium-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -4px rgba(59, 130, 246, 0.5);
}

/* Grid */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 1.5rem;
  text-align: center;
  position: relative;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);
  overflow: hidden;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px -10px rgba(15, 23, 42, 0.08);
}

.item-card.common { border-top: 4px solid #94a3b8; }
.item-card.rare { border-top: 4px solid #3b82f6; }
.item-card.epic { border-top: 4px solid #a855f7; }
.item-card.legendary { border-top: 4px solid #f59e0b; }

.item-card.equipped {
  border: 2px solid #10b981;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.2);
}

.equipped-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
  z-index: 2;
}

.item-preview-wrapper {
  width: 120px;
  height: 120px;
  margin: 1.5rem auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.item-card:hover .item-preview-wrapper {
  transform: scale(1.05);
}

.item-preview-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0.2;
  z-index: 0;
}

.common-bg::before { background: #94a3b8; }
.rare-bg::before { background: #3b82f6; }
.epic-bg::before { background: #a855f7; }
.legendary-bg::before { background: #f59e0b; }

.item-preview {
  width: 80px;
  height: 80px;
  z-index: 1;
}

.item-preview :deep(svg) {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.item-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 1.5rem;
}

.rarity-pill {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 12px;
}

.rarity-pill.common { background: #f1f5f9; color: #64748b; }
.rarity-pill.rare { background: #eff6ff; color: #3b82f6; }
.rarity-pill.epic { background: #faf5ff; color: #a855f7; }
.rarity-pill.legendary { background: #fffbeb; color: #d97706; }

.item-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 0.8rem 0.5rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.equip-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.equip-btn:hover {
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.unequip-btn {
  background: #f1f5f9;
  color: #475569;
}

.unequip-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.sell-btn {
  flex: 0 0 auto;
  width: 44px;
  background: #fee2e2;
  color: #ef4444;
}

.sell-btn span {
  display: none;
}

.sell-btn:hover {
  background: #fecaca;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .inventory-wrapper {
    padding: 2rem 1rem;
  }
  
  .inventory-title {
    font-size: 2.2rem;
  }
  
  .tabs {
    flex-direction: column;
    width: 100%;
  }
  
  .tabs button {
    width: 100%;
    justify-content: center;
  }
}
</style>
