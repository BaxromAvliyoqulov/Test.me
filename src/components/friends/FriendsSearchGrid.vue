<template>
  <div class="search-results-bento">
    <div class="results-header">
      <div class="title-wrap">
        <i class="fas fa-compass header-icon"></i>
        <div>
          <h3 class="results-title">{{ isQuerySearch ? 'Qidiruv natijalari' : 'Tavsiya etilgan o\'quvchilar' }}</h3>
          <p class="results-sub">
            {{ isQuerySearch ? `"${query}" bo'yicha ${searchResults.length} nafar foydalanuvchi topildi` : 'Test.me hamjamiyatidagi faol o\'rganuvchilar bilan do\'stlashish imkoniyati' }}
          </p>
        </div>
      </div>
      <span class="count-badge">{{ searchResults.length }} ta</span>
    </div>

    <div v-if="searchResults.length === 0" class="empty-search">
      <div class="empty-orb">
        <i class="fas fa-user-slash"></i>
      </div>
      <h4>Foydalanuvchi topilmadi</h4>
      <p>Iltimos, ism, email yoki unikal #ID kodini to'g'ri kiritganingizni tekshiring.</p>
    </div>

    <div v-else class="grid">
      <div 
        v-for="user in searchResults" 
        :key="user.id || user.uid" 
        class="result-card-premium"
      >
        <div class="card-glass-bg"></div>

        <div class="card-avatar-wrap" @click="$emit('view-profile', user)">
          <img 
            v-if="getUserAvatar(user) && !failedAvatars.has(user.id || user.uid)" 
            :src="getUserAvatar(user)" 
            :alt="getUserDisplayName(user)" 
            class="avatar-large-img"
            @error="handleAvatarError(user.id || user.uid)"
          />
          <div v-else class="avatar-large">
            {{ getUserInitials(user) }}
          </div>
          <span class="avatar-rank-icon" :class="getRankClass(user.points || 0)">
            <i :class="getRankIcon(user.points || 0)"></i>
          </span>
        </div>

        <h4 class="card-user-name" @click="$emit('view-profile', user)" :title="getUserDisplayName(user)">
          {{ getUserDisplayName(user) }}
        </h4>

        <div class="badges-row">
          <span class="user-id-badge">
            <i class="fas fa-hashtag"></i> {{ user.shortId || user.referralCode || (user.id || user.uid).slice(0, 6).toUpperCase() }}
          </span>
          <span class="tp-badge">
            <i class="fas fa-coins text-warning"></i> {{ (user.points || 0).toLocaleString() }} TP
          </span>
        </div>

        <div class="rank-name-label" :class="getRankClass(user.points || 0)">
          {{ getRankName(user.points || 0) }}
        </div>

        <div class="btn-actions">
          <button 
            v-if="isSelf(user.id || user.uid)"
            class="btn-state self"
            disabled
          >
            <i class="fas fa-user-check"></i> Sizning profilingiz
          </button>

          <button 
            v-else-if="isFriend(user.id || user.uid)"
            class="btn-state friend"
            @click="$emit('view-profile', user)"
          >
            <i class="fas fa-user-group"></i> Do'stingiz
          </button>

          <button 
            v-else-if="isPending(user.id || user.uid)"
            class="btn-state pending"
            disabled
          >
            <i class="fas fa-hourglass-half"></i> So'rov yuborilgan
          </button>

          <button 
            v-else
            class="btn-add-premium"
            @click="$emit('send-request', user)"
          >
            <i class="fas fa-user-plus"></i> + Do'stlik So'rovi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getRankName, getRankClass, getRankIcon } from '@/utils/ranks';
import { getUserDisplayName, getUserAvatar, getUserInitials } from '@/utils/userHelpers';

const failedAvatars = ref(new Set());
const handleAvatarError = (id) => {
  if (id) failedAvatars.value.add(id);
};

const props = defineProps({
  searchResults: { type: Array, default: () => [] },
  query: { type: String, default: '' },
  currentUid: { type: String, default: '' },
  friends: { type: Array, default: () => [] },
  pendingRequests: { type: Array, default: () => [] },
  outgoingRequests: { type: Array, default: () => [] },
  isRus: { type: Boolean, default: false }
});

defineEmits(['send-request', 'view-profile']);

const isQuerySearch = computed(() => !!props.query.trim());

const isSelf = (uid) => uid === props.currentUid;

const isFriend = (uid) => {
  return props.friends.some(f => (f.uid || f.id) === uid);
};

const isPending = (uid) => {
  return props.outgoingRequests.some(r => r.toUid === uid) || 
         props.pendingRequests.some(r => r.fromUid === uid);
};
</script>

<style scoped>
.search-results-bento {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 2rem;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2.2rem;
  color: #3b82f6;
  filter: drop-shadow(0 4px 10px rgba(59, 130, 246, 0.3));
}

.results-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
}

.results-sub {
  margin: 0.25rem 0 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.count-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.4rem 0.85rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.82rem;
}

.empty-search {
  text-align: center;
  padding: 4rem 1rem;
  color: #94a3b8;
}

.empty-orb {
  width: 70px;
  height: 70px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: #94a3b8;
  margin: 0 auto 1rem auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.result-card-premium {
  position: relative;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}

.result-card-premium:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
  box-shadow: 0 15px 30px -10px rgba(59, 130, 246, 0.2);
}

.card-avatar-wrap {
  position: relative;
  cursor: pointer;
  margin-bottom: 0.75rem;
}

.avatar-large,
.avatar-large-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-size: 1.6rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
}

.avatar-rank-icon {
  position: absolute;
  bottom: 0;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.card-user-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  max-width: 190px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.badges-row {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}

.user-id-badge, .tp-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
}

.user-id-badge {
  background: #f1f5f9;
  color: #475569;
}

.tp-badge {
  background: #fef3c7;
  color: #b45309;
}

.rank-name-label {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1.1rem;
}

.btn-actions {
  width: 100%;
}

.btn-add-premium {
  width: 100%;
  padding: 0.65rem 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.82rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s;
  box-shadow: 0 6px 16px -2px rgba(59, 130, 246, 0.4);
}

.btn-add-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -2px rgba(59, 130, 246, 0.5);
}

.btn-state {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-state.self {
  background: #f1f5f9;
  color: #94a3b8;
}

.btn-state.friend {
  background: #ecfdf5;
  color: #059669;
  cursor: pointer;
}

.btn-state.pending {
  background: #fffbeb;
  color: #b45309;
}
</style>