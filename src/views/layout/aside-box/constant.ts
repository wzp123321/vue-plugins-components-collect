/*
 * @Author: wanzp
 * @Date: 2022-09-16 19:43:49
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-22 22:46:45
 * @Description:
 */
import pluginRoutes from '../../../router/modules/plugins';
import componentRoutes from '../../../router/modules/components';
import echartRoutes from '../../../router/modules/echarts';
import animationRoutes from '../../../router/modules/animation';
import threejsRoutes from '../../../router/modules/threejs';
import cssRoutes from '../../../router/modules/css';
import babyRoutes from '../../../router/modules/babylon';
import directiveRoutes from '../../../router/modules/directive';
import semantizationRoutes from '../../../router/modules/semantization';

export const menuList = [
  // 动画管理
  {
    path: 'animation',
    meta: { name: '动画管理' },
    icons: 'icon-library',
    hasIcon: true,
    children: animationRoutes,
  },
  // 组件管理
  {
    path: 'component',
    meta: { name: '组件管理' },
    icons: 'icon-library',
    hasIcon: true,
    children: componentRoutes,
  },
  // 指令
  {
    path: 'directive',
    meta: { name: '指令管理' },
    icons: 'icon-library',
    hasIcon: true,
    children: directiveRoutes,
  },
  // Echart管理
  {
    path: 'echart',
    meta: { name: 'Echarts管理' },
    icons: 'icon-library',
    hasIcon: true,
    children: echartRoutes,
  },

  // 插件管理
  {
    path: 'plugins',
    meta: { name: '插件管理' },
    icons: 'icon-library',
    hasIcon: true,
    children: pluginRoutes,
  },

  // threejs
  {
    path: '/threejs',
    icons: 'icon-library',
    hasIcon: true,
    meta: { name: 'threejs' },
    children: threejsRoutes,
  },

  // babylon
  {
    path: '/babylon',
    icons: 'icon-library',
    hasIcon: true,
    meta: { name: 'babylon' },
    children: babyRoutes,
  },
  // G6
  {
    path: '/g6',
    icons: 'icon-library',
    hasIcon: true,
    meta: { name: 'G6' },
    children: [],
  },

  // css
  {
    path: '/css',
    icons: 'icon-library',
    hasIcon: true,
    meta: { name: 'CSS' },
    children: cssRoutes,
  },
  // semantization
  {
    path: '/semantization',
    icons: 'icon-library',
    hasIcon: true,
    meta: { name: '语义化标签' },
    children: semantizationRoutes,
  },
  // demo
  {
    path: '/demo',
    icons: 'icon-library',
    hasIcon: true,
    meta: { name: 'Demo' },
    children: [],
  },
];
