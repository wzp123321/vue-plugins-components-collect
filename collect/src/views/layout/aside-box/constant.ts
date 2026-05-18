/*
 * @Author: wanzp
 * @Date: 2022-09-16 19:43:49
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-22 22:46:45
 * @Description:
 */
import pluginRoutes from '../../../router/modules/plugins';
import componentRoutes from '../../../router/modules/components';
import dataVisRoutes from '../../../router/modules/data-visualization';
import animationRoutes from '../../../router/modules/animation';
import cssRoutes from '../../../router/modules/css';
import d3EngineRoutes from '../../../router/modules/3d-engine';
import directiveRoutes from '../../../router/modules/directive';
import networkRoutes from '../../../router/modules/network';
import formEnhanceRoutes from '../../../router/modules/form-enhance';
import storeAdvanceRoutes from '../../../router/modules/store-advance';
import performanceRoutes from '../../../router/modules/performance';
import vue3AdvancedRoutes from '../../../router/modules/vue3-advanced';
import utilsAdvanceRoutes from '../../../router/modules/utils-advance';

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
    path: 'network',
    meta: { name: '网络通信' },
    icons: 'icon-web',
    hasIcon: true,
    children: networkRoutes,
  },
  {
    path: 'form-enhance',
    meta: { name: '表单增强' },
    icons: 'icon-shezhi',
    hasIcon: true,
    children: formEnhanceRoutes,
  },
  {
    path: 'store-advance',
    meta: { name: '状态管理进阶' },
    icons: 'icon-moxingshu',
    hasIcon: true,
    children: storeAdvanceRoutes,
  },
  {
    path: 'performance',
    meta: { name: '性能优化' },
    icons: 'icon-huanjingjiance',
    hasIcon: true,
    children: performanceRoutes,
  },
  {
    path: 'vue3-advanced',
    meta: { name: 'Vue3进阶' },
    icons: 'icon-guanlianguize',
    hasIcon: true,
    children: vue3AdvancedRoutes,
  },
  {
    path: 'utils-advance',
    meta: { name: '工具函数进阶' },
    icons: 'icon-caidan',
    hasIcon: true,
    children: utilsAdvanceRoutes,
  },
  {
    path: 'data-visualization',
    meta: { name: '数据可视化' },
    icons: 'icon-huanjingjiance',
    hasIcon: true,
    children: dataVisRoutes,
  },

  {
    path: 'plugins',
    meta: { name: '插件管理' },
    icons: 'icon-shezhi',
    hasIcon: true,
    children: pluginRoutes,
  },
  {
    path: '3d-engine',
    icons: 'icon-web',
    hasIcon: true,
    meta: { name: '3D 引擎' },
    children: d3EngineRoutes,
  },
  {
    path: 'css',
    icons: 'icon-xitongguanlihoutai',
    hasIcon: true,
    meta: { name: 'CSS' },
    children: cssRoutes,
  },
  {
    path: 'demo',
    icons: 'icon-caidan',
    hasIcon: true,
    meta: { name: 'Demo' },
    children: [],
  },
];
