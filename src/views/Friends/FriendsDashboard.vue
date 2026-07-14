<template>
  <div class="friends-dashboard-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="friends-container">
      <div class="header-section">
        <h2><i class="fas fa-users"></i> {{ isRus ? 'Друзья и Сообщество' : "Do'stlar va Hamjamiyat" }}</h2>
        <p>{{ isRus ? 'Общайтесь с другими учениками, соревнуйтесь и делитесь результатами!' : "Boshqa foydalanuvchilar bilan suhbatlashing va natijalar bilan bo'lishing!" }}</p>
      </div>

      <div class="main-layout">
        <!-- Sidebar -->
        <div class="sidebar-wrapper">
          <FriendsSidebar 
            v-model:searchQuery="searchQuery"
            v-model:tab="tab"
            :friends="friends"
            :pendingRequests="pendingRequests"
            :isRus="isRus"
            @search="searchUsers"
            @open-chat="openChat"
            @accept-request="acceptRequest"
            @reject-request="rejectRequest"
          />
        </div>

        <!-- Main Area -->
        <div class="content-area-wrapper">
          <FriendsSearchGrid 
            v-if="searchResults.length > 0"
            :searchResults="searchResults"
            :isRus="isRus"
            :isFriendOrRequested="isFriendOrRequested"
            @send-request="sendRequest"
          />
          
          <div v-else-if="!activeChat" class="empty-state-premium">
            <div class="glass-orb">
              <i class="fas fa-user-friends pulse"></i>
            </div>
            <h3>{{ isRus ? 'Выберите друга для общения!' : "Suhbatlashish uchun do'st tanlang!" }}</h3>
          </div>
          
          <!-- Chat Component -->
          <ChatBox 
            v-if="activeChat" 
            :friend="activeChat" 
            :currentUser="currentUser" 
            @close="activeChat = null" 
            class="chat-premium"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import ChatBox from '@/components/ChatBox.vue';
import FriendsSidebar from '@/components/friends/FriendsSidebar.vue';
import FriendsSearchGrid from '@/components/friends/FriendsSearchGrid.vue';
import { useI18n } from '@/utils/i18n';

export default {
  name: 'FriendsDashboard',
  components: { ChatBox, FriendsSidebar, FriendsSearchGrid },
  setup() {
    const { locale } = useI18n();
    return { currentLocale: locale };
  },
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      tab: 'friends',
      friends: [],
      pendingRequests: [],
      activeChat: null,
      currentUser: null,
      unsubReq: null,
      unsubFriends: null
    };
  },
  computed: {
    isRus() {
      return this.currentLocale === 'RUS';
    }
  },
  mounted() {
    const auth = getAuth();
    auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUser = { uid: user.uid, displayName: user.displayName || user.email };
        this.listenForRequests();
        this.listenForFriends();
      } else {
        this.$router.push('/login');
      }
    });
  },
  unmounted() {
    if (this.unsubReq) this.unsubReq();
    if (this.unsubFriends) this.unsubFriends();
  },
  methods: {
    async searchUsers() {
      if (!this.searchQuery.trim()) return;
      this.activeChat = null;
      
      const searchTerm = this.searchQuery.trim();
      const searchTermUpper = searchTerm.toUpperCase();

      const qId = query(collection(db, 'users'), where('shortId', '==', searchTermUpper));
      const qName = query(collection(db, 'users'), where('displayName', '>=', searchTerm), where('displayName', '<=', searchTerm + '\\uf8ff'));
      
      const [snapId, snapName] = await Promise.all([getDocs(qId), getDocs(qName)]);
      
      const resultsMap = new Map();
      
      snapId.docs.forEach(d => {
        if (d.id !== this.currentUser.uid) resultsMap.set(d.id, { id: d.id, ...d.data() });
      });
      
      snapName.docs.forEach(d => {
        if (d.id !== this.currentUser.uid && !resultsMap.has(d.id)) resultsMap.set(d.id, { id: d.id, ...d.data() });
      });
      
      this.searchResults = Array.from(resultsMap.values());
    },
    
    isFriendOrRequested(uid) {
      return this.friends.some(f => f.uid === uid) || this.pendingRequests.some(r => r.fromUid === uid || r.toUid === uid);
    },
    
    async sendRequest(targetUser) {
      await addDoc(collection(db, 'friend_requests'), {
        fromUid: this.currentUser.uid,
        fromName: this.currentUser.displayName,
        toUid: targetUser.id,
        toName: targetUser.displayName || targetUser.email,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      alert(this.isRus ? 'Запрос отправлен!' : "So'rov yuborildi!");
      this.searchResults = [];
    },
    
    listenForRequests() {
      const q = query(collection(db, 'friend_requests'), where('toUid', '==', this.currentUser.uid), where('status', '==', 'pending'));
      this.unsubReq = onSnapshot(q, snap => {
        this.pendingRequests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    },
    
    listenForFriends() {
      const q = query(collection(db, 'users', this.currentUser.uid, 'friends'));
      this.unsubFriends = onSnapshot(q, snap => {
        this.friends = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      });
    },
    
    async acceptRequest(req) {
      await setDoc(doc(db, 'users', this.currentUser.uid, 'friends', req.fromUid), { displayName: req.fromName, timestamp: serverTimestamp() });
      await setDoc(doc(db, 'users', req.fromUid, 'friends', this.currentUser.uid), { displayName: this.currentUser.displayName, timestamp: serverTimestamp() });
      await deleteDoc(doc(db, 'friend_requests', req.id));
    },
    
    async rejectRequest(reqId) {
      await deleteDoc(doc(db, 'friend_requests', reqId));
    },
    
    openChat(friend) {
      this.searchResults = [];
      this.activeChat = friend;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.friends-dashboard-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 3rem 1.5rem;
}

/* Background glowing elements */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.08;
}
.glow-bg-1 { width: 450px; height: 450px; background: #3b82f6; top: -5%; left: -5%; }
.glow-bg-2 { width: 450px; height: 450px; background: #10b981; bottom: -5%; right: -5%; }

.friends-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  width: 95%;
  margin: 0 auto;
}

.header-section { text-align: center; margin-bottom: 2rem; }
.header-section h2 { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; letter-spacing: -1px; }
.header-section p { color: #64748b; font-size: 1rem; }

.main-layout { display: flex; gap: 1.5rem; height: 75vh; }
.sidebar-wrapper { width: 340px; flex-shrink: 0; }
.content-area-wrapper { flex-grow: 1; display: flex; flex-direction: column; }

.empty-state-premium {
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

.glass-orb {
  width: 120px; height: 120px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1));
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 8px 32px rgba(0,0,0,0.05);
}

.glass-orb i { font-size: 3.5rem; color: #3b82f6; }
.empty-state-premium h3 { font-size: 1.4rem; color: #1e293b; margin: 0; font-weight: 800; }

.chat-premium {
  height: 100%;
  border-radius: 24px !important;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05) !important;
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
  overflow: hidden;
}

@media (max-width: 900px) {
  .main-layout { flex-direction: column; height: auto; }
  .sidebar-wrapper { width: 100%; height: 500px; }
  .content-area-wrapper { height: 600px; }
}
</style>
