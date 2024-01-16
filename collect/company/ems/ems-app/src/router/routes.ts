import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/index',
    name: 'Index',
    component: () => import('../pages/index/index.vue'),
  },
  {
    path: '/log',
    name: 'Log',
    component: () => import('../pages/log/log.vue'),
  },
];
