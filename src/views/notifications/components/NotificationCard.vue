<template>
  <div 
    class="notif-card"
    :class="[
      item.category, 
      { 'is-unread': !isRead }
    ]"
    @click="$emit('click-card', item)"
  >
    <!-- Card Icon Pillar -->
    <div class="icon-pillar" :class="item.category">
      <i :class="item.icon"></i>
    </div>

    <!-- Card Main Content -->
    <div class="card-content">
      <div class="card-top">
        <span class="category-tag" :class="item.category">
          {{ item.categoryLabel }}
        </span>
        <span class="time-stamp">
          <i class="far fa-clock"></i> {{ formattedTime }}
        </span>
      </div>

      <h4 class="card-title">{{ item.title }}</h4>
      <p class="card-message">{{ item.message }}</p>

      <!-- Interactive Actions for Duels -->
      <div v-if="item.type === 'duel_challenge'" class="card-interactive-row" @click.stop>
        <div class="duel-wager-pill">
          <i class="fas fa-coins text-warning"></i>
          <span>{{ item.data?.wager ? item.data.wager + ' TP garov' : 'Do\'stona sinov' }}</span>
        </div>
        <div class="actions-buttons">
          <button class="btn-action duel-accept" @click="$emit('accept-duel', item.data)">
            <i class="fas fa-play"></i> Qabul qilish
          </button>
          <button class="btn-action duel-reject" @click="$emit('reject-duel', item.data.id)">
            <i class="fas fa-times"></i> Rad etish
          </button>
        </div>
      </div>

      <!-- Interactive Actions for Friend Requests -->
      <div v-else-if="item.type === 'friend_request'" class="card-interactive-row" @click.stop>
        <div class="actions-buttons">
          <button class="btn-action friend-accept" @click="$emit('accept-friend', item.data)">
            <i class="fas fa-user-check"></i> Do'stlikni Qabul Qilish
          </button>
          <button class="btn-action friend-reject" @click="$emit('reject-friend', item.data.id)">
            <i class="fas fa-user-xmark"></i> Rad etish
          </button>
        </div>
      </div>

      <!-- Quick action for System Links -->
      <div v-else-if="item.link" class="card-link-row">
        <router-link :to="item.link" class="action-link">
          <span>{{ item.linkText || "Ko'rish" }}</span>
          <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>
    </div>

    <!-- Card Right Controls -->
    <div class="card-controls" @click.stop>
      <button 
        class="control-btn toggle-read" 
        :title="isRead ? 'O\'qilmagan qilish' : 'O\'qilgan deb belgilash'"
        @click="$emit('toggle-read', item.feedId)"
      >
        <i :class="isRead ? 'far fa-envelope' : 'fas fa-check'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: { type: Object, required: true },
  isRead: { type: Boolean, default: false }
});

defineEmits([
  'click-card', 
  'toggle-read', 
  'accept-duel', 
  'reject-duel', 
  'accept-friend', 
  'reject-friend'
]);

const formattedTime = computed(() => {
  const ts = props.item.timestamp;
  if (!ts) return 'Yaqinda';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Hozirgina';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} daqiqa oldin`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} soat oldin`;
    return d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Yaqinda';
  }
});
</script>

<style scoped>
.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.notif-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
}

.notif-card.is-unread {
  background: linear-gradient(135deg, #ffffff, #f0f7ff);
  border-color: #93c5fd;
  box-shadow: 0 6px 20px -4px rgba(59, 130, 246, 0.15);
}

.icon-pillar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.icon-pillar.duels { background: #fee2e2; color: #dc2626; }
.icon-pillar.social { background: #e0f2fe; color: #0284c7; }
.icon-pillar.rewards { background: #fef3c7; color: #d97706; }
.icon-pillar.system { background: #f1f5f9; color: #475569; }

.card-content {
  flex: 1;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.category-tag {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.category-tag.duels { background: #fee2e2; color: #b91c1c; }
.category-tag.social { background: #e0f2fe; color: #0369a1; }
.category-tag.rewards { background: #fef3c7; color: #92400e; }
.category-tag.system { background: #f1f5f9; color: #475569; }

.time-stamp {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

.card-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.card-message {
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.45;
}

.card-interactive-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px dashed #e2e8f0;
}

.duel-wager-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fefce8;
  color: #854d0e;
  padding: 0.35rem 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 800;
}

.actions-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-action.duel-accept {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-action.duel-accept:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4);
}

.btn-action.duel-reject, .btn-action.friend-reject {
  background: #f1f5f9;
  color: #64748b;
}

.btn-action.duel-reject:hover, .btn-action.friend-reject:hover {
  background: #fee2e2;
  color: #dc2626;
}

.btn-action.friend-accept {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.card-link-row {
  margin-top: 0.75rem;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #3b82f6;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
}

.action-link:hover {
  text-decoration: underline;
}

.card-controls {
  margin-left: auto;
}

.control-btn {
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.control-btn:hover {
  color: #3b82f6;
  background: #f1f5f9;
}
</style>
