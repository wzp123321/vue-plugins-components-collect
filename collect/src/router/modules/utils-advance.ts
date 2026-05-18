import { RouteRecordRaw } from 'vue-router';

const utilsAdvanceRoutes: RouteRecordRaw[] = [
  {
    path: '/utils-advance',
    meta: {
      name: '工具函数进阶',
    },
    component: () => import('../../pages/utils-advance/index.vue'),
  },
  {
    path: '/utils-copy-clone',
    meta: {
      name: '深拷贝与浅拷贝',
    },
    component: () => import('../../pages/utils-advance/copy-clone/copy-clone.vue'),
  },
  {
    path: '/utils-debounce-throttle',
    meta: {
      name: '防抖节流原理',
    },
    component: () => import('../../pages/utils-advance/debounce-throttle/debounce-throttle.vue'),
  },
  {
    path: '/utils-event-bus',
    meta: {
      name: '事件总线mitt',
    },
    component: () => import('../../pages/utils-advance/event-bus/event-bus.vue'),
  },
  {
    path: '/utils-clipboard',
    meta: {
      name: '剪贴板操作',
    },
    component: () => import('../../pages/utils-advance/clipboard/clipboard.vue'),
  },
  {
    path: '/utils-indexeddb',
    meta: {
      name: 'IndexedDB封装',
    },
    component: () => import('../../pages/utils-advance/indexeddb/indexeddb.vue'),
  },
];

export default utilsAdvanceRoutes;
