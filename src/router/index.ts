import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import pluginRoutes from './modules/plugins';
import componentRoutes from './modules/components';
import echartRoutes from './modules/echarts';
import animationRoutes from './modules/animation';
import threejsRoutes from './modules/threejs';

const routes: RouteRecordRaw[] = [
  {
    path: '/demo',
    component: () => import('../demo/demo.vue'),
  },
  {
    path: '/grid',
    component: () => import('../pages/grid/grid.vue'),
  },
  {
    path: '/canvas',
    component: () => import('../pages/canvas/canvas.vue'),
  },
  {
    path: '/g6',
    component: () => import('../pages/antv-g6/antv-g6.vue'),
  },
  ...componentRoutes,
  ...pluginRoutes,
  ...animationRoutes,
  ...echartRoutes,
  ...threejsRoutes,
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
