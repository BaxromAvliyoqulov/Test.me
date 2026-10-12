<template>
  <div class="notifications-page-wrapper">
    <!-- Glowing background elements -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="notifications-container">
      <!-- 1. Header Hero -->
      <NotificationHeaderHero
        :unreadCount="unreadCount"
        :hasNoRead="readNotifications.length === 0"
        :isProcessing="isProcessing"
        :isRus="isRus"
        @mark-all-read="markAllAsRead"
        @clear-read="clearReadNotifications"
      />

      <!-- 2. Controls & Filter Tabs Bar -->
      <NotificationFiltersBar
        v-model:currentTab="currentTab"
        v-model:searchQuery="searchQuery"
        :totalCount="allFeedItems.length"
        :unreadCount="unreadCount"
        :duelsCount="pendingDuels.length"
        :requestsCount="pendingRequests.length"
        :isRus="isRus"
      />

      <!-- 3. Notification Feed Section -->
      <div class="feed-section">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner-bubble"></div>
          <p>{{ isRus ? 'Загрузка уведомлений...' : 'Bildirishnomalar yangilanmoqda...' }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredFeed.length === 0" class="empty-feed">
          <div class="empty-orb"><i class="fas fa-bell-slash"></i></div>
          <h3>{{ isRus ? 'Уведомлений нет' : 'Bildirishnomalar mavjud emas' }}</h3>
          <p v-if="searchQuery">
            {{ isRus ? `По запросу "${searchQuery}" ничего не найдено.` : `"${searchQuery}" bo'yicha hech qanday xabar topilmadi.` }}
          </p>
          <p v-else-if="currentTab === 'unread'">
            {{ isRus ? 'Вы прочитали все уведомления!' : "Barcha bildirishnomalarni o'qib bo'lgansiz!" }}
          </p>
          <p v-else>
            {{ isRus ? 'У вас пока нет новых уведомлений. Пригласите друзей на дуэль или пройдите тест!' : 'Hozircha sizda yangi bildirishnomalar yo\'q. Do\'stlaringizni duelga chorlang yoki test topshiring!' }}
          </p>
        </div>

        <!-- Cards List -->
        <div v-else class="feed-list">
          <NotificationCard
            v-for="item in filteredFeed"
            :key="item.feedId"
            :item="item"
            :isRead="isRead(item.feedId)"
            :isRus="isRus"
            @click-card="handleCardClick"
            @toggle-read="toggleReadState"
            @accept-duel="acceptDuel"
            @reject-duel="rejectDuel"
            @accept-friend="acceptFriendRequest"
            @reject-friend="rejectFriendRequest"
          />
        </div>
      </div>
    </div>

    <!-- 4. Notification Detail Modal -->
    <NotificationDetailModal
      :notif="selectedNotif"
      @close="selectedNotif = null"
      @navigate="navigateFromDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { 
  collection, query, where, onSnapshot, 
  doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, setDoc, orderBy 
} from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from '@/utils/i18n';

// Modular Child Components
import NotificationHeaderHero from './components/NotificationHeaderHero.vue';
import NotificationFiltersBar from './components/NotificationFiltersBar.vue';
import NotificationCard from './components/NotificationCard.vue';
import NotificationDetailModal from './components/NotificationDetailModal.vue';

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

// Handles
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

      const userRef = doc(db, 'users', user.uid);
      unsubUserDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          readNotifications.value = snap.data().readNotifications || [];
        }
      });

      listenSystemNotifications();
      listenFriendRequests();
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

const listenSystemNotifications = () => {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
  unsubSystem = onSnapshot(q, (snap) => {
    systemNotifications.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    loading.value = false;
  }, () => { loading.value = false; });
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

  pendingDuels.value.forEach(d => {
    feed.push({
      feedId: 'duel_' + d.id,
      id: d.id,
      type: 'duel_challenge',
      category: 'duels',
      categoryLabel: isRus.value ? '1v1 Дуэль' : '1v1 Duel',
      icon: 'fas fa-bolt',
      title: isRus.value 
        ? `${d.challengerName || 'Друг'} вызвал вас на 1v1 дуэль!` 
        : `${d.challengerName || 'Do\'st'} sizni 1v1 duelga chaqirdi!`,
      message: isRus.value 
        ? `Сразитесь в тестовой дуэли по предмету "${d.subjectName || 'Предмет'}" (${d.questionCount || 10} вопросов)!` 
        : `${d.subjectName || 'Fan'} bo'yicha ${d.questionCount || 10} ta savollik test jangida bellashing!`,
      timestamp: d.createdAt,
      data: d
    });
  });

  pendingRequests.value.forEach(r => {
    feed.push({
      feedId: 'friend_' + r.id,
      id: r.id,
      type: 'friend_request',
      category: 'social',
      categoryLabel: isRus.value ? 'Дружба' : 'Do\'stlik',
      icon: 'fas fa-user-plus',
      title: isRus.value 
        ? `${r.fromName || 'Пользователь'} отправил вам запрос в друзья` 
        : `${r.fromName || 'Foydalanuvchi'} sizga do'stlik so'rovi yubordi`,
      message: isRus.value 
        ? 'Добавьте в список друзей и развивайтесь вместе!' 
        : 'Do\'stlar ro\'yxatiga qo\'shing va birgalikda o\'rganing!',
      timestamp: r.timestamp,
      data: r
    });
  });

  systemNotifications.value.forEach(s => {
    let cat = 'system';
    let catLabel = isRus.value ? 'Платформа' : 'Platforma';
    let icon = 'fas fa-bullhorn';

    if (s.type === 'promo') {
      cat = 'rewards';
      catLabel = isRus.value ? 'Акция / Подарок' : 'Aksiya / Sovg\'a';
      icon = 'fas fa-gift';
    } else if (s.type === 'update') {
      cat = 'system';
      catLabel = isRus.value ? 'Обновление' : 'Yangilik';
      icon = 'fas fa-rocket';
    } else if (s.type === 'warning') {
      cat = 'system';
      catLabel = isRus.value ? 'Важное' : 'Muhim';
      icon = 'fas fa-triangle-exclamation';
    }

    feed.push({
      feedId: 'system_' + s.id,
      id: s.id,
      type: 'system_broadcast',
      category: cat,
      categoryLabel: catLabel,
      icon,
      title: s.title || (isRus.value ? 'Уведомление платформы' : 'Platforma bildirishnomasi'),
      message: s.message || s.content || '',
      timestamp: s.createdAt,
      link: s.link || null,
      linkText: s.linkText || (isRus.value ? 'Посмотреть' : "Ko'rish"),
      author: s.author || 'Test.me Team',
      data: s
    });
  });

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

const unreadCount = computed(() => {
  return allFeedItems.value.filter(item => !readNotifications.value.includes(item.feedId)).length;
});

const filteredFeed = computed(() => {
  let list = allFeedItems.value;
  if (currentTab.value === 'unread') {
    list = list.filter(item => !readNotifications.value.includes(item.feedId));
  } else if (currentTab.value !== 'all') {
    list = list.filter(item => item.category === currentTab.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(item => 
      (item.title || '').toLowerCase().includes(q) || 
      (item.message || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const isRead = (feedId) => readNotifications.value.includes(feedId);

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

.feed-section {
  display: flex;
  flex-direction: column;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

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
</style>
