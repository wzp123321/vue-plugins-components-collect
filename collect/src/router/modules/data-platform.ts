import { RouteRecordRaw } from 'vue-router';

const dataPlatformRoutes: RouteRecordRaw[] = [
  {
    path: '/data-platform-metric-catalog',
    meta: {
      name: '指标口径管理',
    },
    component: () => import('../../pages/data-platform/metric-catalog/metric-catalog.vue'),
  },
  {
    path: '/data-platform-univer-entry',
    meta: {
      name: 'Univer BI 数据录入',
    },
    component: () => import('../../pages/data-platform/univer-entry/univer-entry.vue'),
  },
  {
    path: '/data-platform-tabulator-entry',
    meta: {
      name: 'Tabulator BI 数据录入',
    },
    component: () => import('../../pages/data-platform/tabulator-entry/tabulator-entry.vue'),
  },
];

export default dataPlatformRoutes;
