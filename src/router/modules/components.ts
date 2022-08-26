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
    path: '/component-virtualized-table',
    meta: {
      name: '大数据表格',
    },
    component: () => import('../../pages/components/virtualized-table/virtualized-table.vue'),
  },
];

export default components;
