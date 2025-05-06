import { RouteRecordRaw } from 'vue-router';

const pluginRoutes: RouteRecordRaw[] = [
  {
    path: '/animations',
    meta: {
      name: '动画大全',
    },
    component: () => import('../../pages/animations/animations.vue'),
  },
];

export default pluginRoutes;
