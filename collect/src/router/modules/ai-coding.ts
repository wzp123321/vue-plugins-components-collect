import { RouteRecordRaw } from 'vue-router';

const aiCodingRoutes: RouteRecordRaw[] = [
  {
    path: '/ai-coding/staff',
    meta: {
      name: '员工管理',
    },
    component: () => import('../../pages/ai-coding/staff-management/staff-management.vue'),
  },
];

export default aiCodingRoutes;
