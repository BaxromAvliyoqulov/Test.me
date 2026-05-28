// Base SVG Templates to reuse
const drawBox = (color, label) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="80" height="60" rx="10" fill="${color}" stroke="#1e293b" stroke-width="4"/><path d="M 10 40 L 90 40" stroke="#1e293b" stroke-width="4"/><circle cx="50" cy="40" r="10" fill="#f8fafc" stroke="#1e293b" stroke-width="4"/><text x="50" y="65" font-family="Arial" font-size="12" fill="white" font-weight="bold" text-anchor="middle">${label}</text></svg>`;

const drawFrame = (color) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="90" height="90" rx="45" fill="none" stroke="${color}" stroke-width="6"/></svg>`;

const drawBadge = (color, symbol) => `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20" fill="${color}"/><text x="25" y="32" font-family="Arial" font-size="20" fill="white" text-anchor="middle" font-weight="bold">${symbol}</text></svg>`;

export const starterBoxes = [
  {
    name: 'Student Crate',
    price: 30,
    description: 'A basic crate for beginners.',
    color: '#94a3b8',
    svg: drawBox('#94a3b8', 'STUDENT'),
    drops: { common: 90, rare: 10, epic: 0, legendary: 0 },
    items: [
      { id: 'st1', name: 'Wooden Frame', type: 'frame', rarity: 'common', svg: drawFrame('#8b4513') },
      { id: 'st2', name: 'Iron Frame', type: 'frame', rarity: 'rare', svg: drawFrame('#a9a9a9') },
      { id: 'st3', name: 'Starter Badge', type: 'badge', rarity: 'common', svg: drawBadge('#8b4513', 'S') }
    ]
  },
  {
    name: 'Math Genius Box',
    price: 80,
    description: 'Exclusive items for math lovers.',
    color: '#3b82f6',
    svg: drawBox('#3b82f6', 'MATH'),
    drops: { common: 50, rare: 40, epic: 10, legendary: 0 },
    items: [
      { id: 'mg1', name: 'Calculator Badge', type: 'badge', rarity: 'common', svg: drawBadge('#3b82f6', '+-') },
      { id: 'mg2', name: 'Pi Symbol Badge', type: 'badge', rarity: 'rare', svg: drawBadge('#2563eb', 'π') },
      { id: 'mg3', name: 'Sigma Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#1d4ed8') }
    ]
  },
  {
    name: 'Linguistic Case',
    price: 80,
    description: 'Perfect for English and Russian learners.',
    color: '#10b981',
    svg: drawBox('#10b981', 'LANG'),
    drops: { common: 50, rare: 40, epic: 10, legendary: 0 },
    items: [
      { id: 'lc1', name: 'EN Badge', type: 'badge', rarity: 'common', svg: drawBadge('#10b981', 'EN') },
      { id: 'lc2', name: 'RU Badge', type: 'badge', rarity: 'common', svg: drawBadge('#10b981', 'RU') },
      { id: 'lc3', name: 'Polyglot Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#059669') }
    ]
  },
  {
    name: 'Silver Elite Case',
    price: 150,
    description: 'Contains high-quality silver items.',
    color: '#cbd5e1',
    svg: drawBox('#cbd5e1', 'SILVER'),
    drops: { common: 30, rare: 50, epic: 20, legendary: 0 },
    items: [
      { id: 'se1', name: 'Silver Frame', type: 'frame', rarity: 'rare', svg: drawFrame('#c0c0c0') },
      { id: 'se2', name: 'Silver Star Badge', type: 'badge', rarity: 'rare', svg: drawBadge('#c0c0c0', '★') },
      { id: 'se3', name: 'Elite Silver Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#e2e8f0') }
    ]
  },
  {
    name: 'Gold Standard Box',
    price: 300,
    description: 'Golden cosmetics for top achievers.',
    color: '#f59e0b',
    svg: drawBox('#f59e0b', 'GOLD'),
    drops: { common: 0, rare: 50, epic: 45, legendary: 5 },
    items: [
      { id: 'gs1', name: 'Gold Badge', type: 'badge', rarity: 'rare', svg: drawBadge('#f59e0b', 'G') },
      { id: 'gs2', name: 'Pure Gold Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#ffd700') },
      { id: 'gs3', name: 'Crown Badge', type: 'badge', rarity: 'legendary', svg: drawBadge('#d97706', '♔') }
    ]
  },
  {
    name: 'Diamond VIP Crate',
    price: 600,
    description: 'Extremely rare diamond-tier cosmetics.',
    color: '#06b6d4',
    svg: drawBox('#06b6d4', 'VIP'),
    drops: { common: 0, rare: 0, epic: 80, legendary: 20 },
    items: [
      { id: 'dv1', name: 'Diamond Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#06b6d4') },
      { id: 'dv2', name: 'Flawless Diamond', type: 'badge', rarity: 'epic', svg: drawBadge('#0891b2', '✧') },
      { id: 'dv3', name: 'Royal VIP Frame', type: 'frame', rarity: 'legendary', svg: drawFrame('#0e7490') }
    ]
  },
  {
    name: 'Nebula Mystery Box',
    price: 800,
    description: 'Cosmic-themed items from outer space.',
    color: '#8b5cf6',
    svg: drawBox('#8b5cf6', 'NEBULA'),
    drops: { common: 0, rare: 0, epic: 70, legendary: 30 },
    items: [
      { id: 'nm1', name: 'Space Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#a855f7') },
      { id: 'nm2', name: 'Galaxy Badge', type: 'badge', rarity: 'epic', svg: drawBadge('#8b5cf6', '☄') },
      { id: 'nm3', name: 'Cosmic Frame', type: 'frame', rarity: 'legendary', svg: drawFrame('#7c3aed') }
    ]
  },
  {
    name: 'Fire Dragon Case',
    price: 1000,
    description: 'Contains mythical fire dragon items.',
    color: '#ef4444',
    svg: drawBox('#ef4444', 'FIRE'),
    drops: { common: 0, rare: 0, epic: 50, legendary: 50 },
    items: [
      { id: 'fd1', name: 'Flame Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#ef4444') },
      { id: 'fd2', name: 'Dragon Eye Badge', type: 'badge', rarity: 'legendary', svg: drawBadge('#dc2626', 'ʘ') },
      { id: 'fd3', name: 'Inferno Frame', type: 'frame', rarity: 'legendary', svg: drawFrame('#b91c1c') }
    ]
  },
  {
    name: 'Aqua Ocean Crate',
    price: 400,
    description: 'Deep sea treasures and aquatic themes.',
    color: '#0ea5e9',
    svg: drawBox('#0ea5e9', 'AQUA'),
    drops: { common: 0, rare: 60, epic: 30, legendary: 10 },
    items: [
      { id: 'ao1', name: 'Water Drop', type: 'badge', rarity: 'rare', svg: drawBadge('#0ea5e9', '💧') },
      { id: 'ao2', name: 'Ocean Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#0284c7') },
      { id: 'ao3', name: 'Poseidon Badge', type: 'badge', rarity: 'legendary', svg: drawBadge('#0369a1', '🔱') }
    ]
  },
  {
    name: 'Cyberpunk Hack Case',
    price: 1500,
    description: 'The ultimate case. Neon, futuristic, legendary.',
    color: '#14b8a6',
    svg: drawBox('#14b8a6', 'CYBER'),
    drops: { common: 0, rare: 0, epic: 20, legendary: 80 },
    items: [
      { id: 'ch1', name: 'Neon Frame', type: 'frame', rarity: 'epic', svg: drawFrame('#14b8a6') },
      { id: 'ch2', name: 'Hacker Badge', type: 'badge', rarity: 'legendary', svg: drawBadge('#0f766e', '/>') },
      { id: 'ch3', name: 'Matrix Frame', type: 'frame', rarity: 'legendary', svg: drawFrame('#047857') },
      { id: 'ch4', name: 'Cyber Demon', type: 'badge', rarity: 'legendary', svg: drawBadge('#be123c', '☠') }
    ]
  }
];
