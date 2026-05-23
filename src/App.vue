<template>
  <mainLayout>
    <router-view />
  </mainLayout>
</template>

<script>
import MainLayout from '@/layout/mainLayout.vue';
export default {
  components: {
    MainLayout,
  },
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

[data-theme="dark"] {
  --bg-color: #0b0f19;
  --text-color: #f8fafc;
  --card-bg: #131a2b;
  --card-border: rgba(255, 255, 255, 0.08);
  --card-title-color: #f8fafc;
  --input-bg: #1e293b;
  --input-border: #334155;
  --shadow-primary: 0 10px 30px rgba(0, 0, 0, 0.3);
  --muted-text: #94a3b8;
  --hr-color: #334155;
  --dropdown-bg: rgba(19, 26, 43, 0.98);
  --dropdown-border: rgba(255, 255, 255, 0.08);
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  background-image: radial-gradient(rgba(37, 99, 235, 0.025) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Global Dark Mode Overrides */
[data-theme="dark"] .sidebar-card,
[data-theme="dark"] .dashboard-card,
[data-theme="dark"] .glass-card,
[data-theme="dark"] .quiz-glass-card,
[data-theme="dark"] .test-body-card,
[data-theme="dark"] .metric-card,
[data-theme="dark"] .subject-card,
[data-theme="dark"] .stat-card,
[data-theme="dark"] .info-card,
[data-theme="dark"] .setup-glass-card {
  background: var(--card-bg) !important;
  border-color: var(--card-border) !important;
  color: var(--text-color) !important;
  box-shadow: var(--shadow-primary) !important;
}

[data-theme="dark"] .dashboard-wrapper,
[data-theme="dark"] .test-page-wrapper,
[data-theme="dark"] .about-wrapper,
[data-theme="dark"] .contact-wrapper,
[data-theme="dark"] .badges-wrapper,
[data-theme="dark"] .certificates-wrapper,
[data-theme="dark"] .points-wrapper,
[data-theme="dark"] .profile-wrapper {
  background-color: var(--bg-color) !important;
  color: var(--text-color) !important;
}

[data-theme="dark"] .subject-name,
[data-theme="dark"] .subject-title,
[data-theme="dark"] .card-title,
[data-theme="dark"] .section-title,
[data-theme="dark"] .question-title,
[data-theme="dark"] h1,
[data-theme="dark"] h2,
[data-theme="dark"] h3,
[data-theme="dark"] h4 {
  color: var(--card-title-color) !important;
}

[data-theme="dark"] p,
[data-theme="dark"] span,
[data-theme="dark"] li,
[data-theme="dark"] label {
  color: var(--text-color) !important;
}

[data-theme="dark"] .ai-advice {
  color: var(--text-color) !important;
}

[data-theme="dark"] .text-muted,
[data-theme="dark"] .muted-text,
[data-theme="dark"] .questions-count-tag {
  color: var(--muted-text) !important;
}

[data-theme="dark"] .option-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: var(--text-color) !important;
}

[data-theme="dark"] .option-card:hover {
  background: rgba(59, 130, 246, 0.15) !important;
  border-color: #3b82f6 !important;
}

[data-theme="dark"] .option-card .option-marker {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #94a3b8 !important;
}

[data-theme="dark"] .option-card.selected {
  background: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: #ffffff !important;
}

[data-theme="dark"] .option-card.selected .option-marker {
  background: #ffffff !important;
  color: #3b82f6 !important;
}

[data-theme="dark"] .data-table th {
  background-color: rgba(255, 255, 255, 0.02) !important;
  color: var(--text-color) !important;
  border-bottom: 1px solid var(--card-border) !important;
}

[data-theme="dark"] .data-table td {
  color: var(--text-color) !important;
  border-bottom: 1px solid var(--card-border) !important;
}

[data-theme="dark"] .data-table tr:hover {
  background-color: rgba(255, 255, 255, 0.04) !important;
}

[data-theme="dark"] .filter-select,
[data-theme="dark"] .search-input,
[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
  background-color: var(--input-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--input-border) !important;
}

[data-theme="dark"] .custom-hr,
[data-theme="dark"] hr {
  border-top-color: var(--hr-color) !important;
  opacity: 0.1;
}

[data-theme="dark"] .modal-glass-card {
  background: var(--card-bg) !important;
  border-color: var(--card-border) !important;
  color: var(--text-color) !important;
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

@media (max-width: 768px) {
  button {
    max-width: 100%;
  }
}
</style>
