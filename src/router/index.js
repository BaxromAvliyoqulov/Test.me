import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards/authGuard';

import home from '@/views/home.vue';
const Login = () => import('@/components/login.vue');
const SignUP = () => import('@/components/SignUp.vue');
const testPage = () => import('@/views/testPage/testPage.vue');
const admin = () => import('@/views/admin/index.vue');
const about = () => import('@/views/about.vue');
const contactUs = () => import('@/views/contactUs.vue');
const dashboard = () => import('@/views/dashboard.vue');
const points = () => import('@/views/Points/points.vue');
const NotFound = () => import('@/views/404.vue');
const EditProfile = () => import('@/views/editProfile/editProfile.vue');
const Badges = () => import('@/views/badges.vue');
const Certificates = () => import('@/views/certificates.vue');
const AiTestSetup = () => import('@/views/testPage/aiTestSetup.vue');
import MentorContainer from '@/views/testPage/MentorContainer.vue';
const AdminSeeder = () => import('@/views/AdminSeeder.vue');
const ShopPage = () => import('@/views/shop/ShopPage.vue');
const FriendsDashboard = () => import('@/views/Friends/FriendsDashboard.vue');
const RankSystemPage = () => import('@/views/Ranks/RankSystemPage.vue');
const PlatformStats = () => import('@/views/PlatformStats.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  },
  routes: [
    {
      path: '/ai-setup',
      name: 'aiSetup',
      component: AiTestSetup,
      meta: { title: 'AI Test Setup | Test.me' }
    },
    {
      path: '/ai-setup/:mentorId',
      name: 'aiMentorSetup',
      component: MentorContainer,
      meta: { title: 'AI Mentor | Test.me' }
    },
    {
      path: '/admin-seeder',
      name: 'adminSeeder',
      component: AdminSeeder,
      meta: { title: 'Admin Seeder | Test.me' }
    },
    {
      path: '/',
      name: 'home',
      component: home,
      meta: { title: 'Bosh Sahifa | Test.me' }
    },
    {
      path: '/test',
      name: 'testPage',
      component: testPage,
      meta: { title: 'Test | Test.me' }
    },
    {
      path: '/admin',
      name: 'admin',
      component: admin,
      meta: { title: 'Admin Panel | Test.me' }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: 'Tizimga kirish | Test.me' }
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: SignUP,
      meta: { title: 'Ro\'yxatdan o\'tish | Test.me' }
    },
    {
      path: '/about',
      name: 'aboutUs',
      component: about,
      meta: { title: 'Biz haqimizda | Test.me' }
    },
    {
      path: '/contactUs',
      name: 'contactUs',
      component: contactUs,
      meta: { title: 'Bog\'lanish | Test.me' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: dashboard,
      meta: { title: 'Asosiy Panel | Test.me' }
    },
    {
      path: '/points',
      name: 'points',
      component: points,
      meta: { title: 'TP Coins | Test.me' }
    },
    {
      path: '/404',
      name: 'NotFound',
      component: NotFound,
      meta: { title: 'Sahifa topilmadi | Test.me' }
    },
    {
      path: '/editProfile',
      name: 'editProfile',
      component: EditProfile,
      meta: { title: 'Profilni tahrirlash | Test.me' }
    },
    {
      path: '/badges',
      name: 'badges',
      component: Badges,
      meta: { title: 'Yutuqlar va Nishonlar | Test.me' }
    },
    {
      path: '/certificates',
      name: 'certificates',
      component: Certificates,
      meta: { title: 'Sertifikatlar | Test.me' }
    },
    {
      path: '/shop',
      name: 'shop',
      component: ShopPage,
      meta: { title: 'Do\'kon | Test.me' }
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsDashboard,
      meta: { title: 'Do\'stlar | Test.me' }
    },
    {
      path: '/ranks',
      name: 'ranks',
      component: RankSystemPage,
      meta: { title: 'Reytinglar | Test.me' }
    },
    {
      path: '/stats',
      name: 'platformStats',
      component: PlatformStats,
      meta: { title: 'Platforma Statistikasi | Test.me' }
    },
  ],
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Test.me';
  authGuard(to, from, next);
});

export default router;
