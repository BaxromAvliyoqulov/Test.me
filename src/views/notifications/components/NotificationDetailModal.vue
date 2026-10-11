<template>
  <Teleport to="body">
    <div v-if="notif" class="detail-overlay" @click.self="$emit('close')">
      <div class="detail-card animate-pop-in">
        <div class="detail-header" :class="notif.category">
          <div class="detail-icon-wrap">
            <i :class="notif.icon"></i>
          </div>
          <div>
            <span class="detail-tag">{{ notif.categoryLabel }}</span>
            <h3>{{ notif.title }}</h3>
          </div>
          <button class="detail-close" @click="$emit('close')">&times;</button>
        </div>

        <div class="detail-body">
          <p class="detail-text">{{ notif.message }}</p>
          <div class="detail-meta">
            <span><i class="far fa-clock"></i> {{ formattedTime }}</span>
            <span v-if="notif.author">Muallif: {{ notif.author }}</span>
          </div>
        </div>

        <div class="detail-footer">
          <button class="detail-btn close" @click="$emit('close')">Yopish</button>
          <button 
            v-if="notif.link" 
            class="detail-btn navigate" 
            @click="$emit('navigate', notif.link)"
          >
            Sahifaga o'tish <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  notif: { type: Object, default: null }
});

defineEmits(['close', 'navigate']);

const formattedTime = computed(() => {
  const ts = props.notif?.timestamp;
  if (!ts) return 'Yaqinda';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Yaqinda';
  }
});
</script>

<style scoped>
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.detail-card {
  background: white;
  border-radius: 28px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.detail-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.detail-tag {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.detail-header h3 {
  margin: 0.2rem 0 0 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

.detail-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
}

.detail-body {
  padding: 1.75rem;
}

.detail-text {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.6;
  margin: 0 0 1.25rem 0;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.75rem;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.detail-btn {
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
}

.detail-btn.close {
  background: white;
  border: 1.5px solid #cbd5e1;
  color: #475569;
}

.detail-btn.navigate {
  background: #3b82f6;
  color: white;
}

.animate-pop-in {
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
</style>
