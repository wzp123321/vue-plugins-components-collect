import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import pluginRoutes from './modules/plugins';
import componentRoutes from './modules/components';
import echartRoutes from './modules/echarts';
import animationRoutes from './modules/animation';
import threejsRoutes from './modules/threejs';
import cssRoutes from './modules/css';
import babyRoutes from './modules/babylon';
import directiveRoutes from './modules/directive';
import semantizationRoutes from './modules/semantization';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/demo',
  },
  {
    path: '/demo',
    component: () => import('../demo/demo.vue'),
  },
  ...componentRoutes,
  ...pluginRoutes,
  ...animationRoutes,
  ...echartRoutes,
  ...threejsRoutes,
  ...cssRoutes,
  ...babyRoutes,
  ...directiveRoutes,
  ...semantizationRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = (to.meta?.name as string) ?? '收集系统';

  next();
});

export default router;
