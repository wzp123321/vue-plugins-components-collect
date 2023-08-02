import { App } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { createRouterGuards } from './routerGuards';

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    meta: {
      title: '首页',
    },
  },
];

const router = createRouter({
  // process.env.BASE_URL
  history: createWebHistory(''),
  routes,
});

export function setupRouter(app: App) {
  app.use(router);
  // 创建路由守卫
  createRouterGuards(router);
}
export default router;
