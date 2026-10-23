<template>
  <div class="friends-dashboard-wrapper">
    <!-- Glowing background elements -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="friends-container">
      <!-- 1. Header Banner -->
      <FriendsHeaderBanner
        :friendsCount="friends.length"
        :pendingCount="pendingRequests.length"
        :duelsCount="incomingDuels.length"
        :isRus="isRus"
        @open-duel="openDuelModal(null)"
      />

      <!-- 2. Main Layout -->
      <div class="main-layout">
        <!-- Sidebar Navigation -->
        <div class="sidebar-wrapper">
          <FriendsSidebar 
            v-model:searchQuery="searchQuery"
            v-model:tab="tab"
            :friends="friends"
            :pendingRequests="pendingRequests"
            :outgoingRequests="outgoingRequests"
            :incomingDuels="incomingDuels"
            :outgoingDuels="outgoingDuels"
            :activeChatFriendUid="activeChat?.uid || activeChat?.id"
            :chatSummaries="chatSummaries"
            :currentUser="currentUser"
            :isRus="isRus"
            @search="searchUsers"
            @clear-search="clearSearch"
            @open-chat="openChat"
            @start-duel="openDuelModal"
            @send-gift="openGiftModal"
            @view-profile="openProfileModal"
            @accept-request="acceptRequest"
            @reject-request="rejectRequest"
            @cancel-outgoing-request="cancelOutgoingRequest"
            @accept-duel="acceptDuel"
            @reject-duel="rejectDuel"
          />
        </div>

        <!-- Main Content Area -->
        <div class="content-area-wrapper">
          <!-- Leaderboard View -->
          <FriendLeaderboard 
            v-if="tab === 'leaderboard'"
            :friends="friends"
            :currentUser="currentUser"
            :isRus="isRus"
            @select-user="openProfileModal"
            @challenge="openDuelModal"
          />

          <!-- Search / Discovery View -->
          <FriendsSearchGrid 
            v-else-if="searchQuery.trim().length > 0 || (friends.length === 0 && !activeChat)"
            :searchResults="displayedSearchResults"
            :query="searchQuery"
            :currentUid="currentUser?.uid"
            :friends="friends"
            :pendingRequests="pendingRequests"
            :outgoingRequests="outgoingRequests"
            :isRus="isRus"
            @send-request="sendRequest"
            @view-profile="openProfileModal"
            @open-chat="openChat"
            @start-duel="openDuelModal"
          />

          <!-- Active Chat View -->
          <ChatBox 
            v-else-if="activeChat" 
            :friend="activeChat" 
            :currentUser="currentUser" 
            :isRus="isRus"
            @close="activeChat = null" 
            class="chat-premium"
          />

          <!-- Community Empty Hub -->
          <FriendsEmptyHub
            v-else
            @select-tab="tab = $event"
            @open-duel="openDuelModal(null)"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <FriendProfileModal 
      v-if="showProfileModal"
      :friend="selectedProfileUser"
      :isFriend="isUserFriend(selectedProfileUser?.uid || selectedProfileUser?.id)"
      :isRus="isRus"
      @close="showProfileModal = false"
      @start-chat="startChatFromProfile"
      @challenge-duel="challengeDuelFromProfile"
      @send-gift="sendGiftFromProfile"
      @unfriend="handleUnfriend"
    />

    <DuelModal 
      :show="showDuelModal"
      :friends="friends"
      :preselectedFriend="selectedDuelFriend"
      :currentUser="currentUser"
      @close="showDuelModal = false"
      @create-duel="handleCreateDuel"
    />

    <GiftCoinsModal 
      :show="showGiftModal"
      :friend="selectedGiftFriend"
      :currentUserPoints="currentUser?.points || 0"
      @close="showGiftModal = false"
      @send-gift="handleSendGift"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { confirmDelete } from '@/utils/sweetalert';
import { useI18n } from '@/utils/i18n';
import { supabase, authService, profileService, friendService } from '@/services/supabaseService';

// Modular Child Components
import FriendsHeaderBanner from './components/FriendsHeaderBanner.vue';
import FriendsEmptyHub from './components/FriendsEmptyHub.vue';
import FriendsSidebar from '@/components/friends/FriendsSidebar.vue';
import FriendsSearchGrid from '@/components/friends/FriendsSearchGrid.vue';
import ChatBox from '@/components/friends/ChatBox.vue';
import FriendProfileModal from '@/components/friends/FriendProfileModal.vue';
import DuelModal from '@/components/friends/DuelModal.vue';
import GiftCoinsModal from '@/components/friends/GiftCoinsModal.vue';
import FriendLeaderboard from '@/components/friends/FriendLeaderboard.vue';

const { locale } = useI18n();
const router = useRouter();
const toast = useToast();

const isRus = computed(() => locale.value === 'RUS');

// Core State
const currentUser = ref(null);
const searchQuery = ref('');
const searchResults = ref([]);
const suggestedUsers = ref([]);
const tab = ref('friends');
const friends = ref([]);
const pendingRequests = ref([]);
const outgoingRequests = ref([]);
const incomingDuels = ref([]);
const outgoingDuels = ref([]);
const activeChat = ref(null);
const chatSummaries = ref({});

// Modal States
const showProfileModal = ref(false);
const selectedProfileUser = ref(null);
const showDuelModal = ref(false);
const selectedDuelFriend = ref(null);
const showGiftModal = ref(false);
const selectedGiftFriend = ref(null);

let pollInterval = null;
let realtimeChannel = null;

const displayedSearchResults = computed(() => {
  if (searchQuery.value.trim().length > 0) return searchResults.value;
  return suggestedUsers.value;
});

const loadAllFriendData = async () => {
  if (!currentUser.value?.uid) return;
  const uid = currentUser.value.uid;

  try {
    const [friendsList, inReq, outReq, inDuels, outDuels] = await Promise.all([
      friendService.getFriends(uid),
      friendService.getPendingRequests(uid),
      friendService.getOutgoingRequests(uid),
      friendService.getPendingDuels(uid),
      friendService.getOutgoingDuels(uid)
    ]);

    friends.value = friendsList;
    pendingRequests.value = inReq;
    outgoingRequests.value = outReq;
    incomingDuels.value = inDuels;
    outgoingDuels.value = outDuels;
  } catch (err) {
    console.warn("Friend data loading note:", err);
  }
};

const refreshCurrentUserProfile = async () => {
  if (!currentUser.value?.uid) return;
  try {
    const profile = await profileService.getProfile(currentUser.value.uid);
    if (profile) {
      currentUser.value = {
        ...currentUser.value,
        points: profile.points || 0,
        shortId: profile.short_id || profile.referral_code || currentUser.value.uid.slice(0, 6).toUpperCase(),
        displayName: profile.display_name || profile.full_name || currentUser.value.displayName,
        profileImage: profile.avatar_url || null,
        streak: profile.streak || 1
      };
    }
  } catch (e) {
    console.warn("Profile fetch note:", e);
  }
};

onMounted(async () => {
  const user = await authService.getCurrentUser();
  if (user) {
    currentUser.value = {
      uid: user.id,
      id: user.id,
      displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Foydalanuvchi',
      email: user.email,
      points: 0
    };

    await refreshCurrentUserProfile();
    await loadAllFriendData();
    await loadSuggestedUsers();

    // Subscribe to realtime changes for friend_requests & duels
    try {
      realtimeChannel = supabase
        .channel(`friends_${user.id}`)
        .on('broadcast', { event: 'refresh' }, () => {
          loadAllFriendData();
        })
        .subscribe();
    } catch (e) {
      console.warn("Realtime channel note:", e);
    }

    // Light polling every 12s for fresh state
    pollInterval = setInterval(() => {
      loadAllFriendData();
    }, 12000);
  } else {
    router.push('/login');
  }
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }
});

const loadSuggestedUsers = async () => {
  try {
    suggestedUsers.value = await friendService.getSuggestedUsers(currentUser.value?.uid);
  } catch (err) {
    console.error("Suggested users error:", err);
  }
};

// Real-time live search as user types
watch(searchQuery, (newVal) => {
  if (!newVal || !newVal.trim()) {
    searchResults.value = [];
  } else {
    searchUsers();
  }
});

const searchUsers = async () => {
  const term = searchQuery.value.trim().toLowerCase();
  if (!term) {
    searchResults.value = [];
    return;
  }
  activeChat.value = null;

  // 1. Instant local match across suggested users & existing friends
  const localCandidates = [...suggestedUsers.value, ...friends.value];
  const matchedMap = new Map();

  localCandidates.forEach(u => {
    if (u.id === currentUser.value?.uid || u.uid === currentUser.value?.uid) return;
    const name = (u.displayName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const shortId = (u.shortId || u.id || u.uid || '').toLowerCase();

    if (name.includes(term) || email.includes(term) || shortId.includes(term)) {
      matchedMap.set(u.id || u.uid, u);
    }
  });

  searchResults.value = Array.from(matchedMap.values());

  // 2. Query Supabase
  try {
    const remote = await friendService.searchUsers(term, currentUser.value?.uid);
    remote.forEach(u => matchedMap.set(u.id || u.uid, u));
    searchResults.value = Array.from(matchedMap.values());
  } catch (err) {
    console.warn("Search users note:", err);
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};

const sendRequest = async (targetUser) => {
  const targetUid = targetUser.id || targetUser.uid;
  const targetName = targetUser.displayName || targetUser.email || (isRus.value ? 'Пользователь' : 'Foydalanuvchi');

  try {
    await friendService.sendFriendRequest(currentUser.value, targetUser);
    toast.success(isRus.value ? `Запрос в друзья отправлен пользователю ${targetName}!` : `${targetName}ga do'stlik so'rovi yuborildi!`);
    await loadAllFriendData();
  } catch (err) {
    console.error("Send request error:", err);
    toast.error(isRus.value ? "Ошибка при отправке запроса" : "So'rov yuborishda xatolik yuz berdi");
  }
};

const acceptRequest = async (req) => {
  try {
    await friendService.acceptFriendRequest(req);
    toast.success(`${req.fromName || req.sender_name || 'Do\'stingiz'} bilan do'stlik o'rnatildi! 🎉`);
    await loadAllFriendData();
  } catch (err) {
    console.error("Accept request error:", err);
    toast.error("So'rovni qabul qilishda xatolik");
  }
};

const rejectRequest = async (reqId) => {
  try {
    await friendService.rejectFriendRequest(reqId);
    toast.info("Do'stlik so'rovi rad etildi");
    await loadAllFriendData();
  } catch (err) {
    console.warn("Reject request note:", err);
  }
};

const cancelOutgoingRequest = async (reqId) => {
  try {
    await friendService.rejectFriendRequest(reqId);
    toast.info("Yuborilgan so'rov bekor qilindi");
    await loadAllFriendData();
  } catch (err) {
    console.warn("Cancel outgoing note:", err);
  }
};

const handleUnfriend = async (friend) => {
  const fId = friend.uid || friend.id;
  const fName = friend.displayName || friend.email || 'Ushbu do\'st';
  const confirmed = await confirmDelete("Do'stlikdan chiqarasizmi?", `${fName}ni do'stlaringiz safidan chiqarmoqchimisiz?`);
  if (!confirmed) return;

  try {
    await friendService.removeFriend(currentUser.value.uid, fId);
    showProfileModal.value = false;
    if (activeChat.value?.uid === fId || activeChat.value?.id === fId) {
      activeChat.value = null;
    }
    toast.success(`${fName} do'stlar safidan chiqarildi.`);
    await loadAllFriendData();
  } catch (err) {
    console.error("Unfriend error:", err);
    toast.error("Do'stlikdan chiqarishda xatolik");
  }
};

const openDuelModal = (friend = null) => {
  selectedDuelFriend.value = friend;
  showDuelModal.value = true;
};

const handleCreateDuel = async (duelData) => {
  try {
    await friendService.createDuel(currentUser.value, duelData);
    showDuelModal.value = false;
    toast.success(`⚔️ ${duelData.opponentName}ga 1v1 duel chaqiruvi yuborildi!`);
    await loadAllFriendData();
  } catch (err) {
    console.error("Create duel error:", err);
    toast.error("Duel chaqiruvini yuborishda xatolik");
  }
};

const acceptDuel = async (duel) => {
  try {
    await friendService.acceptDuel(duel.id);
    toast.success("Duel qabul qilindi! Sinov maydoniga o'tmoqdasiz... 🔥");
    router.push(`/test?subjectId=${duel.subjectId || duel.subject_id}&levelId=elementary&duelId=${duel.id}&questionsCount=${duel.questionCount || duel.question_count || 10}`);
  } catch (err) {
    console.error("Accept duel error:", err);
  }
};

const rejectDuel = async (duelId) => {
  try {
    await friendService.rejectDuel(duelId);
    toast.info("Duel chaqiruvi bekor qilindi");
    await loadAllFriendData();
  } catch (err) {
    console.warn("Reject duel note:", err);
  }
};

const openGiftModal = (friend) => {
  selectedGiftFriend.value = friend;
  showGiftModal.value = true;
};

const handleSendGift = async ({ friend, amount, message }) => {
  if ((currentUser.value?.points || 0) < amount) {
    toast.error("Hisobingizda yetarli TP Coin mavjud emas!");
    return;
  }
  try {
    await friendService.sendGift(currentUser.value, friend, amount, message);
    await refreshCurrentUserProfile();
    showGiftModal.value = false;
    toast.success(`🎉 ${friend.displayName || 'Do\'stingiz'}ga ${amount} TP coin sovg'a qilindi!`);
  } catch (err) {
    console.error("Send gift error:", err);
    toast.error("Sovg'a yuborishda xatolik yuz berdi");
  }
};

const openProfileModal = (user) => {
  selectedProfileUser.value = user;
  showProfileModal.value = true;
};

const isUserFriend = (uid) => friends.value.some(f => (f.uid || f.id) === uid);
const startChatFromProfile = (friend) => { showProfileModal.value = false; openChat(friend); };
const challengeDuelFromProfile = (friend) => { showProfileModal.value = false; openDuelModal(friend); };
const sendGiftFromProfile = (friend) => { showProfileModal.value = false; openGiftModal(friend); };

const openChat = (friend) => {
  activeChat.value = friend;
  searchQuery.value = '';
  searchResults.value = [];
};
</script>

<style scoped>
.friends-dashboard-wrapper {
  position: relative;
  min-height: calc(100vh - 80px);
  padding: 1.5rem;
  background: #f8fafc;
  overflow: clip;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.45;
  z-index: 0;
}

.glow-bg-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #38bdf8 0%, rgba(56, 189, 248, 0) 70%);
  top: -100px;
  right: -50px;
}

.glow-bg-2 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, #818cf8 0%, rgba(129, 140, 248, 0) 70%);
  bottom: 0px;
  left: -100px;
}

.friends-container {
  position: relative;
  z-index: 1;
  max-width: 1560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.sidebar-wrapper {
  position: sticky;
  top: 16px;
  height: calc(100vh - 110px);
  max-height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.content-area-wrapper {
  min-height: 650px;
  display: flex;
  flex-direction: column;
}

.chat-premium {
  height: 100%;
  min-height: 620px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  .sidebar-wrapper {
    position: static;
    top: auto;
    height: auto;
    max-height: none;
  }
}
</style>
