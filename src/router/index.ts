import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import pluginRoutes from './modules/plugins';
import componentRoutes from './modules/component';
import animationRoutes from './modules/animation';

const routes: RouteRecordRaw[] = [...componentRoutes, ...pluginRoutes, ...animationRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = (to.meta?.name as string) ?? '收集系统';

  next();
});

export default router;
