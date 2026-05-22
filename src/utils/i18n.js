import { ref } from 'vue';

const currentLocale = ref(localStorage.getItem('locale') || 'UZB');

const translations = {
  UZB: {
    home: 'Bosh sahifa',
    points: 'Ballar',
    about: 'Biz haqimizda',
    contact: 'Aloqa',
    dashboard: 'Statistika',
    logout: 'Chiqish',
    login: 'Kirish',
    signup: 'Roʻyxatdan oʻtish',
    selectSubject: 'Test topshirish uchun fan tanlang',
    chooseSubject: 'Fanni tanlang',
    selectLevel: 'Darajani tanlang',
    chooseLevel: 'Darajani tanlang',
    questionCount: 'Savollar soni',
    selectQuestionCount: 'Savollar sonini tanlang',
    startTest: 'Testni boshlash',
    backToSelection: 'Selektsiyaga qaytish',
    loadingSubjects: 'Fanlar yuklanmoqda...',
    loadingLevels: 'Darajalar yuklanmoqda...',
    questions: 'savol',
  },
  RUS: {
    home: 'Главная',
    points: 'Баллы',
    about: 'О нас',
    contact: 'Контакты',
    dashboard: 'Панель',
    logout: 'Выйти',
    login: 'Войти',
    signup: 'Регистрация',
    selectSubject: 'Выберите предмет для теста',
    chooseSubject: 'Выберите предмет',
    selectLevel: 'Выберите уровень',
    chooseLevel: 'Выберите уровень',
    questionCount: 'Количество вопросов',
    selectQuestionCount: 'Выберите количество вопросов',
    startTest: 'Начать тест',
    backToSelection: 'Назад к выбору',
    loadingSubjects: 'Загрузка предметов...',
    loadingLevels: 'Загрузка уровней...',
    questions: 'вопросов',
  },
  ENG: {
    home: 'Home',
    points: 'Points',
    about: 'About Us',
    contact: 'Contact Us',
    dashboard: 'Dashboard',
    logout: 'Log Out',
    login: 'Log In',
    signup: 'Sign Up',
    selectSubject: 'Select Subject for Tests',
    chooseSubject: 'Choose a subject',
    selectLevel: 'Select Level',
    chooseLevel: 'Choose a level',
    questionCount: 'Number of Questions',
    selectQuestionCount: 'Select number of questions',
    startTest: 'Start Test',
    backToSelection: 'Back to Selection',
    loadingSubjects: 'Loading subjects...',
    loadingLevels: 'Loading levels...',
    questions: 'questions',
  }
};

export const useI18n = () => {
  const t = (key) => {
    return translations[currentLocale.value]?.[key] || translations['ENG']?.[key] || key;
  };

  const setLocale = (locale) => {
    if (translations[locale]) {
      currentLocale.value = locale;
      localStorage.setItem('locale', locale);
    }
  };

  return {
    locale: currentLocale,
    t,
    setLocale,
    locales: ['UZB', 'RUS', 'ENG']
  };
};
