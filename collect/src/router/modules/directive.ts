/*
 * @Author: wanzp
 * @Date: 2023-02-10 22:13:43
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-22 22:46:05
 * @Description:
 */
import { RouteRecordRaw } from 'vue-router';

const directiveRoutes: RouteRecordRaw[] = [
  {
    path: '/inputFilter',
    meta: {
      name: '输入框过滤',
    },
    component: () => import('../../pages/directives/input-directive/input-directive.vue'),
  },
  {
    path: '/drag',
    meta: {
      name: '拖拽指令',
    },
    component: () => import('../../pages/directives/drag-directive/drag-directive.vue'),
  },
];

export default directiveRoutes;
