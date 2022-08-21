import { RouteRecordRaw } from 'vue-router';

const components: RouteRecordRaw[] = [
  {
    path: '/inputFilter',
    meta: {
      name: '输入框过滤',
    },
    component: () => import('../../pages/components/input-filter/input-filter.vue'),
  },
];

export default components;
