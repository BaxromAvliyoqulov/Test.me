// src/router/guards/authGuard.js
import { authService, profileService } from '@/services/supabaseService';

export const authGuard = async (to, from, next) => {
  try {
    const session = await authService.getSession();
    const user = session?.user || null;

    const publicPages = ['/login', '/signup', '/about', '/contactUs', '/'];
    const authRequired = !publicPages.includes(to.path);

    // 1. Agar tizimga kirmagan bo'lsa va sahifa himoyalangan bo'lsa
    if (authRequired && !user) {
      next('/login');
      return;
    }

    // 2. Agar kirgan bo'lsa va login/signup sahifasiga o'tmoqchi bo'lsa
    const loginSignupPages = ['/login', '/signup'];
    if (user && loginSignupPages.includes(to.path)) {
      next('/dashboard');
      return;
    }

    // 3. Admin huquqlari tekshiruvi (RBAC guard)
    if (to.meta.requiresAdmin) {
      if (!user) {
        next('/login');
        return;
      }

      // Check admin status in Supabase profiles (DB RBAC, no hardcoded emails)
      const profile = await profileService.getProfile(user.id);
      const isAdmin = Boolean(profile?.is_admin) || ['super_admin', 'admin', 'content_admin'].includes(profile?.admin_role);
      
      if (!isAdmin) {
        console.warn('⚠️ Admin ruxsati yo\'q. Kirish taqiqlandi.');
        next('/');
        return;
      }
    }

    next();
  } catch (error) {
    console.error('AuthGuard xatolik:', error);
    // Fail-Secure: Agar himoyalangan sahifa bo'lsa, xatolik yuz berganda ruxsatsiz o'tkazilmaydi
    const publicPages = ['/login', '/signup', '/about', '/contactUs', '/'];
    if (!publicPages.includes(to.path)) {
      next('/login');
    } else {
      next();
    }
  }
};
