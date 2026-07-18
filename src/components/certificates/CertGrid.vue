<template>
  <div>
    <div class="certs-grid" v-if="certificates.length > 0">
      <div
        v-for="cert in certificates"
        :key="cert.id"
        :class="['cert-card', { locked: !cert.unlocked }]"
      >
        <div 
          class="cert-icon" 
          :style="cert.unlocked ? { background: cert.color + '15', color: cert.color, borderColor: cert.color + '30' } : {}"
        >
          <i :class="cert.icon"></i>
          <div class="lock-indicator" v-if="!cert.unlocked">
            <i class="fas fa-lock"></i>
          </div>
        </div>

        <div class="cert-details">
          <h3>{{ isRus ? cert.nameRu : cert.nameUz }}</h3>
          <p class="cert-desc">{{ isRus ? cert.descRu : cert.descUz }}</p>

          <div class="cert-progress-container" v-if="cert.progress !== null">
            <div class="progress-info">
              <span>{{ isRus ? 'Прогресс' : 'Progress' }}</span>
              <span>{{ Math.min(cert.currentVal, cert.targetVal) }} / {{ cert.targetVal }}</span>
            </div>
            <div class="bar-outer">
              <div 
                class="bar-inner" 
                :style="{ 
                  width: Math.min((cert.currentVal / cert.targetVal) * 100, 100) + '%', 
                  background: cert.unlocked ? cert.color : '#94a3b8' 
                }"
              ></div>
            </div>
          </div>

          <div class="cert-actions">
            <span class="unlock-rate">
              <i class="fas fa-users"></i> {{ cert.unlockRate }}%
            </span>
            <button 
              class="view-cert-btn" 
              v-if="cert.unlocked"
              @click="$emit('view-cert', cert)"
            >
              <i class="fas fa-eye"></i> {{ isRus ? 'Посмотреть' : "Ko'rish" }}
            </button>
            <span class="locked-lbl" v-else>
              <i class="fas fa-lock"></i> {{ isRus ? 'Заблокировано' : 'Qulflangan' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty-filter-state" v-else>
      <div class="empty-icon"><i class="fas fa-search"></i></div>
      <h3>{{ isRus ? 'Ничего не найдено' : 'Hech narsa topilmadi' }}</h3>
      <p>{{ isRus ? 'Попробуйте изменить параметры фильтрации' : "Qidiruv parametrlarini o'zgartirib ko'ring" }}</p>
      <button class="reset-btn" @click="$emit('reset-filters')">{{ isRus ? 'Сбросить фильтры' : 'Filtrlarni tozalash' }}</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  certificates: { type: Array, required: true },
  isRus: { type: Boolean, required: true }
});

const emit = defineEmits(['view-cert', 'reset-filters']);
</script>

<style scoped>
.certs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.cert-card {
  display: flex;
  gap: 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.02);
  transition: all 0.3s ease;
}
.cert-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -5px rgba(15, 23, 42, 0.06);
}
.cert-card.locked {
  background: rgba(255, 255, 255, 0.6);
}
.cert-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 18px;
  font-size: 1.8rem;
  background: #f1f5f9;
  color: #94a3b8;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.cert-card.locked .cert-icon { filter: grayscale(1); }
.lock-indicator {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.cert-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.cert-details h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
}
.cert-card.locked .cert-details h3 { color: #64748b; }
.cert-desc {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0 0 12px 0;
}
.cert-progress-container { margin-bottom: 12px; }
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
}
.bar-outer { height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
.bar-inner { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
.cert-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
  margin-top: 4px;
}
.unlock-rate {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}
.view-cert-btn {
  background: #10b981;
  color: white;
  border: none;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.view-cert-btn:hover { background: #059669; }
.locked-lbl { font-size: 0.72rem; font-weight: 700; color: #ef4444; }

.empty-filter-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  border: 1px dashed #cbd5e1;
}
.empty-filter-state .empty-icon { font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem; }
.empty-filter-state h3 { font-size: 1.5rem; color: #1e293b; margin-bottom: 0.5rem; }
.empty-filter-state p { color: #64748b; margin-bottom: 1.5rem; }
.reset-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.reset-btn:hover { background: #2563eb; }
</style>