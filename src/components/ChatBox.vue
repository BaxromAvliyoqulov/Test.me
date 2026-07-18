<template>
  <div class="chat-box">
    <div class="chat-header">
      <div class="header-info">
        <div class="avatar">{{ friend.displayName ? friend.displayName.charAt(0) : 'U' }}</div>
        <h3>{{ friend.displayName }}</h3>
      </div>
      <button @click="$emit('close')" class="close-btn"><i class="fas fa-times"></i></button>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading" class="loading">Loading messages...</div>
      <div v-else-if="messages.length === 0" class="empty">
        Say hi to {{ friend.displayName }}!
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
        placeholder="Type a message..." 
        ref="chatInput" 
        required 
      />
      <button type="submit" :disabled="!newMessage.trim()"><i class="fas fa-paper-plane"></i></button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { db } from '@/config/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const props = defineProps({
  friend: { type: Object, required: true },
  currentUser: { type: Object, required: true }
});

const emit = defineEmits(['close']);

const messagesContainer = ref(null);
const chatInput = ref(null);

const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
let unsub = null;

const chatId = computed(() => {
  return [props.currentUser.uid, props.friend.uid].sort().join('_');
});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const listenToMessages = () => {
  if (unsub) unsub();
  loading.value = true;
  messages.value = [];
  
  const q = query(
    collection(db, 'chats', chatId.value, 'messages'),
    orderBy('timestamp', 'asc')
  );
  
  unsub = onSnapshot(q, snap => {
    messages.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
    scrollToBottom();
  });
};

watch(() => props.friend, () => {
  listenToMessages();
}, { immediate: true });

onUnmounted(() => {
  if (unsub) unsub();
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  const text = newMessage.value;
  newMessage.value = '';
  
  try {
    await addDoc(collection(db, 'chats', chatId.value, 'messages'), {
      text,
      senderId: props.currentUser.uid,
      timestamp: serverTimestamp()
    });
    chatInput.value.focus();
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
.avatar { width: 36px; height: 36px; border-radius: 50%; background: #a855f7; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.header-info h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
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
