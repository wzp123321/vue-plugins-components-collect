import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/main/main.vue'),
  },
  {
    path: '/:firstPage',
    component: () => import('@/pages/main/main.vue'),
  },
  {
    path: '/:firstPage/:secondPage',
    component: () => import('@/pages/main/main.vue'),
  },
  {
    path: '/:firstPage/:secondPage/:thirdPage',
    component: () => import('@/pages/main/main.vue'),
  },
  {
    path: '/forbidden',
    component: () => import('@/pages/not-permission/not-permission.vue'),
  },
  { path: '/:pathMatch(.*)*', name: 'Other', component: () => import('@/pages/not-found/not-found.vue') },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
