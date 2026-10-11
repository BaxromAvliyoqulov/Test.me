import { ref, computed } from 'vue';
import { db } from '@/config/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, query, where, onSnapshot, orderBy, doc 
} from 'firebase/firestore';
import { playNotificationSound, playDuelChallengeSound } from '@/utils/soundEffects';

// Shared Reactive Singleton State
const isInitialized = ref(false);
const currentUserId = ref(null);

const broadcastNotifications = ref([]);
const readNotificationIds = ref([]);
const pendingRequests = ref([]);
const pendingDuels = ref([]);
const loading = ref(true);

let unsubAuth = null;
let unsubUserDoc = null;
let unsubBroadcast = null;
let unsubRequests = null;
let unsubDuels = null;

let prevDuelsCount = 0;
let prevRequestsCount = 0;

export function useNotifications() {
  if (!isInitialized.value && typeof window !== 'undefined') {
    isInitialized.value = true;
    initNotificationListeners();
  }

  // Filtered broadcast notifications based on target
  const filteredBroadcasts = computed(() => {
    return broadcastNotifications.value;
  });

  // 1. Unread Broadcast Count
  const unreadBroadcastCount = computed(() => {
    return broadcastNotifications.value.filter(
      n => !readNotificationIds.value.includes(n.id) && !readNotificationIds.value.includes('system_' + n.id)
    ).length;
  });

  // 2. Pending Duels Count
  const pendingDuelsCount = computed(() => pendingDuels.value.length);

  // 3. Pending Requests Count
  const pendingRequestsCount = computed(() => pendingRequests.value.length);

  // 4. Grand Total Unread Count
  const totalUnreadCount = computed(() => {
    return unreadBroadcastCount.value + pendingDuelsCount.value + pendingRequestsCount.value;
  });

  return {
    broadcastNotifications: filteredBroadcasts,
    readNotificationIds,
    pendingRequests,
    pendingDuels,
    unreadBroadcastCount,
    pendingDuelsCount,
    pendingRequestsCount,
    totalUnreadCount,
    loading,
    currentUserId
  };
}

function initNotificationListeners() {
  const auth = getAuth();
  unsubAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserId.value = user.uid;

      // 1. Listen to user doc for read notifications
      const userRef = doc(db, 'users', user.uid);
      if (unsubUserDoc) unsubUserDoc();
      unsubUserDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          readNotificationIds.value = snap.data().readNotifications || [];
        }
      });

      // 2. Listen to system broadcast notifications
      const bCastQ = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      if (unsubBroadcast) unsubBroadcast();
      unsubBroadcast = onSnapshot(bCastQ, (snap) => {
        broadcastNotifications.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        loading.value = false;
      }, () => { loading.value = false; });

      // 3. Listen to incoming friend requests
      const reqQ = query(
        collection(db, 'friend_requests'),
        where('toUid', '==', user.uid),
        where('status', '==', 'pending')
      );
      if (unsubRequests) unsubRequests();
      unsubRequests = onSnapshot(reqQ, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length > prevRequestsCount && prevRequestsCount > 0) {
          playNotificationSound();
        }
        prevRequestsCount = list.length;
        pendingRequests.value = list;
      });

      // 4. Listen to incoming 1v1 duels
      const duelQ = query(
        collection(db, 'duels'),
        where('opponentUid', '==', user.uid),
        where('status', '==', 'pending')
      );
      if (unsubDuels) unsubDuels();
      unsubDuels = onSnapshot(duelQ, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length > prevDuelsCount && prevDuelsCount > 0) {
          playDuelChallengeSound();
        }
        prevDuelsCount = list.length;
        pendingDuels.value = list;
      });

    } else {
      currentUserId.value = null;
      broadcastNotifications.value = [];
      readNotificationIds.value = [];
      pendingRequests.value = [];
      pendingDuels.value = [];
      if (unsubUserDoc) unsubUserDoc();
      if (unsubBroadcast) unsubBroadcast();
      if (unsubRequests) unsubRequests();
      if (unsubDuels) unsubDuels();
    }
  });
}
