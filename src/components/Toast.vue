<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
        @mouseenter="pause(toast.id)"
        @mouseleave="resume(toast.id)"
      >
        <span>{{ toast.message }}</span>
        <button class="close-btn" @click="closeToast(toast.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue';

const props = defineProps({
  toasts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close-toast']);

const timeouts = new Map();

const closeToast = (id) => {
  clearTimeout(timeouts.get(id));
  timeouts.delete(id);
  emit('close-toast', id);
};

const pause = (id) => {
  clearTimeout(timeouts.get(id));
};

const resume = (id) => {
  const toast = props.toasts.find((t) => t.id === id);
  if (toast) {
    const timeout = setTimeout(
      () => closeToast(id),
      toast.duration || 3000
    );
    timeouts.set(id, timeout);
  }
};

watch(() => props.toasts, (newToasts) => {
  newToasts.forEach((toast) => {
    if (!timeouts.has(toast.id)) {
      const timeout = setTimeout(
        () => closeToast(toast.id),
        toast.duration || 3000
      );
      timeouts.set(toast.id, timeout);
    }
  });
}, { immediate: true });

onBeforeUnmount(() => {
  timeouts.forEach((t) => clearTimeout(t));
  timeouts.clear();
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 12px 16px;
  border-radius: 4px;
  min-width: 220px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  cursor: default;
}

/* Toast ranglari */
.success {
  background-color: #28a745;
}

.error {
  background-color: #dc3545;
}

.info {
  background-color: #007bff;
}

.warning {
  background-color: #ffc107;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  color: inherit;
  margin-left: 10px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
