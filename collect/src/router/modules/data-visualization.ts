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
      name: '地图可视化大屏',
    },
    component: () => import('../../pages/echarts/chart-map/chart-dashboard.vue'),
  },
  {
    // 省份地图已合并进「地图可视化大屏」（全国→省份下钻），保留历史链接
    path: '/echarts-province',
    redirect: '/echarts-map',
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
    path: '/vtable',
    meta: {
      name: 'VTable-BI数据录入',
    },
    component: () => import('../../pages/vtable/vtable.vue'),
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
