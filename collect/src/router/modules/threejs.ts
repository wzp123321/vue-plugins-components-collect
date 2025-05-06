import { RouteRecordRaw } from 'vue-router';

const pluginRoutes: RouteRecordRaw[] = [
  {
    path: '/threejs-basic',
    meta: {
      name: '基础3D图形',
    },
    component: () => import('../../pages/threejs/threejs-basic/threejs-basic.vue'),
  },
  {
    path: '/threejs-scene',
    meta: {
      name: '场景与物体',
    },
    component: () => import('../../pages/threejs/threejs-scene/threejs-scene.vue'),
  },
  {
    path: '/threejs-sun',
    meta: {
      name: '太阳地球',
    },
    component: () => import('../../pages/threejs/threejs-sun/threejs-sun.vue'),
  },
];

export default pluginRoutes;
