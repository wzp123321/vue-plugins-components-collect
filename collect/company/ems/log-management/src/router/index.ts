import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
const history = createWebHistory();
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/logManagement',
  },
  {
    path: '/logManagement',
    name: 'logManagement',
    component: () => import('../views/log-management/log-management.vue'),
  },
];
const router = createRouter({
  history,
  routes,
});
export default router;
