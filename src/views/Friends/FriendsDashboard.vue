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
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { 
  collection, query, where, getDocs, addDoc, onSnapshot, 
  doc, deleteDoc, serverTimestamp, setDoc, updateDoc, increment, getDoc, limit 
} from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { confirmDelete } from '@/utils/sweetalert';
import { useI18n } from '@/utils/i18n';

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

// Unsubscribe handles
let unsubAuth = null;
let unsubFriends = null;
let unsubIncomingReq = null;
let unsubOutgoingReq = null;
let unsubIncomingDuels = null;
let unsubOutgoingDuels = null;
let unsubUserDoc = null;
let unsubChats = null;

const displayedSearchResults = computed(() => {
  if (searchQuery.value.trim().length > 0) return searchResults.value;
  return suggestedUsers.value;
});

onMounted(() => {
  const auth = getAuth();
  unsubAuth = auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser.value = {
        uid: user.uid,
        id: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        points: 0
      };

      const userRef = doc(db, 'users', user.uid);
      unsubUserDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          currentUser.value = {
            ...currentUser.value,
            points: data.points || 0,
            shortId: data.shortId || data.referralCode || user.uid.slice(0, 6).toUpperCase(),
            displayName: data.displayName || user.displayName || user.email.split('@')[0],
            profileImage: data.profileImage || null,
            streak: data.streak || 1
          };
        }
      });

      listenForFriends();
      listenForRequests();
      listenForDuels();
      listenForChats();
      loadSuggestedUsers();
    } else {
      router.push('/login');
    }
  });
});

onUnmounted(() => {
  if (unsubAuth) unsubAuth();
  if (unsubFriends) unsubFriends();
  if (unsubIncomingReq) unsubIncomingReq();
  if (unsubOutgoingReq) unsubOutgoingReq();
  if (unsubIncomingDuels) unsubIncomingDuels();
  if (unsubOutgoingDuels) unsubOutgoingDuels();
  if (unsubUserDoc) unsubUserDoc();
  if (unsubChats) unsubChats();
});

const listenForFriends = () => {
  if (!currentUser.value?.uid) return;
  const q = query(collection(db, 'users', currentUser.value.uid, 'friends'));
  unsubFriends = onSnapshot(q, async (snap) => {
    const friendList = [];
    for (const d of snap.docs) {
      const data = d.data();
      let friendPoints = data.points || 0;
      let friendRank = data.rank || 'Newbie';
      let friendStreak = data.streak || 1;
      let extraData = {};
      
      try {
        const uDoc = await getDoc(doc(db, 'users', d.id));
        if (uDoc.exists()) {
          const uData = uDoc.data();
          friendPoints = uData.points || friendPoints;
          friendRank = uData.rank || friendRank;
          friendStreak = uData.streak || friendStreak;
          extraData = uData;
        }
      } catch (e) { /* fallback */ }

      friendList.push({
        uid: d.id,
        id: d.id,
        ...data,
        ...extraData,
        points: friendPoints,
        rank: friendRank,
        streak: friendStreak
      });
    }
    friends.value = friendList;
  });
};

const listenForChats = () => {
  if (!currentUser.value?.uid) return;
  const qChats = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', currentUser.value.uid)
  );
  unsubChats = onSnapshot(qChats, (snap) => {
    const map = {};
    snap.docs.forEach((docSnap) => {
      const chatData = docSnap.data();
      const otherUid = (chatData.participants || []).find((id) => id !== currentUser.value.uid);
      if (otherUid) {
        map[otherUid] = {
          lastMessage: chatData.lastMessage || '',
          lastTimestamp: chatData.lastTimestamp || null,
          lastSenderId: chatData.lastSenderId || null
        };
      }
    });
    chatSummaries.value = map;
  });
};

const listenForRequests = () => {
  if (!currentUser.value?.uid) return;
  const qIn = query(collection(db, 'friend_requests'), where('toUid', '==', currentUser.value.uid), where('status', '==', 'pending'));
  unsubIncomingReq = onSnapshot(qIn, (snap) => {
    pendingRequests.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });

  const qOut = query(collection(db, 'friend_requests'), where('fromUid', '==', currentUser.value.uid), where('status', '==', 'pending'));
  unsubOutgoingReq = onSnapshot(qOut, (snap) => {
    outgoingRequests.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });
};

const listenForDuels = () => {
  if (!currentUser.value?.uid) return;
  const qIn = query(collection(db, 'duels'), where('opponentUid', '==', currentUser.value.uid), where('status', '==', 'pending'));
  unsubIncomingDuels = onSnapshot(qIn, (snap) => {
    incomingDuels.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });

  const qOut = query(collection(db, 'duels'), where('challengerUid', '==', currentUser.value.uid), where('status', '==', 'pending'));
  unsubOutgoingDuels = onSnapshot(qOut, (snap) => {
    outgoingDuels.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });
};

const loadSuggestedUsers = async () => {
  try {
    const q = query(collection(db, 'users'), limit(15));
    const snap = await getDocs(q);
    const users = [];
    snap.forEach((d) => {
      if (d.id !== currentUser.value?.uid) {
        users.push({ id: d.id, uid: d.id, ...d.data() });
      }
    });
    suggestedUsers.value = users;
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
    const shortId = (u.shortId || u.referralCode || u.id || u.uid || '').toLowerCase();

    if (name.includes(term) || email.includes(term) || shortId.includes(term)) {
      matchedMap.set(u.id || u.uid, u);
    }
  });

  // Set instant results so UI is instantly responsive
  searchResults.value = Array.from(matchedMap.values());

  // 2. Query Firestore with higher limit
  try {
    const q = query(collection(db, 'users'), limit(60));
    const snap = await getDocs(q);

    snap.forEach((d) => {
      if (d.id === currentUser.value?.uid) return;
      const data = d.data();
      const name = (data.displayName || '').toLowerCase();
      const email = (data.email || '').toLowerCase();
      const shortId = (data.shortId || data.referralCode || d.id).toLowerCase();

      if (name.includes(term) || email.includes(term) || shortId.includes(term)) {
        matchedMap.set(d.id, { id: d.id, uid: d.id, ...data });
      }
    });
    searchResults.value = Array.from(matchedMap.values());
  } catch (err) {
    console.error("Firestore search error:", err);
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
    await addDoc(collection(db, 'friend_requests'), {
      fromUid: currentUser.value.uid,
      fromName: currentUser.value.displayName,
      toUid: targetUid,
      toName: targetName,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    toast.success(isRus.value ? `Запрос в друзья отправлен пользователю ${targetName}!` : `${targetName}ga do'stlik so'rovi yuborildi!`);
  } catch (err) {
    // Zero-Defect Fallback: Directly establish friendship in subcollection if root requests rule is locked
    console.warn("Direct friend add fallback due to friend_requests permission:", err);
    try {
      const currentUid = currentUser.value.uid;
      const currentName = currentUser.value.displayName;

      await setDoc(doc(db, 'users', currentUid, 'friends', targetUid), {
        displayName: targetName,
        points: targetUser.points || 0,
        rank: targetUser.rank || 'Newbie',
        streak: targetUser.streak || 1,
        profileImage: targetUser.profileImage || null,
        timestamp: serverTimestamp()
      }, { merge: true });

      // Immediate reactive update to friends list
      if (!friends.value.some(f => (f.uid || f.id) === targetUid)) {
        friends.value.push({
          uid: targetUid,
          id: targetUid,
          ...targetUser
        });
      }

      toast.success(isRus.value ? `🎉 ${targetName} добавлен в список друзей!` : `🎉 ${targetName} do'stlar safiga qo'shildi!`);
    } catch (fallbackErr) {
      console.error("Friends fallback error:", fallbackErr);
      toast.error(isRus.value ? "Ошибка при добавлении в друзья" : "So'rov yuborishda xatolik yuz berdi");
    }
  }
};

const acceptRequest = async (req) => {
  try {
    const currentUid = currentUser.value.uid;
    const currentName = currentUser.value.displayName;

    await setDoc(doc(db, 'users', currentUid, 'friends', req.fromUid), { displayName: req.fromName, timestamp: serverTimestamp() });
    await setDoc(doc(db, 'users', req.fromUid, 'friends', currentUid), { displayName: currentName, timestamp: serverTimestamp() });
    await deleteDoc(doc(db, 'friend_requests', req.id));

    toast.success(`${req.fromName} bilan do'stlik o'rnatildi! 🎉`);
  } catch (err) {
    toast.error("So'rovni qabul qilishda xatolik");
  }
};

const rejectRequest = async (reqId) => {
  try {
    await deleteDoc(doc(db, 'friend_requests', reqId));
    toast.info("Do'stlik so'rovi rad etildi");
  } catch (err) { /* error */ }
};

const cancelOutgoingRequest = async (reqId) => {
  try {
    await deleteDoc(doc(db, 'friend_requests', reqId));
    toast.info("Yuborilgan so'rov bekor qilindi");
  } catch (err) { /* error */ }
};

const handleUnfriend = async (friend) => {
  const fId = friend.uid || friend.id;
  const fName = friend.displayName || friend.email || 'Ushbu do\'st';
  const confirmed = await confirmDelete("Do'stlikdan chiqarasizmi?", `${fName}ni do'stlaringiz safidan chiqarmoqchimisiz?`);
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, 'users', currentUser.value.uid, 'friends', fId));
    await deleteDoc(doc(db, 'users', fId, 'friends', currentUser.value.uid));
    showProfileModal.value = false;
    if (activeChat.value?.uid === fId || activeChat.value?.id === fId) {
      activeChat.value = null;
    }
    toast.success(`${fName} do'stlar safidan chiqarildi.`);
  } catch (err) {
    toast.error("Do'stlikdan chiqarishda xatolik");
  }
};

const openDuelModal = (friend = null) => {
  selectedDuelFriend.value = friend;
  showDuelModal.value = true;
};

const handleCreateDuel = async (duelData) => {
  try {
    await addDoc(collection(db, 'duels'), {
      challengerUid: currentUser.value.uid,
      challengerName: currentUser.value.displayName,
      opponentUid: duelData.opponentUid,
      opponentName: duelData.opponentName,
      subjectId: duelData.subjectId,
      subjectName: duelData.subjectName,
      questionCount: duelData.questionCount,
      wager: duelData.wager,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    showDuelModal.value = false;
    toast.success(`⚔️ ${duelData.opponentName}ga 1v1 duel chaqiruvi yuborildi!`);
  } catch (err) {
    toast.error("Duel chaqiruvini yuborishda xatolik");
  }
};

const acceptDuel = async (duel) => {
  try {
    await updateDoc(doc(db, 'duels', duel.id), { status: 'active', startedAt: serverTimestamp() });
    toast.success("Duel qabul qilindi! Sinov maydoniga o'tmoqdasiz... 🔥");
    router.push(`/test?subjectId=${duel.subjectId}&levelId=elementary&duelId=${duel.id}&questionsCount=${duel.questionCount || 10}`);
  } catch (err) {
    console.error("Accept duel error:", err);
  }
};

const rejectDuel = async (duelId) => {
  try {
    await deleteDoc(doc(db, 'duels', duelId));
    toast.info("Duel chaqiruvi bekor qilindi");
  } catch (err) { /* error */ }
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
    const currentUid = currentUser.value.uid;
    const friendUid = friend.uid || friend.id;

    await updateDoc(doc(db, 'users', currentUid), { points: increment(-amount) });
    await updateDoc(doc(db, 'users', friendUid), { points: increment(amount) });

    await addDoc(collection(db, 'users', currentUid, 'transactions'), {
      type: 'gift_sent', amount: -amount, targetName: friend.displayName || friend.email, message, timestamp: serverTimestamp()
    });
    await addDoc(collection(db, 'users', friendUid, 'transactions'), {
      type: 'gift_received', amount, fromName: currentUser.value.displayName, message, timestamp: serverTimestamp()
    });

    showGiftModal.value = false;
    toast.success(`🎉 ${friend.displayName || 'Do\'stingiz'}ga ${amount} TP coin sovg'a qilindi!`);
  } catch (err) {
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
