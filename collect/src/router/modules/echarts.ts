import { RouteRecordRaw } from 'vue-router';

const components: RouteRecordRaw[] = [
  {
    path: '/echarts',
    meta: {
      name: 'eChart集合',
    },
    component: () => import('../../pages/echarts/index.vue'),
  },
  {
    path: '/echarts-map',
    meta: {
      name: '大屏-地球',
    },
    component: () => import('../../pages/echarts/chart-map/chart-map.vue'),
  },
  {
    path: '/drill-map',
    meta: {
      name: '下钻-地球',
    },
    component: () => import('../../pages/echarts/drill-map/drill-map.vue'),
  },
  {
    path: '/echarts-province',
    meta: {
      name: '省份',
    },
    component: () => import('../../pages/echarts/chart-province/chart-province.vue'),
  },
];

export default components;
