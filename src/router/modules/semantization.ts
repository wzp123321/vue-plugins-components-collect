/*
 * @Author: wanzp
 * @Date: 2023-02-10 22:13:43
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-22 22:44:58
 * @Description:
 */
import { RouteRecordRaw } from 'vue-router';

const semantizationRoutes: RouteRecordRaw[] = [
  {
    path: '/semantization',
    meta: {
      name: '语义化标签',
    },
    component: () => import('../../pages/semantization/semantization.vue'),
  },
];

export default semantizationRoutes;
