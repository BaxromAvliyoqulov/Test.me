const fs = require('fs');
const path = require('path');

const rarities = [
  { name: 'basic', price: 100, color: '#94a3b8' },
  { name: 'common', price: 250, color: '#10b981' },
  { name: 'rare', price: 500, color: '#3b82f6' },
  { name: 'epic', price: 1200, color: '#a855f7' },
  { name: 'legendary', price: 3000, color: '#f59e0b' }
];

// Diverse SVG Frame Shapes
const frameShapes = [
  // 1. Solid Ring
  (c, sw, filter) => `<circle cx="50" cy="50" r="45" fill="none" stroke="${c}" stroke-width="${sw}" ${filter} />`,
  // 2. Double Ring
  (c, sw, filter) => `<circle cx="50" cy="50" r="45" fill="none" stroke="${c}" stroke-width="${sw-1}" ${filter} /><circle cx="50" cy="50" r="35" fill="none" stroke="${c}" stroke-width="${Math.max(1, sw-2)}" opacity="0.5" ${filter} />`,
  // 3. Hexagon
  (c, sw, filter) => `<polygon points="50,5 89,27 89,72 50,95 11,72 11,27" fill="none" stroke="${c}" stroke-width="${sw}" ${filter} />`,
  // 4. Diamond
  (c, sw, filter) => `<polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="${c}" stroke-width="${sw}" ${filter} />`,
  // 5. Tech Octagon
  (c, sw, filter) => `<polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="none" stroke="${c}" stroke-width="${sw}" ${filter} />`,
  // 6. Dashed Circle
  (c, sw, filter) => `<circle cx="50" cy="50" r="45" fill="none" stroke="${c}" stroke-width="${sw}" stroke-dasharray="10 5" ${filter} />`,
  // 7. Starburst
  (c, sw, filter) => `<path d="M50,5 L61,35 L95,35 L67,55 L78,85 L50,65 L22,85 L33,55 L5,35 L39,35 Z" fill="none" stroke="${c}" stroke-width="${sw}" ${filter} />`,
  // 8. Rounded Square
  (c, sw, filter) => `<rect x="5" y="5" width="90" height="90" rx="20" fill="none" stroke="${c}" stroke-width="${sw}" ${filter} />`,
  // 9. Shield
  (c, sw, filter) => `<path d="M10,10 L90,10 L90,40 C90,70 50,95 50,95 C50,95 10,70 10,40 Z" fill="none" stroke="${c}" stroke-width="${sw}" ${filter} />`,
  // 10. Abstract Crown
  (c, sw, filter) => `<path d="M10,40 L30,10 L50,30 L70,10 L90,40 L80,90 L20,90 Z" fill="none" stroke="${c}" stroke-width="${sw}" ${filter} />`
];

const frameNames = [
  "Simple Ring", "Twin Orbit", "Hexa Core", "Diamond Edge", "Tech Octo",
  "Dashed Line", "Nova Star", "Smooth Box", "Defender", "Royal Crown"
];

const badgeIcons = [
  { i: 'fa-star', n: 'Star' }, { i: 'fa-award', n: 'Award' }, { i: 'fa-shield-alt', n: 'Shield' }, { i: 'fa-crown', n: 'Crown' }, { i: 'fa-gem', n: 'Gem' },
  { i: 'fa-fire', n: 'Fire' }, { i: 'fa-bolt', n: 'Lightning' }, { i: 'fa-heart', n: 'Heart' }, { i: 'fa-leaf', n: 'Leaf' }, { i: 'fa-moon', n: 'Moon' }
];

let items = [];

// Generate 50 Frames (10 per rarity)
for (let i = 0; i < 50; i++) {
  const rarity = rarities[Math.floor(i / 10)];
  const num = i % 10;
  
  const rarityPrefix = rarity.name.charAt(0).toUpperCase() + rarity.name.slice(1);
  const name = `${rarityPrefix} ${frameNames[num]}`;
  
  const strokeWidth = rarity.name === 'legendary' ? 8 : rarity.name === 'epic' ? 6 : rarity.name === 'rare' ? 5 : 4;
  const filter = (rarity.name === 'legendary' || rarity.name === 'epic') ? 'filter="url(#glow)"' : '';
  
  const shapeSvg = frameShapes[num](rarity.color, strokeWidth, filter);

  const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    ${shapeSvg}
  </svg>`;

  items.push({
    id: `frame_${rarity.name}_${num}`,
    name: name,
    type: 'frame',
    rarity: rarity.name,
    price: rarity.price + (num * 15),
    svg: svg.replace(/\n/g, '').replace(/\s+/g, ' ')
  });
}

// Generate 50 Badges (10 per rarity)
for (let i = 0; i < 50; i++) {
  const rarity = rarities[Math.floor(i / 10)];
  const num = i % 10;
  
  const iconData = badgeIcons[num];
  const rarityPrefix = rarity.name.charAt(0).toUpperCase() + rarity.name.slice(1);
  const name = `${rarityPrefix} ${iconData.n} Badge`;
  
  const isGlowing = rarity.name === 'legendary' || rarity.name === 'epic';
  const shadow = isGlowing ? `box-shadow: 0 0 20px ${rarity.color}80, inset 0 0 10px ${rarity.color}40;` : `box-shadow: 0 4px 6px rgba(0,0,0,0.1);`;
  
  const svg = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, ${rarity.color}20, ${rarity.color}60);border-radius:50%;border:3px solid ${rarity.color};color:#fff;font-size:2.5rem;text-shadow:0 2px 4px rgba(0,0,0,0.5);${shadow}">
    <i class="fas ${iconData.i}"></i>
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
console.log('Successfully generated 100 distinct cosmetics in src/utils/cosmetics.js');
