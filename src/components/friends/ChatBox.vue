<template>
  <div class="chat-box">
    <div class="chat-header">
      <div class="header-info">
        <div class="avatar">
          <img 
            v-if="getUserAvatar(friend) && !avatarFailed" 
            :src="getUserAvatar(friend)" 
            :alt="getUserDisplayName(friend)" 
            class="avatar-img"
            @error="avatarFailed = true"
          />
          <span v-else>{{ getUserInitials(friend) }}</span>
        </div>
        <div>
          <h3>{{ getUserDisplayName(friend) }}</h3>
          <span class="chat-header-presence" :class="isUserOnline(friend) ? 'online' : 'offline'">
            <span class="presence-dot"></span>
            {{ getUserLastSeenText(friend, isRus ? 'RUS' : 'UZB') }}
          </span>
        </div>
      </div>
      <button @click="$emit('close')" class="close-btn" :title="isRus ? 'Закрыть' : 'Yopish'"><i class="fas fa-times"></i></button>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading" class="loading">{{ isRus ? 'Загрузка сообщений...' : 'Xabarlar yuklanmoqda...' }}</div>
      <div v-else-if="messages.length === 0" class="empty">
        {{ isRus ? `Поздоровайтесь с ${getUserDisplayName(friend)}! 👋` : `${getUserDisplayName(friend)} bilan salomlashing! 👋` }}
      </div>
      <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="message-wrapper" 
        :class="msg.senderId === currentUser.uid ? 'sent' : 'received'"
      >
        <div class="message-bubble">
          {{ msg.text }}
          <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="input-area">
      <input 
        v-model="newMessage" 
        :placeholder="isRus ? 'Введите сообщение...' : 'Xabar yozing...'" 
        ref="chatInput" 
        required 
      />
      <button type="submit" :disabled="!newMessage.trim()"><i class="fas fa-paper-plane"></i></button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { supabase } from '@/services/supabaseService';
import { 
  getUserDisplayName, 
  getUserAvatar, 
  getUserInitials,
  isUserOnline,
  getUserLastSeenText
} from '@/utils/userHelpers';

const avatarFailed = ref(false);

const props = defineProps({
  friend: { type: Object, required: true },
  currentUser: { type: Object, required: true },
  isRus: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const messagesContainer = ref(null);
const chatInput = ref(null);

const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
let unsub = null;

const chatId = computed(() => {
  const fId = props.friend.uid || props.friend.id;
  const myId = props.currentUser.uid || props.currentUser.id;
  return [myId, fId].sort().join('_');
});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const listenToMessages = () => {
  if (unsub) {
    supabase.removeChannel(unsub);
    unsub = null;
  }
  loading.value = true;
  messages.value = [];
  
  unsub = supabase.channel(`chat_${chatId.value}`)
    .on('broadcast', { event: 'msg' }, ({ payload }) => {
      messages.value.push(payload);
      scrollToBottom();
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        loading.value = false;
      }
    });

  setTimeout(() => {
    loading.value = false;
  }, 400);
};

watch(() => props.friend, () => {
  listenToMessages();
}, { immediate: true });

onUnmounted(() => {
  if (unsub) supabase.removeChannel(unsub);
});

const sendMessage = async () => {
  if (!newMessage.value.trim() || !unsub) return;
  const text = newMessage.value.trim();
  newMessage.value = '';

  const payload = {
    id: 'msg_' + Date.now(),
    text,
    senderId: props.currentUser.uid || props.currentUser.id,
    timestamp: new Date().toISOString()
  };

  messages.value.push(payload);
  scrollToBottom();

  try {
    await unsub.send({
      type: 'broadcast',
      event: 'msg',
      payload
    });
    chatInput.value?.focus();
  } catch (err) {
    console.error("Error sending message", err);
  }
};

const formatTime = (ts) => {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.chat-box { display: flex; flex-direction: column; height: 100%; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }

.chat-header { background: #f8fafc; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.header-info { display: flex; align-items: center; gap: 12px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: #a855f7; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.header-info h3 { margin: 0; font-size: 1.05rem; color: #1e293b; line-height: 1.2; }
.chat-header-presence {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
}
.chat-header-presence.online { color: #10b981; }
.chat-header-presence.offline { color: #94a3b8; }
.chat-header-presence .presence-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; }
.close-btn:hover { color: #ef4444; }

.messages-container { flex-grow: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: white; }
.loading, .empty { text-align: center; color: #94a3b8; margin-top: auto; margin-bottom: auto; }

.message-wrapper { display: flex; width: 100%; }
.message-wrapper.sent { justify-content: flex-end; }
.message-wrapper.received { justify-content: flex-start; }

.message-bubble { max-width: 70%; padding: 10px 15px; border-radius: 18px; position: relative; word-wrap: break-word; line-height: 1.4; }
.sent .message-bubble { background: #3b82f6; color: white; border-bottom-right-radius: 4px; }
.received .message-bubble { background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; }

.timestamp { font-size: 0.65rem; opacity: 0.7; margin-left: 10px; float: right; margin-top: 5px; }
.sent .timestamp { color: rgba(255,255,255,0.8); }
.received .timestamp { color: #64748b; }

.input-area { display: flex; padding: 15px; background: #f8fafc; border-top: 1px solid #e2e8f0; gap: 10px; }
.input-area input { flex-grow: 1; padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 20px; outline: none; font-family: inherit; }
.input-area input:focus { border-color: #3b82f6; }
.input-area button { background: #3b82f6; color: white; border: none; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: background 0.2s; }
.input-area button:hover:not(:disabled) { background: #2563eb; }
.input-area button:disabled { background: #cbd5e1; cursor: not-allowed; }
</style>
