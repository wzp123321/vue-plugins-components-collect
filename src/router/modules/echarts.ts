import { RouteRecordRaw } from 'vue-router';

const components: RouteRecordRaw[] = [
  {
    path: '/echarts-map',
    meta: {
      name: '地球',
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
    path: '/echarts-line',
    meta: {
      name: '折线图',
    },
    component: () => import('../../pages/echarts/line-charts/line-charts.vue'),
  },
  {
    path: '/echarts-water-ball',
    meta: {
      name: '水球',
    },
    component: () => import('../../pages/echarts/water-ball-chart/water-ball-chart.vue'),
  },

  {
    path: '/echarts-bar',
    meta: {
      name: '柱状图',
    },
    component: () => import('../../pages/echarts/bar-charts/bar-charts.vue'),
  },
  {
    path: '/echarts-charts-graphic',
    meta: {
      name: '自定义',
    },
    component: () => import('../../pages/echarts/echarts-graphic/echarts-graphic.vue'),
  },
];

export default components;
