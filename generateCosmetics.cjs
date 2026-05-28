const fs = require('fs');
const path = require('path');

const rarities = [
  { name: 'basic', price: 100, color: '#94a3b8' },
  { name: 'common', price: 250, color: '#10b981' },
  { name: 'rare', price: 500, color: '#3b82f6' },
  { name: 'epic', price: 1200, color: '#a855f7' },
  { name: 'legendary', price: 3000, color: '#f59e0b' }
];

const badgeIcons = [
  'fa-star', 'fa-award', 'fa-shield-alt', 'fa-crown', 'fa-gem', 
  'fa-fire', 'fa-bolt', 'fa-heart', 'fa-leaf', 'fa-moon',
  'fa-sun', 'fa-meteor', 'fa-compass', 'fa-anchor', 'fa-dragon',
  'fa-ghost', 'fa-robot', 'fa-rocket', 'fa-satellite', 'fa-space-shuttle'
];

let items = [];

// Generate 50 Frames
for (let i = 0; i < 50; i++) {
  const rarity = rarities[Math.floor(i / 10)];
  const num = (i % 10) + 1;
  const name = `${rarity.name.charAt(0).toUpperCase() + rarity.name.slice(1)} Frame ${num}`;
  const strokeWidth = rarity.name === 'legendary' ? 8 : rarity.name === 'epic' ? 6 : 4;
  const filter = rarity.name === 'legendary' || rarity.name === 'epic' ? 'filter="url(#glow)"' : '';
  
  const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="${rarity.color}" stroke-width="${strokeWidth}" ${filter} />
  </svg>`;

  items.push({
    id: `frame_${rarity.name}_${num}`,
    name: name,
    type: 'frame',
    rarity: rarity.name,
    price: rarity.price + (num * 10),
    svg: svg.replace(/\n/g, '').replace(/\s+/g, ' ')
  });
}

// Generate 50 Badges
for (let i = 0; i < 50; i++) {
  const rarity = rarities[Math.floor(i / 10)];
  const num = (i % 10) + 1;
  const icon = badgeIcons[i % badgeIcons.length];
  const name = `${rarity.name.charAt(0).toUpperCase() + rarity.name.slice(1)} Badge ${num}`;
  
  const svg = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${rarity.color}20;border-radius:50%;border:2px solid ${rarity.color};color:${rarity.color};font-size:2rem;box-shadow:0 0 15px ${rarity.color}40;">
    <i class="fas ${icon}"></i>
  </div>`;

  items.push({
    id: `badge_${rarity.name}_${num}`,
    name: name,
    type: 'badge',
    rarity: rarity.name,
    price: rarity.price + (num * 10),
    svg: svg.replace(/\n/g, '').replace(/\s+/g, ' ')
  });
}

const fileContent = `export const cosmetics = ${JSON.stringify(items, null, 2)};\n`;

fs.writeFileSync(path.join(__dirname, 'src', 'utils', 'cosmetics.js'), fileContent);
console.log('Successfully generated 100 cosmetics in src/utils/cosmetics.js');
