<template>
  <div class="shop-container">
    <div class="glow-bg glow-1"></div>
    <div class="glow-bg glow-2"></div>

    <div class="shop-header">
      <div class="header-content">
        <h2><i class="fas fa-store"></i> TP Coin Shop</h2>
        <p>Purchase mystery boxes or buy cosmetics directly!</p>
      </div>
      <div class="user-balance">
        <img src="@/assets/img/tpCoin.png" class="coin-icon" alt="TP" />
        <span class="balance-amount">{{ userPoints }}</span>
      </div>
    </div>
    
    <div class="shop-tabs">
      <button :class="{ active: activeTab === 'boxes' }" @click="activeTab = 'boxes'">Mystery Boxes</button>
      <button :class="{ active: activeTab === 'frames' }" @click="activeTab = 'frames'">Frames</button>
      <button :class="{ active: activeTab === 'badges' }" @click="activeTab = 'badges'">Badges</button>
    </div>

    <!-- Inspect Modal -->
    <transition name="fade">
      <div v-if="inspectingBox" class="inspect-modal" @click.self="inspectingBox = null">
        <div class="modal-content inspect-content">
          <div class="inspect-header">
            <h3>{{ inspectingBox.name }} - Contents</h3>
            <button @click="inspectingBox = null" class="close-btn"><i class="fas fa-times"></i></button>
          </div>
          <div v-if="!inspectingBox.items || inspectingBox.items.length === 0" class="empty-case">
            No specific items in this case yet.
          </div>
          <div class="inspect-items">
            <div v-for="item in inspectingBox.items" :key="item.id" class="inspect-item-card" :class="item.rarity">
              <div class="item-preview" v-html="item.svg"></div>
              <div class="item-info">
                <strong>{{ item.name }}</strong>
                <span>{{ item.rarity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Lootbox Opening Modal -->
    <transition name="fade">
      <div v-if="openingBox" class="lootbox-modal">
        <div class="modal-content" :class="{ 'shake': isShaking }">
          <div v-if="!droppedItem" class="box-animation-container">
            <i class="fas fa-box-open box-icon pulse"></i>
            <h3>Opening {{ selectedBox?.name }}...</h3>
          </div>
          <div v-else class="drop-reveal" :class="droppedItem.rarity">
            <h3 class="rarity-title">{{ droppedItem.rarity.toUpperCase() }} DROP!</h3>
            <div class="item-preview" v-html="droppedItem.svg"></div>
            <h4>{{ droppedItem.name }}</h4>
            <div class="actions">
              <button class="btn-keep" @click="keepItem">Keep Item</button>
              <button class="btn-sell" @click="quickSell">Quick Sell (+{{ getSellPriceValue }} TP)</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <h3>Qutilar yuklanmoqda...</h3>
    </div>

    <div v-else-if="activeTab === 'boxes'" class="boxes-grid">
      <div v-for="box in boxes" :key="box.id" class="box-card" :style="{ '--box-color': box.color }">
        <div class="box-visual" v-html="box.svg || '<i class=\'fas fa-cube\'></i>'"></div>
        <div class="box-info">
          <h3>{{ box.name }}</h3>
          <p>{{ box.description }}</p>
          <div class="drop-rates">
            <span class="rate basic" v-if="box.drops.basic">{{ box.drops.basic }}% BSC</span>
            <span class="rate common" v-if="box.drops.common">{{ box.drops.common }}% CMN</span>
            <span class="rate rare" v-if="box.drops.rare">{{ box.drops.rare }}% RAR</span>
            <span class="rate epic" v-if="box.drops.epic">{{ box.drops.epic }}% EPC</span>
            <span class="rate legendary" v-if="box.drops.legendary">{{ box.drops.legendary }}% LEG</span>
          </div>
        </div>
        <div class="box-actions">
          <button class="inspect-btn" @click="inspectingBox = box" title="Inspect Contents">
            <i class="fas fa-search"></i>
          </button>
          <button 
            class="buy-btn" 
            :disabled="userPoints < box.price || loading"
            @click="buyBox(box)"
          >
            <img src="@/assets/img/tpCoin.png" class="btn-coin" /> {{ box.price }}
          </button>
        </div>
      </div>
    </div>

    <!-- Direct Shop Grid (Frames / Badges) -->
    <div v-else class="cosmetics-grid">
      <div v-for="item in activeCosmetics" :key="item.id" class="cosmetic-card" :class="item.rarity">
        <div class="cosmetic-visual" v-html="item.svg"></div>
        <div class="cosmetic-info">
          <h3>{{ item.name }}</h3>
          <span class="cosmetic-rarity">{{ item.rarity.toUpperCase() }}</span>
        </div>
        <button 
          class="direct-buy-btn" 
          :class="{ 'locked-btn': userPoints < item.price }"
          :disabled="loading"
          @click="buyDirectItem(item)"
        >
          <img src="@/assets/img/tpCoin.png" class="btn-coin" /> {{ item.price }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, addDoc } from 'firebase/firestore';
import { purchaseBox, purchaseDirectItem, addToInventory, quickSellItem, getSellPrice } from '@/utils/economy';
import { cosmetics } from '@/utils/cosmetics';
import { useToast } from 'vue-toastification';

export default {
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      activeTab: 'boxes', // 'boxes', 'frames', 'badges'
      boxes: [],
      userPoints: 0,
      loading: false,
      openingBox: false,
      inspectingBox: null,
      isShaking: false,
      selectedBox: null,
      droppedItem: null,
      authUnsub: null,
    };
  },
  computed: {
    activeCosmetics() {
      if (this.activeTab === 'frames') return cosmetics.filter(c => c.type === 'frame');
      if (this.activeTab === 'badges') return cosmetics.filter(c => c.type === 'badge');
      return [];
    },
    getSellPriceValue() {
      if (!this.droppedItem) return 0;
      return this.droppedItem.price || 10;
    }
  },
  mounted() {
    this.loading = true;
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.listenToUserPoints(user.uid);
        try {
          await this.fetchBoxes();
        } catch (err) {
          console.error("Error loading shop:", err);
        } finally {
          this.loading = false;
        }
      } else {
        this.loading = false;
      }
    });
  },
  unmounted() {
    if (this.authUnsub) this.authUnsub();
  },
  methods: {
    async fetchBoxes() {
      this.boxes = [
        {
          id: 'box_basic',
          name: 'Starter Crate',
          description: 'Great for beginners. Contains basic and common items.',
          price: 50,
          color: '#94a3b8',
          svg: '<i class="fas fa-box"></i>',
          drops: { basic: 40, common: 35, rare: 20, epic: 5, legendary: 0 },
          items: cosmetics.filter(c => c.rarity === 'basic' || c.rarity === 'common' || c.rarity === 'rare' || c.rarity === 'epic')
        },
        {
          id: 'box_rare',
          name: 'Rare Vault',
          description: 'A glowing vault containing high-quality items.',
          price: 150,
          color: '#3b82f6',
          svg: '<i class="fas fa-box-open"></i>',
          drops: { basic: 5, common: 20, rare: 55, epic: 15, legendary: 5 },
          items: cosmetics
        },
        {
          id: 'box_epic',
          name: 'Epic Chest',
          description: 'Guaranteed rare items and a high chance for epic gear.',
          price: 450,
          color: '#a855f7',
          svg: '<i class="fas fa-gift"></i>',
          drops: { basic: 0, common: 0, rare: 30, epic: 55, legendary: 15 },
          items: cosmetics.filter(c => c.rarity !== 'basic' && c.rarity !== 'common')
        },
        {
          id: 'box_legendary',
          name: 'Legendary Cache',
          description: 'The ultimate prize cache. Massive chance for legendary drops!',
          price: 1200,
          color: '#f59e0b',
          svg: '<i class="fas fa-gem"></i>',
          drops: { basic: 0, common: 0, rare: 0, epic: 40, legendary: 60 },
          items: cosmetics.filter(c => c.rarity === 'epic' || c.rarity === 'legendary')
        }
      ];
    },
    listenToUserPoints(uid) {
      const userRef = doc(db, 'users', uid);
      this.authUnsub = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          this.userPoints = docSnap.data().points || 0;
        }
      });
    },
    async buyBox(box) {
      if (this.userPoints < box.price) return;
      
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return alert("Must be logged in!");

      this.loading = true;
      this.selectedBox = box;
      this.openingBox = true;
      this.isShaking = true;
      this.droppedItem = null;

      try {
        const itemObj = await purchaseBox(user.uid, box);
        // Simulate animation delay
        setTimeout(() => {
          this.isShaking = false;
          this.droppedItem = itemObj;
          this.loading = false;
        }, 2000);
      } catch (err) {
        console.error(err);
        this.openingBox = false;
        this.loading = false;
        this.toast.error("Xatolik: " + err.message);
      }
    },
    async buyDirectItem(item) {
      if (this.userPoints < item.price) {
        this.toast.warning(`Pulingiz yetarli emas! Sizga yana ${item.price - this.userPoints} TP kerak.`);
        return;
      }
      if (!confirm(`Siz "${item.name}" ni ${item.price} TP evaziga sotib olmoqchimisiz?`)) return;
      
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return this.toast.error("Tizimga kirmagansiz!");

      this.loading = true;
      try {
        await purchaseDirectItem(user.uid, item);
        this.toast.success(`Muvaffaqiyatli! ${item.name} inventaringizga qo'shildi.`);
      } catch (err) {
        console.error(err);
        this.toast.error("Xatolik: " + err.message);
      } finally {
        this.loading = false;
      }
    },
    async keepItem() {
      const auth = getAuth();
      await addToInventory(auth.currentUser.uid, this.droppedItem);
      this.closeModal();
    },
    async quickSell() {
      const auth = getAuth();
      const sellPrice = this.getSellPriceValue;
      await quickSellItem(auth.currentUser.uid, this.droppedItem.id, sellPrice);
      this.closeModal();
    },
    closeModal() {
      this.openingBox = false;
      this.droppedItem = null;
      this.selectedBox = null;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

.shop-container { padding: 40px; position: relative; overflow: hidden; min-height: 80vh; font-family: 'Plus Jakarta Sans', sans-serif;}
.glow-bg { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15; z-index: -1; }
.glow-1 { width: 400px; height: 400px; background: #3b82f6; top: -50px; left: -50px; }
.glow-2 { width: 300px; height: 300px; background: #a855f7; bottom: 10%; right: 5%; }

.shop-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: rgba(255,255,255,0.7); padding: 20px 30px; border-radius: 20px; backdrop-filter: blur(10px); }
.header-content h2 { margin: 0; font-size: 2rem; color: #1e293b; }
.header-content p { margin: 5px 0 0; color: #64748b; }

.user-balance { display: flex; align-items: center; gap: 10px; background: #fef3c7; padding: 10px 20px; border-radius: 15px; border: 2px solid #f59e0b; }
.coin-icon { width: 30px; height: 30px; }
.balance-amount { font-size: 1.5rem; font-weight: 800; color: #b45309; }

.shop-tabs { display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; }
.shop-tabs button { background: rgba(255, 255, 255, 0.8); border: 1px solid #e2e8f0; padding: 10px 25px; border-radius: 99px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.3s; }
.shop-tabs button:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.shop-tabs button.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }

.loading-state { text-align: center; padding: 60px 20px; color: #64748b; margin-top: 20px; }
.loading-state h3 { font-size: 1.8rem; color: #1e293b; margin: 20px 0 10px; }
.loading-state i { font-size: 5rem; color: #cbd5e1; }

.boxes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
.box-card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; border-top: 5px solid var(--box-color); transition: transform 0.3s; }
.box-card:hover { transform: translateY(-5px); }
.box-visual { font-size: 4rem; color: var(--box-color); margin-bottom: 15px; text-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.box-info h3 { margin: 0 0 10px; font-size: 1.4rem; color: #1e293b; }
.box-info p { color: #64748b; font-size: 0.9rem; margin-bottom: 15px; }

.drop-rates { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-bottom: 20px; }
.rate { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
.rate.basic { background: #f1f5f9; color: #64748b; }
.rate.common { background: #f1f5f9; color: #64748b; }
.rate.rare { background: #eff6ff; color: #3b82f6; }
.rate.epic { background: #faf5ff; color: #a855f7; }
.rate.legendary { background: #fffbeb; color: #f59e0b; }

.box-actions { display: flex; gap: 10px; width: 100%; margin-top: auto; }
.inspect-btn { background: #f1f5f9; color: #475569; border: none; padding: 12px; border-radius: 12px; cursor: pointer; transition: background 0.2s; font-size: 1.1rem; }
.inspect-btn:hover { background: #e2e8f0; color: #1e293b; }
.buy-btn { flex-grow: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #1e293b; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: background 0.2s; }
.buy-btn:hover:not(:disabled) { background: #0f172a; }
.buy-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-coin { width: 24px; height: 24px; }

/* Cosmetics Grid */
.cosmetics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.cosmetic-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-radius: 20px; padding: 25px 20px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.3s; position: relative; overflow: hidden; min-height: 280px; justify-content: space-between; }
.cosmetic-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08); }
.cosmetic-card.basic { border-bottom: 5px solid #94a3b8; }
.cosmetic-card.common { border-bottom: 5px solid #10b981; }
/* Cosmetics Grid - Premium Redesign */
.cosmetics-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
  gap: 25px; 
  padding: 10px;
}
.cosmetic-card { 
  background: rgba(255, 255, 255, 0.9); 
  border: 1px solid rgba(226, 232, 240, 0.8); 
  border-radius: 24px; 
  padding: 25px 20px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
  position: relative; 
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.cosmetic-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 6px;
  background: var(--card-color, #94a3b8);
}

.cosmetic-card:hover { 
  transform: translateY(-8px) scale(1.02); 
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.1); 
  border-color: var(--card-color, #94a3b8);
}

.cosmetic-card.basic { --card-color: #94a3b8; }
.cosmetic-card.common { --card-color: #10b981; }
.cosmetic-card.rare { --card-color: #3b82f6; }
.cosmetic-card.epic { --card-color: #a855f7; }
.cosmetic-card.legendary { --card-color: #f59e0b; }

.cosmetic-visual { 
  width: 120px; 
  height: 120px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-bottom: 20px; 
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
  transition: transform 0.4s ease;
}

.cosmetic-card:hover .cosmetic-visual {
  transform: scale(1.1) rotate(2deg);
}

.cosmetic-info { 
  text-align: center; 
  margin-bottom: 20px; 
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.cosmetic-info h3 { 
  margin: 0 0 8px 0; 
  font-size: 1.15rem; 
  color: #1e293b; 
  font-weight: 800;
  line-height: 1.3;
}
.cosmetic-rarity { 
  font-size: 0.75rem; 
  font-weight: 800; 
  padding: 4px 12px; 
  border-radius: 99px; 
  letter-spacing: 1px;
  display: inline-block;
  background: rgba(148, 163, 184, 0.1);
  color: var(--card-color, #94a3b8);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* Premium Button Design */
.direct-buy-btn { 
  width: 100%; 
  background: #0f172a; 
  color: white; 
  border: none; 
  padding: 14px; 
  border-radius: 16px; 
  font-weight: 800; 
  font-size: 1.05rem;
  cursor: pointer; 
  transition: all 0.3s; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 10px; 
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.direct-buy-btn:hover:not(:disabled):not(.locked-btn) { 
  background: var(--card-color, #3b82f6); 
  transform: translateY(-2px); 
  box-shadow: 0 8px 20px rgba(0,0,0,0.2); 
}

.direct-buy-btn.locked-btn { 
  background: #f1f5f9; 
  color: #94a3b8; 
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}
.direct-buy-btn.locked-btn .btn-coin {
  filter: grayscale(1) opacity(0.5);
}
.direct-buy-btn:disabled { 
  opacity: 0.6; 
  cursor: not-allowed; 
}
.btn-coin { width: 22px; height: 22px; }

/* Modals */
.inspect-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
.inspect-content { background: white; padding: 30px; border-radius: 20px; color: #1e293b; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; text-align: left; border: none; }
.inspect-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px; }
.inspect-header h3 { margin: 0; font-size: 1.5rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.close-btn:hover { color: #ef4444; }
.empty-case { text-align: center; color: #94a3b8; padding: 20px; }
.inspect-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
.inspect-item-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.inspect-item-card.common { border-color: #cbd5e1; }
.inspect-item-card.rare { border-color: #93c5fd; background: #eff6ff; }
.inspect-item-card.epic { border-color: #d8b4fe; background: #faf5ff; }
.inspect-item-card.legendary { border-color: #fcd34d; background: #fffbeb; }
.inspect-item-card .item-info strong { display: block; font-size: 0.9rem; margin-top: 10px; }
.inspect-item-card .item-info span { font-size: 0.75rem; text-transform: uppercase; font-weight: bold; }

.lootbox-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
.modal-content { background: #1e293b; padding: 40px; border-radius: 30px; text-align: center; color: white; min-width: 350px; border: 2px solid #334155; }
.shake { animation: shake 0.5s infinite; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px) rotate(-5deg); } 75% { transform: translateX(5px) rotate(5deg); } }
.pulse { animation: pulse 1s infinite; font-size: 6rem; color: #f59e0b; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

.drop-reveal.common { color: #94a3b8; }
.drop-reveal.rare { color: #60a5fa; text-shadow: 0 0 10px rgba(59,130,246,0.5); }
.drop-reveal.epic { color: #c084fc; text-shadow: 0 0 15px rgba(168,85,247,0.6); }
.drop-reveal.legendary { color: #fbbf24; text-shadow: 0 0 20px rgba(245,158,11,0.8); }

.rarity-title { font-size: 2rem; margin: 0 0 20px; font-weight: 900; letter-spacing: 2px; }
.item-preview { width: 150px; height: 150px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
.item-preview :deep(svg) { width: 100%; height: 100%; }

.actions { display: flex; gap: 15px; margin-top: 30px; }
.btn-keep { flex: 1; background: #10b981; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; }
.btn-sell { flex: 1; background: #ef4444; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
