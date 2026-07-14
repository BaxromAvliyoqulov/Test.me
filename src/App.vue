<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
import MainLayout from '@/layout/mainLayout.vue';

export default {
  components: {
    MainLayout,
  },
  computed: {
    layout() {
      // If the route starts with /admin, do not use MainLayout.
      // Just render a plain div (or fragment) to avoid nesting sidebars.
      if (this.$route.path.startsWith('/admin')) {
        return 'div';
      }
      return 'MainLayout';
    }
  }
};
</script>

<style>
:root {
  --bg-color: #f8fafc;
  --text-color: #0f172a;
  --card-bg: #ffffff;
  --card-border: #e2e8f0;
  --card-title-color: #0f172a;
  --input-bg: #ffffff;
  --input-border: #cbd5e1;
  --shadow-primary: 0 10px 30px rgba(15, 23, 42, 0.03);
  --muted-text: #64748b;
  --hr-color: #e2e8f0;
  --dropdown-bg: rgba(255, 255, 255, 0.96);
  --dropdown-border: rgba(15, 23, 42, 0.08);
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  background-image: radial-gradient(rgba(37, 99, 235, 0.025) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  transition: background-color 0.3s ease, color 0.3s ease;
}
a {
  text-decoration: none;
  color: black;
  font-size: 20px;
  font-weight: bold;
}
.button {
  padding: 10px 20px;
  font-size: 18px;
  font-weight: 700;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
  margin-top: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
}

.button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0px 10px 8px rgba(0, 0, 0, 0.3);
}

.button:active {
  transform: translateY(2px);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}
.gradient-text {
  background: linear-gradient(145deg, #0056b3, #007bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

/* Global Rank Badge Styles */
.nav-rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.70rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
.rank-newbie { background: #f1f5f9; color: #475569; }
.rank-bronze { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.rank-silver { background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; }
.rank-gold { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }
.rank-grandmaster {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  border: none;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

/* Global Rank Progress Card Styles */
.rank-progress-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 10px 25px -10px rgba(15, 23, 42, 0.05);
}

.progress-card-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.6rem;
}

.progress-target-text {
  color: #3b82f6;
  font-weight: 800;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #a855f7 100%);
  border-radius: 10px;
  transition: width 0.4s ease;
}

.progress-footer-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  font-weight: 700;
  color: #64748b;
}

@media (max-width: 768px) {
  button {
    max-width: 100%;
  }
}
</style>
