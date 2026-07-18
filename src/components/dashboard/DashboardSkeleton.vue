<template>
  <div class="skeleton-wrapper">
    <!-- Hero Skeleton -->
    <div class="skeleton-hero">
      <div class="skeleton-hero-left">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line text"></div>
        <div class="skeleton-btn"></div>
      </div>
      <div class="skeleton-hero-right">
        <div class="skeleton-stat-card" v-for="i in 4" :key="i"></div>
      </div>
    </div>

    <!-- Analytics Skeleton -->
    <div class="skeleton-analytics">
      <div class="skeleton-line section-title"></div>
      <div class="skeleton-grid">
        <div class="skeleton-card" v-for="i in 3" :key="'a'+i"></div>
      </div>
    </div>

    <!-- Table Skeleton -->
    <div class="skeleton-table">
      <div class="skeleton-line section-title"></div>
      <div class="skeleton-table-header"></div>
      <div class="skeleton-table-row" v-for="i in 5" :key="'r'+i"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;
}

.skeleton-line,
.skeleton-btn,
.skeleton-stat-card,
.skeleton-card,
.skeleton-table-header,
.skeleton-table-row {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.5s infinite ease-in-out;
  border-radius: 12px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Hero Skeleton */
.skeleton-hero {
  display: flex;
  gap: 2rem;
  padding: 2.5rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
}

.skeleton-hero-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-line.title { width: 60%; height: 2.5rem; }
.skeleton-line.text { width: 80%; height: 1.5rem; }
.skeleton-btn { width: 140px; height: 3rem; border-radius: 99px; }

.skeleton-hero-right {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  flex: 1;
}

.skeleton-stat-card {
  height: 100px;
}

/* Analytics Skeleton */
.skeleton-analytics {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-line.section-title { width: 200px; height: 1.8rem; }

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  height: 180px;
}

/* Table Skeleton */
.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
}

.skeleton-table-header {
  height: 3rem;
  margin-bottom: 1rem;
}

.skeleton-table-row {
  height: 4rem;
}

@media (max-width: 768px) {
  .skeleton-hero {
    flex-direction: column;
    padding: 1.5rem;
  }
}
</style>
