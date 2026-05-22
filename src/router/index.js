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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/ai-setup',
      name: 'aiSetup',
      component: AiTestSetup,
    },
    {
      path: '/',
      name: 'home',
      component: home,
    },
    {
      path: '/test',
      name: 'testPage',
      component: testPage,
    },
    {
      path: '/admin',
      name: 'admin',
      component: admin,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: SignUP,
    },
    {
      path: '/about',
      name: 'aboutUs',
      component: about,
    },
    {
      path: '/contactUs',
      name: 'contactUs',
      component: contactUs,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: dashboard,
    },
    {
      path: '/points',
      name: 'points',
      component: points,
    },
    {
      path: '/404',
      name: 'NotFound',
      component: NotFound,
    },
    {
      path: '/editProfile',
      name: 'editProfile',
      component: EditProfile,
    },
    {
      path: '/badges',
      name: 'badges',
      component: Badges,
    },
    {
      path: '/certificates',
      name: 'certificates',
      component: Certificates,
    },
  ],
});

router.beforeEach(authGuard);

export default router;
