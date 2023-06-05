import { RouteRecordRaw } from 'vue-router';

const components: RouteRecordRaw[] = [
  {
    path: '/component-home',
    meta: {
      name: '组件',
    },
    component: () => import('../../pages/components/index.vue'),
  },
  {
    path: '/component-inputFilter',
    meta: {
      name: '输入框过滤',
    },
    component: () => import('../../pages/components/input-filter/input-filter.vue'),
  },
  {
    path: '/component-vue3-virtual-list',
    meta: {
      name: '虚拟表格',
    },
    component: () => import('../../pages/components/vue3-virtual-list-container/vue3-virtual-list-container.vue'),
  },
  {
    path: '/virtual-card-load',
    meta: {
      name: '虚拟卡片加载',
    },
    component: () => import('../../pages/components/virtual-card-load/virtual-card-load.vue'),
  },
  {
    path: '/component-searchbar',
    meta: {
      name: 'searchbar',
    },
    component: () => import('../../pages/components/common-searchbar/common-searchbar.vue'),
  },
];

export default components;
