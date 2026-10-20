import { RouteRecordRaw } from 'vue-router';

/**
 * 工具函数示例路由
 *
 * 2026-10-20 菜单合并：5 个工具函数示例聚合为 utils-lab 标签合集页，
 * 旧路径保留为 redirect 兼容历史链接。
 */
const utilsAdvanceRoutes: RouteRecordRaw[] = [
  {
    path: '/utils-lab',
    meta: {
      name: '工具函数合集',
    },
    component: () => import('../../pages/utils-advance/utils-lab.vue'),
  },
  {
    path: '/utils-advance',
    meta: { name: '工具函数进阶(已合并)' },
    redirect: { path: '/utils-lab' },
  },
  {
    path: '/utils-copy-clone',
    meta: { name: '深拷贝与浅拷贝(已合并)' },
    redirect: { path: '/utils-lab', query: { tab: 'copy-clone' } },
  },
  {
    path: '/utils-debounce-throttle',
    meta: { name: '防抖节流原理(已合并)' },
    redirect: { path: '/utils-lab', query: { tab: 'debounce-throttle' } },
  },
  {
    path: '/utils-event-bus',
    meta: { name: '事件总线mitt(已合并)' },
    redirect: { path: '/utils-lab', query: { tab: 'event-bus' } },
  },
  {
    path: '/utils-clipboard',
    meta: { name: '剪贴板操作(已合并)' },
    redirect: { path: '/utils-lab', query: { tab: 'clipboard' } },
  },
  {
    path: '/utils-indexeddb',
    meta: { name: 'IndexedDB封装(已合并)' },
    redirect: { path: '/utils-lab', query: { tab: 'indexeddb' } },
  },
];

export default utilsAdvanceRoutes;
