import { RouteRecordRaw } from 'vue-router';

const energyAnalysisRoutes: RouteRecordRaw[] = [
  /** 能耗分析 start */
  {
    path: '/energyAnalysis',
    name: 'energyAnalysis',
    component: () =>
      import(
        /* webpackChunkName: "energyAnalysis" */
        '@/views/pages/energy-analysis/energy-analysis.vue'
      ),
    meta: {
      name: '能耗分析',
      keepAlive: true,
    },
  },
  /** 能耗分析 end */

  /** 能耗对比start */
  {
    path: '/energyContrast',
    name: 'energyContrast',
    meta: {
      name: '能耗对比',
      keepAlive: true,
    },
    component: () =>
      import(/* webpackChunkName: "energyContrast" */ '@/views/pages/energy-contrast/energy-contrast.vue'),
  },
  /** 能耗对比end */

  /** 能流平衡start */
  {
    path: '/energyBalance',
    name: 'energyBalance',
    meta: {
      name: '能流平衡',
      keepAlive: true,
    },
    component: () => import(/* webpackChunkName: "energyBalance" */ '@/views/pages/energy-balance/energy-balance.vue'),
  },
  /** 能流平衡end */

  /** 能耗排名start */
  {
    path: '/energyRanking',
    name: 'energyRanking',
    meta: {
      name: '能耗排名',
      keepAlive: true,
    },
    component: () => import(/* webpackChunkName: "energy-ranking" */ '@/views/pages/energy-ranking/energy-ranking.vue'),
  },
  /** 能耗排名end */

  /** 关联分析start */
  {
    path: '/relationAnalysis',
    name: 'relationAnalysis',
    meta: {
      name: '关联分析',
      keepAlive: true,
    },
    component: () =>
      import(/* webpackChunkName: "relation-analysis" */ '@/views/pages/relation-analysis/relation-analysis.vue'),
  },
  /** 关联分析end */

  /** 机场线对标分析start */
  {
    path: '/airportBenchmarkingAnalysis',
    name: 'AirportBenchmarkingAnalysis',
    meta: {
      name: '对标分析',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "airport-benchmarkingAnalysis" */ '@/views/pages/airport-benchmarking-analysis/airport-benchmarking-analysis.vue'
      ),
  },
  /** 对标分析end */
  /** 对标分析start */
  {
    path: '/benchmarkingAnalysis',
    name: 'BenchmarkingAnalysis',
    meta: {
      name: '对标分析',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "benchmarking-analysis" */ '@/views/pages/benchmarking-analysis/benchmarking-analysis.vue'
      ),
  },
  {
    path: '/benchmarkingManage',
    name: 'BenchmarkingManage',
    meta: {
      name: '对标分析',
      keepAlive: true,
    },
    component: () =>
      import(/* webpackChunkName: "benchmarking-manage" */ '@/views/pages/benchmarking-manage/benchmarking-manage.vue'),
  },
  /** 对标分析end */

  /** 对标库 start */
  {
    path: '/benchmarkingLibrary',
    name: 'benchmarkingLibrary',
    meta: {
      breadcrumbName: '对标库',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "benchmarking-library" */ '@/views/pages/benchmarking-library/benchmarking-library.vue'
      ),
  },
  /** 对标库 end */
];

export default energyAnalysisRoutes;
