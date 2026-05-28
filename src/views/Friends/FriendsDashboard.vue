<template>
  <div class="friends-dashboard">
    <div class="header">
      <h2><i class="fas fa-users"></i> Friends & Community</h2>
      <p>Connect with other learners, chat, and compare scores!</p>
    </div>

    <div class="main-layout">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="search-users">
          <input 
            v-model="searchQuery" 
            @keyup.enter="searchUsers" 
            placeholder="Search by username..." 
          />
          <button @click="searchUsers"><i class="fas fa-search"></i></button>
        </div>

        <div class="tabs">
          <button :class="{ active: tab === 'friends' }" @click="tab = 'friends'">My Friends</button>
          <button :class="{ active: tab === 'requests' }" @click="tab = 'requests'">
            Requests 
            <span v-if="pendingRequests.length" class="badge">{{ pendingRequests.length }}</span>
          </button>
        </div>

        <!-- Friends List -->
        <div v-if="tab === 'friends'" class="user-list">
          <div v-if="friends.length === 0" class="empty">No friends yet. Search to add some!</div>
          <div v-for="friend in friends" :key="friend.uid" class="user-item">
            <div class="user-info">
              <div class="avatar">{{ friend.displayName ? friend.displayName.charAt(0) : 'U' }}</div>
              <span>{{ friend.displayName }}</span>
            </div>
            <button @click="openChat(friend)" class="btn-chat"><i class="fas fa-comment"></i></button>
          </div>
        </div>

        <!-- Requests List -->
        <div v-if="tab === 'requests'" class="user-list">
          <div v-if="pendingRequests.length === 0" class="empty">No pending requests.</div>
          <div v-for="req in pendingRequests" :key="req.id" class="user-item">
            <div class="user-info">
              <span>{{ req.fromName }}</span>
            </div>
            <div class="actions">
              <button @click="acceptRequest(req)" class="btn-accept"><i class="fas fa-check"></i></button>
              <button @click="rejectRequest(req.id)" class="btn-reject"><i class="fas fa-times"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Area (Search Results or Chat Placeholder) -->
      <div class="content-area">
        <div v-if="searchResults.length > 0" class="search-results">
          <h3>Search Results</h3>
          <div class="grid">
            <div v-for="user in searchResults" :key="user.id" class="result-card">
              <div class="avatar-large">{{ user.displayName ? user.displayName.charAt(0) : 'U' }}</div>
              <h4>{{ user.displayName || user.email }}</h4>
              <span class="user-id-badge">ID: {{ user.shortId || user.referralCode || 'N/A' }}</span>
              <button 
                :disabled="isFriendOrRequested(user.id)" 
                @click="sendRequest(user)" 
                class="btn-add"
              >
                {{ isFriendOrRequested(user.id) ? 'Added / Pending' : 'Add Friend' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="!activeChat" class="empty-state">
          <i class="fas fa-user-friends pulse"></i>
          <h3>Select a friend to start chatting!</h3>
        </div>
        
        <!-- Chat Component -->
        <ChatBox 
          v-if="activeChat" 
          :friend="activeChat" 
          :currentUser="currentUser" 
          @close="activeChat = null" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import ChatBox from '@/components/ChatBox.vue';

export default {
  components: { ChatBox },
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
      this.activeChat = null; // Close chat if searching
      
      const searchTerm = this.searchQuery.trim();
      const searchTermUpper = searchTerm.toUpperCase();

      // Query 1: Search by shortId (Exact match)
      const qId = query(
        collection(db, 'users'),
        where('shortId', '==', searchTermUpper)
      );

      // Query 2: Search by displayName (Prefix match)
      const qName = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff')
      );
      
      const [snapId, snapName] = await Promise.all([getDocs(qId), getDocs(qName)]);
      
      const resultsMap = new Map();
      
      snapId.docs.forEach(d => {
        if (d.id !== this.currentUser.uid) {
          resultsMap.set(d.id, { id: d.id, ...d.data() });
        }
      });
      
      snapName.docs.forEach(d => {
        if (d.id !== this.currentUser.uid && !resultsMap.has(d.id)) {
          resultsMap.set(d.id, { id: d.id, ...d.data() });
        }
      });
      
      this.searchResults = Array.from(resultsMap.values());
    },
    
    isFriendOrRequested(uid) {
      return this.friends.some(f => f.uid === uid) || 
             this.pendingRequests.some(r => r.fromUid === uid || r.toUid === uid);
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
      alert('Friend request sent!');
      this.searchResults = [];
    },
    
    listenForRequests() {
      const q = query(
        collection(db, 'friend_requests'), 
        where('toUid', '==', this.currentUser.uid),
        where('status', '==', 'pending')
      );
      
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
      // Create friend link for both users
      await setDoc(doc(db, 'users', this.currentUser.uid, 'friends', req.fromUid), {
        displayName: req.fromName,
        timestamp: serverTimestamp()
      });
      
      await setDoc(doc(db, 'users', req.fromUid, 'friends', this.currentUser.uid), {
        displayName: this.currentUser.displayName,
        timestamp: serverTimestamp()
      });
      
      // Delete request
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

.friends-dashboard { padding: 30px; font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; min-height: 85vh; }
.header { margin-bottom: 25px; }
.header h2 { font-size: 2rem; color: #0f172a; margin: 0 0 5px; }
.header p { color: #64748b; margin: 0; }

.main-layout { display: flex; gap: 20px; height: 70vh; }
.sidebar { width: 320px; background: white; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
.content-area { flex-grow: 1; background: white; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow-y: auto; display: flex; flex-direction: column; }

.search-users { display: flex; gap: 10px; margin-bottom: 20px; }
.search-users input { flex-grow: 1; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; }
.search-users button { background: #3b82f6; color: white; border: none; padding: 0 15px; border-radius: 10px; cursor: pointer; }

.tabs { display: flex; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; }
.tabs button { flex: 1; padding: 10px; background: none; border: none; font-weight: bold; color: #94a3b8; cursor: pointer; position: relative; }
.tabs button.active { color: #3b82f6; border-bottom: 3px solid #3b82f6; margin-bottom: -2px; }
.badge { background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; margin-left: 5px; }

.user-list { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.empty { text-align: center; color: #94a3b8; padding: 20px; }
.user-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-radius: 12px; background: #f8fafc; transition: background 0.2s; }
.user-item:hover { background: #f1f5f9; }

.user-info { display: flex; align-items: center; gap: 12px; font-weight: bold; color: #1e293b; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

.btn-chat { background: #e0e7ff; color: #4f46e5; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; }
.btn-chat:hover { background: #c7d2fe; }

.actions { display: flex; gap: 5px; }
.btn-accept { background: #10b981; color: white; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
.btn-reject { background: #ef4444; color: white; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }

/* Search Results Grid */
.search-results .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; margin-top: 15px; }
.result-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.avatar-large { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #a855f7, #3b82f6); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; }
.user-id-badge { font-size: 0.75rem; background: #f1f5f9; color: #64748b; padding: 4px 8px; border-radius: 6px; font-weight: bold; margin-top: -5px; margin-bottom: 5px; }
.btn-add { background: #3b82f6; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; }
.btn-add:disabled { background: #cbd5e1; cursor: not-allowed; }

.empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; }
.empty-state i { font-size: 5rem; margin-bottom: 20px; color: #e2e8f0; }
</style>
