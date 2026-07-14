<template>
  <div class="sidebar-bento">
    <div class="search-users">
      <input 
        :value="searchQuery" 
        @input="$emit('update:searchQuery', $event.target.value)" 
        @keyup.enter="$emit('search')" 
        :placeholder="isRus ? 'Поиск по имени...' : 'Ism bo\'yicha qidirish...'" 
      />
      <button @click="$emit('search')"><i class="fas fa-search"></i></button>
    </div>

    <div class="tabs">
      <button :class="{ active: tab === 'friends' }" @click="$emit('update:tab', 'friends')">
        {{ isRus ? 'Мои Друзья' : "Mening Do'stlarim" }}
      </button>
      <button :class="{ active: tab === 'requests' }" @click="$emit('update:tab', 'requests')">
        {{ isRus ? 'Запросы' : "So'rovlar" }}
        <span v-if="pendingRequests.length" class="badge">{{ pendingRequests.length }}</span>
      </button>
    </div>

    <!-- Friends List -->
    <div v-if="tab === 'friends'" class="user-list">
      <div v-if="friends.length === 0" class="empty">
        <i class="fas fa-user-friends"></i>
        <p>{{ isRus ? 'Пока нет друзей. Найдите кого-нибудь!' : "Hozircha do'stlar yo'q. Qidirib ko'ring!" }}</p>
      </div>
      <div v-for="friend in friends" :key="friend.uid" class="user-item-compact">
        <div class="user-info-compact">
          <div class="avatar-sm">{{ friend.displayName ? friend.displayName.charAt(0).toUpperCase() : 'U' }}</div>
          <span>{{ friend.displayName }}</span>
        </div>
        <button @click="$emit('open-chat', friend)" class="btn-chat-sm"><i class="fas fa-comment"></i></button>
      </div>
    </div>

    <!-- Requests List -->
    <div v-if="tab === 'requests'" class="user-list">
      <div v-if="pendingRequests.length === 0" class="empty">
        <i class="fas fa-envelope-open"></i>
        <p>{{ isRus ? 'Нет новых запросов.' : "Yangi so'rovlar yo'q." }}</p>
      </div>
      <div v-for="req in pendingRequests" :key="req.id" class="user-item-compact">
        <div class="user-info-compact">
          <span>{{ req.fromName }}</span>
        </div>
        <div class="actions-sm">
          <button @click="$emit('accept-request', req)" class="btn-accept-sm"><i class="fas fa-check"></i></button>
          <button @click="$emit('reject-request', req.id)" class="btn-reject-sm"><i class="fas fa-times"></i></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FriendsSidebar',
  props: {
    searchQuery: String,
    tab: String,
    friends: Array,
    pendingRequests: Array,
    isRus: Boolean
  }
}
</script>

<style scoped>
.sidebar-bento {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-users { display: flex; gap: 10px; margin-bottom: 20px; }
.search-users input {
  flex-grow: 1; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; outline: none; transition: 0.3s;
}
.search-users input:focus { border-color: #3b82f6; }
.search-users button {
  background: #3b82f6; color: white; border: none; padding: 0 18px; border-radius: 12px; cursor: pointer; transition: 0.2s;
}
.search-users button:hover { background: #2563eb; }

.tabs { display: flex; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; }
.tabs button {
  flex: 1; padding: 12px; background: none; border: none; font-weight: 700; color: #94a3b8; cursor: pointer; position: relative; transition: 0.3s;
}
.tabs button.active { color: #3b82f6; border-bottom: 3px solid #3b82f6; margin-bottom: -2px; }
.badge { background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; margin-left: 5px; }

.user-list { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 5px; }
.empty { text-align: center; color: #94a3b8; padding: 30px 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.empty i { font-size: 2rem; color: #cbd5e1; }
.empty p { margin: 0; font-size: 0.9rem; }

.user-item-compact { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 16px; background: #f8fafc; border: 1px solid #f1f5f9; transition: 0.2s; }
.user-item-compact:hover { background: #f1f5f9; border-color: #e2e8f0; transform: translateX(2px); }

.user-info-compact { display: flex; align-items: center; gap: 12px; font-weight: 700; color: #0f172a; font-size: 0.95rem; }
.avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; }

.btn-chat-sm { background: #e0e7ff; color: #4f46e5; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; transition: 0.2s; }
.btn-chat-sm:hover { background: #c7d2fe; transform: scale(1.1); }

.actions-sm { display: flex; gap: 6px; }
.btn-accept-sm { background: #10b981; color: white; border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.btn-accept-sm:hover { background: #059669; }
.btn-reject-sm { background: #ef4444; color: white; border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.btn-reject-sm:hover { background: #dc2626; }
</style>