import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/container/default',
  },
  {
    path: '/container/:target',
    name: 'CloudContainer',
    component: () => import('../pages/cloud-container/cloud-container.vue'),
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
