import { RouteRecordRaw } from 'vue-router';

const cssComponents: RouteRecordRaw[] = [
  {
    path: '/css-flex-dice',
    meta: {
      name: 'Flex布局-骰子',
    },
    component: () => import('../../pages/css/css-flex/cf-dice.vue'),
  },
];

export default cssComponents;
