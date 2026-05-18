/*
 * @Author: wanzp
 * @Date: 2023-02-10 22:13:43
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2025-04-07 15:32:26
 * @Description:
 */
import { RouteRecordRaw } from 'vue-router';

const cssComponents: RouteRecordRaw[] = [
  {
    path: '/css-home',
    meta: {
      name: 'CSS',
    },
    component: () => import('../../pages/css/index.vue'),
  },
  {
    path: '/css-grid',
    meta: {
      name: 'Grid布局',
    },
    component: () => import('../../pages/css/css-grid/css-grid.vue'),
  },
  {
    path: '/css-flex',
    meta: {
      name: 'Flex布局',
    },
    component: () => import('../../pages/css/css-flex/css-flex.vue'),
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
  {
    path: '/css-backdrop',
    meta: {
      name: 'CSS-毛玻璃',
    },
    component: () => import('../../pages/css/css-filter/css-filter.vue'),
  },
  {
    path: '/css-semantization',
    meta: {
      name: '语义化标签',
    },
    component: () => import('../../pages/css/semantization/semantization.vue'),
  },
  {
    path: '/css-keyframe-animation',
    meta: {
      name: 'CSS-关键帧动画',
    },
    component: () => import('../../pages/css/css-keyframe-animation/css-keyframe-animation.vue'),
  },
  {
    path: '/css-responsive',
    meta: {
      name: 'CSS-响应式布局',
    },
    component: () => import('../../pages/css/css-responsive/css-responsive.vue'),
  },
  {
    path: '/css-var-theme',
    meta: {
      name: 'CSS-变量主题',
    },
    component: () => import('../../pages/css/css-var-theme/css-var-theme.vue'),
  },
];

export default cssComponents;
