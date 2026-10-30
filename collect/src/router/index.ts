import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import pluginRoutes from './modules/plugins';
import componentRoutes from './modules/components';
import dataVisRoutes from './modules/data-visualization';
import animationRoutes from './modules/animation';
import cssRoutes from './modules/css';
import d3EngineRoutes from './modules/3d-engine';
import directiveRoutes from './modules/directive';
import networkRoutes from './modules/network';
import formEnhanceRoutes from './modules/form-enhance';
import storeAdvanceRoutes from './modules/store-advance';
import vue3AdvancedRoutes from './modules/vue3-advanced';
import utilsAdvanceRoutes from './modules/utils-advance';
import dataPlatformRoutes from './modules/data-platform';
import extendedRoutes from './modules/extended-capability';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    meta: {
      name: '总览',
    },
    component: () => import('../pages/home/home.vue'),
  },
  {
    path: '/capability-map',
    meta: {
      name: '能力地图',
    },
    component: () => import('../pages/capability-map/capability-map.vue'),
  },
  {
    path: '/demo',
    meta: {
      name: 'Chrome TTS 语音播报',
    },
    component: () => import('../demo/demo.vue'),
  },
  ...componentRoutes,
  ...pluginRoutes,
  ...animationRoutes,
  ...dataVisRoutes,
  ...cssRoutes,
  ...d3EngineRoutes,
  ...directiveRoutes,
  ...networkRoutes,
  ...formEnhanceRoutes,
  ...storeAdvanceRoutes,
  ...vue3AdvancedRoutes,
  ...utilsAdvanceRoutes,
  ...dataPlatformRoutes,
  ...extendedRoutes,
  { path: '/:pathMatch(.*)*', name: 'Other', redirect: '/home' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  document.title = (to.meta?.name as string) ?? '收集系统';
});

export default router;
