export function getBadges(totalTests, perfectCount, userPoints, results = []) {
  // normalize and compute subject counts
  const resultsList = Array.isArray(results) ? results : [];
  
  const englishCount = resultsList.filter(r => {
    const s = (r.subject || '').toLowerCase();
    return s.includes('ingliz') || s.includes('english');
  }).length;

  const russianCount = resultsList.filter(r => {
    const s = (r.subject || '').toLowerCase();
    return s.includes('rus') || s.includes('russian');
  }).length;

  const mathCount = resultsList.filter(r => {
    const s = (r.subject || '').toLowerCase();
    return s.includes('matem') || s.includes('math');
  }).length;

  const historyCount = resultsList.filter(r => {
    const s = (r.subject || '').toLowerCase();
    return s.includes('tarix') || s.includes('history');
  }).length;

  const aiCount = resultsList.filter(r => r.subject === 'ai').length;
  
  const beginnerCount = resultsList.filter(r => {
    const lvl = (r.test_level || '').toLowerCase();
    return lvl === 'beginner' || lvl === 'boshlang\'ich' || lvl === 'boshlangich';
  }).length;

  const intermediateCount = resultsList.filter(r => {
    const lvl = (r.test_level || '').toLowerCase();
    return lvl === 'intermediate' || lvl === 'o\'rta' || lvl === 'orta';
  }).length;

  const advancedCount = resultsList.filter(r => {
    const lvl = (r.test_level || '').toLowerCase();
    return lvl === 'advanced' || lvl === 'yuqori';
  }).length;

  const specialCount = resultsList.filter(r => r.subject === 'special').length;

  return [
    // --- Group 1: Total Tests Solved (11 badges) ---
    {
      id: 'test_1',
      nameUz: 'Birinchi qadam',
      nameRu: 'Первый шаг',
      descUz: 'Kamida 1 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении хотя бы 1 теста.',
      icon: 'fas fa-walking',
      color: '#3b82f6',
      unlockRate: 95,
      unlocked: totalTests >= 1,
      progress: true,
      currentVal: totalTests,
      targetVal: 1
    },
    {
      id: 'test_5',
      nameUz: 'Yosh olim',
      nameRu: 'Молодой ученый',
      descUz: 'Kamida 5 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 5 тестов.',
      icon: 'fas fa-baby',
      color: '#60a5fa',
      unlockRate: 72,
      unlocked: totalTests >= 5,
      progress: true,
      currentVal: totalTests,
      targetVal: 5
    },
    {
      id: 'test_10',
      nameUz: 'Tirishqoq',
      nameRu: 'Упорный',
      descUz: 'Kamida 10 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 10 тестов.',
      icon: 'fas fa-fire',
      color: '#f97316',
      unlockRate: 50,
      unlocked: totalTests >= 10,
      progress: true,
      currentVal: totalTests,
      targetVal: 10
    },
    {
      id: 'test_15',
      nameUz: 'Bilimdon',
      nameRu: 'Эрудит',
      descUz: 'Kamida 15 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 15 тестов.',
      icon: 'fas fa-book-reader',
      color: '#10b981',
      unlockRate: 35,
      unlocked: totalTests >= 15,
      progress: true,
      currentVal: totalTests,
      targetVal: 15
    },
    {
      id: 'test_20',
      nameUz: 'Kitobxon',
      nameRu: 'Книголюб',
      descUz: 'Kamida 20 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 20 тестов.',
      icon: 'fas fa-book',
      color: '#059669',
      unlockRate: 25,
      unlocked: totalTests >= 20,
      progress: true,
      currentVal: totalTests,
      targetVal: 20
    },
    {
      id: 'test_25',
      nameUz: 'Aqlli miya',
      nameRu: 'Умная голова',
      descUz: 'Kamida 25 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 25 тестов.',
      icon: 'fas fa-brain',
      color: '#8b5cf6',
      unlockRate: 18,
      unlocked: totalTests >= 25,
      progress: true,
      currentVal: totalTests,
      targetVal: 25
    },
    {
      id: 'test_30',
      nameUz: 'Dono',
      nameRu: 'Мудрец',
      descUz: 'Kamida 30 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 30 тестов.',
      icon: 'fas fa-user-graduate',
      color: '#7c3aed',
      unlockRate: 12,
      unlocked: totalTests >= 30,
      progress: true,
      currentVal: totalTests,
      targetVal: 30
    },
    {
      id: 'test_40',
      nameUz: 'Bilimlar guruhi',
      nameRu: 'Гуру знаний',
      descUz: 'Kamida 40 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 40 тестов.',
      icon: 'fas fa-award',
      color: '#db2777',
      unlockRate: 8,
      unlocked: totalTests >= 40,
      progress: true,
      currentVal: totalTests,
      targetVal: 40
    },
    {
      id: 'test_50',
      nameUz: 'Professor',
      nameRu: 'Профессор',
      descUz: 'Kamida 50 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 50 тестов.',
      icon: 'fas fa-university',
      color: '#ec4899',
      unlockRate: 5,
      unlocked: totalTests >= 50,
      progress: true,
      currentVal: totalTests,
      targetVal: 50
    },
    {
      id: 'test_75',
      nameUz: 'Akademik',
      nameRu: 'Академик',
      descUz: 'Kamida 75 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 75 тестов.',
      icon: 'fas fa-gem',
      color: '#14b8a6',
      unlockRate: 3,
      unlocked: totalTests >= 75,
      progress: true,
      currentVal: totalTests,
      targetVal: 75
    },
    {
      id: 'test_100',
      nameUz: 'Eynshteyn',
      nameRu: 'Эйнштейн',
      descUz: 'Kamida 100 ta test topshirganingizda ochiladi.',
      descRu: 'Открывается при прохождении 100 тестов.',
      icon: 'fas fa-atom',
      color: '#0d9488',
      unlockRate: 1,
      unlocked: totalTests >= 100,
      progress: true,
      currentVal: totalTests,
      targetVal: 100
    },

    // --- Group 2: Perfect Scores (7 badges) ---
    {
      id: 'perfect_1',
      nameUz: 'A\'lochi',
      nameRu: 'Отличник',
      descUz: 'Birorta testda 100% natija qayd etganingizda ochiladi.',
      descRu: 'Открывается за 100% результат в любом тесте.',
      icon: 'fas fa-star',
      color: '#fbbf24',
      unlockRate: 30,
      unlocked: perfectCount >= 1,
      progress: true,
      currentVal: perfectCount,
      targetVal: 1
    },
    {
      id: 'perfect_2',
      nameUz: 'Qo\'shaloq g\'alaba',
      nameRu: 'Двойная победа',
      descUz: '2 ta testda 100% natija qayd etganingizda ochiladi.',
      descRu: 'Открывается за 100% результат в 2 тестах.',
      icon: 'fas fa-medal',
      color: '#f59e0b',
      unlockRate: 15,
      unlocked: perfectCount >= 2,
      progress: true,
      currentVal: perfectCount,
      targetVal: 2
    },
    {
      id: 'perfect_3',
      nameUz: 'Super Aql',
      nameRu: 'Супер Мозг',
      descUz: '3 ta testda 100% natija qayd etganingizda ochiladi.',
      descRu: 'Открывается за 100% результат в 3 тестах.',
      icon: 'fas fa-crown',
      color: '#d97706',
      unlockRate: 8,
      unlocked: perfectCount >= 3,
      progress: true,
      currentVal: perfectCount,
      targetVal: 3
    },
    {
      id: 'perfect_5',
      nameUz: 'Yengilmas',
      nameRu: 'Непобедимый',
      descUz: '5 ta testda 100% natija qayd etganingizda ochiladi.',
      descRu: 'Открывается за 100% результат в 5 тестах.',
      icon: 'fas fa-shield-alt',
      color: '#ef4444',
      unlockRate: 5,
      unlocked: perfectCount >= 5,
      progress: true,
      currentVal: perfectCount,
      targetVal: 5
    },
    {
      id: 'perfect_10',
      nameUz: 'Daholik',
      nameRu: 'Гений',
      descUz: '10 ta testda 100% natija qayd etganingizda ochiladi.',
      descRu: 'Открывается за 100% результат в 10 тестах.',
      icon: 'fas fa-bolt',
      color: '#ea580c',
      unlockRate: 2,
      unlocked: perfectCount >= 10,
      progress: true,
      currentVal: perfectCount,
      targetVal: 10
    },
    {
      id: 'perfect_15',
      nameUz: 'Mukammal',
      nameRu: 'Безупречный',
      descUz: '15 ta testda 100% natija qayd etganingizda ochiladi.',
      descRu: 'Открывается за 100% результат в 15 тестах.',
      icon: 'fas fa-magic',
      color: '#be123c',
      unlockRate: 1,
      unlocked: perfectCount >= 15,
      progress: true,
      currentVal: perfectCount,
      targetVal: 15
    },
    {
      id: 'perfect_20',
      nameUz: 'Hamma narsani biluvchi',
      nameRu: 'Всеведущий',
      descUz: '20 ta testda 100% natija qayd etganingizda ochiladi.',
      descRu: 'Открывается за 100% результат в 20 тестах.',
      icon: 'fas fa-eye',
      color: '#e11d48',
      unlockRate: 0.5,
      unlocked: perfectCount >= 20,
      progress: true,
      currentVal: perfectCount,
      targetVal: 20
    },

    // --- Group 3: Coins Accumulated (9 badges) ---
    {
      id: 'coins_10',
      nameUz: 'Boshlang\'ich hamyon',
      nameRu: 'Начальный кошелек',
      descUz: 'Kamida 10 TP Coin yig\'ganingizda ochiladi.',
      descRu: 'Открывается при накоплении хотя бы 10 TP Coins.',
      icon: 'fas fa-piggy-bank',
      color: '#fcd34d',
      unlockRate: 90,
      unlocked: userPoints >= 10,
      progress: true,
      currentVal: userPoints,
      targetVal: 10
    },
    {
      id: 'coins_50',
      nameUz: 'Bronza hamyon',
      nameRu: 'Бронзовый кошелек',
      descUz: 'Kamida 50 TP Coin yig\'ganingizda ochiladi.',
      descRu: 'Открывается при накоплении хотя бы 50 TP Coins.',
      icon: 'fas fa-wallet',
      color: '#fbbf24',
      unlockRate: 75,
      unlocked: userPoints >= 50,
      progress: true,
      currentVal: userPoints,
      targetVal: 50
    },
    {
      id: 'coins_100',
      nameUz: 'Kumush hamyon',
      nameRu: 'Серебряный кошелек',
      descUz: 'Kamida 100 TP Coin yig\'ganingizda ochiladi.',
      descRu: 'Открывается при накоплении хотя бы 100 TP Coins.',
      icon: 'fas fa-coins',
      color: '#94a3b8',
      unlockRate: 60,
      unlocked: userPoints >= 100,
      progress: true,
      currentVal: userPoints,
      targetVal: 100
    },
    {
      id: 'coins_200',
      nameUz: 'Oltin hamyon',
      nameRu: 'Золотой кошелек',
      descUz: 'Kamida 200 TP Coin yig\'ganingizda ochiladi.',
      descRu: 'Открывается при накоплении хотя бы 200 TP Coins.',
      icon: 'fas fa-box-open',
      color: '#ca8a04',
      unlockRate: 40,
      unlocked: userPoints >= 200,
      progress: true,
      currentVal: userPoints,
      targetVal: 200
    },
    {
      id: 'coins_500',
      nameUz: 'Koin Qiroli',
      nameRu: 'Король Коинов',
      descUz: '500 dan ortiq TP Coin to\'plaganingizda ochiladi.',
      descRu: 'Открывается за накопление 500+ TP Coins.',
      icon: 'fas fa-crown',
      color: '#a855f7',
      unlockRate: 20,
      unlocked: userPoints >= 500,
      progress: true,
      currentVal: userPoints,
      targetVal: 500
    },
    {
      id: 'coins_1000',
      nameUz: 'Kolleksioner',
      nameRu: 'Коллекционер',
      descUz: '1000 dan ortiq TP Coin to\'plaganingizda ochiladi.',
      descRu: 'Открывается за накопление 1000+ TP Coins.',
      icon: 'fas fa-key',
      color: '#9333ea',
      unlockRate: 10,
      unlocked: userPoints >= 1000,
      progress: true,
      currentVal: userPoints,
      targetVal: 1000
    },
    {
      id: 'coins_2000',
      nameUz: 'Boy olim',
      nameRu: 'Богатый ученый',
      descUz: '2000 dan ortiq TP Coin to\'plaganingizda ochiladi.',
      descRu: 'Открывается за накопление 2000+ TP Coins.',
      icon: 'fas fa-gem',
      color: '#7e22ce',
      unlockRate: 5,
      unlocked: userPoints >= 2000,
      progress: true,
      currentVal: userPoints,
      targetVal: 2000
    },
    {
      id: 'coins_5000',
      nameUz: 'Millioner',
      nameRu: 'Миллионер',
      descUz: '5000 dan ortiq TP Coin to\'plaganingizda ochiladi.',
      descRu: 'Открывается за накопление 5000+ TP Coins.',
      icon: 'fas fa-chart-line',
      color: '#4c1d95',
      unlockRate: 2,
      unlocked: userPoints >= 5000,
      progress: true,
      currentVal: userPoints,
      targetVal: 5000
    },
    {
      id: 'coins_10000',
      nameUz: 'Xazina egasi',
      nameRu: 'Хранитель казны',
      descUz: '10000 dan ortiq TP Coin to\'plaganingizda ochiladi.',
      descRu: 'Открывается за накопление 10000+ TP Coins.',
      icon: 'fas fa-vault',
      color: '#2563eb',
      unlockRate: 0.8,
      unlocked: userPoints >= 10000,
      progress: true,
      currentVal: userPoints,
      targetVal: 10000
    },

    // --- Group 4: Subject-Specific Solved (16 badges) ---
    // English
    {
      id: 'subj_english_1',
      nameUz: 'Ingliz tili boshlang\'ich',
      nameRu: 'Новичок в английском',
      descUz: 'Kamida 1 ta Ingliz tili testini topshiring.',
      descRu: 'Сдайте хотя бы 1 тест по английскому языку.',
      icon: 'fas fa-globe',
      color: '#38bdf8',
      unlockRate: 70,
      unlocked: englishCount >= 1,
      progress: true,
      currentVal: englishCount,
      targetVal: 1
    },
    {
      id: 'subj_english_5',
      nameUz: 'Ingliz tili o\'rganuvchisi',
      nameRu: 'Изучающий английский',
      descUz: 'Kamida 5 ta Ingliz tili testini topshiring.',
      descRu: 'Сдайте хотя бы 5 тестов по английскому языку.',
      icon: 'fas fa-language',
      color: '#0284c7',
      unlockRate: 40,
      unlocked: englishCount >= 5,
      progress: true,
      currentVal: englishCount,
      targetVal: 5
    },
    {
      id: 'subj_english_10',
      nameUz: 'Ingliz tili so\'zlovchisi',
      nameRu: 'Говорящий по-английски',
      descUz: 'Kamida 10 ta Ingliz tili testini topshiring.',
      descRu: 'Сдайте хотя бы 10 тестов по английскому языку.',
      icon: 'fas fa-comments',
      color: '#0369a1',
      unlockRate: 20,
      unlocked: englishCount >= 10,
      progress: true,
      currentVal: englishCount,
      targetVal: 10
    },
    {
      id: 'subj_english_20',
      nameUz: 'Londonlik',
      nameRu: 'Лондонец',
      descUz: 'Kamida 20 ta Ingliz tili testini topshiring.',
      descRu: 'Сдайте хотя бы 20 тестов по английскому языку.',
      icon: 'fas fa-landmark',
      color: '#1e3a8a',
      unlockRate: 5,
      unlocked: englishCount >= 20,
      progress: true,
      currentVal: englishCount,
      targetVal: 20
    },
    // Russian
    {
      id: 'subj_russian_1',
      nameUz: 'Rus tili boshlang\'ich',
      nameRu: 'Новичок в русском',
      descUz: 'Kamida 1 ta Rus tili testini topshiring.',
      descRu: 'Сдайте хотя бы 1 тест по русскому языку.',
      icon: 'fas fa-feather',
      color: '#fca5a5',
      unlockRate: 65,
      unlocked: russianCount >= 1,
      progress: true,
      currentVal: russianCount,
      targetVal: 1
    },
    {
      id: 'subj_russian_5',
      nameUz: 'Rus tili o\'rganuvchisi',
      nameRu: 'Изучающий русский',
      descUz: 'Kamida 5 ta Rus tili testini topshiring.',
      descRu: 'Сдайте хотя бы 5 тестов по русскому языку.',
      icon: 'fas fa-pen-fancy',
      color: '#ef4444',
      unlockRate: 35,
      unlocked: russianCount >= 5,
      progress: true,
      currentVal: russianCount,
      targetVal: 5
    },
    {
      id: 'subj_russian_10',
      nameUz: 'Rus tili so\'zlovchisi',
      nameRu: 'Говорящий по-русски',
      descUz: 'Kamida 10 ta Rus tili testini topshiring.',
      descRu: 'Сдайте хотя бы 10 тестов по русскому языку.',
      icon: 'fas fa-pen-nib',
      color: '#dc2626',
      unlockRate: 15,
      unlocked: russianCount >= 10,
      progress: true,
      currentVal: russianCount,
      targetVal: 10
    },
    {
      id: 'subj_russian_20',
      nameUz: 'Pushkin do\'sti',
      nameRu: 'Друг Пушкина',
      descUz: 'Kamida 20 ta Rus tili testini topshiring.',
      descRu: 'Сдайте хотя бы 20 тестов по русскому языку.',
      icon: 'fas fa-book-open',
      color: '#991b1b',
      unlockRate: 4,
      unlocked: russianCount >= 20,
      progress: true,
      currentVal: russianCount,
      targetVal: 20
    },
    // Math
    {
      id: 'subj_math_1',
      nameUz: 'Matematika boshlang\'ich',
      nameRu: 'Новичок в математике',
      descUz: 'Kamida 1 ta Matematika testini topshiring.',
      descRu: 'Сдайте хотя бы 1 тест по математике.',
      icon: 'fas fa-calculator',
      color: '#c084fc',
      unlockRate: 60,
      unlocked: mathCount >= 1,
      progress: true,
      currentVal: mathCount,
      targetVal: 1
    },
    {
      id: 'subj_math_5',
      nameUz: 'Matematika o\'rganuvchisi',
      nameRu: 'Изучающий математику',
      descUz: 'Kamida 5 ta Matematika testini topshiring.',
      descRu: 'Сдайте хотя бы 5 тестов по математике.',
      icon: 'fas fa-square-root-alt',
      color: '#a855f7',
      unlockRate: 30,
      unlocked: mathCount >= 5,
      progress: true,
      currentVal: mathCount,
      targetVal: 5
    },
    {
      id: 'subj_math_10',
      nameUz: 'Master hisobchi',
      nameRu: 'Мастер вычислений',
      descUz: 'Kamida 10 ta Matematika testini topshiring.',
      descRu: 'Сдайте хотя бы 10 тестов по математике.',
      icon: 'fas fa-percent',
      color: '#7e22ce',
      unlockRate: 12,
      unlocked: mathCount >= 10,
      progress: true,
      currentVal: mathCount,
      targetVal: 10
    },
    {
      id: 'subj_math_20',
      nameUz: 'Al-Xorazmiy davomchisi',
      nameRu: 'Преемник Аль-Хорезми',
      descUz: 'Kamida 20 ta Matematika testini topshiring.',
      descRu: 'Сдайте хотя бы 20 тестов по математике.',
      icon: 'fas fa-infinity',
      color: '#581c87',
      unlockRate: 3,
      unlocked: mathCount >= 20,
      progress: true,
      currentVal: mathCount,
      targetVal: 20
    },
    // History
    {
      id: 'subj_history_1',
      nameUz: 'Tarix boshlang\'ich',
      nameRu: 'Новичок в истории',
      descUz: 'Kamida 1 ta Tarix testini topshiring.',
      descRu: 'Сдайте хотя бы 1 тест по истории.',
      icon: 'fas fa-landmark',
      color: '#f59e0b',
      unlockRate: 55,
      unlocked: historyCount >= 1,
      progress: true,
      currentVal: historyCount,
      targetVal: 1
    },
    {
      id: 'subj_history_5',
      nameUz: 'Xronolog',
      nameRu: 'Хронолог',
      descUz: 'Kamida 5 ta Tarix testini topshiring.',
      descRu: 'Сдайте хотя бы 5 тестов по истории.',
      icon: 'fas fa-history',
      color: '#d97706',
      unlockRate: 25,
      unlocked: historyCount >= 5,
      progress: true,
      currentVal: historyCount,
      targetVal: 5
    },
    {
      id: 'subj_history_10',
      nameUz: 'Vaqt sayohatchisi',
      nameRu: 'Путешественник во времени',
      descUz: 'Kamida 10 ta Tarix testini topshiring.',
      descRu: 'Сдайте хотя бы 10 тестов по истории.',
      icon: 'fas fa-clock',
      color: '#b45309',
      unlockRate: 10,
      unlocked: historyCount >= 10,
      progress: true,
      currentVal: historyCount,
      targetVal: 10
    },
    {
      id: 'subj_history_20',
      nameUz: 'Tarixchi olim',
      nameRu: 'Ученый-историк',
      descUz: 'Kamida 20 ta Tarix testini topshiring.',
      descRu: 'Сдайте хотя бы 20 тестов по истории.',
      icon: 'fas fa-monument',
      color: '#78350f',
      unlockRate: 2,
      unlocked: historyCount >= 20,
      progress: true,
      currentVal: historyCount,
      targetVal: 20
    },

    // --- Group 5: AI Constructor Completion (3 badges) ---
    {
      id: 'ai_1',
      nameUz: 'AI Tadqiqotchi',
      nameRu: 'Исследователь ИИ',
      descUz: 'Kamida 1 ta AI konstruktori orqali yaratilgan testni yeching.',
      descRu: 'Пройдите хотя бы 1 тест, созданный ИИ-конструктором.',
      icon: 'fas fa-microchip',
      color: '#c084fc',
      unlockRate: 40,
      unlocked: aiCount >= 1,
      progress: true,
      currentVal: aiCount,
      targetVal: 1
    },
    {
      id: 'ai_5',
      nameUz: 'AI Amaliyotchi',
      nameRu: 'Практик ИИ',
      descUz: 'Kamida 5 ta AI konstruktori orqali yaratilgan testni yeching.',
      descRu: 'Пройдите хотя бы 5 тестов, созданных ИИ-конструктором.',
      icon: 'fas fa-laptop-code',
      color: '#a855f7',
      unlockRate: 15,
      unlocked: aiCount >= 5,
      progress: true,
      currentVal: aiCount,
      targetVal: 5
    },
    {
      id: 'ai_10',
      nameUz: 'Sun\'iy intellekt ustasi',
      nameRu: 'Мастер искусственного интеллекта',
      descUz: 'Kamida 10 ta AI konstruktori orqali yaratilgan testni yeching.',
      descRu: 'Пройдите хотя бы 10 тестов, созданных ИИ-конструктором.',
      icon: 'fas fa-robot',
      color: '#6b21a8',
      unlockRate: 4,
      unlocked: aiCount >= 10,
      progress: true,
      currentVal: aiCount,
      targetVal: 10
    },

    // --- Group 6: Level-Specific Mastery (4 badges) ---
    {
      id: 'level_beginner',
      nameUz: 'Boshlang\'ich zabt etuvchi',
      nameRu: 'Покоритель начального уровня',
      descUz: 'Kamida 5 ta Beginner (Boshlang\'ich) darajasidagi testlarni yeching.',
      descRu: 'Сдайте хотя бы 5 тестов начального уровня (Beginner).',
      icon: 'fas fa-graduation-cap',
      color: '#22c55e',
      unlockRate: 60,
      unlocked: beginnerCount >= 5,
      progress: true,
      currentVal: beginnerCount,
      targetVal: 5
    },
    {
      id: 'level_intermediate',
      nameUz: 'O\'rta daraja eksperti',
      nameRu: 'Эксперт среднего уровня',
      descUz: 'Kamida 5 ta Intermediate (O\'rta) darajasidagi testlarni yeching.',
      descRu: 'Сдайте хотя бы 5 тестов среднего уровня (Intermediate).',
      icon: 'fas fa-certificate',
      color: '#3b82f6',
      unlockRate: 30,
      unlocked: intermediateCount >= 5,
      progress: true,
      currentVal: intermediateCount,
      targetVal: 5
    },
    {
      id: 'level_advanced',
      nameUz: 'Yuqori daraja afsonasi',
      nameRu: 'Легенда высокого уровня',
      descUz: 'Kamida 5 ta Advanced (Yuqori) darajasidagi testlarni yeching.',
      descRu: 'Сдайте хотя бы 5 тестов высокого уровня (Advanced).',
      icon: 'fas fa-medal',
      color: '#f59e0b',
      unlockRate: 10,
      unlocked: advancedCount >= 5,
      progress: true,
      currentVal: advancedCount,
      targetVal: 5
    },
    {
      id: 'level_special',
      nameUz: 'Imtihon chaqiruvchisi',
      nameRu: 'Бросивший вызов экзаменам',
      descUz: 'Kamida 3 ta Maxsus yoki DTM testlarini yeching.',
      descRu: 'Пройдите хотя бы 3 Специальных или DTM теста.',
      icon: 'fas fa-trophy',
      color: '#ec4899',
      unlockRate: 5,
      unlocked: specialCount >= 3,
      progress: true,
      currentVal: specialCount,
      targetVal: 3
    }
  ];
}
