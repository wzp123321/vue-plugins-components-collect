import { RouteRecordRaw } from 'vue-router';

const pluginRoutes: RouteRecordRaw[] = [
  {
    path: '/vue3SlideVerify',
    meta: {
      name: '滑动验证',
    },
    component: () => import('../../pages/plugins/vue3-slide-verify/vue3-slide-verify.vue'),
  },
  {
    path: '/plugins-vueuse',
    meta: {
      name: 'vueuse',
    },
    component: () => import('../../pages/plugins/vueuse/vueuse.vue'),
  },
  {
    path: '/plugins-draggable-formula',
    meta: {
      name: '拖拽公式',
    },
    component: () => import('../../pages/plugins/plugins-draggable-formula/plugins-draggable-formula.vue'),
  },
  {
    path: '/plugin-word-pdf-preview',
    meta: {
      name: '文件预览下载',
    },
    component: () => import('../../pages/plugins/plugin-word-pdf-preview/plugin-word-pdf-preview.vue'),
  },
  {
    path: '/pluginsLittle',
    meta: {
      name: '小插件',
    },
    component: () => import('../../pages/plugins/plugins-little/plugins-little.vue'),
  },
];

export default pluginRoutes;
