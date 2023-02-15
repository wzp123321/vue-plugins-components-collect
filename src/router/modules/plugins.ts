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
  {
    path: '/plugins-textarea',
    meta: {
      name: '文本框自适应',
    },
    component: () => import('../../pages/plugins/autoheight-textarea/autoheight-textarea.vue'),
  },
  {
    path: '/vue3SlideVerify',
    meta: {
      name: '滑动验证',
    },
    component: () => import('../../pages/plugins/vue3-slide-verify/vue3-slide-verify.vue'),
  },
  {
    path: '/plugins-vue-virtual-scroller',
    meta: {
      name: 'vue-virtual-scroller',
    },
    component: () => import('../../pages/plugins/vue-virtual-scroller/vue-virtual-scroller.vue'),
  },
  {
    path: '/plugins-vueuse',
    meta: {
      name: 'vueuse',
    },
    component: () => import('../../pages/plugins/vueuse/vueuse.vue'),
  },
  {
    path: '/plugins-jspreadsheet',
    meta: {
      name: 'jspreadsheet',
    },
    component: () => import('../../pages/plugins/jspreadsheet-ce-vue/jspreadsheet-ce-vue.vue'),
  },
];

export default pluginRoutes;
