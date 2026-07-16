const fs = require('fs');
const path = require('path');

const vueFile = path.resolve('src/views/editProfile/components/GoalsEditor.vue');
let content = fs.readFileSync(vueFile, 'utf-8');

// Update template structure
const oldTemplateStart = `<div class="goals-editor-wrap">
    <!-- Header -->`;

const newTemplateStart = `<div class="goals-editor-wrap split-layout">
    <!-- Left Column: Goals List -->
    <div class="goals-list-section">
      <!-- Header -->`;

content = content.replace(oldTemplateStart, newTemplateStart);

const beforeForm = `    <!-- Add / Edit Form -->`;
const replaceBeforeForm = `    </div> <!-- End Left Column -->

    <!-- Right Column: Sticky Form -->
    <div class="goal-form-section">
      <!-- Add / Edit Form -->`;

content = content.replace(beforeForm, replaceBeforeForm);

const endTemplate = `      </div>
    </div>
  </div>
</template>`;

const newEndTemplate = `      </div>
    </div>
    </div> <!-- End Right Column -->
  </div>
</template>`;

content = content.replace(endTemplate, newEndTemplate);

// Add CSS for split layout
const cssToInsert = `
/* Split Layout */
.goals-editor-wrap.split-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}
.goals-list-section {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevents flex items from blowing out the grid */
}
.goal-form-section {
  position: sticky;
  top: 2rem;
}
.sticky-panel {
  margin-top: 0 !important;
}

@media (max-width: 1024px) {
  .goals-editor-wrap.split-layout {
    grid-template-columns: 1fr;
  }
  .goal-form-section {
    position: static;
  }
}
`;

content = content.replace('.goals-editor-wrap {', cssToInsert + '\n.goals-editor-wrap {');

// make form panel sticky
content = content.replace('<div class="goal-form-panel">', '<div class="goal-form-panel sticky-panel">');

// Update goals-grid to support 2 columns inside the left pane
const gridCss = `.goals-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}`;
const newGridCss = `.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}`;

content = content.replace(gridCss, newGridCss);

fs.writeFileSync(vueFile, content, 'utf-8');
console.log('Updated GoalsEditor.vue for Split Layout');
