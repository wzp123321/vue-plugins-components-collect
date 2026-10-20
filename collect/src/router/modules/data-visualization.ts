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
      name: '中国地图大屏',
    },
    component: () => import('../../pages/echarts/chart-map/chart-map.vue'),
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
  {
    path: '/vchart',
    meta: {
      name: 'VChart 图表',
    },
    component: () => import('../../pages/vchart/vchart.vue'),
  },
  {
    path: '/canvas-advance',
    meta: {
      name: 'Canvas 绘图进阶',
    },
    component: () => import('../../pages/canvas-advance/canvas-advance.vue'),
  },
];

export default dataVisRoutes;
