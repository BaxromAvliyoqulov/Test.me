const fs = require('fs');

let content = fs.readFileSync('src/views/home.vue', 'utf8');

// HTML class binding
content = content.replace(
    /:class="\['subject-card', { selected: selectedSubject && selectedSubject.id === subject.id }\]"/,
    `:class="['subject-card', { selected: selectedSubject && selectedSubject.id === subject.id, 'goal-active': subject.id === defaultSubjectId }]"`
);

// CSS updates
content = content.replace(
    /\.subject-card\.selected \{\r?\n  background: var\(--subject-color\);\r?\n  border-color: var\(--subject-color\);\r?\n  box-shadow: 0 15px 30px -5px color-mix\(in srgb, var\(--subject-color\) 40%, transparent\);\r?\n  transform: scale\(1.05\);\r?\n\}/,
    `.subject-card.selected, .subject-card.goal-active {
  background: var(--subject-color);
  border-color: var(--subject-color);
  box-shadow: 0 15px 30px -5px color-mix(in srgb, var(--subject-color) 40%, transparent);
  transform: scale(1.05);
}`
);

content = content.replace(
    /\.subject-card\.selected \.card-content h4 \{\r?\n  color: #ffffff !important;\r?\n\}/,
    `.subject-card.selected .card-content h4, .subject-card.goal-active .card-content h4 {
  color: #ffffff !important;
}`
);

content = content.replace(
    /\.subject-card\.selected \.status-badge \{\r?\n  color: rgba\(255, 255, 255, 0\.8\) !important;\r?\n\}/,
    `.subject-card.selected .status-badge, .subject-card.goal-active .status-badge {
  color: rgba(255, 255, 255, 0.8) !important;
}`
);

content = content.replace(
    /\.subject-card\.selected \.icon-wrapper \{\r?\n  background: rgba\(255, 255, 255, 0\.2\);\r?\n  color: #ffffff;\r?\n  box-shadow: inset 0 2px 4px rgba\(255,255,255,0\.3\);\r?\n\}/,
    `.subject-card.selected .icon-wrapper, .subject-card.goal-active .icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.3);
}`
);

content = content.replace(
    /\.subject-card\.selected \.card-bg-icon \{\r?\n  color: #ffffff;\r?\n  opacity: 0\.2;\r?\n\}/,
    `.subject-card.selected .card-bg-icon, .subject-card.goal-active .card-bg-icon {
  color: #ffffff;
  opacity: 0.2;
}`
);

fs.writeFileSync('src/views/home.vue', content);
console.log('Done!');
