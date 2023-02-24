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
    path: '/css-zindex',
    meta: {
      name: 'CSS-zIndex',
    },
    component: () => import('../../pages/css/css-zindex/css-zindex.vue'),
  },
  {
    path: '/css-pseudo-element',
    meta: {
      name: 'CSS-伪元素伪类',
    },
    component: () => import('../../pages/css/css-pseudo-element/css-pseudo-element.vue'),
  },
];

export default cssComponents;
