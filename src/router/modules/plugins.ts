import { RouteRecordRaw } from 'vue-router';

const pluginRoutes: RouteRecordRaw[] = [
  {
    path: '/plugins-simple',
    meta: {
      name: '简易插件',
    },
    component: () => import('../../pages/plugins/plugins-simple/plugins-simple.vue'),
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
    path: '/plugins-g6',
    meta: {
      name: 'G6',
    },
    component: () => import('../../pages/plugins/plugins-antv-g6/plugins-antv-g6.vue'),
  },
  {
    path: '/plugins-canvas',
    meta: {
      name: 'Canvas',
    },
    component: () => import('../../pages/plugins/plugins-canvas/plugins-canvas.vue'),
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
];

export default pluginRoutes;
