<template>
  <div class="stats-overview">
    <div class="overview-card">
      <span class="value">{{ unlockedCount }} / {{ totalCount }}</span>
      <span class="label">{{ isRus ? 'Получено сертификатов' : 'Olingan sertifikatlar' }}</span>
    </div>
    <div class="overview-card">
      <span class="value">{{ elementaryCount }}</span>
      <span class="label">Elementary tests</span>
    </div>
    <div class="overview-card">
      <span class="value">{{ intermediateCount }}</span>
      <span class="label">Intermediate tests</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  unlockedCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  elementaryCount: { type: Number, required: true },
  intermediateCount: { type: Number, required: true },
  isRus: { type: Boolean, required: true }
});
</script>

<style scoped>
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.overview-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);
}
.overview-card .value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #10b981;
  margin-bottom: 4px;
}
.overview-card .label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>