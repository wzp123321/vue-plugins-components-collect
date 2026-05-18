import { RouteRecordRaw } from 'vue-router';

const performanceRoutes: RouteRecordRaw[] = [
  {
    path: '/perf-keep-alive',
    meta: {
      name: 'KeepAlive缓存',
    },
    component: () => import('../../pages/performance/keep-alive/keep-alive.vue'),
  },
  {
    path: '/perf-async-component',
    meta: {
      name: '异步组件懒加载',
    },
    component: () => import('../../pages/performance/async-component/async-component.vue'),
  },
];

export default performanceRoutes;
