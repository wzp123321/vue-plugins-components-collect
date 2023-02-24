import { RouteRecordRaw } from 'vue-router';

const cssComponents: RouteRecordRaw[] = [
  {
    path: '/css-flex-dice',
    meta: {
      name: 'Flex布局-骰子',
    },
    component: () => import('../../pages/css/css-flex/cf-dice.vue'),
  },
  {
    path: '/css-whitespace-wordbreak-wordwrap',
    meta: {
      name: 'CSS-换行处理',
    },
    component: () => import('../../pages/css/css-whitespace-wordbreak-wordwrap/css-whitespace-wordbreak-wordwrap.vue'),
  },
  {
    path: '/css-backdrop',
    meta: {
      name: 'CSS-毛玻璃',
    },
    component: () => import('../../pages/css/css-filter/css-filter.vue'),
  },
];

export default cssComponents;
