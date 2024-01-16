import { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/energyRate',
    name: 'energyRate',
    meta: {
      title: '能源费率',
    },
    component: () => import('../pages/energy-rate/energy-rate.vue'),
  },
  {
    path: '/costAnalysis',
    name: 'costAnalysis',
    meta: {
      title: '成本管理',
    },
    component: () => import('../pages/cost-analysis/cost-analysis.vue'),
  },
];
