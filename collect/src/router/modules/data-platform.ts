import { RouteRecordRaw } from 'vue-router';

const dataPlatformRoutes: RouteRecordRaw[] = [
  {
    path: '/data-platform-metric-catalog',
    meta: {
      name: '指标口径管理',
    },
    component: () => import('../../pages/data-platform/metric-catalog/metric-catalog.vue'),
  },
];

export default dataPlatformRoutes;
