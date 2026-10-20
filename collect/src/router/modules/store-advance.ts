import { RouteRecordRaw } from 'vue-router';

/**
 * 状态管理与性能示例路由
 *
 * 2026-10-20 菜单合并：Pinia（持久化/Setup Store）与性能（KeepAlive/异步组件）
 * 聚合为 store-perf-lab 标签合集页，旧路径保留为 redirect 兼容历史链接。
 */
const storeRoutes: RouteRecordRaw[] = [
  {
    path: '/store-perf-lab',
    meta: {
      name: '状态与性能合集',
    },
    component: () => import('../../pages/store-advance/store-perf-lab.vue'),
  },
  {
    path: '/store-persist',
    meta: { name: 'Pinia持久化(已合并)' },
    redirect: { path: '/store-perf-lab', query: { tab: 'pinia-persist' } },
  },
  {
    path: '/store-setup',
    meta: { name: 'Setup Store(已合并)' },
    redirect: { path: '/store-perf-lab', query: { tab: 'setup-store' } },
  },
  {
    path: '/perf-keep-alive',
    meta: { name: 'KeepAlive缓存(已合并)' },
    redirect: { path: '/store-perf-lab', query: { tab: 'keep-alive' } },
  },
  {
    path: '/perf-async-component',
    meta: { name: '异步组件懒加载(已合并)' },
    redirect: { path: '/store-perf-lab', query: { tab: 'async-component' } },
  },
];

export default storeRoutes;
