import { RouteRecordRaw } from 'vue-router';

/**
 * Vue3 核心特性示例路由
 *
 * 2026-10-20 菜单合并：Teleport / Suspense / provide-inject / watch 对比聚合为
 * vue3-core-lab 标签合集页，旧路径保留为 redirect 兼容历史链接。
 */
const vue3AdvancedRoutes: RouteRecordRaw[] = [
  {
    path: '/vue3-core-lab',
    meta: {
      name: 'Vue3 核心特性合集',
    },
    component: () => import('../../pages/vue3-advanced/vue3-core-lab.vue'),
  },
  {
    path: '/vue3-advanced',
    meta: { name: 'Vue3进阶特性(已合并)' },
    redirect: { path: '/vue3-core-lab' },
  },
  {
    path: '/vue3-teleport',
    meta: { name: 'Teleport传送门(已合并)' },
    redirect: { path: '/vue3-core-lab', query: { tab: 'teleport' } },
  },
  {
    path: '/vue3-suspense',
    meta: { name: 'Suspense异步组件(已合并)' },
    redirect: { path: '/vue3-core-lab', query: { tab: 'suspense' } },
  },
  {
    path: '/vue3-provide-inject',
    meta: { name: 'provide/inject(已合并)' },
    redirect: { path: '/vue3-core-lab', query: { tab: 'provide-inject' } },
  },
  {
    path: '/vue3-watch-compare',
    meta: { name: 'watch对比演示(已合并)' },
    redirect: { path: '/vue3-core-lab', query: { tab: 'watch-compare' } },
  },
];

export default vue3AdvancedRoutes;
