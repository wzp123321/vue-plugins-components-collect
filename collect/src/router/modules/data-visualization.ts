import { RouteRecordRaw } from 'vue-router';

const dataVisRoutes: RouteRecordRaw[] = [
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
  {
    path: '/data-vis-g6',
    meta: {
      name: 'G6 拓扑图',
    },
    component: () => import('../../pages/plugins/plugins-antv-g6/plugins-antv-g6.vue'),
  },
];

export default dataVisRoutes;
