// src/config/defaultSubjects.js
/**
 * ⚡ Test.me Default Offline-First Subjects & Levels
 * Server yoki Supabase bilan aloqa uzilganda ham platforma to'liq ishlashini
 * va foydalanuvchilar har qanday fandan test yechishini ta'minlovchi kafolatli fanlar bazasi.
 */

export const DEFAULT_SUBJECTS = [
  {
    id: 'matematika',
    name: 'Matematika',
    nameUz: 'Matematika',
    nameRu: 'Математика',
    description: 'Algebra, geometriya va mantiqiy masalalar',
    descriptionRu: 'Алгебра, геометрия и логические задачи',
    icon: 'fas fa-calculator',
    color: '#3b82f6',
    is_active: true
  },
  {
    id: 'ingliz-tili',
    name: 'Ingliz tili',
    nameUz: 'Ingliz tili',
    nameRu: 'Английский язык',
    description: 'Grammar, vocabulary, reading va CEFR darajalari',
    descriptionRu: 'Грамматика, словарный запас и тесты CEFR',
    icon: 'fas fa-globe',
    color: '#10b981',
    is_active: true
  },
  {
    id: 'fizika',
    name: 'Fizika',
    nameUz: 'Fizika',
    nameRu: 'Физика',
    description: 'Mexanika, termodinamika va elektrodinamika',
    descriptionRu: 'Механика, термодинамика и электродинамика',
    icon: 'fas fa-atom',
    color: '#8b5cf6',
    is_active: true
  },
  {
    id: 'tarix',
    name: "O'zbekiston tarixi",
    nameUz: "O'zbekiston tarixi",
    nameRu: 'История Узбекистана',
    description: 'Qadimgi davrdan hozirgi kungacha tarixiy voqealar',
    descriptionRu: 'С древнейших времен до наших дней',
    icon: 'fas fa-landmark',
    color: '#f59e0b',
    is_active: true
  },
  {
    id: 'biologiya',
    name: 'Biologiya',
    nameUz: 'Biologiya',
    nameRu: 'Биология',
    description: 'Botanika, zoologiya va inson anatomiyasi',
    descriptionRu: 'Ботаника, зоология и анатомия человека',
    icon: 'fas fa-dna',
    color: '#ec4899',
    is_active: true
  },
  {
    id: 'informatika',
    name: 'Informatika va IT',
    nameUz: 'Informatika va IT',
    nameRu: 'Информатика и IT',
    description: 'Dasturlash, kompyuter savodxonligi va algoritmlar',
    descriptionRu: 'Программирование, компьютерная грамотность и IT',
    icon: 'fas fa-laptop-code',
    color: '#06b6d4',
    is_active: true
  },
  {
    id: 'ona-tili',
    name: 'Ona tili va Adabiyot',
    nameUz: 'Ona tili va Adabiyot',
    nameRu: 'Родной язык и литература',
    description: 'Orfografiya, punktuatsiya va adabiy asarlar tahlili',
    descriptionRu: 'Орфография, пунктуация и анализ литературы',
    icon: 'fas fa-book',
    color: '#6366f1',
    is_active: true
  },
  {
    id: 'kimyo',
    name: 'Kimyo',
    nameUz: 'Kimyo',
    nameRu: 'Химия',
    description: 'Organik va anorganik kimyo, reaksiyalar va formulalar',
    descriptionRu: 'Органическая и неорганическая химия, формулы',
    icon: 'fas fa-flask',
    color: '#14b8a6',
    is_active: true
  }
];

export const DEFAULT_LEVELS = {
  matematika: ["Boshlang'ich (Elementary)", "O'rta (Intermediate)", "Murakkab (Advanced / DTM)"],
  'ingliz-tili': ['A1 - A2 (Beginner)', 'B1 - B2 (Intermediate)', 'C1 (Advanced)'],
  fizika: ['Asosiy tushunchalar', "O'rta qiyinlik", 'Murakkab masalalar (DTM)'],
  tarix: ['Umumiy tarix (5-9 sinf)', "Chuqurlashtirilgan (DTM)"],
  biologiya: ['Umumiy biologiya', 'Anatomiya va Genetika (DTM)'],
  informatika: ["Kompyuter savodxonligi", "Algoritmlar va Python", "Web dasturlash"],
  'ona-tili': ["Qoidalar va Imlo", "Morfologiya va Sintaksis", "Adabiyot va Testlar"],
  kimyo: ["Boshlang'ich tushunchalar", "Reaksiyalar va Masalalar"]
};

export const DEFAULT_SPECIAL_TESTS = [
  {
    id: 'dtm-block-2026',
    title: 'DTM 2026 Blok Test (Katta Sinov)',
    category: 'DTM',
    description: 'Majburiy va asosiy fanlar bo\'yicha davlat imtihoni simulyatsiyasi',
    questionCount: 30
  },
  {
    id: 'logic-iq-test',
    title: 'Mantiqiy Fikr va IQ Sinovi',
    category: 'Mantiq',
    description: 'Kreativ va analitik intellektni baholovchi savollar',
    questionCount: 15
  },
  {
    id: 'cefr-english-mock',
    title: 'CEFR B2 / Multilevel Mock Exam',
    category: 'CEFR',
    description: 'Xalqaro va milliy sertifikat standartidagi ingliz tili testi',
    questionCount: 25
  }
];

export function getFallbackLevelsForSubject(subjectId) {
  if (!subjectId) return ["Boshlang'ich", "O'rta", "Murakkab"];
  const lower = String(subjectId).toLowerCase();
  for (const [key, lvls] of Object.entries(DEFAULT_LEVELS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return lvls;
    }
  }
  return ["Boshlang'ich (Elementary)", "O'rta (Intermediate)", "Murakkab (Advanced)"];
}
