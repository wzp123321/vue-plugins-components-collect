import { RouteRecordRaw } from 'vue-router';

const components: RouteRecordRaw[] = [
  {
    path: '/babylon-base',
    meta: {
      name: 'babylon基础',
    },
    component: () => import('../../pages/babylon/babylon-base/babylon-base.vue'),
  },
  {
    path: '/babylon-mesh',
    meta: {
      name: 'babylon形状',
    },
    component: () => import('../../pages/babylon/babylon-mesh/babylon-mesh.vue'),
  },
  {
    path: '/babylon-params',
    meta: {
      name: 'babylon参数化',
    },
    component: () => import('../../pages/babylon/babylon-params/babylon-params.vue'),
  },
  {
    path: '/babylon-texture',
    meta: {
      name: 'babylon材质',
    },
    component: () => import('../../pages/babylon/babylon-texture/babylon-texture.vue'),
  },
];

export default components;
