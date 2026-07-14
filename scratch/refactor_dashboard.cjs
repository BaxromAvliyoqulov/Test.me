const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, '..', 'src', 'views', 'dashboard.vue');
const fileContent = fs.readFileSync(dashboardPath, 'utf8');

// 1. Extract the script part exactly as it is.
const scriptStart = fileContent.indexOf('<script>');
const scriptEnd = fileContent.indexOf('</style>') + 8; // wait, no
const styleStart = fileContent.indexOf('<style scoped>');

const scriptContent = fileContent.substring(scriptStart, styleStart);

// 2. We need to add the imports for our new components into the script.
let updatedScript = scriptContent;
updatedScript = updatedScript.replace(
  "import { useI18n } from '@/utils/i18n';",
  `import { useI18n } from '@/utils/i18n';
import DashboardHero from '@/components/dashboard/DashboardHero.vue';
import SubjectAnalytics from '@/components/dashboard/SubjectAnalytics.vue';
import ResultsTable from '@/components/dashboard/ResultsTable.vue';`
);

// Register components in the export default object
updatedScript = updatedScript.replace(
  "name: 'Dashboard',",
  "name: 'Dashboard',\n  components: {\n    DashboardHero,\n    SubjectAnalytics,\n    ResultsTable\n  },"
);

// 3. New template
const newTemplate = `<template>
  <div class="premium-layout dashboard-wrapper">
    <!-- Glowing background blobs matching the premium theme -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="dashboard-container">
      <DashboardHero 
        :totalTests="items.length"
        :averageScorePercent="averageScorePercent"
        :highestScorePercent="highestScorePercent"
        :bestSubjectName="bestSubjectName"
        :perfectScoreCount="perfectScoreCount"
        :uniqueSubjectsStudied="uniqueSubjectsStudied"
      />

      <SubjectAnalytics 
        :subjectStats="subjectStats"
        :levelStats="levelStats"
      />

      <ResultsTable 
        :search="search"
        @update:search="search = $event"
        :filterSubject="filterSubject"
        @update:filterSubject="filterSubject = $event"
        :filterLevel="filterLevel"
        @update:filterLevel="filterLevel = $event"
        :uniqueSubjects="uniqueSubjects"
        :uniqueLevels="uniqueLevels"
        :loading="loading"
        :items="items"
        :paginatedItems="paginatedAndFilteredItems"
        :headers="headers"
        :sortKey="sortKey"
        :sortOrder="sortOrder"
        :currentPage="currentPage"
        @update:currentPage="currentPage = $event"
        :totalPages="totalPages"
        @sort="sortBy"
        @delete="deleteItem"
        @export="exportToExcel"
      />
    </div>
  </div>
</template>
`;

// 4. New simplified style
const newStyle = `<style scoped>
.dashboard-wrapper {
  position: relative;
  min-height: 100vh;
  padding: 3rem 1.5rem;
  overflow-x: hidden;
  background: #f8fafc;
  font-family: 'Outfit', 'Inter', sans-serif;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
}

.glow-bg-1 {
  top: 5%;
  left: 5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #3b82f6 0%, #60a5fa 100%);
}

.glow-bg-2 {
  bottom: 5%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #10b981 0%, #34d399 100%);
}

.dashboard-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}
</style>
`;

// Assemble the final file
const finalFileContent = newTemplate + '\n' + updatedScript + newStyle;

fs.writeFileSync(dashboardPath, finalFileContent);
console.log('Successfully refactored dashboard.vue');
