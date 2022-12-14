import pluginRoutes from '../../../router/modules/plugins';
import componentRoutes from '../../../router/modules/components';
import echartRoutes from '../../../router/modules/echarts';
import animationRoutes from '../../../router/modules/animation';

export const menuList = [
  // 动画管理
  {
    path: 'animation',
    meta: { name: '动画管理' },
    children: animationRoutes,
  },

  // 组件管理
  {
    path: 'component',
    meta: { name: '组件管理' },
    children: componentRoutes,
  },

  // Echart管理
  {
    path: 'echart',
    meta: { name: 'Echart管理' },
    children: echartRoutes,
  },

  // 插件管理
  {
    path: 'plugins',
    meta: { name: '插件管理' },
    children: pluginRoutes,
  },
];
