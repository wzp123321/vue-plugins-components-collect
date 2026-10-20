/*
 * @Author: wanzp
 * @Date: 2023-02-10 22:13:43
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2026-10-20 22:30:00
 * @Description: CSS 示例路由（2026-10-20 菜单合并：布局/效果示例聚合为两个合集页，旧路径 redirect 兼容）
 */
import { RouteRecordRaw } from 'vue-router';

const cssComponents: RouteRecordRaw[] = [
  {
    path: '/css-layout-lab',
    meta: {
      name: 'CSS 布局合集',
    },
    component: () => import('../../pages/css/css-layout-lab.vue'),
  },
  {
    path: '/css-effects-lab',
    meta: {
      name: 'CSS 效果合集',
    },
    component: () => import('../../pages/css/css-effects-lab.vue'),
  },
  {
    path: '/css-home',
    meta: { name: 'CSS 总览(已合并)' },
    redirect: { path: '/css-layout-lab' },
  },
  {
    path: '/css-grid',
    meta: { name: 'Grid布局(已合并)' },
    redirect: { path: '/css-layout-lab', query: { tab: 'grid' } },
  },
  {
    path: '/css-flex',
    meta: { name: 'Flex布局(已合并)' },
    redirect: { path: '/css-layout-lab', query: { tab: 'flex' } },
  },
  {
    path: '/css-responsive',
    meta: { name: 'CSS-响应式布局(已合并)' },
    redirect: { path: '/css-layout-lab', query: { tab: 'responsive' } },
  },
  {
    path: '/css-semantization',
    meta: { name: '语义化标签(已合并)' },
    redirect: { path: '/css-layout-lab', query: { tab: 'semantization' } },
  },
  {
    path: '/css-keyframe-animation',
    meta: { name: 'CSS-关键帧动画(已合并)' },
    redirect: { path: '/css-effects-lab', query: { tab: 'keyframe' } },
  },
  {
    path: '/css-backdrop',
    meta: { name: 'CSS-毛玻璃(已合并)' },
    redirect: { path: '/css-effects-lab', query: { tab: 'backdrop' } },
  },
  {
    path: '/css-var-theme',
    meta: { name: 'CSS-变量主题(已合并)' },
    redirect: { path: '/css-effects-lab', query: { tab: 'var-theme' } },
  },
  {
    path: '/css-zindex',
    meta: { name: 'CSS-zIndex(已合并)' },
    redirect: { path: '/css-effects-lab', query: { tab: 'zindex' } },
  },
  {
    path: '/css-pseudo-element',
    meta: { name: 'CSS-伪元素伪类(已合并)' },
    redirect: { path: '/css-effects-lab', query: { tab: 'pseudo' } },
  },
  {
    path: '/css-whitespace-wordbreak-wordwrap',
    meta: { name: 'CSS-换行处理(已合并)' },
    redirect: { path: '/css-effects-lab', query: { tab: 'whitespace' } },
  },
];

export default cssComponents;
