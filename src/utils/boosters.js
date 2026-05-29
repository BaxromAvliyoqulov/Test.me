export const shopItems = [
  // Boosters
  {
    id: 'double_tp_1h',
    name: 'Double TP (1 Hour)',
    description: 'Double your TP earnings from all tests for 1 hour.',
    category: 'boosters',
    price: 150,
    durationHours: 1,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="booster1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><circle cx="50" cy="50" r="40" fill="url(#booster1)"/><path d="M40 30h20l-10 20h15L35 75l10-25H30l10-20z" fill="#fff"/></svg>`
  },
  {
    id: 'double_tp_24h',
    name: 'Double TP (24 Hours)',
    description: 'Double your TP earnings from all tests for 24 hours.',
    category: 'boosters',
    price: 500,
    durationHours: 24,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="booster2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><circle cx="50" cy="50" r="40" fill="url(#booster2)"/><path d="M40 30h20l-10 20h15L35 75l10-25H30l10-20z" fill="#fff"/></svg>`
  },
  // AI Tools
  {
    id: 'tool_5050',
    name: '50/50 Eliminator',
    description: 'Removes two incorrect answers during a test. (Single use)',
    category: 'ai_tools',
    price: 20,
    quantity: 1,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ai1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#6d28d9"/></linearGradient></defs><circle cx="50" cy="50" r="40" fill="url(#ai1)"/><text x="50" y="58" font-family="Arial" font-size="28" font-weight="bold" fill="#fff" text-anchor="middle">50/50</text></svg>`
  },
  {
    id: 'tool_ai_hint',
    name: 'AI Smart Hint',
    description: 'Provides a smart hint for a difficult question. (Single use)',
    category: 'ai_tools',
    price: 35,
    quantity: 1,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ai2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#047857"/></linearGradient></defs><circle cx="50" cy="50" r="40" fill="url(#ai2)"/><path d="M50 25c-11 0-20 9-20 20 0 6.6 3.2 12.5 8 16.2V68c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4v-6.8c4.8-3.7 8-9.6 8-16.2 0-11-9-20-20-20zm0 50c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z" fill="#fff"/></svg>`
  }
];
