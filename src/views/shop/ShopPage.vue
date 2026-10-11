<template>
  <div class="premium-layout shop-wrapper">
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="shop-container">
      <div class="header-section">
        <h1>рџ›ЌпёЏ {{ isRus ? 'РњР°РіР°Р·РёРЅ' : "Do'kon" }}</h1>
        <p>{{ isRus ? 'РћР±РјРµРЅРёРІР°Р№С‚Рµ TP Coins РЅР° РЅР°СЃС‚Р°РІРЅРёРєРѕРІ Рё РЅР°РіСЂР°РґС‹!' : "TP Coin larni AI ustozlar va sovg'alarga almashtiring!" }}</p>
      </div>

      <div class="shop-content">
        <!-- Balance Header -->
        <div class="balance-bento">
          <div class="balance-left">
            <span class="balance-label">{{ isRus ? 'ВАШ БАЛАНС' : 'SIZNING BALANSINGIZ' }}</span>
            <div class="balance-val">
              <img src="@/assets/img/tpCoin.png" alt="TP Coin" class="animate-spin-slow" />
              <h2>{{ points }}</h2>
              <span>TP Coins</span>
            </div>
          </div>
          <div class="balance-actions">
            <button class="history-btn" @click="showHistoryModal = true">
              <i class="fas fa-history"></i> {{ isRus ? 'История' : 'Tarix' }}
            </button>
            <button class="earn-more-btn" @click="$router.push('/points')">
              <i class="fas fa-plus"></i> {{ isRus ? 'Заработать' : 'Ishlash' }}
            </button>
          </div>
        </div>

        <!-- Shop Tabs -->
        <div class="shop-tabs">
          <button :class="['shop-tab', { active: activeTab === 'mentors' }]" @click="activeTab = 'mentors'">
            <i class="fas fa-robot"></i> {{ isRus ? 'AI Наставники' : 'AI Ustozlar' }}
          </button>
          <button :class="['shop-tab', { active: activeTab === 'themes' }]" @click="activeTab = 'themes'">
            <i class="fas fa-palette"></i> {{ isRus ? 'Темы UI' : 'Mavzular' }}
          </button>
        </div>

        <!-- AI MENTORS TAB -->
        <div v-if="activeTab === 'mentors'" class="mentors-shop">
          <div class="mentors-grid">
            <div
              v-for="mentor in allMentors"
              :key="mentor.id"
              :class="['mentor-shop-card', `card-${mentor.id}`, {
                owned: isOwned(mentor.id),
                active: activeMentorId === mentor.id,
                free: mentor.price === 0
              }]"
              :style="{ '--mc': mentor.color }"
            >
              <!-- Icon -->
              <div class="msc-icon">
                <i :class="mentor.icon"></i>
              </div>

              <!-- Info -->
              <div class="msc-info">
                <h4>{{ mentor.name[isRus ? 'RUS' : 'UZB'] }}</h4>
                <p>{{ mentor.desc[isRus ? 'RUS' : 'UZB'] }}</p>
              </div>

              <!-- Price / Status -->
              <div class="msc-footer">
                <!-- Active badge -->
                <div v-if="activeMentorId === mentor.id" class="msc-active-badge">
                  <i class="fas fa-check-circle"></i> {{ isRus ? 'Активен' : 'Faol' }}
                </div>
                <!-- Activate if owned -->
                <button
                  v-else-if="isOwned(mentor.id)"
                  class="msc-btn msc-btn-activate"
                  @click="activateMentor(mentor.id)"
                  :disabled="activating"
                >
                  <i class="fas fa-bolt"></i> {{ isRus ? 'Активировать' : 'Faollashtirish' }}
                </button>
                <!-- Buy button -->
                <button
                  v-else
                  class="msc-btn msc-btn-buy"
                  @click="buyMentor(mentor)"
                  :disabled="buying === mentor.id || points < mentor.price"
                >
                  <span v-if="buying === mentor.id"><i class="fas fa-circle-notch fa-spin"></i></span>
                  <span v-else-if="mentor.price === 0">
                    <i class="fas fa-gift"></i> {{ isRus ? 'Бесплатно' : 'Bepul' }}
                  </span>
                  <span v-else>
                    <img src="@/assets/img/tpCoin.png" style="width:16px;vertical-align:middle" /> {{ mentor.price }} TP
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- THEMES TAB -->
        <div v-if="activeTab === 'themes'" class="themes-shop">
          <div class="mentors-grid">
            <div
              v-for="theme in availableThemes"
              :key="theme.id"
              :class="['mentor-shop-card', {
                owned: isThemeOwned(theme.id),
                active: activeThemeId === theme.id
              }]"
              :style="{ '--mc': theme.color }"
            >
              <div class="msc-icon">
                <i :class="theme.icon"></i>
              </div>
              <div class="msc-info">
                <h4>{{ theme.name[isRus ? 'RUS' : 'UZB'] }}</h4>
                <p>{{ theme.desc[isRus ? 'RUS' : 'UZB'] }}</p>
              </div>
              <div class="msc-footer">
                <div v-if="activeThemeId === theme.id" class="msc-active-badge">
                  <i class="fas fa-check-circle"></i> {{ isRus ? 'Активен' : 'Faol' }}
                </div>
                <button
                  v-else-if="isThemeOwned(theme.id)"
                  class="msc-btn msc-btn-activate"
                  @click="activateTheme(theme.id)"
                >
                  <i class="fas fa-magic"></i> {{ isRus ? 'Применить' : 'Qo\'llash' }}
                </button>
                <button
                  v-else
                  class="msc-btn msc-btn-buy"
                  @click="buyTheme(theme)"
                  :disabled="points < theme.price"
                >
                  <img src="@/assets/img/tpCoin.png" style="width:16px;vertical-align:middle" /> {{ theme.price }} TP
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Toast notification -->
    <transition name="slide-up">
      <div v-if="toastMsg" :class="['shop-toast', toastType]">
        {{ toastMsg }}
      </div>
    </transition>
    <!-- Transaction History Modal -->
    <div v-if="showHistoryModal" class="lootbox-overlay" @click.self="showHistoryModal = false">
      <div class="history-modal-content animate-pop-in">
        <div class="modal-header">
          <h3><i class="fas fa-history text-blue"></i> {{ isRus ? 'История Tranzaktsiy' : 'Tranzaksiyalar Tarixi' }}</h3>
          <button class="close-modal-btn" @click="showHistoryModal = false">&times;</button>
        </div>
        <div class="history-list" v-if="transactions.length > 0">
          <div v-for="t in transactions" :key="t.id" :class="['history-item', t.type]">
            <div class="hi-icon">
              <i :class="t.type === 'earn' ? 'fas fa-arrow-down text-emerald' : 'fas fa-arrow-up text-rose'"></i>
            </div>
            <div class="hi-details">
              <div class="hi-title">{{ t.description }}</div>
              <div class="hi-time">{{ t.date }}</div>
            </div>
            <div :class="['hi-amount', t.type]">
              {{ t.type === 'earn' ? '+' : '-' }}{{ t.amount }} TP
            </div>
          </div>
        </div>
        <div v-else class="empty-history">
          <i class="fas fa-receipt text-slate"></i>
          <p>{{ isRus ? 'История пока пуста' : 'Tranzaksiyalar tarixi hali bo\'sh' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useToast } from 'vue-toastification';
import { useI18n } from '@/utils/i18n';
import { getBadges } from '@/utils/badges';
import { AIMentors } from '@/config/mentors';

const points = ref(0);
const { locale } = useI18n();
const isRus = ref(locale.value === 'RUS');
const toast = useToast();
const auth = getAuth();

const activeTab = ref('mentors');
const allMentors = Object.values(AIMentors);
const unlockedMentors = ref(['standard', 'friendly']);
const activeMentorId = ref('standard');
const buying = ref(null);
const activating = ref(false);
const toastMsg = ref('');
const toastType = ref('success');
const showHistoryModal = ref(false);

// Themes State
const activeThemeId = ref('default');
const unlockedThemes = ref(['default']);
const availableThemes = [
  { id: 'default', name: { UZB: 'Minimal SaaS', RUS: 'Минимал SaaS' }, desc: { UZB: 'Standart zamonaviy oq-ko\'k dizayn', RUS: 'Стандартный современный дизайн' }, price: 0, color: '#3b82f6', icon: 'fas fa-sun' },
  { id: 'cyberpunk', name: { UZB: 'Cyberpunk Neon', RUS: 'Киберпанк Неон' }, desc: { UZB: 'Neonnli va zamonaviy kelajak mavzusi', RUS: 'Футуристическая неоновая тема' }, price: 150, color: '#ec4899', icon: 'fas fa-bolt' },
  { id: 'emerald', name: { UZB: 'Emerald Glass', RUS: 'Изумрудный Глянец' }, desc: { UZB: 'Yashil va tinchlantiruvchi tabiat mavzusi', RUS: 'Экологичная зеленая тема' }, price: 200, color: '#10b981', icon: 'fas fa-leaf' },
  { id: 'midnight', name: { UZB: 'Midnight Violet', RUS: 'Полночный Фиолет' }, desc: { UZB: 'Tungi to\'q binafsha rangli VIP uslub', RUS: 'Темный фиолетовый премиум стиль' }, price: 300, color: '#8b5cf6', icon: 'fas fa-moon' },
];

// Transactions history list
const transactions = ref([
  { id: 't1', type: 'earn', description: 'Test topshirildi (IQ Math)', amount: 50, date: 'Bugun, 12:40' },
  { id: 't2', type: 'spend', description: 'Comedian AI Mentor xarid qilindi', amount: 100, date: 'Kecha, 18:20' }
]);

let currentUser = null;

const showToast = (msg, type = 'success') => {
  toastMsg.value = msg;
  toastType.value = type;
  setTimeout(() => { toastMsg.value = ''; }, 3000);
};

const isOwned = (id) => unlockedMentors.value.includes(id);
const isThemeOwned = (id) => unlockedThemes.value.includes(id);

const buyTheme = async (theme) => {
  if (!currentUser) return;
  if (points.value < theme.price) {
    showToast(isRus.value ? 'TP Coins yetarli emas!' : 'TP Coins yetarli emas!', 'error');
    return;
  }
  try {
    const newList = [...unlockedThemes.value, theme.id];
    await updateDoc(doc(db, 'users', currentUser.uid), {
      points: increment(-theme.price),
      'preferences.unlockedThemes': newList
    });
    unlockedThemes.value = newList;
    transactions.value.unshift({
      id: Date.now(),
      type: 'spend',
      description: `${theme.name.UZB} mavzusi sotib olindi`,
      amount: theme.price,
      date: 'Hozir'
    });
    showToast(isRus.value ? 'Тема разблокирована! 🎉' : 'Mavzu razblokiruy qilindi! 🎉', 'success');
  } catch (e) {
    showToast('Xatolik yuz berdi!', 'error');
  }
};

const activateTheme = async (id) => {
  if (!currentUser) return;
  activeThemeId.value = id;
  try {
    await updateDoc(doc(db, 'users', currentUser.uid), {
      'preferences.themeId': id
    });
    showToast(isRus.value ? 'Тема применена!' : 'Mavzu qo\'llanildi! ✨', 'success');
  } catch (e) {
    showToast('Xatolik!', 'error');
  }
};

onMounted(async () => {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          points.value = data.points || 0;
          const prefs = data.preferences || {};
          unlockedMentors.value = prefs.unlockedMentors || ['standard', 'friendly'];
          activeMentorId.value = prefs.mentorType || 'standard';
        }
      });
    }
  });
});

const buyMentor = async (mentor) => {
  if (!currentUser) return;
  if (mentor.price === 0) {
    // Free mentor вЂ” just unlock
    if (!isOwned(mentor.id)) {
      const newList = [...unlockedMentors.value, mentor.id];
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'preferences.unlockedMentors': newList
      });
      showToast(isRus.value ? 'РќР°СЃС‚Р°РІРЅРёРє СЂР°Р·Р±Р»РѕРєРёСЂРѕРІР°РЅ!' : "Ustoz qo'shildi!", 'success');
    }
    return;
  }
  if (points.value < mentor.price) {
    showToast(isRus.value ? 'TP Coins yetarli emas!' : 'TP Coins yetarli emas!', 'error');
    return;
  }
  buying.value = mentor.id;
  try {
    const newList = [...unlockedMentors.value, mentor.id];
    await updateDoc(doc(db, 'users', currentUser.uid), {
      points: increment(-mentor.price),
      'preferences.unlockedMentors': newList
    });
    showToast(isRus.value ? `${mentor.name.RUS} razblokРёСЂРѕРІР°РЅ! рџЋ‰` : `${mentor.name.UZB} qo'shildi! рџЋ‰`, 'success');
  } catch (e) {
    console.error(e);
    showToast('Xatolik yuz berdi!', 'error');
  } finally {
    buying.value = null;
  }
};

const activateMentor = async (id) => {
  if (!currentUser) return;
  activating.value = true;
  try {
    await updateDoc(doc(db, 'users', currentUser.uid), {
      'preferences.mentorType': id
    });
    showToast(isRus.value ? 'РќР°СЃС‚Р°РІРЅРёРє Р°РєС‚РёРІРёСЂРѕРІР°РЅ!' : 'Ustoz faollashtirildi! вњ…', 'success');
  } catch (e) {
    showToast('Xatolik!', 'error');
  } finally {
    activating.value = false;
  }
};
</script>

<style scoped>
.shop-wrapper {
  position: relative;
  min-height: 100vh;
  padding: 3rem 1.5rem;
  overflow-x: hidden;
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
  animation: float-bg 15s ease-in-out infinite alternate;
}

@keyframes float-bg {
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.2) translate(50px, 30px); }
  100% { transform: scale(0.9) translate(-30px, 50px); }
}

.glow-bg-1 {
  top: 5%;
  left: 5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #8b5cf6 0%, #d946ef 100%);
}

.glow-bg-2 {
  bottom: 5%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #f59e0b 0%, #fbbf24 100%);
  animation-delay: -7s;
}

.shop-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.header-section {
  text-align: left;
}

.header-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
}

.header-section p {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 500;
}

.shop-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.balance-bento {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

@media (max-width: 600px) {
  .balance-bento {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }
}

.balance-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 1px;
}

.balance-val {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-val img {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.balance-val h2 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1;
}

.balance-val span {
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 8px;
}

.earn-more-btn {
  background: #f1f5f9;
  color: #0f172a;
  border: none;
  padding: 12px 24px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.earn-more-btn:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.section-title-wrap {
  margin-bottom: 2rem;
}

.section-title-wrap h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.text-blue {
  color: #3b82f6;
}

.text-purple {
  color: #8b5cf6;
}

.text-orange {
  color: #f59e0b;
}

/* COMING SOON UI */
.coming-soon-wrapper {
  margin-top: 2rem;
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.coming-soon-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 36px;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.05);
}

.icon-glow-ring {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
}

.icon-glow-ring::after {
  content: '';
  position: absolute;
  top: -10px; left: -10px; right: -10px; bottom: -10px;
  border-radius: 50%;
  border: 2px dashed rgba(59, 130, 246, 0.3);
  animation: spin 15s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.floating-icon {
  font-size: 3.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: float-icon 3s ease-in-out infinite;
}

@keyframes float-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.coming-soon-card h2 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
  letter-spacing: -0.5px;
}

.coming-soon-card p {
  color: #64748b;
  max-width: 600px;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 3rem 0;
}

.features-preview {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 600px) {
  .features-preview {
    flex-direction: column;
    gap: 1rem;
  }
}

.feature-item {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.03);
  font-weight: 700;
  color: #334155;
  transition: transform 0.2s;
}

.feature-item:hover {
  transform: translateY(-3px);
}

.feature-item i {
  font-size: 1.2rem;
}

.back-btn {
  background: #f8fafc;
  color: #475569;
  border: 2px solid transparent;
  padding: 14px 32px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}

.back-btn:hover {
  background: white;
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
}

/* OVERLAY ANIMATIONS */
.lootbox-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.animate-pop-in {
  animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes popIn {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

/* ===== SHOP TABS ===== */
.shop-tabs { display: flex; gap: 12px; margin-bottom: 2rem; }
.shop-tab { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 0.95rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.25s; }
.shop-tab.active { background: #0f172a; color: #fff; border-color: #0f172a; box-shadow: 0 8px 20px -4px rgba(15,23,42,0.25); }
.soon-badge { font-size: 0.65rem; font-weight: 800; background: #f59e0b; color: #fff; padding: 2px 7px; border-radius: 20px; }

/* ===== MENTORS GRID ===== */
.mentors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
.mentor-shop-card { background: rgba(255,255,255,0.9); border: 1.5px solid rgba(226,232,240,0.8); border-radius: 24px; padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); position: relative; overflow: hidden; }
.mentor-shop-card::before { content: ''; position: absolute; top: -60px; right: -60px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--mc) 20%, transparent), transparent 70%); pointer-events: none; }
.mentor-shop-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -10px color-mix(in srgb, var(--mc) 20%, rgba(0,0,0,0.08)); border-color: color-mix(in srgb, var(--mc) 40%, transparent); }
.mentor-shop-card.owned { border-color: color-mix(in srgb, var(--mc) 50%, transparent); background: color-mix(in srgb, var(--mc) 4%, #fff); }
.mentor-shop-card.active { border-color: var(--mc); box-shadow: 0 0 0 3px color-mix(in srgb, var(--mc) 20%, transparent), 0 20px 40px -10px color-mix(in srgb, var(--mc) 25%, transparent); }
.msc-icon { width: 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, var(--mc), color-mix(in srgb, var(--mc) 60%, white)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 8px 20px -4px color-mix(in srgb, var(--mc) 50%, transparent); }
.msc-info h4 { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.msc-info p { font-size: 0.83rem; color: #64748b; line-height: 1.5; }
.msc-active-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 12px; background: color-mix(in srgb, var(--mc) 12%, transparent); color: var(--mc); font-weight: 800; font-size: 0.9rem; }
.msc-btn { width: 100%; padding: 12px 18px; border-radius: 14px; border: none; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.msc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.msc-btn-buy { background: linear-gradient(135deg, var(--mc), color-mix(in srgb, var(--mc) 70%, #000)); color: #fff; box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--mc) 50%, transparent); }
.msc-btn-buy:hover:not(:disabled) { transform: translateY(-2px); }
.msc-btn-activate { background: #f1f5f9; color: #334155; border: 1.5px solid #e2e8f0; }
.msc-btn-activate:hover:not(:disabled) { background: #0f172a; color: #fff; border-color: transparent; }

/* ===== BALANCE ACTIONS & HISTORY MODAL ===== */
.balance-actions { display: flex; gap: 10px; align-items: center; }
.history-btn { background: #f8fafc; color: #475569; border: 1.5px solid #e2e8f0; padding: 12px 20px; border-radius: 16px; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; }
.history-btn:hover { background: #e2e8f0; color: #0f172a; }

.history-modal-content { background: white; border-radius: 28px; padding: 2rem; width: 480px; max-width: 92vw; box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.4); border: 1px solid #e2e8f0; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h3 { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
.close-modal-btn { background: transparent; border: none; font-size: 1.8rem; color: #94a3b8; cursor: pointer; line-height: 1; transition: color 0.2s; }
.close-modal-btn:hover { color: #0f172a; }

.history-list { display: flex; flex-direction: column; gap: 12px; max-height: 340px; overflow-y: auto; padding-right: 4px; }
.history-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 16px; background: #f8fafc; border: 1px solid #f1f5f9; }
.hi-icon { width: 40px; height: 40px; border-radius: 12px; background: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
.text-emerald { color: #10b981; }
.text-rose { color: #f43f5e; }
.text-slate { color: #94a3b8; }
.hi-details { flex: 1; }
.hi-title { font-size: 0.92rem; font-weight: 700; color: #1e293b; }
.hi-time { font-size: 0.78rem; color: #94a3b8; margin-top: 2px; }
.hi-amount { font-weight: 800; font-size: 0.98rem; }
.hi-amount.earn { color: #10b981; }
.hi-amount.spend { color: #f43f5e; }

.empty-history { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
.empty-history i { font-size: 3rem; margin-bottom: 1rem; }
.empty-history p { margin: 0; font-weight: 600; }

/* ===== TOAST ===== */
.shop-toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); padding: 14px 28px; border-radius: 16px; font-weight: 700; font-size: 0.95rem; z-index: 9999; box-shadow: 0 8px 30px rgba(0,0,0,0.15); white-space: nowrap; }
.shop-toast.success { background: #0f172a; color: #fff; }
.shop-toast.error { background: #ef4444; color: #fff; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.35s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translate(-50%, 20px); }

@media (max-width: 768px) {
  .shop-wrapper {
    padding: 1rem 0.5rem !important;
  }
  .header-section h1 {
    font-size: 1.6rem !important;
  }
  .header-section p {
    font-size: 0.88rem !important;
  }
  .shop-content {
    gap: 1.5rem !important;
  }
  .balance-bento {
    padding: 1rem !important;
    border-radius: 18px !important;
    flex-direction: column !important;
    gap: 1rem !important;
    align-items: stretch !important;
  }
  .balance-val h2 {
    font-size: 1.7rem !important;
  }
  .balance-actions {
    width: 100% !important;
    display: flex !important;
    gap: 8px !important;
  }
  .balance-actions button {
    flex: 1 !important;
    justify-content: center !important;
    padding: 10px 8px !important;
    font-size: 0.85rem !important;
    border-radius: 12px !important;
  }
  .shop-tabs {
    gap: 8px !important;
    margin-bottom: 1.25rem !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding-bottom: 4px !important;
  }
  .shop-tab {
    padding: 8px 14px !important;
    font-size: 0.82rem !important;
    white-space: nowrap !important;
    border-radius: 12px !important;
  }
  .mentors-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  .mentor-shop-card {
    padding: 1.25rem !important;
    border-radius: 20px !important;
    gap: 1rem !important;
  }
  .history-modal-content {
    padding: 1.25rem !important;
    border-radius: 22px !important;
  }
}
</style>

