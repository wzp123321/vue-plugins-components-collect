import { RouteRecordRaw } from 'vue-router';

/**
 * 3D 引擎示例路由
 *
 * 2026-10-20 菜单合并：Three.js / Babylon.js 的基础示例聚合为两个标签合集页，
 * 旧路径保留为 redirect 兼容历史链接（银河系、拾取、火焰、PBR、中国地图等大件保持独立）。
 */
const threejsRoutes: RouteRecordRaw[] = [
  {
    path: '/threejs-lab',
    meta: {
      name: 'Three.js 合集',
    },
    component: () => import('../../pages/threejs/threejs-lab/threejs-lab.vue'),
  },
  {
    path: '/threejs-basic',
    meta: { name: 'Three.js 基础图形(已合并)' },
    redirect: { path: '/threejs-lab', query: { tab: 'basic' } },
  },
  {
    path: '/threejs-scene',
    meta: { name: 'Three.js 场景与物体(已合并)' },
    redirect: { path: '/threejs-lab', query: { tab: 'scene' } },
  },
  {
    path: '/threejs-sun',
    meta: { name: 'Three.js 太阳地球(已合并)' },
    redirect: { path: '/threejs-lab', query: { tab: 'sun' } },
  },
  {
    path: '/threejs-galaxy',
    meta: { name: 'Threejs 粒子银河系(已合并)' },
    redirect: { path: '/threejs-lab', query: { tab: 'galaxy' } },
  },
  {
    path: '/threejs-raycaster',
    meta: { name: 'Threejs 交互拾取(已合并)' },
    redirect: { path: '/threejs-lab', query: { tab: 'raycaster' } },
  },
  {
    path: '/babylon-lab',
    meta: {
      name: 'Babylon 基础合集',
    },
    component: () => import('../../pages/babylon/babylon-lab/babylon-lab.vue'),
  },
  {
    path: '/babylon-base',
    meta: { name: 'Babylon 基础(已合并)' },
    redirect: { path: '/babylon-lab', query: { tab: 'base' } },
  },
  {
    path: '/babylon-mesh',
    meta: { name: 'Babylon 形状(已合并)' },
    redirect: { path: '/babylon-lab', query: { tab: 'mesh' } },
  },
  {
    path: '/babylon-params',
    meta: { name: 'Babylon 参数化(已合并)' },
    redirect: { path: '/babylon-lab', query: { tab: 'params' } },
  },
  {
    path: '/babylon-texture',
    meta: { name: 'Babylon 材质(已合并)' },
    redirect: { path: '/babylon-lab', query: { tab: 'texture' } },
  },
  {
    path: '/babylon-flame',
    meta: {
      name: 'Babylon 粒子火焰',
    },
    component: () => import('../../pages/babylon/babylon-flame/babylon-flame.vue'),
  },
  {
    path: '/babylon-pbr',
    meta: {
      name: 'Babylon PBR材质',
    },
    component: () => import('../../pages/babylon/babylon-pbr/babylon-pbr.vue'),
  },
  {
    path: '/threejs-china-3d-map',
    meta: {
      name: 'Threejs 中国3D地图(mega)',
    },
    component: () => import('../../pages/threejs/threejs-china-3d-map/threejs-china-3d-map.vue'),
  },
];

export default threejsRoutes;
