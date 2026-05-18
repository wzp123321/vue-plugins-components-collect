import { RouteRecordRaw } from 'vue-router';

const threejsRoutes: RouteRecordRaw[] = [
  {
    path: '/threejs-basic',
    meta: {
      name: 'Three.js 基础图形',
    },
    component: () => import('../../pages/threejs/threejs-basic/threejs-basic.vue'),
  },
  {
    path: '/threejs-scene',
    meta: {
      name: 'Three.js 场景与物体',
    },
    component: () => import('../../pages/threejs/threejs-scene/threejs-scene.vue'),
  },
  {
    path: '/threejs-sun',
    meta: {
      name: 'Three.js 太阳地球',
    },
    component: () => import('../../pages/threejs/threejs-sun/threejs-sun.vue'),
  },
  {
    path: '/babylon-base',
    meta: {
      name: 'Babylon 基础',
    },
    component: () => import('../../pages/babylon/babylon-base/babylon-base.vue'),
  },
  {
    path: '/babylon-mesh',
    meta: {
      name: 'Babylon 形状',
    },
    component: () => import('../../pages/babylon/babylon-mesh/babylon-mesh.vue'),
  },
  {
    path: '/babylon-params',
    meta: {
      name: 'Babylon 参数化',
    },
    component: () => import('../../pages/babylon/babylon-params/babylon-params.vue'),
  },
  {
    path: '/babylon-texture',
    meta: {
      name: 'Babylon 材质',
    },
    component: () => import('../../pages/babylon/babylon-texture/babylon-texture.vue'),
  },
  {
    path: '/threejs-galaxy',
    meta: {
      name: 'Threejs 粒子银河系',
    },
    component: () => import('../../pages/threejs/threejs-galaxy/threejs-galaxy.vue'),
  },
  {
    path: '/threejs-raycaster',
    meta: {
      name: 'Threejs 交互拾取',
    },
    component: () => import('../../pages/threejs/threejs-raycaster/threejs-raycaster.vue'),
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
];

export default threejsRoutes;