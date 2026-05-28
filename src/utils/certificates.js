export function getCertificates(results = []) {
  const resultsList = Array.isArray(results) ? results : [];

  // Normalize results that are qualified (score >= 80%)
  const qualifiedResults = resultsList.filter(r => r.total > 0 && (r.score / r.total) >= 0.8);

  const perfectCount = qualifiedResults.filter(r => r.score === r.total).length;

  // General level counts
  const elemCount = qualifiedResults.filter(r => {
    const l = (r.test_level || '').toLowerCase();
    return l.includes('elem') || l.includes('beg') || l.includes('boshlang');
  }).length;

  const interCount = qualifiedResults.filter(r => {
    const l = (r.test_level || '').toLowerCase();
    return l.includes('inter') || l.includes('o\'rta') || l.includes('orta');
  }).length;

  const advCount = qualifiedResults.filter(r => {
    const l = (r.test_level || '').toLowerCase();
    return l.includes('adv') || l.includes('yuqori') || l.includes('prof');
  }).length;

  const hasElem = qualifiedResults.some(r => {
    const l = (r.test_level || '').toLowerCase();
    return l.includes('elem') || l.includes('beg') || l.includes('boshlang');
  });
  const hasInter = qualifiedResults.some(r => {
    const l = (r.test_level || '').toLowerCase();
    return l.includes('inter') || l.includes('o\'rta') || l.includes('orta');
  });
  const hasAdv = qualifiedResults.some(r => {
    const l = (r.test_level || '').toLowerCase();
    return l.includes('adv') || l.includes('yuqori') || l.includes('prof');
  });
  const allLevelsCount = (hasElem ? 1 : 0) + (hasInter ? 1 : 0) + (hasAdv ? 1 : 0);

  // Helper helpers for subject specific checks
  const getSubjLvl = (subjKeyword, lvlKeyword) => {
    return qualifiedResults.filter(r => {
      const s = (r.subject || '').toLowerCase();
      const l = (r.test_level || '').toLowerCase();
      const matchSub = s.includes(subjKeyword) || (subjKeyword === 'uzbek' && (s.includes('o\'zbek') || s.includes('ozbek')));
      const matchLvl = l.includes(lvlKeyword) || 
                       (lvlKeyword === 'elem' && l.includes('beg')) || 
                       (lvlKeyword === 'adv' && l.includes('prof'));
      return matchSub && matchLvl;
    }).length;
  };

  const getSubjTotal = (subjKeyword) => {
    return qualifiedResults.filter(r => {
      const s = (r.subject || '').toLowerCase();
      return s.includes(subjKeyword) || (subjKeyword === 'uzbek' && (s.includes('o\'zbek') || s.includes('ozbek')));
    }).length;
  };

  const hasSubjPerfAdv = (subjKeyword) => {
    return qualifiedResults.some(r => {
      const s = (r.subject || '').toLowerCase();
      const l = (r.test_level || '').toLowerCase();
      const matchSub = s.includes(subjKeyword) || (subjKeyword === 'uzbek' && (s.includes('o\'zbek') || s.includes('ozbek')));
      const matchLvl = l.includes('adv') || l.includes('prof') || l.includes('yuqori');
      return matchSub && matchLvl && r.score === r.total;
    });
  };

  // 50 certificates configuration
  return [
    // === Category 1: General & Level Graduates (10 certs) ===
    {
      id: 'elementary_graduate',
      nameUz: 'Boshlang\'ich Savodxon',
      nameRu: 'Начальный Грамотей',
      descUz: 'Boshlang\'ich darajada kamida 1 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 1 теста на уровне Elementary с результатом 80% или выше.',
      icon: 'fas fa-award',
      color: '#3b82f6',
      unlockRate: 85,
      unlocked: elemCount >= 1,
      progress: true,
      currentVal: elemCount,
      targetVal: 1
    },
    {
      id: 'elementary_specialist',
      nameUz: 'Boshlang\'ich Mutaxassis',
      nameRu: 'Начальный Специалист',
      descUz: 'Boshlang\'ich darajada kamida 3 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 3 тестов на уровне Elementary с результатом 80% или выше.',
      icon: 'fas fa-graduation-cap',
      color: '#60a5fa',
      unlockRate: 60,
      unlocked: elemCount >= 3,
      progress: true,
      currentVal: elemCount,
      targetVal: 3
    },
    {
      id: 'elementary_master',
      nameUz: 'Boshlang\'ich Ustasi',
      nameRu: 'Мастер Начального Уровня',
      descUz: 'Boshlang\'ich darajada kamida 5 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 5 тестов на уровне Elementary с результатом 80% или выше.',
      icon: 'fas fa-certificate',
      color: '#1d4ed8',
      unlockRate: 45,
      unlocked: elemCount >= 5,
      progress: true,
      currentVal: elemCount,
      targetVal: 5
    },
    {
      id: 'intermediate_graduate',
      nameUz: 'O\'rta Darajali Bitiruvchi',
      nameRu: 'Выпускник Среднего Уровня',
      descUz: 'O\'rta darajada kamida 1 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 1 теста на уровне Intermediate с результатом 80% или выше.',
      icon: 'fas fa-award',
      color: '#10b981',
      unlockRate: 55,
      unlocked: interCount >= 1,
      progress: true,
      currentVal: interCount,
      targetVal: 1
    },
    {
      id: 'intermediate_expert',
      nameUz: 'O\'rta Darajali Mutaxassis',
      nameRu: 'Средний Эксперт',
      descUz: 'O\'rta darajada kamida 3 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 3 тестов на уровне Intermediate с результатом 80% или выше.',
      icon: 'fas fa-graduation-cap',
      color: '#34d399',
      unlockRate: 35,
      unlocked: interCount >= 3,
      progress: true,
      currentVal: interCount,
      targetVal: 3
    },
    {
      id: 'intermediate_master',
      nameUz: 'O\'rta Darajali Usta',
      nameRu: 'Мастер Среднего Уровня',
      descUz: 'O\'rta darajada kamida 5 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 5 тестов на уровне Intermediate с результатом 80% или выше.',
      icon: 'fas fa-certificate',
      color: '#047857',
      unlockRate: 25,
      unlocked: interCount >= 5,
      progress: true,
      currentVal: interCount,
      targetVal: 5
    },
    {
      id: 'advanced_graduate',
      nameUz: 'Yuqori Darajali Bitiruvchi',
      nameRu: 'Выпускник Высокого Уровня',
      descUz: 'Yuqori darajada kamida 1 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 1 теста на уровне Advanced с результатом 80% или выше.',
      icon: 'fas fa-award',
      color: '#fbbf24',
      unlockRate: 30,
      unlocked: advCount >= 1,
      progress: true,
      currentVal: advCount,
      targetVal: 1
    },
    {
      id: 'advanced_professional',
      nameUz: 'Professional Bilimdon',
      nameRu: 'Продвинутый Профи',
      descUz: 'Yuqori darajada kamida 3 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 3 тестов на уровне Advanced с результатом 80% или выше.',
      icon: 'fas fa-crown',
      color: '#f59e0b',
      unlockRate: 15,
      unlocked: advCount >= 3,
      progress: true,
      currentVal: advCount,
      targetVal: 3
    },
    {
      id: 'advanced_master',
      nameUz: 'Yuqori Darajali Usta',
      nameRu: 'Мастер Высокого Уровня',
      descUz: 'Yuqori darajada kamida 5 ta testni 80% yoki undan yuqori natija bilan yechganda beriladi.',
      descRu: 'Выдается за решение не менее 5 тестов на уровне Advanced с результатом 80% или выше.',
      icon: 'fas fa-trophy',
      color: '#d97706',
      unlockRate: 8,
      unlocked: advCount >= 5,
      progress: true,
      currentVal: advCount,
      targetVal: 5
    },
    {
      id: 'ultimate_academic',
      nameUz: 'Universal Akademik',
      nameRu: 'Универсальный Академик',
      descUz: 'Boshlang\'ich, o\'rta va yuqori darajalarning barchasida kamida 1 tadan muvaffaqiyatli test topshiring.',
      descRu: 'Сдайте хотя бы по 1 успешному тесту на каждом из уровней (Beginner, Intermediate, Advanced).',
      icon: 'fas fa-universal-access',
      color: '#ec4899',
      unlockRate: 5,
      unlocked: allLevelsCount >= 3,
      progress: true,
      currentVal: allLevelsCount,
      targetVal: 3
    },

    // === Category 2: English Language (6 certs) ===
    {
      id: 'eng_novice',
      nameUz: 'Ingliz Tili Boshlang\'ich',
      nameRu: 'Английский - Начальный',
      descUz: 'Boshlang\'ich darajada kamida 1 ta Ingliz tili testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 1 тест по английскому языку на начальном уровне.',
      icon: 'fas fa-globe-americas',
      color: '#38bdf8',
      unlockRate: 75,
      unlocked: getSubjLvl('english', 'elem') >= 1,
      progress: true,
      currentVal: getSubjLvl('english', 'elem'),
      targetVal: 1
    },
    {
      id: 'eng_practitioner',
      nameUz: 'Ingliz Tili Amaliyotchi',
      nameRu: 'Практик Английского',
      descUz: 'Kamida 3 ta Ingliz tili testini 80% yoki undan yuqori natija bilan yeching.',
      descRu: 'Сдайте не менее 3 тестов по английскому языку с результатом 80% или выше.',
      icon: 'fas fa-comments',
      color: '#0ea5e9',
      unlockRate: 45,
      unlocked: getSubjTotal('english') >= 3,
      progress: true,
      currentVal: getSubjTotal('english'),
      targetVal: 3
    },
    {
      id: 'eng_inter_expert',
      nameUz: 'Ingliz Tili O\'rta Mutaxassis',
      nameRu: 'Английский - Эксперт Среднего',
      descUz: 'O\'rta darajada kamida 3 ta Ingliz tili testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по английскому языку на среднем уровне.',
      icon: 'fas fa-graduation-cap',
      color: '#0284c7',
      unlockRate: 25,
      unlocked: getSubjLvl('english', 'inter') >= 3,
      progress: true,
      currentVal: getSubjLvl('english', 'inter'),
      targetVal: 3
    },
    {
      id: 'eng_adv_expert',
      nameUz: 'Ingliz Tili Yuqori Mutaxassis',
      nameRu: 'Английский - Профессионал',
      descUz: 'Yuqori darajada kamida 3 ta Ingliz tili testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по английскому языку на продвинутом уровне.',
      icon: 'fas fa-crown',
      color: '#1e3a8a',
      unlockRate: 12,
      unlocked: getSubjLvl('english', 'adv') >= 3,
      progress: true,
      currentVal: getSubjLvl('english', 'adv'),
      targetVal: 3
    },
    {
      id: 'eng_master',
      nameUz: 'Ingliz Tili So\'z Ustasi',
      nameRu: 'Мастер Английского Слова',
      descUz: 'Yuqori darajadagi Ingliz tili testlaridan birida 100% natija qayd eting.',
      descRu: 'Получите 100% результат в тесте по английскому продвинутого уровня.',
      icon: 'fas fa-medal',
      color: '#6366f1',
      unlockRate: 5,
      unlocked: hasSubjPerfAdv('english'),
      progress: false,
      currentVal: hasSubjPerfAdv('english') ? 1 : 0,
      targetVal: 1
    },
    {
      id: 'eng_philologist',
      nameUz: 'Londonlik Filolog',
      nameRu: 'Лондонский Филолог',
      descUz: 'Jami 10 ta Ingliz tili testini muvaffaqiyatli yeching.',
      descRu: 'Успешно завершите 10 тестов по английскому языку.',
      icon: 'fas fa-book-reader',
      color: '#4f46e5',
      unlockRate: 4,
      unlocked: getSubjTotal('english') >= 10,
      progress: true,
      currentVal: getSubjTotal('english'),
      targetVal: 10
    },

    // === Category 3: O\'zbek Tili (6 certs) ===
    {
      id: 'uzb_novice',
      nameUz: 'O\'zbek Tili Boshlang\'ich',
      nameRu: 'Узбекский - Начальный',
      descUz: 'Boshlang\'ich darajada kamida 1 ta O\'zbek tili testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 1 тест по узбекскому языку на начальном уровне.',
      icon: 'fas fa-book',
      color: '#a7f3d0',
      unlockRate: 80,
      unlocked: getSubjLvl('uzbek', 'elem') >= 1,
      progress: true,
      currentVal: getSubjLvl('uzbek', 'elem'),
      targetVal: 1
    },
    {
      id: 'uzb_practitioner',
      nameUz: 'O\'zbek Tili Amaliyotchi',
      nameRu: 'Практик Узбекского',
      descUz: 'Kamida 3 ta O\'zbek tili testini muvaffaqiyatli yeching.',
      descRu: 'Сдайте не менее 3 тестов по узбекскому языку с результатом 80% или выше.',
      icon: 'fas fa-feather',
      color: '#34d399',
      unlockRate: 50,
      unlocked: getSubjTotal('uzbek') >= 3,
      progress: true,
      currentVal: getSubjTotal('uzbek'),
      targetVal: 3
    },
    {
      id: 'uzb_inter_expert',
      nameUz: 'O\'zbek Tili O\'rta Mutaxassis',
      nameRu: 'Узбекский - Эксперт Среднего',
      descUz: 'O\'rta darajada kamida 3 ta O\'zbek tili testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по узбекскому языку на среднем уровне.',
      icon: 'fas fa-pen-fancy',
      color: '#059669',
      unlockRate: 30,
      unlocked: getSubjLvl('uzbek', 'inter') >= 3,
      progress: true,
      currentVal: getSubjLvl('uzbek', 'inter'),
      targetVal: 3
    },
    {
      id: 'uzb_adv_expert',
      nameUz: 'O\'zbek Tili Professional',
      nameRu: 'Узбекский - Профессионал',
      descUz: 'Yuqori darajada kamida 3 ta O\'zbek tili testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по узбекскому языку на продвинутом уровне.',
      icon: 'fas fa-crown',
      color: '#065f46',
      unlockRate: 15,
      unlocked: getSubjLvl('uzbek', 'adv') >= 3,
      progress: true,
      currentVal: getSubjLvl('uzbek', 'adv'),
      targetVal: 3
    },
    {
      id: 'uzb_master',
      nameUz: 'Suxandon',
      nameRu: 'Оратор',
      descUz: 'Yuqori darajadagi O\'zbek tili testlaridan birida 100% natija qayd eting.',
      descRu: 'Получите 100% результат в тесте по узбекскому продвинутого уровня.',
      icon: 'fas fa-bullhorn',
      color: '#10b981',
      unlockRate: 6,
      unlocked: hasSubjPerfAdv('uzbek'),
      progress: false,
      currentVal: hasSubjPerfAdv('uzbek') ? 1 : 0,
      targetVal: 1
    },
    {
      id: 'uzb_navoiy',
      nameUz: 'Alisher Navoiy Vorisi',
      nameRu: 'Преемник Алишера Навои',
      descUz: 'Jami 10 ta O\'zbek tili testini muvaffaqiyatli yeching.',
      descRu: 'Успешно завершите 10 тестов по узбекскому языку.',
      icon: 'fas fa-scroll',
      color: '#0f766e',
      unlockRate: 5,
      unlocked: getSubjTotal('uzbek') >= 10,
      progress: true,
      currentVal: getSubjTotal('uzbek'),
      targetVal: 10
    },

    // === Category 4: Matematika (6 certs) ===
    {
      id: 'math_novice',
      nameUz: 'Matematika Boshlang\'ich',
      nameRu: 'Математика - Начальный',
      descUz: 'Boshlang\'ich darajada kamida 1 ta Matematika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 1 тест по математике на начальном уровне.',
      icon: 'fas fa-calculator',
      color: '#e9d5ff',
      unlockRate: 70,
      unlocked: getSubjLvl('matematika', 'elem') >= 1,
      progress: true,
      currentVal: getSubjLvl('matematika', 'elem'),
      targetVal: 1
    },
    {
      id: 'math_practitioner',
      nameUz: 'Yosh Hisobchi',
      nameRu: 'Молодой Вычислитель',
      descUz: 'Kamida 3 ta Matematika testini muvaffaqiyatli yeching.',
      descRu: 'Сдайте не менее 3 тестов по математике с результатом 80% или выше.',
      icon: 'fas fa-percent',
      color: '#c084fc',
      unlockRate: 40,
      unlocked: getSubjTotal('matematika') >= 3,
      progress: true,
      currentVal: getSubjTotal('matematika'),
      targetVal: 3
    },
    {
      id: 'math_inter_expert',
      nameUz: 'Matematika O\'rta Mutaxassis',
      nameRu: 'Математика - Эксперт Среднего',
      descUz: 'O\'rta darajada kamida 3 ta Matematika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по математике на среднем уровне.',
      icon: 'fas fa-shapes',
      color: '#a855f7',
      unlockRate: 20,
      unlocked: getSubjLvl('matematika', 'inter') >= 3,
      progress: true,
      currentVal: getSubjLvl('matematika', 'inter'),
      targetVal: 3
    },
    {
      id: 'math_adv_expert',
      nameUz: 'Matematika Professional',
      nameRu: 'Математика - Профессионал',
      descUz: 'Yuqori darajada kamida 3 ta Matematika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по математике на продвинутом уровне.',
      icon: 'fas fa-square-root-alt',
      color: '#7e22ce',
      unlockRate: 10,
      unlocked: getSubjLvl('matematika', 'adv') >= 3,
      progress: true,
      currentVal: getSubjLvl('matematika', 'adv'),
      targetVal: 3
    },
    {
      id: 'math_master',
      nameUz: 'Matematika Dahosi',
      nameRu: 'Гений Математики',
      descUz: 'Yuqori darajadagi Matematika testlaridan birida 100% natija qayd eting.',
      descRu: 'Получите 100% результат в тесте по математике продвинутого уровня.',
      icon: 'fas fa-infinity',
      color: '#6b21a8',
      unlockRate: 4,
      unlocked: hasSubjPerfAdv('matematika'),
      progress: false,
      currentVal: hasSubjPerfAdv('matematika') ? 1 : 0,
      targetVal: 1
    },
    {
      id: 'math_xorazmiy',
      nameUz: 'Al-Xorazmiy Vorisi',
      nameRu: 'Преемник Аль-Хорезми',
      descUz: 'Jami 10 ta Matematika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно завершите 10 тестов по математике.',
      icon: 'fas fa-superscript',
      color: '#4c1d95',
      unlockRate: 3,
      unlocked: getSubjTotal('matematika') >= 10,
      progress: true,
      currentVal: getSubjTotal('matematika'),
      targetVal: 10
    },

    // === Category 5: Tarix (6 certs) ===
    {
      id: 'hist_novice',
      nameUz: 'Tarix Boshlang\'ich',
      nameRu: 'История - Начальный',
      descUz: 'Boshlang\'ich darajada kamida 1 ta Tarix testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 1 тест по истории на начальном уровне.',
      icon: 'fas fa-map-marked-alt',
      color: '#fef3c7',
      unlockRate: 72,
      unlocked: getSubjLvl('tarix', 'elem') >= 1,
      progress: true,
      currentVal: getSubjLvl('tarix', 'elem'),
      targetVal: 1
    },
    {
      id: 'hist_practitioner',
      nameUz: 'Yosh Tarixchi',
      nameRu: 'Молодой Историк',
      descUz: 'Kamida 3 ta Tarix testini muvaffaqiyatli yeching.',
      descRu: 'Сдайте не менее 3 тестов по истории с результатом 80% или выше.',
      icon: 'fas fa-history',
      color: '#fcd34d',
      unlockRate: 45,
      unlocked: getSubjTotal('tarix') >= 3,
      progress: true,
      currentVal: getSubjTotal('tarix'),
      targetVal: 3
    },
    {
      id: 'hist_inter_expert',
      nameUz: 'Tarix O\'rta Mutaxassis',
      nameRu: 'История - Эксперт Среднего',
      descUz: 'O\'rta darajada kamida 3 ta Tarix testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по истории на среднем уровне.',
      icon: 'fas fa-university',
      color: '#d97706',
      unlockRate: 22,
      unlocked: getSubjLvl('tarix', 'inter') >= 3,
      progress: true,
      currentVal: getSubjLvl('tarix', 'inter'),
      targetVal: 3
    },
    {
      id: 'hist_adv_expert',
      nameUz: 'Tarix Professional',
      nameRu: 'История - Профессионал',
      descUz: 'Yuqori darajada kamida 3 ta Tarix testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по истории на продвинутом уровне.',
      icon: 'fas fa-hourglass-half',
      color: '#b45309',
      unlockRate: 11,
      unlocked: getSubjLvl('tarix', 'adv') >= 3,
      progress: true,
      currentVal: getSubjLvl('tarix', 'adv'),
      targetVal: 3
    },
    {
      id: 'hist_master',
      nameUz: 'Tarix Bilimdoni',
      nameRu: 'Знаток Истории',
      descUz: 'Yuqori darajadagi Tarix testlaridan birida 100% natija qayd eting.',
      descRu: 'Получите 100% результат в тесте по истории продвинутого уровня.',
      icon: 'fas fa-landmark',
      color: '#92400e',
      unlockRate: 4,
      unlocked: hasSubjPerfAdv('tarix'),
      progress: false,
      currentVal: hasSubjPerfAdv('tarix') ? 1 : 0,
      targetVal: 1
    },
    {
      id: 'hist_chronolog',
      nameUz: 'Buyuk Xronolog',
      nameRu: 'Великий Хронолог',
      descUz: 'Jami 10 ta Tarix testini muvaffaqiyatli yeching.',
      descRu: 'Успешно завершите 10 тестов по истории.',
      icon: 'fas fa-monument',
      color: '#78350f',
      unlockRate: 3,
      unlocked: getSubjTotal('tarix') >= 10,
      progress: true,
      currentVal: getSubjTotal('tarix'),
      targetVal: 10
    },

    // === Category 6: Fizika (6 certs) ===
    {
      id: 'phys_novice',
      nameUz: 'Fizika Boshlang\'ich',
      nameRu: 'Физика - Начальный',
      descUz: 'Boshlang\'ich darajada kamida 1 ta Fizika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 1 тест по физике на начальном уровне.',
      icon: 'fas fa-magnet',
      color: '#fee2e2',
      unlockRate: 65,
      unlocked: getSubjLvl('fizika', 'elem') >= 1,
      progress: true,
      currentVal: getSubjLvl('fizika', 'elem'),
      targetVal: 1
    },
    {
      id: 'phys_practitioner',
      nameUz: 'Yosh Fizik',
      nameRu: 'Молодой Физик',
      descUz: 'Kamida 3 ta Fizika testini muvaffaqiyatli yeching.',
      descRu: 'Сдайте не менее 3 тестов по физике с результатом 80% или выше.',
      icon: 'fas fa-lightbulb',
      color: '#fca5a5',
      unlockRate: 38,
      unlocked: getSubjTotal('fizika') >= 3,
      progress: true,
      currentVal: getSubjTotal('fizika'),
      targetVal: 3
    },
    {
      id: 'phys_inter_expert',
      nameUz: 'Fizika O\'rta Mutaxassis',
      nameRu: 'Физика - Эксперт Среднего',
      descUz: 'O\'rta darajada kamida 3 ta Fizika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по физике на среднем уровне.',
      icon: 'fas fa-thermometer-half',
      color: '#ef4444',
      unlockRate: 18,
      unlocked: getSubjLvl('fizika', 'inter') >= 3,
      progress: true,
      currentVal: getSubjLvl('fizika', 'inter'),
      targetVal: 3
    },
    {
      id: 'phys_adv_expert',
      nameUz: 'Fizika Professional',
      nameRu: 'Физика - Профессионал',
      descUz: 'Yuqori darajada kamida 3 ta Fizika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по физике на продвинутом уровне.',
      icon: 'fas fa-atom',
      color: '#dc2626',
      unlockRate: 8,
      unlocked: getSubjLvl('fizika', 'adv') >= 3,
      progress: true,
      currentVal: getSubjLvl('fizika', 'adv'),
      targetVal: 3
    },
    {
      id: 'phys_master',
      nameUz: 'Fizika Dahosi',
      nameRu: 'Гений Физики',
      descUz: 'Yuqori darajadagi Fizika testlaridan birida 100% natija qayd eting.',
      descRu: 'Получите 100% результат в тесте по физике продвинутого уровня.',
      icon: 'fas fa-meteor',
      color: '#b91c1c',
      unlockRate: 3,
      unlocked: hasSubjPerfAdv('fizika'),
      progress: false,
      currentVal: hasSubjPerfAdv('fizika') ? 1 : 0,
      targetVal: 1
    },
    {
      id: 'phys_newton',
      nameUz: 'Nyuton Izdoshi',
      nameRu: 'Преемник Ньютона',
      descUz: 'Jami 10 ta Fizika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно завершите 10 тестов по физике.',
      icon: 'fas fa-apple-alt',
      color: '#991b1b',
      unlockRate: 2,
      unlocked: getSubjTotal('fizika') >= 10,
      progress: true,
      currentVal: getSubjTotal('fizika'),
      targetVal: 10
    },

    // === Category 7: Informatika (5 certs) ===
    {
      id: 'info_novice',
      nameUz: 'Informatika Boshlang\'ich',
      nameRu: 'Информатика - Начальный',
      descUz: 'Boshlang\'ich darajada kamida 1 ta Informatika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 1 тест по информатике на начальном уровне.',
      icon: 'fas fa-keyboard',
      color: '#e0f2fe',
      unlockRate: 78,
      unlocked: getSubjLvl('informatika', 'elem') >= 1,
      progress: true,
      currentVal: getSubjLvl('informatika', 'elem'),
      targetVal: 1
    },
    {
      id: 'info_practitioner',
      nameUz: 'Raqamli Dunyo',
      nameRu: 'Цифровой Мир',
      descUz: 'Kamida 3 ta Informatika testini muvaffaqiyatli yeching.',
      descRu: 'Сдайте не менее 3 тестов по информатике с результатом 80% или выше.',
      icon: 'fas fa-desktop',
      color: '#7dd3fc',
      unlockRate: 48,
      unlocked: getSubjTotal('informatika') >= 3,
      progress: true,
      currentVal: getSubjTotal('informatika'),
      targetVal: 3
    },
    {
      id: 'info_inter_expert',
      nameUz: 'Informatika O\'rta Mutaxassis',
      nameRu: 'Информатика - Эксперт Среднего',
      descUz: 'O\'rta darajada kamida 3 ta Informatika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по информатике на среднем уровне.',
      icon: 'fas fa-server',
      color: '#0ea5e9',
      unlockRate: 28,
      unlocked: getSubjLvl('informatika', 'inter') >= 3,
      progress: true,
      currentVal: getSubjLvl('informatika', 'inter'),
      targetVal: 3
    },
    {
      id: 'info_adv_expert',
      nameUz: 'Informatika Professional',
      nameRu: 'Информатика - Профессионал',
      descUz: 'Yuqori darajada kamida 3 ta Informatika testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по информатике на продвинутом уровне.',
      icon: 'fas fa-network-wired',
      color: '#0369a1',
      unlockRate: 14,
      unlocked: getSubjLvl('informatika', 'adv') >= 3,
      progress: true,
      currentVal: getSubjLvl('informatika', 'adv'),
      targetVal: 3
    },
    {
      id: 'info_master',
      nameUz: 'Informatika Dahosi',
      nameRu: 'Гений Информатики',
      descUz: 'Yuqori darajadagi Informatika testlaridan birida 100% natija qayd eting.',
      descRu: 'Получите 100% результат в тесте по информатике продвинутого уровня.',
      icon: 'fas fa-microchip',
      color: '#1e40af',
      unlockRate: 5,
      unlocked: hasSubjPerfAdv('informatika'),
      progress: false,
      currentVal: hasSubjPerfAdv('informatika') ? 1 : 0,
      targetVal: 1
    },

    // === Category 8: Dasturlash (5 certs) ===
    {
      id: 'prog_novice',
      nameUz: 'Kodlovchi Boshlang\'ich',
      nameRu: 'Кодер - Начальный',
      descUz: 'Boshlang\'ich darajada kamida 1 ta Dasturlash testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 1 тест по программированию на начальном уровне.',
      icon: 'fas fa-file-code',
      color: '#fae8ff',
      unlockRate: 68,
      unlocked: getSubjLvl('dasturlash', 'elem') >= 1,
      progress: true,
      currentVal: getSubjLvl('dasturlash', 'elem'),
      targetVal: 1
    },
    {
      id: 'prog_practitioner',
      nameUz: 'Yosh Dasturchi',
      nameRu: 'Молодой Программист',
      descUz: 'Kamida 3 ta Dasturlash testini muvaffaqiyatli yeching.',
      descRu: 'Сдайте не менее 3 тестов по программированию с результатом 80% или выше.',
      icon: 'fas fa-code',
      color: '#e9d5ff',
      unlockRate: 38,
      unlocked: getSubjTotal('dasturlash') >= 3,
      progress: true,
      currentVal: getSubjTotal('dasturlash'),
      targetVal: 3
    },
    {
      id: 'prog_inter_expert',
      nameUz: 'Dasturlash O\'rta Mutaxassis',
      nameRu: 'Программирование - Эксперт Среднего',
      descUz: 'O\'rta darajada kamida 3 ta Dasturlash testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по программированию на среднем уровне.',
      icon: 'fas fa-terminal',
      color: '#c084fc',
      unlockRate: 18,
      unlocked: getSubjLvl('dasturlash', 'inter') >= 3,
      progress: true,
      currentVal: getSubjLvl('dasturlash', 'inter'),
      targetVal: 3
    },
    {
      id: 'prog_adv_expert',
      nameUz: 'Dasturlash Professional',
      nameRu: 'Программирование - Профессионал',
      descUz: 'Yuqori darajada kamida 3 ta Dasturlash testini muvaffaqiyatli yeching.',
      descRu: 'Успешно сдайте хотя бы 3 теста по программированию на продвинутом уровне.',
      icon: 'fas fa-laptop-code',
      color: '#9333ea',
      unlockRate: 7,
      unlocked: getSubjLvl('dasturlash', 'adv') >= 3,
      progress: true,
      currentVal: getSubjLvl('dasturlash', 'adv'),
      targetVal: 3
    },
    {
      id: 'prog_master',
      nameUz: 'Dasturlash Guruhi',
      nameRu: 'Гуру Программирования',
      descUz: 'Yuqori darajadagi Dasturlash testlaridan birida 100% natija qayd eting.',
      descRu: 'Получите 100% результат в тесте по программированию продвинутого уровня.',
      icon: 'fas fa-bug',
      color: '#581c87',
      unlockRate: 2,
      unlocked: hasSubjPerfAdv('dasturlash'),
      progress: false,
      currentVal: hasSubjPerfAdv('dasturlash') ? 1 : 0,
      targetVal: 1
    }
  ];
}
