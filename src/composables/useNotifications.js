import { ref, computed } from 'vue';
import { supabase, authService, profileService, notificationService, friendService } from '@/services/supabaseService';
import { playNotificationSound, playDuelChallengeSound } from '@/utils/soundEffects';

// Shared Reactive Singleton State
const isInitialized = ref(false);
const currentUserId = ref(null);

const broadcastNotifications = ref([]);
const readNotificationIds = ref([]);
const pendingRequests = ref([]);
const pendingDuels = ref([]);
const loading = ref(true);

let authSubscription = null;
let realtimeChannel = null;

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

async function loadNotificationsForUser(user) {
  if (!user) {
    currentUserId.value = null;
    broadcastNotifications.value = [];
    readNotificationIds.value = [];
    pendingRequests.value = [];
    pendingDuels.value = [];
    loading.value = false;
    return;
  }

  currentUserId.value = user.id;

  try {
    const profile = await profileService.getProfile(user.id);
    if (profile) {
      readNotificationIds.value = profile.read_notifications || [];
    }

    const notifs = await notificationService.getNotifications();
    broadcastNotifications.value = (notifs || []).map(n => ({
      id: n.id,
      title: n.title,
      message: n.message || n.text,
      target: n.target || 'all',
      createdAt: n.created_at,
      ...n
    }));

    const requests = await friendService.getPendingRequests(user.id);
    if (requests.length > prevRequestsCount && prevRequestsCount > 0) {
      playNotificationSound();
    }
    prevRequestsCount = requests.length;
    pendingRequests.value = requests;

    const duels = await friendService.getPendingDuels(user.id);
    if (duels.length > prevDuelsCount && prevDuelsCount > 0) {
      playDuelChallengeSound();
    }
    prevDuelsCount = duels.length;
    pendingDuels.value = duels;
  } catch (err) {
    console.warn('Notifications fetch warning:', err);
  } finally {
    loading.value = false;
  }
}

function initNotificationListeners() {
  authService.getUser().then((user) => {
    loadNotificationsForUser(user);
  });

  const { data: sub } = authService.onAuthStateChange((event, session) => {
    loadNotificationsForUser(session?.user || null);
  });
  authSubscription = sub?.subscription;

  // Realtime subscription via Supabase Channel
  try {
    realtimeChannel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.new) {
            broadcastNotifications.value.unshift({
              id: payload.new.id,
              ...payload.new
            });
            playNotificationSound();
          }
        }
      )
      .subscribe();
  } catch (e) {
    console.warn('Realtime channel fallback:', e);
  }
}
