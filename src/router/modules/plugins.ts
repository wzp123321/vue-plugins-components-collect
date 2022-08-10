import { RouteRecordRaw } from 'vue-router';

const pluginRoutes: RouteRecordRaw[] = [
  {
    path: '/plugins-video-broadcast',
    meta: {
      name: '语音播报',
    },
    component: () => import('../../pages/plugins/video-broadcast/video-broacast.vue'),
  },
  {
    path: '/plugins-crypto-js',
    meta: {
      name: 'CryptoJS加密解密',
    },
    component: () => import('../../pages/plugins/crypto-js/crypto-js.vue'),
  },
];

export default pluginRoutes;