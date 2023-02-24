import pluginRoutes from '../../../router/modules/plugins';
import componentRoutes from '../../../router/modules/components';
import echartRoutes from '../../../router/modules/echarts';
import animationRoutes from '../../../router/modules/animation';
import threejsRoutes from '../../../router/modules/threejs';
import cssRoutes from '../../../router/modules/css';

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

  // Echart管理
  {
    path: 'echart',
    meta: { name: 'Echart管理' },
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
    children: cssRoutes
  },
   // css
   {
    path: '/demo',
    icons: 'icon-library',
    hasIcon: true,
    meta: { name: 'Demo' },
    children: []
  },
];
