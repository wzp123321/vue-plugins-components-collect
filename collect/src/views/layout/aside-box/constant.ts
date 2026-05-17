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

export const menuList = [
  {
    path: 'animation',
    meta: { name: '动画管理' },
    icons: 'icon-web',
    hasIcon: true,
    children: animationRoutes,
  },
  {
    path: 'component',
    meta: { name: '组件管理' },
    icons: 'icon-moxingshu',
    hasIcon: true,
    children: componentRoutes,
  },
  {
    path: 'directive',
    meta: { name: '指令管理' },
    icons: 'icon-guanlianguize',
    hasIcon: true,
    children: directiveRoutes,
  },
  {
    path: 'echart',
    meta: { name: 'Echarts管理' },
    icons: 'icon-huanjingjiance',
    hasIcon: true,
    children: echartRoutes,
  },

  {
    path: 'plugins',
    meta: { name: '插件管理' },
    icons: 'icon-shezhi',
    hasIcon: true,
    children: pluginRoutes,
  },

  {
    path: '/threejs',
    icons: 'icon-web',
    hasIcon: true,
    meta: { name: 'threejs' },
    children: threejsRoutes,
  },

  {
    path: '/babylon',
    icons: 'icon-web',
    hasIcon: true,
    meta: { name: 'babylon' },
    children: babyRoutes,
  },
  {
    path: '/css',
    icons: 'icon-xitongguanlihoutai',
    hasIcon: true,
    meta: { name: 'CSS' },
    children: cssRoutes,
  },
  {
    path: '/demo',
    icons: 'icon-caidan',
    hasIcon: true,
    meta: { name: 'Demo' },
    children: [],
  },
];
