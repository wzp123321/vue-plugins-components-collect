import { RouteRecordRaw } from 'vue-router'

const pluginRoutes: RouteRecordRaw[] = [
  {
    path: '/plugins-video-broadcast',
    meta: {
      name: '语音播报',
    },
    component: () =>
      import('../../pages/plugins/video-broadcast/video-broacast.vue'),
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
    component: () =>
      import('../../pages/plugins/autoheight-textarea/autoheight-textarea.vue'),
  },
  {
    path: '/vue3SlideVerify',
    meta: {
      name: '滑动验证',
    },
    component: () =>
      import('../../pages/plugins/vue3-slide-verify/vue3-slide-verify.vue'),
  },
]

export default pluginRoutes
