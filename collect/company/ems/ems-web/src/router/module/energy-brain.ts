import { RouteRecordRaw } from 'vue-router';

const energyBrainRoutes: RouteRecordRaw[] = [
  /** 负荷预测start */
  {
    path: '/loadForecasting',
    name: 'loadForecasting',
    meta: {
      name: '负荷预测',
      keepAlive: true,
    },
    component: () =>
      import(/* webpackChunkName: "loadForecasting" */ '@/views/pages/load-forecasting/load-forecasting.vue'),
  },
  /** 负荷预测end */

  /** 峰值分析start */
  {
    path: '/peakology',
    name: 'peakology',
    meta: {
      name: '峰值分析',
      keepAlive: true,
    },
    component: () => import(/* webpackChunkName: "peakology" */ '@/views/pages/peakology/peakology.vue'),
  },
  /** 峰值分析end */

  /** 环境评价 start */
  {
    path: '/environmentEvaluation',
    name: 'environmentEvaluation',
    meta: {
      breadcrumbName: '环境评价',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "environmentEvaluation" */ '@/views/pages/environment-evaluation/environment-evaluation.vue'
      ),
  },
  /** 环境评价 end */
];

export default energyBrainRoutes;
