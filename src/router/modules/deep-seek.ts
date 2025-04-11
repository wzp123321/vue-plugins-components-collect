/*
 * @Author: wanzp
 * @Date: 2023-02-10 22:13:43
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-22 22:44:58
 * @Description:
 */
import { RouteRecordRaw } from 'vue-router';

const deepSeekRoutes: RouteRecordRaw[] = [
  {
    path: '/deep-seek',
    meta: {
      name: 'DeepSeek实践',
    },
    component: () => import('../../pages/deep-seek/deep-seek.vue'),
  },
];

export default deepSeekRoutes;
