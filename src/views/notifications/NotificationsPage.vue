<template>
  <div class="notifications-page-wrapper">
    <!-- Glowing background elements -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="notifications-container">
      <!-- Header Hero -->
      <div class="header-hero">
        <div class="header-left">
          <div class="title-pill">
            <i class="fas fa-bell animate-bounce-slow"></i> Bildirishnomalar Markazi
          </div>
          <h2>{{ isRus ? 'Центр Уведомлений' : 'Barcha Bildirishnomalar' }}</h2>
          <p>{{ isRus ? 'Следите за вызовами на дуэли, запросами в друзья и системными наградами в реальном времени!' : '1v1 duel chaqiruvlari, do\'stlik so\'rovlari, TP Coin mukofotlari va platforma yangiliklarini bir joyda kuzating!' }}</p>
        </div>

        <div class="header-actions">
          <button 
            v-if="unreadCount > 0" 
            class="action-btn mark-read" 
            @click="markAllAsRead"
            :disabled="isProcessing"
          >
            <i class="fas fa-check-double"></i>
            <span>{{ isRus ? 'Прочитать всё' : 'Barchasini o\'qilgan qilish' }}</span>
          </button>

          <button 
            class="action-btn clear-read" 
            @click="clearReadNotifications"
            :disabled="isProcessing || readNotifications.length === 0"
          >
            <i class="fas fa-trash-can"></i>
            <span>{{ isRus ? 'Очистить' : 'O\'qilganlarni tozalash' }}</span>
          </button>
        </div>
      </div>

      <!-- Controls & Filter Tabs Bar -->
      <div class="controls-bar">
        <!-- Filter Tabs -->
        <div class="tabs-scroller">
          <button 
            class="filter-tab" 
            :class="{ active: currentTab === 'all' }" 
            @click="currentTab = 'all'"
          >
            <i class="fas fa-layer-group"></i>
            <span>Barchasi</span>
            <span class="tab-count">{{ allFeedItems.length }}</span>
          </button>

          <button 
            class="filter-tab" 
            :class="{ active: currentTab === 'unread' }" 
            @click="currentTab = 'unread'"
          >
            <i class="fas fa-envelope"></i>
            <span>O'qilmagan</span>
            <span class="tab-count danger" v-if="unreadCount > 0">{{ unreadCount }}</span>
          </button>

          <button 
            class="filter-tab" 
            :class="{ active: currentTab === 'duels' }" 
            @click="currentTab = 'duels'"
          >
            <i class="fas fa-bolt text-danger"></i>
            <span>Duellar</span>
            <span class="tab-count warning" v-if="pendingDuels.length > 0">{{ pendingDuels.length }}</span>
          </button>

          <button 
            class="filter-tab" 
            :class="{ active: currentTab === 'social' }" 
            @click="currentTab = 'social'"
          >
            <i class="fas fa-user-group text-primary"></i>
            <span>Do'stlar</span>
            <span class="tab-count primary" v-if="pendingRequests.length > 0">{{ pendingRequests.length }}</span>
          </button>

          <button 
            class="filter-tab" 
            :class="{ active: currentTab === 'rewards' }" 
            @click="currentTab = 'rewards'"
          >
            <i class="fas fa-coins text-warning"></i>
            <span>Mukofotlar</span>
          </button>

          <button 
            class="filter-tab" 
            :class="{ active: currentTab === 'system' }" 
            @click="currentTab = 'system'"
          >
            <i class="fas fa-bullhorn text-info"></i>
            <span>Tizim</span>
          </button>
        </div>

        <!-- Search input -->
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery" 
            :placeholder="isRus ? 'Поиск в уведомлениях...' : 'Xabarlarni qidirish...'" 
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Notification Feed List -->
      <div class="feed-section">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner-bubble"></div>
          <p>Bildirishnomalar yangilanmoqda...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredFeed.length === 0" class="empty-feed">
          <div class="empty-orb">
            <i class="fas fa-bell-slash"></i>
          </div>
          <h3>Bildirishnomalar mavjud emas</h3>
          <p v-if="searchQuery">"{{ searchQuery }}" bo'yicha hech qanday xabar topilmadi.</p>
          <p v-else-if="currentTab === 'unread'">Barcha bildirishnomalarni o'qib bo'lgansiz!</p>
          <p v-else>Hozircha sizda yangi bildirishnomalar yo'q. Do'stlaringizni duelga chorlang yoki test topshiring!</p>
        </div>

        <!-- Cards List -->
        <div v-else class="feed-list">
          <div 
            v-for="item in filteredFeed" 
            :key="item.feedId"
            class="notif-card"
            :class="[
              item.category, 
              { 'is-unread': !isRead(item.feedId) }
            ]"
            @click="handleCardClick(item)"
          >
            <!-- Card Icon Pillar -->
            <div class="icon-pillar" :class="item.category">
              <i :class="item.icon"></i>
            </div>

            <!-- Card Main Content -->
            <div class="card-content">
              <div class="card-top">
                <span class="category-tag" :class="item.category">
                  {{ item.categoryLabel }}
                </span>
                <span class="time-stamp">
                  <i class="far fa-clock"></i> {{ formatTime(item.timestamp) }}
                </span>
              </div>

              <h4 class="card-title">{{ item.title }}</h4>
              <p class="card-message">{{ item.message }}</p>

              <!-- Interactive Actions for Duels -->
              <div v-if="item.type === 'duel_challenge'" class="card-interactive-row" @click.stop>
                <div class="duel-wager-pill">
                  <i class="fas fa-coins text-warning"></i>
                  <span>{{ item.data?.wager ? item.data.wager + ' TP garov' : 'Do\'stona sinov' }}</span>
                </div>
                <div class="actions-buttons">
                  <button class="btn-action duel-accept" @click="acceptDuel(item.data)">
                    <i class="fas fa-play"></i> Qabul qilish
                  </button>
                  <button class="btn-action duel-reject" @click="rejectDuel(item.data.id)">
                    <i class="fas fa-times"></i> Rad etish
                  </button>
                </div>
              </div>

              <!-- Interactive Actions for Friend Requests -->
              <div v-else-if="item.type === 'friend_request'" class="card-interactive-row" @click.stop>
                <div class="actions-buttons">
                  <button class="btn-action friend-accept" @click="acceptFriendRequest(item.data)">
                    <i class="fas fa-user-check"></i> Do'stlikni Qabul Qilish
                  </button>
                  <button class="btn-action friend-reject" @click="rejectFriendRequest(item.data.id)">
                    <i class="fas fa-user-xmark"></i> Rad etish
                  </button>
                </div>
              </div>

              <!-- Quick action for System Links -->
              <div v-else-if="item.link" class="card-link-row">
                <router-link :to="item.link" class="action-link">
                  <span>{{ item.linkText || "Ko'rish" }}</span>
                  <i class="fas fa-arrow-right"></i>
                </router-link>
              </div>
            </div>

            <!-- Card Right Controls -->
            <div class="card-controls" @click.stop>
              <button 
                class="control-btn toggle-read" 
                :title="isRead(item.feedId) ? 'O\'qilmagan qilish' : 'O\'qilgan deb belgilash'"
                @click="toggleReadState(item.feedId)"
              >
                <i :class="isRead(item.feedId) ? 'far fa-envelope' : 'fas fa-check'"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedNotif" class="detail-overlay" @click.self="selectedNotif = null">
        <div class="detail-card animate-pop-in">
          <div class="detail-header" :class="selectedNotif.category">
            <div class="detail-icon-wrap">
              <i :class="selectedNotif.icon"></i>
            </div>
            <div>
              <span class="detail-tag">{{ selectedNotif.categoryLabel }}</span>
              <h3>{{ selectedNotif.title }}</h3>
            </div>
            <button class="detail-close" @click="selectedNotif = null">&times;</button>
          </div>

          <div class="detail-body">
            <p class="detail-text">{{ selectedNotif.message }}</p>
            <div class="detail-meta">
              <span><i class="far fa-clock"></i> {{ formatTime(selectedNotif.timestamp) }}</span>
              <span v-if="selectedNotif.author">Muallif: {{ selectedNotif.author }}</span>
            </div>
          </div>

          <div class="detail-footer">
            <button class="detail-btn close" @click="selectedNotif = null">Yopish</button>
            <button 
              v-if="selectedNotif.link" 
              class="detail-btn navigate" 
              @click="navigateFromDetail(selectedNotif.link)"
            >
              Sahifaga o'tish <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { 
  collection, query, where, getDocs, onSnapshot, 
  doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, setDoc, orderBy 
} from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from '@/utils/i18n';

const router = useRouter();
const toast = useToast();
const { locale } = useI18n();

const isRus = computed(() => locale.value === 'RUS');

// Core State
const currentUser = ref(null);
const loading = ref(true);
const isProcessing = ref(false);
const currentTab = ref('all');
const searchQuery = ref('');
const selectedNotif = ref(null);

// Data Lists
const systemNotifications = ref([]);
const pendingRequests = ref([]);
const pendingDuels = ref([]);
const readNotifications = ref([]);

// Unsubscribe handles
let unsubAuth = null;
let unsubUserDoc = null;
let unsubSystem = null;
let unsubRequests = null;
let unsubDuels = null;

onMounted(() => {
  const auth = getAuth();
  unsubAuth = auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser.value = {
        uid: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email
      };

      // 1. Listen to user doc for readNotifications list
      const userRef = doc(db, 'users', user.uid);
      unsubUserDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          readNotifications.value = data.readNotifications || [];
        }
      });

      // 2. Listen to system notifications
      listenSystemNotifications();

      // 3. Listen to incoming friend requests
      listenFriendRequests();

      // 4. Listen to incoming duels
      listenIncomingDuels();
    } else {
      router.push('/login');
    }
  });
});

onUnmounted(() => {
  if (unsubAuth) unsubAuth();
  if (unsubUserDoc) unsubUserDoc();
  if (unsubSystem) unsubSystem();
  if (unsubRequests) unsubRequests();
  if (unsubDuels) unsubDuels();
});

// Real-time Listeners
const listenSystemNotifications = () => {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
  unsubSystem = onSnapshot(q, (snap) => {
    systemNotifications.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    loading.value = false;
  }, (err) => {
    console.error("System notifications error:", err);
    loading.value = false;
  });
};

const listenFriendRequests = () => {
  if (!currentUser.value?.uid) return;
  const q = query(
    collection(db, 'friend_requests'), 
    where('toUid', '==', currentUser.value.uid),
    where('status', '==', 'pending')
  );
  unsubRequests = onSnapshot(q, (snap) => {
    pendingRequests.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });
};

const listenIncomingDuels = () => {
  if (!currentUser.value?.uid) return;
  const q = query(
    collection(db, 'duels'), 
    where('opponentUid', '==', currentUser.value.uid),
    where('status', '==', 'pending')
  );
  unsubDuels = onSnapshot(q, (snap) => {
    pendingDuels.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });
};

// Aggregated Unified Feed Items
const allFeedItems = computed(() => {
  const feed = [];

  // 1. Incoming 1v1 Duels
  pendingDuels.value.forEach(d => {
    feed.push({
      feedId: 'duel_' + d.id,
      id: d.id,
      type: 'duel_challenge',
      category: 'duels',
      categoryLabel: '1v1 Duel',
      icon: 'fas fa-bolt',
      title: `${d.challengerName || 'Do\'st'} sizni 1v1 duelga chaqirdi!`,
      message: `${d.subjectName || 'Fan'} bo'yicha ${d.questionCount || 10} ta savollik test jangida bellashing!`,
      timestamp: d.createdAt,
      data: d
    });
  });

  // 2. Incoming Friend Requests
  pendingRequests.value.forEach(r => {
    feed.push({
      feedId: 'friend_' + r.id,
      id: r.id,
      type: 'friend_request',
      category: 'social',
      categoryLabel: 'Do\'stlik',
      icon: 'fas fa-user-plus',
      title: `${r.fromName || 'Foydalanuvchi'} sizga do'stlik so'rovi yubordi`,
      message: `Do'stlar ro'yxatiga qo'shing va birgalikda o'rganing!`,
      timestamp: r.timestamp,
      data: r
    });
  });

  // 3. System & Admin Broadcasts
  systemNotifications.value.forEach(s => {
    const isPromo = s.type === 'promo';
    const isUpdate = s.type === 'update';
    const isWarning = s.type === 'warning';
    
    let cat = 'system';
    let catLabel = 'Platforma';
    let icon = 'fas fa-bullhorn';

    if (isPromo) {
      cat = 'rewards';
      catLabel = 'Aksiya / Sovg\'a';
      icon = 'fas fa-gift';
    } else if (isUpdate) {
      cat = 'system';
      catLabel = 'Yangilik';
      icon = 'fas fa-rocket';
    } else if (isWarning) {
      cat = 'system';
      catLabel = 'Muhim';
      icon = 'fas fa-triangle-exclamation';
    }

    feed.push({
      feedId: 'system_' + s.id,
      id: s.id,
      type: 'system_broadcast',
      category: cat,
      categoryLabel: catLabel,
      icon,
      title: s.title || 'Platforma bildirishnomasi',
      message: s.message || s.content || '',
      timestamp: s.createdAt,
      link: s.link || null,
      linkText: s.linkText || "Ko'rish",
      author: s.author || 'Test.me Team',
      data: s
    });
  });

  // Sort by timestamp descending
  return feed.sort((a, b) => {
    const getTime = (ts) => {
      if (!ts) return 0;
      if (ts.toMillis) return ts.toMillis();
      if (ts.toDate) return ts.toDate().getTime();
      return new Date(ts).getTime();
    };
    return getTime(b.timestamp) - getTime(a.timestamp);
  });
});

// Unread count
const unreadCount = computed(() => {
  return allFeedItems.value.filter(item => !readNotifications.value.includes(item.feedId)).length;
});

// Filtered Feed based on tab and search query
const filteredFeed = computed(() => {
  let list = allFeedItems.value;

  // Filter by category tab
  if (currentTab.value === 'unread') {
    list = list.filter(item => !readNotifications.value.includes(item.feedId));
  } else if (currentTab.value !== 'all') {
    list = list.filter(item => item.category === currentTab.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(item => 
      (item.title || '').toLowerCase().includes(q) || 
      (item.message || '').toLowerCase().includes(q)
    );
  }

  return list;
});

const isRead = (feedId) => {
  return readNotifications.value.includes(feedId);
};

// Handlers: Mark All Read
const markAllAsRead = async () => {
  if (!currentUser.value?.uid) return;
  isProcessing.value = true;
  try {
    const unreadFeedIds = allFeedItems.value.map(i => i.feedId);
    await updateDoc(doc(db, 'users', currentUser.value.uid), {
      readNotifications: arrayUnion(...unreadFeedIds)
    });
    toast.success("Barcha bildirishnomalar o'qilgan deb belgilandi.");
  } catch (err) {
    console.error("Mark read error:", err);
  } finally {
    isProcessing.value = false;
  }
};

// Clear read notifications
const clearReadNotifications = async () => {
  if (!currentUser.value?.uid) return;
  isProcessing.value = true;
  try {
    await updateDoc(doc(db, 'users', currentUser.value.uid), {
      readNotifications: []
    });
    toast.info("O'qilgan xabarlar holati tozalandi.");
  } catch (err) {
    console.error("Clear read error:", err);
  } finally {
    isProcessing.value = false;
  }
};

// Toggle read state for single item
const toggleReadState = async (feedId) => {
  if (!currentUser.value?.uid) return;
  const userRef = doc(db, 'users', currentUser.value.uid);
  try {
    if (isRead(feedId)) {
      await updateDoc(userRef, { readNotifications: arrayRemove(feedId) });
    } else {
      await updateDoc(userRef, { readNotifications: arrayUnion(feedId) });
    }
  } catch (err) {
    console.error("Toggle read error:", err);
  }
};

const handleCardClick = (item) => {
  if (!isRead(item.feedId)) {
    toggleReadState(item.feedId);
  }
  if (item.type === 'system_broadcast') {
    selectedNotif.value = item;
  }
};

// Duel Handlers
const acceptDuel = async (duel) => {
  try {
    await updateDoc(doc(db, 'duels', duel.id), {
      status: 'active',
      startedAt: serverTimestamp()
    });
    toast.success("Duel qabul qilindi! Maydonga o'tilmoqda... 🔥");
    router.push(`/test?subjectId=${duel.subjectId}&levelId=elementary&duelId=${duel.id}&questionsCount=${duel.questionCount || 10}`);
  } catch (err) {
    console.error("Accept duel error:", err);
  }
};

const rejectDuel = async (duelId) => {
  try {
    await deleteDoc(doc(db, 'duels', duelId));
    toast.info("Duel chaqiruvi rad etildi.");
  } catch (err) {
    console.error("Reject duel error:", err);
  }
};

// Friend Request Handlers
const acceptFriendRequest = async (req) => {
  try {
    const currentUid = currentUser.value.uid;
    const currentName = currentUser.value.displayName;

    await setDoc(doc(db, 'users', currentUid, 'friends', req.fromUid), {
      displayName: req.fromName,
      timestamp: serverTimestamp()
    });
    await setDoc(doc(db, 'users', req.fromUid, 'friends', currentUid), {
      displayName: currentName,
      timestamp: serverTimestamp()
    });
    await deleteDoc(doc(db, 'friend_requests', req.id));

    toast.success(`${req.fromName} do'stlaringiz safiga qo'shildi! 🎉`);
  } catch (err) {
    console.error("Accept friend error:", err);
  }
};

const rejectFriendRequest = async (reqId) => {
  try {
    await deleteDoc(doc(db, 'friend_requests', reqId));
    toast.info("Do'stlik so'rovi rad etildi.");
  } catch (err) {
    console.error("Reject friend error:", err);
  }
};

const navigateFromDetail = (link) => {
  selectedNotif.value = null;
  router.push(link);
};

// Formatting Time
const formatTime = (ts) => {
  if (!ts) return 'Yaqinda';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Hozirgina';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} daqiqa oldin`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} soat oldin`;
    return d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Yaqinda';
  }
};
</script>

<style scoped>
.notifications-page-wrapper {
  position: relative;
  min-height: calc(100vh - 80px);
  padding: 1.5rem;
  background: #f8fafc;
  overflow-x: hidden;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.45;
  z-index: 0;
}

.glow-bg-1 {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, #f59e0b 0%, rgba(245, 158, 11, 0) 70%);
  top: -100px;
  right: -50px;
}

.glow-bg-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #3b82f6 0%, rgba(59, 130, 246, 0) 70%);
  bottom: -50px;
  left: -80px;
}

.notifications-container {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header Hero */
.header-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 26px;
  padding: 2rem 2.25rem;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
}

.header-left {
  max-width: 650px;
}

.title-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #b45309;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
}

.header-hero h2 {
  margin: 0 0 0.35rem 0;
  font-size: 1.85rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.header-hero p {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn.mark-read {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.action-btn.mark-read:hover:not(:disabled) {
  background: #2563eb;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.25);
}

.action-btn.clear-read {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.action-btn.clear-read:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Controls Bar */
.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.tabs-scroller {
  display: flex;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.35rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-tab.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-count {
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 800;
}

.tab-count.danger { background: #ef4444; color: white; }
.tab-count.warning { background: #f59e0b; color: white; }
.tab-count.primary { background: #3b82f6; color: white; }

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.search-box input {
  width: 100%;
  padding: 0.65rem 2rem 0.65rem 2.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.clear-btn {
  position: absolute;
  right: 0.65rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

/* Feed List */
.feed-section {
  display: flex;
  flex-direction: column;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.notif-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
}

.notif-card.is-unread {
  background: linear-gradient(135deg, #ffffff, #f0f7ff);
  border-color: #93c5fd;
  box-shadow: 0 6px 20px -4px rgba(59, 130, 246, 0.15);
}

.icon-pillar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.icon-pillar.duels { background: #fee2e2; color: #dc2626; }
.icon-pillar.social { background: #e0f2fe; color: #0284c7; }
.icon-pillar.rewards { background: #fef3c7; color: #d97706; }
.icon-pillar.system { background: #f1f5f9; color: #475569; }

.card-content {
  flex: 1;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.category-tag {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.category-tag.duels { background: #fee2e2; color: #b91c1c; }
.category-tag.social { background: #e0f2fe; color: #0369a1; }
.category-tag.rewards { background: #fef3c7; color: #92400e; }
.category-tag.system { background: #f1f5f9; color: #475569; }

.time-stamp {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

.card-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.card-message {
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.45;
}

.card-interactive-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px dashed #e2e8f0;
}

.duel-wager-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fefce8;
  color: #854d0e;
  padding: 0.35rem 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 800;
}

.actions-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-action.duel-accept {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-action.duel-accept:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4);
}

.btn-action.duel-reject, .btn-action.friend-reject {
  background: #f1f5f9;
  color: #64748b;
}

.btn-action.duel-reject:hover, .btn-action.friend-reject:hover {
  background: #fee2e2;
  color: #dc2626;
}

.btn-action.friend-accept {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.card-link-row {
  margin-top: 0.75rem;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #3b82f6;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
}

.action-link:hover {
  text-decoration: underline;
}

.card-controls {
  margin-left: auto;
}

.control-btn {
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.control-btn:hover {
  color: #3b82f6;
  background: #f1f5f9;
}

/* Empty / Loading States */
.empty-feed {
  text-align: center;
  padding: 4rem 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 2px dashed #cbd5e1;
  border-radius: 26px;
}

.empty-orb {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem auto;
  font-size: 2rem;
  color: #94a3b8;
}

.empty-feed h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.empty-feed p {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.spinner-bubble {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Detail Modal */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.detail-card {
  background: white;
  border-radius: 28px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.detail-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.detail-tag {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.detail-header h3 {
  margin: 0.2rem 0 0 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

.detail-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
}

.detail-body {
  padding: 1.75rem;
}

.detail-text {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.6;
  margin: 0 0 1.25rem 0;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.75rem;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.detail-btn {
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
}

.detail-btn.close {
  background: white;
  border: 1.5px solid #cbd5e1;
  color: #475569;
}

.detail-btn.navigate {
  background: #3b82f6;
  color: white;
}

.animate-pop-in {
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.animate-bounce-slow {
  animation: bounceSlow 2s infinite;
}

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@media (max-width: 768px) {
  .header-hero {
    padding: 1.5rem;
  }
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    min-width: 100%;
  }
}
</style>
