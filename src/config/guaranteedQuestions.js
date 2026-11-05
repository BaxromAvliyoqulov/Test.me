// src/config/guaranteedQuestions.js
/**
 * 🎯 Sovereign Guaranteed Question Bank for Test.me
 * Har bir fan, daraja va maxxus testlar uchun 100% kafolatlangan,
 * offline-first, professional test savollari banki.
 * Supabase bo'sh bo'lganda yoki oflayn rejimda ham testlar bir zumda ochiladi.
 */

export const GUARANTEED_QUESTIONS = {
  // ==========================================
  // 1. MATEMATIKA (MATH)
  // ==========================================
  matematika: [
    {
      question: "Quyidagi tenglamani yeching: $2x + 15 = 45$",
      options: ["$x = 10$", "$x = 15$", "$x = 20$", "$x = 30$"],
      answer: "$x = 15$",
      hint: "Tenglamaning ikkala tomonidan 15 ni ayiring va 2 ga bo'ling."
    },
    {
      question: "To'g'ri to'rtburchakning bo'yi $8\\text{ sm}$, eni $5\\text{ sm}$. Uning yuzini toping.",
      options: ["$13\\text{ sm}^2$", "$26\\text{ sm}^2$", "$40\\text{ sm}^2$", "$45\\text{ sm}^2$"],
      answer: "$40\\text{ sm}^2$",
      hint: "To'rtburchak yuzi: $S = a \\times b$"
    },
    {
      question: "Hisoblang: $5^3 - 4^2$",
      options: ["109", "119", "121", "99"],
      answer: "109",
      hint: "$5^3 = 125$, $4^2 = 16$. Ayirmani toping."
    },
    {
      question: "Uchburchakning ichki burchaklari yig'indisi necha gradusga teng?",
      options: ["$90^\\circ$", "$180^\\circ$", "$270^\\circ$", "$360^\\circ$"],
      answer: "$180^\\circ$",
      hint: "Ixtiyoriy Evklid uchburchagi uchun ichki burchaklar yig'indisi o'zgarmasdir."
    },
    {
      question: "Agar $x^2 - 9 = 0$ bo'lsa, $x$ ning barcha mumkin bo'lgan qiymatlarini toping.",
      options: ["Faqat $3$", "Faqat $-3$", "$\\pm 3$", "$0$"],
      answer: "$\\pm 3$",
      hint: "$a^2 - b^2 = (a-b)(a+b)$ formulasi bo'yicha ajrating."
    },
    {
      question: "Hisoblang: $\\sqrt{144} + \\sqrt{25}$",
      options: ["13", "17", "19", "21"],
      answer: "17",
      hint: "$\\sqrt{144} = 12$ va $\\sqrt{25} = 5$."
    },
    {
      question: "Arifmetik progressiyada $a_1 = 3$, $d = 4$ bo'lsa, $a_5$ ni toping.",
      options: ["15", "19", "23", "27"],
      answer: "19",
      hint: "Formula: $a_n = a_1 + (n - 1)d$"
    },
    {
      question: "Kasrni qisqartiring: $\\frac{24}{36}$",
      options: ["$\\frac{1}{2}$", "$\\frac{2}{3}$", "$\\frac{3}{4}$", "$\\frac{4}{5}$"],
      answer: "$\\frac{2}{3}$",
      hint: "Surat va maxrajni ularning eng katta umumiy bo'luvchisi (12) ga bo'ling."
    },
    {
      question: "Doiraning radiusi $r = 7\\text{ sm}$ bo'lsa, uning yuzi qanchaga teng? ($\\pi \\approx \\frac{22}{7}$)",
      options: ["$44\\text{ sm}^2$", "$154\\text{ sm}^2$", "$88\\text{ sm}^2$", "$196\\text{ sm}^2$"],
      answer: "$154\\text{ sm}^2$",
      hint: "Doira yuzi formulasi: $S = \\pi r^2$"
    },
    {
      question: "Funksiyaning hosilasini toping: $f(x) = 3x^2 + 2x - 5$",
      options: ["$6x + 2$", "$3x + 2$", "$6x - 5$", "$x^3 + x^2$"],
      answer: "$6x + 2$",
      hint: "Darajani oldinga tushirib, daraja ko'rsatkichidan 1 ni ayiring."
    }
  ],

  // ==========================================
  // 2. INGLIZ TILI (ENGLISH)
  // ==========================================
  'ingliz-tili': [
    {
      question: "Choose the correct past simple form: 'She _____ to school yesterday.'",
      options: ["go", "went", "gone", "goes"],
      answer: "went",
      hint: "'Go' fe'lining o'tgan zamon (Past Simple) shakli noto'g'ri fe'ldir."
    },
    {
      question: "Which of the following is an adjective?",
      options: ["Quickly", "Happiness", "Beautiful", "Run"],
      answer: "Beautiful",
      hint: "Sifat narsa-buyumning belgisini bildiradi."
    },
    {
      question: "Fill in the blank: 'If I _____ more money, I would buy a new car.'",
      options: ["have", "had", "will have", "having"],
      answer: "had",
      hint: "Second Conditional: If + Past Simple, would + Verb."
    },
    {
      question: "What is the synonym of 'rapid'?",
      options: ["Slow", "Heavy", "Fast", "Quiet"],
      answer: "Fast",
      hint: "'Rapid' so'zi tez, shiddatli degan ma'noni anglatadi."
    },
    {
      question: "Choose the correct preposition: 'I am interested _____ learning languages.'",
      options: ["at", "on", "in", "with"],
      answer: "in",
      hint: "'Interested' sifati doimo 'in' predlogi bilan ishlatiladi."
    },
    {
      question: "Identify the passive sentence:",
      options: [
        "The chef cooked a delicious meal.",
        "The letter was sent by my manager.",
        "They will visit Bukhara next week.",
        "She is reading a mystery novel."
      ],
      answer: "The letter was sent by my manager.",
      hint: "Passive Voice tuzilishi: to be + V3 (Past Participle)."
    },
    {
      question: "What is the antonym of 'generous'?",
      options: ["Kind", "Selfish", "Polite", "Helpful"],
      answer: "Selfish",
      hint: "'Generous' saxiy degani, uning aksi esa xudbin yoki xasis."
    },
    {
      question: "Fill in the blank: 'Neither Tom _____ Jerry was at the party.'",
      options: ["or", "nor", "and", "but"],
      answer: "nor",
      hint: "'Neither' bog'lovchisi har doim 'nor' bilan juft keladi."
    },
    {
      question: "Which sentence is grammatically correct?",
      options: [
        "She don't like horror movies.",
        "She doesn't likes horror movies.",
        "She doesn't like horror movies.",
        "She not like horror movies."
      ],
      answer: "She doesn't like horror movies.",
      hint: "Inkor shaklida: doesn't + fe'lning o'zagi (infinitive)."
    },
    {
      question: "What does the idiom 'once in a blue moon' mean?",
      options: ["Very often", "Very rarely", "Every night", "Never"],
      answer: "Very rarely",
      hint: "Bu ibora juda kamdan-kam sodir bo'ladigan hodisalar uchun ishlatiladi."
    }
  ],

  // ==========================================
  // 3. FIZIKA (PHYSICS)
  // ==========================================
  fizika: [
    {
      question: "Nyutonning ikkinchi qonuni formulasini ko'rsating:",
      options: ["$F = m \\cdot a$", "$E = m \\cdot c^2$", "$P = I \\cdot U$", "$v = s / t$"],
      answer: "$F = m \\cdot a$",
      hint: "Kuch massa va tezlanishning ko'paytmasiga teng."
    },
    {
      question: "Xalqaro birliklar sistemasida (SI) bosim birligi nima?",
      options: ["Nyuton", "Paskal", "Joul", "Vatt"],
      answer: "Paskal",
      hint: "$1\\text{ Pa} = 1\\text{ N} / 1\\text{ m}^2$"
    },
    {
      question: "Vakuumda yorug'lik tezligi qanchaga teng?",
      options: ["$300\\text{ km/s}$", "$300\\ 000\\text{ km/s}$", "$30\\ 000\\text{ km/s}$", "$3\\ 000\\text{ km/s}$"],
      answer: "$300\\ 000\\text{ km/s}$",
      hint: "$c \\approx 3 \\times 10^8\\text{ m/s}$"
    },
    {
      question: "Kinetik energiya qaysi formula orqali hisoblanadi?",
      options: ["$E = mgh$", "$E = \\frac{mv^2}{2}$", "$E = F \\cdot s$", "$E = I^2Rt$"],
      answer: "$E = \\frac{mv^2}{2}$",
      hint: "Harakatlanayotgan jism energiyasi tezlikning kvadratiga to'g'ri mutanosib."
    },
    {
      question: "O'tkazgichdagi tok kuchi, kuchlanish va qarshilik o'rtasidagi munosabat (Om qonuni):",
      options: ["$I = \\frac{U}{R}$", "$I = U \\cdot R$", "$R = I \\cdot U$", "$U = \\frac{I}{R}$"],
      answer: "$I = \\frac{U}{R}$",
      hint: "Tok kuchi kuchlanishga to'g'ri, qarshilikka teskari mutanosib."
    }
  ],

  // ==========================================
  // 4. O'ZBEKISTON TARIXI (HISTORY)
  // ==========================================
  tarix: [
    {
      question: "Amir Temur nechanchi yilda tavallud topgan?",
      options: ["1336-yil 9-aprel", "1346-yil 8-mart", "1326-yil 1-sentabr", "1356-yil 15-may"],
      answer: "1336-yil 9-aprel",
      hint: "Sohibqiron Kesh (hozirgi Shahrisabz) yaqinidagi Xo'ja Ilg'or qishlog'ida tug'ilgan."
    },
    {
      question: "O'zbekiston Respublikasining Davlat Mustaqilligi qachon e'lon qilingan?",
      options: ["1990-yil 20-iyun", "1991-yil 31-avgust", "1991-yil 1-dekabr", "1992-yil 8-dekabr"],
      answer: "1991-yil 31-avgust",
      hint: "Oliy Kengashning navbatdan tashqari sessiyasida mustaqillik e'lon qilingan."
    },
    {
      question: "Mirzo Ulug'bek tomonidan Samarqandda qurdirilgan mashhur rasadxona qaysi asrga tegishli?",
      options: ["XII asr", "XIV asr", "XV asr", "XVII asr"],
      answer: "XV asr",
      hint: "Rasadxona 1420-yillarda barpo etilgan."
    },
    {
      question: "Qadimgi Xorazm hududida yaratilgan muqaddas kitob qaysi?",
      options: ["Qur'oni Karim", "Avesto", "Injil", "Tavrot"],
      answer: "Avesto",
      hint: "Zardushtiylik dinining muqaddas yozma yodgorligi."
    },
    {
      question: "Jaloliddin Manguberdi qaysi bosqinchilarga qarshi qahramonona kurashgan?",
      options: ["Arablar", "Mo'g'ullar", "Yunon-makedonlar", "Forslar"],
      answer: "Mo'g'ullar",
      hint: "Chingizxon qo'shinlariga qarshi Sind daryosi bo'yida afsonaviy jang olib borgan."
    }
  ],

  // ==========================================
  // 5. INFORMATIKA VA DASTURLASH (IT)
  // ==========================================
  informatika: [
    {
      question: "Python dasturlash tilida konsolga ma'lumot chiqarish funksiyasi qaysi?",
      options: ["echo()", "console.log()", "print()", "System.out.println()"],
      answer: "print()",
      hint: "Eng sodda va mashhur matn chiqarish kalit so'zi."
    },
    {
      question: "1 Kilobayt (KB) necha baytga teng?",
      options: ["1000 bayt", "1024 bayt", "512 bayt", "2048 bayt"],
      answer: "1024 bayt",
      hint: "$2^{10}$ ga teng bo'lgan ikkilik birlik."
    },
    {
      question: "Veb-sahifaning asosiy tuzilishi (skeleti) qaysi til yordamida yaratiladi?",
      options: ["CSS", "HTML", "JavaScript", "SQL"],
      answer: "HTML",
      hint: "HyperText Markup Language — gipermatnli belgilash tili."
    },
    {
      question: "Relyatsion ma'lumotlar bazalarini boshqarish uchun qaysi tildan foydalaniladi?",
      options: ["HTML", "Python", "SQL", "C++"],
      answer: "SQL",
      hint: "Structured Query Language — tuzilgan so'rovlar tili."
    },
    {
      question: "Quyidagilardan qaysi biri operatsion tizim hisoblanadi?",
      options: ["Google Chrome", "Linux", "Microsoft Word", "Photoshop"],
      answer: "Linux",
      hint: "Kompyuter apparat vositalarini boshqaruvchi ochiq kodli yadro va tizim."
    }
  ],

  // ==========================================
  // 6. BIOLOGIYA (BIOLOGY)
  // ==========================================
  biologiya: [
    {
      question: "O'simlik hujayrasida fotosintez jarayoni qaysi organoidda kechadi?",
      options: ["Mitoxondriya", "Xloroplast", "Ribosoma", "Vakuola"],
      answer: "Xloroplast",
      hint: "Xlorofill pigmentini o'z ichiga olgan yashil plastidalar."
    },
    {
      question: "Inson tanasidagi eng katta ichki a'zo qaysi?",
      options: ["Yurak", "O'pka", "Jigar", "Oshqozon"],
      answer: "Jigar",
      hint: "Qonni filtrlash va metabolizmda qatnashuvchi markaziy bez."
    },
    {
      question: "Hujayraning energetik stansiyasi deb ataluvchi organoid:",
      options: ["Mitoxondriya", "Yadro", "Golji majmuasi", "Lizosoma"],
      answer: "Mitoxondriya",
      hint: "ATF (adenozintrifosfat) sintez qiluvchi tuzilma."
    }
  ]
};

// Maxsus Testlar To'plami (DTM, IQ, CEFR)
export const GUARANTEED_SPECIAL_TESTS = {
  'dtm-block-2026': {
    title: 'DTM 2026 Blok Test (Katta Sinov)',
    category: 'DTM',
    questions: [
      {
        question: "Matematika: Hisoblang: $\\frac{2^5 \\cdot 4^2}{8^2}$",
        options: ["4", "8", "16", "32"],
        answer: "8",
        hint: "Barchasini 2 ning darajasiga keltiring: $\\frac{2^5 \\cdot 2^4}{2^6} = 2^3 = 8$."
      },
      {
        question: "Tarix: O'zbekiston Respublikasi Konstitutsiyasi qachon qabul qilingan?",
        options: ["1991-yil 1-sentabr", "1992-yil 8-dekabr", "1993-yil 18-noyabr", "1990-yil 24-mart"],
        answer: "1992-yil 8-dekabr",
        hint: "Bosh qomusimiz har yili dekabr oyining ikkinchi haftasida nishonlanadi."
      },
      {
        question: "Ona tili: Asos va qo'shimchalarga to'g'ri ajratilgan so'zni toping:",
        options: ["Gul-chi-lik", "Kitob-xon-lar-imiz-ga", "Tosh-kent-lik", "Ish-chi-lar"],
        answer: "Kitob-xon-lar-imiz-ga",
        hint: "Asos: kitob, so'z yasovchi: -xon, grammatik qo'shimchalar: -lar, -imiz, -ga."
      },
      {
        question: "Ingliz tili: 'She has been working here _____ 2020.'",
        options: ["for", "since", "in", "during"],
        answer: "since",
        hint: "Boshlang'ich aniq yil yoki vaqt ko'rsatilganda 'since' ishlatiladi."
      },
      {
        question: "Fizika: Jism $20\\text{ m/s}$ tezlik bilan $5\\text{ sekund}$ harakatlandi. Bosib o'tilgan yo'lni toping.",
        options: ["$4\\text{ m}$", "$50\\text{ m}$", "$100\\text{ m}$", "$120\\text{ m}$"],
        answer: "$100\\text{ m}$",
        hint: "$s = v \\cdot t = 20 \\times 5 = 100\\text{ m}$."
      }
    ]
  },

  'logic-iq-test': {
    title: 'Mantiqiy Fikr va IQ Sinovi',
    category: 'Mantiq',
    questions: [
      {
        question: "Ketma-ketlikni davom ettiring: 2, 4, 8, 16, 32, ...?",
        options: ["48", "60", "64", "72"],
        answer: "64",
        hint: "Har bir son oldingisidan 2 barobar katta ($2 \\times 32 = 64$)."
      },
      {
        question: "Agar bugun payshanba bo'lsa, 100 kundan keyin haftaning qaysi kuni bo'ladi?",
        options: ["Juma", "Shanba", "Yakshanba", "Dushanba"],
        answer: "Juma",
        hint: "$100 \\div 7 = 14$ (qoldiq 2). Payshanbadan 2 kun keyin: Juma, Shanba."
      },
      {
        question: "Ortiqcha so'zni toping: Toshkent, Samarqand, Parij, Buxoro, Xiva.",
        options: ["Samarqand", "Parij", "Buxoro", "Xiva"],
        answer: "Parij",
        hint: "Parijdan tashqari barcha shaharlar O'zbekistonda joylashgan."
      },
      {
        question: "Bir poyezd 1 daqiqada 1 km masofani bosib o'tsa, uning tezligi soatiga qancha?",
        options: ["$30\\text{ km/h}$", "$60\\text{ km/h}$", "$100\\text{ km/h}$", "$120\\text{ km/h}$"],
        answer: "$60\\text{ km/h}$",
        hint: "1 soatda 60 daqiqa bor, shuning uchun $60 \\times 1 = 60\\text{ km/h}$."
      }
    ]
  },

  'cefr-english-mock': {
    title: 'CEFR B2 / Multilevel Mock Exam',
    category: 'CEFR',
    questions: [
      {
        question: "Reading & Grammar: 'Despite _____ hard, he didn't pass the exam.'",
        options: ["study", "to study", "studying", "studied"],
        answer: "studying",
        hint: "'Despite' predlogidan keyin fe'lning gerund (-ing) shakli keladi."
      },
      {
        question: "Choose the word closest in meaning to 'OBSTACLE':",
        options: ["Opportunity", "Barrier", "Advantage", "Solution"],
        answer: "Barrier",
        hint: "'Obstacle' — to'siq, g'ov degan ma'noni anglatadi."
      },
      {
        question: "'By the time we arrived, the movie _____.'",
        options: ["already started", "had already started", "has already started", "was starting"],
        answer: "had already started",
        hint: "O'tgan zamondagi boshqa hodisadan oldin tugallangan ish uchun Past Perfect (had + V3) ishlatiladi."
      }
    ]
  }
};

/**
 * Fan nomi yoki ID si bo'yicha kafolatlangan savollarni olish
 */
export function getGuaranteedQuestions(subjectId) {
  if (!subjectId) return GUARANTEED_QUESTIONS.matematika;

  const key = String(subjectId).toLowerCase().trim();

  if (key.includes('matem') || key.includes('math') || key.includes('algebra')) {
    return GUARANTEED_QUESTIONS.matematika;
  }
  if (key.includes('ingliz') || key.includes('english') || key.includes('cefr')) {
    return GUARANTEED_QUESTIONS['ingliz-tili'];
  }
  if (key.includes('fizik') || key.includes('physics')) {
    return GUARANTEED_QUESTIONS.fizika;
  }
  if (key.includes('tarix') || key.includes('history')) {
    return GUARANTEED_QUESTIONS.tarix;
  }
  if (key.includes('informatika') || key.includes('it') || key.includes('comp')) {
    return GUARANTEED_QUESTIONS.informatika;
  }
  if (key.includes('biolog') || key.includes('biology')) {
    return GUARANTEED_QUESTIONS.biologiya;
  }

  // Umumiy standart fallback
  return GUARANTEED_QUESTIONS.matematika;
}

/**
 * Maxsus test ma'lumotlarini olish
 */
export function getGuaranteedSpecialTest(specialId) {
  if (specialId && GUARANTEED_SPECIAL_TESTS[specialId]) {
    return GUARANTEED_SPECIAL_TESTS[specialId];
  }
  return GUARANTEED_SPECIAL_TESTS['dtm-block-2026'];
}
