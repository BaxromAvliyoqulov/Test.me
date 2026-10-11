<template>
  <div class="friends-dashboard-wrapper">
    <!-- Glowing background elements -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="friends-container">
      <!-- Header Banner -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-badge"><i class="fas fa-users-rays"></i> Hamjamiyat & Do'stlar</div>
          <h2>{{ isRus ? 'Друзья и Тестовые Дуэли' : "Do'stlar va 1v1 Test Duellari" }}</h2>
          <p>{{ isRus ? 'Находите единомышленников, соревнуйтесь в 1v1 дуэлях и делитесь знаниями!' : "Bilimdon do'stlaringizni toping, 1v1 musobaqalarda bellashing va o'zaro tajriba almashing!" }}</p>
        </div>

        <div class="header-stats-row">
          <div class="stat-pill">
            <span class="pill-num">{{ friends.length }}</span>
            <span class="pill-label">Do'stlar</span>
          </div>
          <div class="stat-pill" v-if="pendingRequests.length">
            <span class="pill-num highlight">{{ pendingRequests.length }}</span>
            <span class="pill-label">Yangi so'rov</span>
          </div>
          <div class="stat-pill" v-if="incomingDuels.length">
            <span class="pill-num fire">⚔️ {{ incomingDuels.length }}</span>
            <span class="pill-label">Chaqiruv</span>
          </div>
          <button class="duel-launch-btn" @click="openDuelModal(null)">
            <span>⚔️ 1v1 Duel Boshlash</span>
          </button>
        </div>
      </div>

      <!-- Main Layout -->
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
          <!-- 1. Leaderboard View -->
          <FriendLeaderboard 
            v-if="tab === 'leaderboard'"
            :friends="friends"
            :currentUser="currentUser"
            :isRus="isRus"
            @select-user="openProfileModal"
            @challenge="openDuelModal"
          />

          <!-- 2. Search / Discovery View -->
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
          />

          <!-- 3. Active Chat View -->
          <ChatBox 
            v-else-if="activeChat" 
            :friend="activeChat" 
            :currentUser="currentUser" 
            @close="activeChat = null" 
            class="chat-premium"
          />

          <!-- 4. Default Community Empty State -->
          <div v-else class="empty-state-hub">
            <div class="orb-container">
              <i class="fas fa-users-viewfinder pulse-orb"></i>
            </div>
            <h3>Suhbat yoki Duelni tanlang</h3>
            <p>Chap menyudan do'stingizni tanlang, yangi do'stlarni qidiring yoki 1v1 duel boshlang!</p>
            <div class="quick-chips">
              <button class="chip" @click="tab = 'friends'"><i class="fas fa-user-group"></i> Do'stlar ro'yxati</button>
              <button class="chip" @click="tab = 'leaderboard'"><i class="fas fa-trophy text-warning"></i> Do'stlar reytingi</button>
              <button class="chip" @click="openDuelModal(null)"><i class="fas fa-bolt text-danger"></i> 1v1 Duel</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- 1. Friend Profile Modal -->
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

    <!-- 2. Duel Challenge Modal -->
    <DuelModal 
      :show="showDuelModal"
      :friends="friends"
      :preselectedFriend="selectedDuelFriend"
      :currentUser="currentUser"
      @close="showDuelModal = false"
      @create-duel="handleCreateDuel"
    />

    <!-- 3. Gift Coins Modal -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

// Components
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

// Displayed Search results (either matching search or suggested community users)
const displayedSearchResults = computed(() => {
  if (searchQuery.value.trim().length > 0) {
    return searchResults.value;
  }
  return suggestedUsers.value;
});

onMounted(() => {
  const auth = getAuth();
  unsubAuth = auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser.value = {
        uid: user.uid,
        id: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        points: 0
      };

      // Listen to current user profile doc for points & stats updates
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

      // Start real-time listeners
      listenForFriends();
      listenForRequests();
      listenForDuels();
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
});

// 1. Listen for Friends
const listenForFriends = () => {
  if (!currentUser.value?.uid) return;
  const q = query(collection(db, 'users', currentUser.value.uid, 'friends'));
  unsubFriends = onSnapshot(q, async (snap) => {
    const friendList = [];
    for (const d of snap.docs) {
      const data = d.data();
      // Fetch full friend profile if available
      let friendPoints = data.points || 0;
      let friendRank = data.rank || 'Newbie';
      let friendStreak = data.streak || 1;
      
      try {
        const uDoc = await getDoc(doc(db, 'users', d.id));
        if (uDoc.exists()) {
          const uData = uDoc.data();
          friendPoints = uData.points || friendPoints;
          friendRank = uData.rank || friendRank;
          friendStreak = uData.streak || friendStreak;
        }
      } catch (e) {
        // use local fallback
      }

      friendList.push({
        uid: d.id,
        id: d.id,
        ...data,
        points: friendPoints,
        rank: friendRank,
        streak: friendStreak
      });
    }
    friends.value = friendList;
  });
};

// 2. Listen for Friend Requests (Incoming & Outgoing)
const listenForRequests = () => {
  if (!currentUser.value?.uid) return;

  // Incoming
  const qIn = query(
    collection(db, 'friend_requests'), 
    where('toUid', '==', currentUser.value.uid), 
    where('status', '==', 'pending')
  );
  unsubIncomingReq = onSnapshot(qIn, (snap) => {
    pendingRequests.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });

  // Outgoing
  const qOut = query(
    collection(db, 'friend_requests'), 
    where('fromUid', '==', currentUser.value.uid), 
    where('status', '==', 'pending')
  );
  unsubOutgoingReq = onSnapshot(qOut, (snap) => {
    outgoingRequests.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });
};

// 3. Listen for Duels (Incoming & Outgoing)
const listenForDuels = () => {
  if (!currentUser.value?.uid) return;

  // Incoming duels
  const qIn = query(
    collection(db, 'duels'),
    where('opponentUid', '==', currentUser.value.uid),
    where('status', '==', 'pending')
  );
  unsubIncomingDuels = onSnapshot(qIn, (snap) => {
    incomingDuels.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });

  // Outgoing duels
  const qOut = query(
    collection(db, 'duels'),
    where('challengerUid', '==', currentUser.value.uid),
    where('status', '==', 'pending')
  );
  unsubOutgoingDuels = onSnapshot(qOut, (snap) => {
    outgoingDuels.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });
};

// 4. Load Suggested Community Users
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

// 5. Intelligent Multi-Field Search (Case-Insensitive)
const searchUsers = async () => {
  const term = searchQuery.value.trim().toLowerCase();
  if (!term) {
    searchResults.value = [];
    return;
  }

  activeChat.value = null;

  try {
    const q = query(collection(db, 'users'), limit(40));
    const snap = await getDocs(q);
    const matches = [];

    snap.forEach((d) => {
      if (d.id === currentUser.value?.uid) return;
      const data = d.data();
      const name = (data.displayName || '').toLowerCase();
      const email = (data.email || '').toLowerCase();
      const shortId = (data.shortId || data.referralCode || d.id).toLowerCase();

      if (name.includes(term) || email.includes(term) || shortId.includes(term)) {
        matches.push({ id: d.id, uid: d.id, ...data });
      }
    });

    searchResults.value = matches;
  } catch (err) {
    console.error("Search error:", err);
    toast.error("Qidiruvda xatolik yuz berdi");
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};

// 6. Send Friend Request
const sendRequest = async (targetUser) => {
  try {
    const targetUid = targetUser.id || targetUser.uid;
    const targetName = targetUser.displayName || targetUser.email;

    await addDoc(collection(db, 'friend_requests'), {
      fromUid: currentUser.value.uid,
      fromName: currentUser.value.displayName,
      toUid: targetUid,
      toName: targetName,
      status: 'pending',
      timestamp: serverTimestamp()
    });

    toast.success(`${targetName}ga do'stlik so'rovi yuborildi!`);
  } catch (err) {
    console.error("Send request error:", err);
    toast.error("So'rov yuborishda xatolik yuz berdi");
  }
};

// 7. Accept Friend Request
const acceptRequest = async (req) => {
  try {
    const currentUid = currentUser.value.uid;
    const currentName = currentUser.value.displayName;

    // Add to current user's friends list
    await setDoc(doc(db, 'users', currentUid, 'friends', req.fromUid), {
      displayName: req.fromName,
      timestamp: serverTimestamp()
    });

    // Add to sender's friends list
    await setDoc(doc(db, 'users', req.fromUid, 'friends', currentUid), {
      displayName: currentName,
      timestamp: serverTimestamp()
    });

    // Delete request doc
    await deleteDoc(doc(db, 'friend_requests', req.id));

    toast.success(`${req.fromName} bilan do'stlik o'rnatildi! 🎉`);
  } catch (err) {
    console.error("Accept request error:", err);
    toast.error("So'rovni qabul qilishda xatolik");
  }
};

// 8. Reject Friend Request
const rejectRequest = async (reqId) => {
  try {
    await deleteDoc(doc(db, 'friend_requests', reqId));
    toast.info("Do'stlik so'rovi rad etildi");
  } catch (err) {
    console.error("Reject request error:", err);
  }
};

// 9. Cancel Outgoing Friend Request
const cancelOutgoingRequest = async (reqId) => {
  try {
    await deleteDoc(doc(db, 'friend_requests', reqId));
    toast.info("Yuborilgan so'rov bekor qilindi");
  } catch (err) {
    console.error("Cancel request error:", err);
  }
};

// 10. Unfriend (Do'stlikdan chiqarish)
const handleUnfriend = async (friend) => {
  const fId = friend.uid || friend.id;
  const fName = friend.displayName || friend.email || 'Ushbu do\'st';

  const confirmed = await confirmDelete(
    "Do'stlikdan chiqarasizmi?",
    `${fName}ni do'stlaringiz safidan chiqarmoqchimisiz?`
  );

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
    console.error("Unfriend error:", err);
    toast.error("Do'stlikdan chiqarishda xatolik");
  }
};

// 11. 1v1 Duel Operations
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
    console.error("Create duel error:", err);
    toast.error("Duel chaqiruvini yuborishda xatolik");
  }
};

const acceptDuel = async (duel) => {
  try {
    await updateDoc(doc(db, 'duels', duel.id), {
      status: 'active',
      startedAt: serverTimestamp()
    });

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
  } catch (err) {
    console.error("Reject duel error:", err);
  }
};

// 12. Gift TP Coins
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

    // Deduct from current user
    await updateDoc(doc(db, 'users', currentUid), {
      points: increment(-amount)
    });

    // Add to friend
    await updateDoc(doc(db, 'users', friendUid), {
      points: increment(amount)
    });

    // Add transactions
    await addDoc(collection(db, 'users', currentUid, 'transactions'), {
      type: 'gift_sent',
      amount: -amount,
      targetName: friend.displayName || friend.email,
      message,
      timestamp: serverTimestamp()
    });

    await addDoc(collection(db, 'users', friendUid, 'transactions'), {
      type: 'gift_received',
      amount: amount,
      fromName: currentUser.value.displayName,
      message,
      timestamp: serverTimestamp()
    });

    showGiftModal.value = false;
    toast.success(`🎉 ${friend.displayName || 'Do\'stingiz'}ga ${amount} TP coin sovg'a qilindi!`);
  } catch (err) {
    console.error("Gift error:", err);
    toast.error("Sovg'a yuborishda xatolik yuz berdi");
  }
};

// 13. Profile Modal Helpers
const openProfileModal = (user) => {
  selectedProfileUser.value = user;
  showProfileModal.value = true;
};

const isUserFriend = (uid) => {
  return friends.value.some(f => (f.uid || f.id) === uid);
};

const startChatFromProfile = (friend) => {
  showProfileModal.value = false;
  openChat(friend);
};

const challengeDuelFromProfile = (friend) => {
  showProfileModal.value = false;
  openDuelModal(friend);
};

const sendGiftFromProfile = (friend) => {
  showProfileModal.value = false;
  openGiftModal(friend);
};

// 14. Chat
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
  overflow-x: hidden;
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

/* Header Section */
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 26px;
  padding: 1.75rem 2.25rem;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
}

.header-content {
  max-width: 650px;
}

.title-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #eff6ff;
  color: #2563eb;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.header-content h2 {
  margin: 0 0 0.35rem 0;
  font-size: 1.8rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.header-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.5;
}

.header-stats-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  min-width: 75px;
}

.pill-num {
  font-size: 1.25rem;
  font-weight: 900;
  color: #0f172a;
}

.pill-num.highlight { color: #3b82f6; }
.pill-num.fire { color: #ef4444; }

.pill-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
}

.duel-launch-btn {
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 18px;
  font-size: 0.92rem;
  font-weight: 800;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4);
  transition: all 0.25s;
}

.duel-launch-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(239, 68, 68, 0.5);
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
  min-height: 650px;
}

.sidebar-wrapper {
  height: 100%;
}

.content-area-wrapper {
  height: 100%;
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

/* Empty State Hub */
.empty-state-hub {
  height: 100%;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border: 2px dashed #cbd5e1;
  border-radius: 28px;
  padding: 3rem 2rem;
  text-align: center;
}

.orb-container {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0f2fe, #f0fdf4);
  border: 2px solid #bae6fd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.pulse-orb {
  font-size: 2.5rem;
  color: #0284c7;
  animation: pulseIcon 2s infinite ease-in-out;
}

@keyframes pulseIcon {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.1); opacity: 1; }
}

.empty-state-hub h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.empty-state-hub p {
  font-size: 0.92rem;
  color: #64748b;
  max-width: 480px;
  margin: 0 0 1.75rem 0;
  line-height: 1.5;
}

.quick-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.chip:hover {
  border-color: #3b82f6;
  color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px -2px rgba(59, 130, 246, 0.15);
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-wrapper {
    height: auto;
  }
}

@media (max-width: 640px) {
  .header-section {
    padding: 1.25rem;
  }

  .header-content h2 {
    font-size: 1.4rem;
  }

  .duel-launch-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
