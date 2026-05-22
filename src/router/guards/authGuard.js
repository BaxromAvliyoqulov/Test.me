import { auth } from '@/config/firebase';

export const authGuard = async (to, from, next) => {
  // Дождемся инициализации Firebase Auth
  await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });

  const user = auth.currentUser;
  const publicPages = ['/login', '/signup', '/about', '/contactUs'];
  const authRequired = !publicPages.includes(to.path);

  // Если требуется авторизация и пользователь не авторизован
  if (authRequired && !user) {
    next('/login');
    return;
  }

  // Если пользователь авторизован и пытается зайти на страницы логина/регистрации
  const loginSignupPages = ['/login', '/signup'];
  if (user && loginSignupPages.includes(to.path)) {
    next('/');
    return;
  }

  // В остальных случаях разрешаем переход
  next();
};
