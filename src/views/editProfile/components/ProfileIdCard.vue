<template>
  <div class="id-card-wrapper" v-if="show">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="id-card-modal">
        <!-- The Card to be exported -->
        <div class="id-card" id="profile-id-card">
          <!-- Background and Glows -->
          <div class="card-bg"></div>
          <div class="glow-top"></div>
          <div class="glow-bottom"></div>

          <!-- Card Content -->
          <div class="card-content">
            <div class="card-header">
              <span class="platform-name">Test.me</span>
              <span class="card-type">STUDENT ID</span>
            </div>

            <div class="card-body">
              <div class="avatar-container">
                <img :src="profilePhoto || defaultUserImage" alt="User Avatar" crossorigin="anonymous" />
                <div class="rank-badge-img">
                  <i :class="userRankIcon"></i>
                </div>
              </div>

              <div class="user-info">
                <h2 class="user-name">{{ userName }}</h2>
                <div class="info-row">
                  <span class="info-label">RANK:</span>
                  <span class="info-value text-gradient">{{ userRankName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">POINTS:</span>
                  <span class="info-value">{{ userPoints }} TP</span>
                </div>
                <div class="info-row">
                  <span class="info-label">JOINED:</span>
                  <span class="info-value">{{ joinedDate }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="barcode-mock">
                || | ||| || ||| | || ||| |
              </div>
              <div class="id-number">ID: {{ shortId || '--------' }}</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions no-print">
          <button class="btn-download" @click="downloadCard" :disabled="isDownloading">
            <i class="fas fa-spinner fa-spin" v-if="isDownloading"></i>
            <i class="fas fa-download" v-else></i>
            {{ isRus ? 'Скачать ID' : 'ID yuklab olish' }}
          </button>
          <button class="btn-close" @click="$emit('close')">
            {{ isRus ? 'Закрыть' : 'Yopish' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import html2canvas from 'html2canvas';

const props = defineProps({
  show: Boolean,
  userName: String,
  profilePhoto: String,
  userPoints: Number,
  shortId: String,
  userRankName: String,
  userRankIcon: String,
  joinedDate: String,
  isRus: Boolean,
  defaultUserImage: String
});

const emit = defineEmits(['close']);
const isDownloading = ref(false);

const downloadCard = async () => {
  isDownloading.value = true;
  try {
    const cardElement = document.getElementById('profile-id-card');
    
    // Create canvas
    const canvas = await html2canvas(cardElement, {
      scale: 3, // High resolution
      backgroundColor: null,
      useCORS: true, // For external images
      logging: false
    });

    // Convert to image and download
    const link = document.createElement('a');
    link.download = `TestMe-ID-${props.userName || 'Student'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
  } catch (err) {
    console.error('Error generating ID card:', err);
    alert(props.isRus ? 'Ошибка при скачивании' : 'Yuklab olishda xatolik yuz berdi');
  } finally {
    isDownloading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.id-card-modal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

/* ID Card Styles */
.id-card {
  width: 400px;
  height: 250px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', sans-serif;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  z-index: 0;
}

.glow-top {
  position: absolute;
  top: -50%; right: -20%;
  width: 250px; height: 250px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 60%);
  opacity: 0.5;
  z-index: 1;
}

.glow-bottom {
  position: absolute;
  bottom: -50%; left: -20%;
  width: 250px; height: 250px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 60%);
  opacity: 0.5;
  z-index: 1;
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.platform-name {
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-type {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
}

.card-body {
  display: flex;
  gap: 1.5rem;
  flex-grow: 1;
}

.avatar-container {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.avatar-container img {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.rank-badge-img {
  position: absolute;
  bottom: -10px; right: -10px;
  width: 32px; height: 32px;
  background: #1e293b;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #f59e0b;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  line-height: 1.1;
  color: #f8fafc;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.info-label {
  color: #64748b;
  font-weight: 700;
  width: 50px;
}

.info-value {
  color: #e2e8f0;
  font-weight: 600;
}

.text-gradient {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.barcode-mock {
  font-family: monospace;
  font-size: 1.5rem;
  letter-spacing: -2px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 0.5;
}

.id-number {
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1px;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 1rem;
}

.btn-download, .btn-close {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download {
  background: #3b82f6;
  color: white;
}
.btn-download:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
}
.btn-download:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-close {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 500px) {
  .id-card {
    width: 100%;
    height: auto;
    aspect-ratio: 1.6;
  }
}
</style>
