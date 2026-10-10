<template>
  <!-- New Version Available Toast / Modal -->
  <transition name="update-slide">
    <div v-if="needRefresh" class="update-prompt-wrapper">
      <div class="update-glass-card">
        <div class="update-icon-glow">
          <i class="fas fa-sparkles"></i>
        </div>

        <div class="update-content">
          <div class="update-badge-row">
            <span class="badge-new">{{ isRus ? 'Новая версия' : 'Yangi versiya' }}</span>
            <span class="version-tag">{{ APP_VERSION }}</span>
            <span class="date-tag">{{ RELEASE_DATE }}</span>
          </div>
          <h4>{{ isRus ? 'Доступно обновление приложения!' : 'Dastur uchun yangilanish mavjud!' }}</h4>
          <p>{{ isRus ? 'Нажмите кнопку, чтобы применить свежие улучшения и функции.' : 'Yangi imkoniyatlar va yaxshilanishlarni yuklash uchun yangilashni qabul qiling.' }}</p>
        </div>

        <div class="update-actions">
          <button class="btn-accept-update" :disabled="isUpdating" @click="handleUpdate">
            <i class="fas fa-rotate" :class="{ 'fa-spin': isUpdating }"></i>
            <span>{{ isUpdating ? (isRus ? 'Обновление...' : 'Yangilanmoqda...') : (isRus ? 'Принять обновление' : 'Yangilashni qabul qilish') }}</span>
          </button>
          <button class="btn-dismiss-update" @click="needRefresh = false" title="Keyinroq">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { needRefresh, acceptUpdate } from '@/services/updateService';
import { APP_VERSION, RELEASE_DATE } from '@/config/version';
import { useI18n } from '@/utils/i18n';

const { locale } = useI18n();
const isRus = computed(() => locale.value === 'RUS');
const isUpdating = ref(false);

const handleUpdate = async () => {
  isUpdating.value = true;
  await acceptUpdate();
};
</script>

<style scoped>
.update-prompt-wrapper {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 28px);
  max-width: 580px;
  z-index: 99999;
  pointer-events: auto;
}

.update-glass-card {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1.5px solid rgba(59, 130, 246, 0.4);
  border-radius: 22px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.25);
  animation: pulseGlow 3s infinite alternate;
}

@keyframes pulseGlow {
  0% { box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.2); }
  100% { box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 35px rgba(59, 130, 246, 0.45); }
}

.update-icon-glow {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.update-content {
  flex: 1;
  min-width: 0;
}

.update-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}

.badge-new {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.version-tag {
  background: rgba(255, 255, 255, 0.12);
  color: #93c5fd;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
}

.date-tag {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 600;
}

.update-content h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.update-content p {
  margin: 2px 0 0;
  font-size: 0.76rem;
  color: #94a3b8;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.update-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-accept-update {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-accept-update:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.5);
}

.btn-accept-update:active {
  transform: scale(0.96);
}

.btn-accept-update:disabled {
  opacity: 0.7;
  cursor: wait;
}

.btn-dismiss-update {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-dismiss-update:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
}

@media (max-width: 600px) {
  .update-prompt-wrapper {
    top: auto;
    bottom: 84px;
    width: calc(100% - 16px);
  }

  .update-glass-card {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 18px;
  }

  .update-actions {
    width: 100%;
    display: flex;
  }

  .btn-accept-update {
    flex: 1;
    justify-content: center;
    padding: 11px;
    font-size: 0.85rem;
  }
}

/* Transitions */
.update-slide-enter-active,
.update-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.update-slide-enter-from,
.update-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -30px);
}

@media (max-width: 600px) {
  .update-slide-enter-from,
  .update-slide-leave-to {
    transform: translate(-50%, 30px);
  }
}
</style>
