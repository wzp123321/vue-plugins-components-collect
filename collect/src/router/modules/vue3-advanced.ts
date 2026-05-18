import { RouteRecordRaw } from 'vue-router';

const vue3AdvancedRoutes: RouteRecordRaw[] = [
  {
    path: '/vue3-advanced',
    meta: {
      name: 'Vue3进阶特性',
    },
    component: () => import('../../pages/vue3-advanced/index.vue'),
  },
  {
    path: '/vue3-define-model',
    meta: {
      name: 'defineModel双向绑定',
    },
    component: () => import('../../pages/vue3-advanced/define-model/define-model.vue'),
  },
  {
    path: '/vue3-teleport',
    meta: {
      name: 'Teleport传送门',
    },
    component: () => import('../../pages/vue3-advanced/teleport/teleport.vue'),
  },
  {
    path: '/vue3-suspense',
    meta: {
      name: 'Suspense异步组件',
    },
    component: () => import('../../pages/vue3-advanced/suspense/suspense.vue'),
  },
  {
    path: '/vue3-provide-inject',
    meta: {
      name: 'provide/inject',
    },
    component: () => import('../../pages/vue3-advanced/provide-inject/provide-inject.vue'),
  },
  {
    path: '/vue3-watch-compare',
    meta: {
      name: 'watch对比演示',
    },
    component: () => import('../../pages/vue3-advanced/watch-compare/watch-compare.vue'),
  },
];

export default vue3AdvancedRoutes;
