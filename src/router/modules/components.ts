import { RouteRecordRaw } from 'vue-router';

const components: RouteRecordRaw[] = [
  {
    path: '/component-inputFilter',
    meta: {
      name: '输入框过滤',
    },
    component: () => import('../../pages/components/input-filter/input-filter.vue'),
  },
  {
    path: '/component-virtualized-table-el',
    meta: {
      name: '大数据表格',
    },
    component: () => import('../../pages/components/virtualized-table-el/virtualized-table-el.vue'),
  },
  {
    path: '/component-vue3-virtual-list',
    meta: {
      name: '虚拟表格',
    },
    component: () => import('../../pages/components/vue3-virtual-list-container/vue3-virtual-list-container.vue'),
  },
  {
    path: '/component-add-select',
    meta: {
      name: '可新增下拉框',
    },
    component: () => import('../../pages/components/add-select/add-select.vue'),
  },
];

export default components;
