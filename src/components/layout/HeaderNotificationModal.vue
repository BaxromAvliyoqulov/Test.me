<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="notif-modal-overlay" @click.self="$emit('close')">
        <div class="notif-modal">
          <!-- Modal Header -->
          <div class="notif-modal-header">
            <div class="notif-modal-title">
              <div class="notif-modal-icon-wrap">
                <i class="fas fa-bell"></i>
              </div>
              <div>
                <h3>Bildirishnomalar</h3>
                <p>{{ notifications.length }} ta xabar</p>
              </div>
            </div>
            <button class="notif-modal-close" @click="$emit('close')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Unread count banner -->
          <div class="notif-modal-banner" v-if="unreadCount > 0">
            <i class="fas fa-circle-dot"></i>
            {{ unreadCount }} ta o'qilmagan xabar bor
          </div>

          <!-- Notifications List -->
          <div class="notif-modal-body">
            <div v-if="loading" class="notif-modal-empty">
              <div class="notif-spinner"></div>
              <p>Yuklanmoqda...</p>
            </div>

            <div v-else-if="notifications.length === 0" class="notif-modal-empty">
              <i class="fas fa-bell-slash"></i>
              <p>Hozircha sizga xabarlar yo'q</p>
            </div>

            <div
              v-else
              v-for="notif in notifications"
              :key="notif.id"
              :class="['notif-modal-item', { unread: !readNotifications.includes(notif.id) }]"
              @click="selectedNotif = notif"
            >
              <div class="notif-modal-item-icon" :class="'type-' + notif.type">
                <i :class="getNotifIcon(notif.type)"></i>
              </div>
              <div class="notif-modal-item-body">
                <div class="notif-modal-item-top">
                  <h5>{{ notif.title }}</h5>
                  <span v-if="!readNotifications.includes(notif.id)" class="unread-dot"></span>
                </div>
                <p>{{ notif.body }}</p>
                <span class="notif-modal-time">{{ formatTime(notif.createdAt) }}</span>
              </div>
              <i class="fas fa-chevron-right notif-chevron"></i>
            </div>
          </div>

          <div class="notif-modal-footer">
            <button class="notif-modal-view-all-btn" @click="goToNotificationsPage">
              <span>Barcha bildirishnomalarni ko'rish</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Notification Detail Modal -->
    <Transition name="modal-slide">
      <div v-if="selectedNotif" class="notif-detail-overlay" @click.self="selectedNotif = null">
        <div class="notif-detail-modal">
          <button class="notif-detail-back" @click="selectedNotif = null">
            <i class="fas fa-arrow-left"></i> Orqaga
          </button>
          <div class="notif-detail-icon" :class="'type-' + selectedNotif.type">
            <i :class="getNotifIcon(selectedNotif.type)"></i>
          </div>
          <h2 class="notif-detail-title">{{ selectedNotif.title }}</h2>
          <p class="notif-detail-body">{{ selectedNotif.body }}</p>
          <div class="notif-detail-meta">
            <span><i class="fas fa-clock"></i> {{ formatTime(selectedNotif.createdAt) }}</span>
            <span class="notif-type-badge" :class="'badge-' + selectedNotif.type">{{ getTypeName(selectedNotif.type) }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  show: { type: Boolean, default: false },
  notifications: { type: Array, default: () => [] },
  readNotifications: { type: Array, default: () => [] },
  unreadCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const router = useRouter();
const selectedNotif = ref(null);

const getNotifIcon = (type) => {
  const icons = {
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    update: 'fas fa-arrow-up',
    promo: 'fas fa-gift'
  };
  return icons[type] || 'fas fa-bell';
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
};

const getTypeName = (type) => {
  const names = { info: "Ma'lumot", success: 'Muvaffaqiyat', warning: 'Ogohlantirish', update: 'Yangilik', promo: 'Aksiya' };
  return names[type] || type;
};

const goToNotificationsPage = () => {
  emit('close');
  router.push('/notifications');
};
</script>

<style scoped>
.notif-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 9998;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 90px 24px 0 0;
}

.notif-modal {
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 110px);
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notif-modal-header {
  padding: 22px 22px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.notif-modal-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.notif-modal-icon-wrap {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.notif-modal-title h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.notif-modal-title p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #64748b;
}

.notif-modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.notif-modal-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.notif-modal-banner {
  margin: 12px 16px 0;
  padding: 10px 14px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  color: #1d4ed8;
  font-size: 0.82rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.notif-modal-empty {
  padding: 48px 20px;
  text-align: center;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.notif-modal-empty i {
  font-size: 2.5rem;
  opacity: 0.4;
}

.notif-modal-empty p {
  margin: 0;
  font-size: 0.9rem;
}

.notif-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.notif-modal-item {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f8fafc;
}

.notif-modal-item:last-child { border-bottom: none; }

.notif-modal-item:hover {
  background: #f8fafc;
}

.notif-modal-item.unread {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  padding-left: 17px;
}

.notif-modal-item.unread:hover {
  background: #dbeafe;
}

.notif-modal-item-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.notif-modal-item-icon.type-info { background: #e0f2fe; color: #0ea5e9; }
.notif-modal-item-icon.type-success { background: #dcfce7; color: #22c55e; }
.notif-modal-item-icon.type-warning { background: #fef3c7; color: #f59e0b; }
.notif-modal-item-icon.type-update { background: #ede9fe; color: #8b5cf6; }
.notif-modal-item-icon.type-promo { background: #fce7f3; color: #ec4899; }

.notif-modal-item-body {
  flex: 1;
  min-width: 0;
}

.notif-modal-item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notif-modal-item-top h5 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

.notif-modal-item-body p {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-modal-time {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 5px;
  display: block;
}

.notif-chevron {
  color: #cbd5e1;
  font-size: 0.8rem;
  flex-shrink: 0;
}

/* Detail Modal */
.notif-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.notif-detail-modal {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 30px 100px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  position: relative;
}

.notif-detail-back {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.notif-detail-back:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.notif-detail-icon {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-top: 16px;
}

.notif-detail-icon.type-info { background: #e0f2fe; color: #0ea5e9; }
.notif-detail-icon.type-success { background: #dcfce7; color: #22c55e; }
.notif-detail-icon.type-warning { background: #fef3c7; color: #f59e0b; }
.notif-detail-icon.type-update { background: #ede9fe; color: #8b5cf6; }
.notif-detail-icon.type-promo { background: #fce7f3; color: #ec4899; }

.notif-detail-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.notif-detail-body {
  margin: 0;
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.65;
}

.notif-detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.78rem;
  color: #94a3b8;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
  width: 100%;
}

.notif-type-badge {
  padding: 4px 12px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.72rem;
}

.badge-info { background: #e0f2fe; color: #0ea5e9; }
.badge-success { background: #dcfce7; color: #22c55e; }
.badge-warning { background: #fef3c7; color: #f59e0b; }
.badge-update { background: #ede9fe; color: #8b5cf6; }
.badge-promo { background: #fce7f3; color: #ec4899; }

.notif-modal-footer {
  padding: 12px 18px 16px;
  background: white;
  border-top: 1px solid #f1f5f9;
}

.notif-modal-view-all-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  font-weight: 700;
  font-size: 0.88rem;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
}

.notif-modal-view-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
  background: linear-gradient(135deg, #4338ca, #4f46e5);
}

/* Animations */
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .notif-modal, .modal-fade-leave-to .notif-modal { transform: translateX(30px) scale(0.97); }

.modal-slide-enter-active, .modal-slide-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-slide-enter-from, .modal-slide-leave-to { opacity: 0; }
.modal-slide-enter-from .notif-detail-modal, .modal-slide-leave-to .notif-detail-modal { transform: scale(0.92) translateY(20px); }

@media (max-width: 480px) {
  .notif-modal-overlay {
    padding: 80px 0 0 0;
    align-items: flex-start;
    justify-content: center;
  }
  .notif-modal {
    width: 100%;
    border-radius: 24px 24px 0 0;
    max-height: 85vh;
  }
}
</style>
