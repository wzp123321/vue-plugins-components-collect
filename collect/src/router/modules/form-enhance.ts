import { RouteRecordRaw } from 'vue-router';

const formEnhanceRoutes: RouteRecordRaw[] = [
  {
    path: '/form-rich-editor',
    meta: {
      name: '富文本编辑器',
    },
    component: () => import('../../pages/form-enhance/rich-editor/rich-editor.vue'),
  },
  {
    path: '/form-image-crop',
    meta: {
      name: '图片裁剪上传',
    },
    component: () => import('../../pages/form-enhance/image-crop/image-crop.vue'),
  },
  {
    path: '/form-signature',
    meta: {
      name: '手写签名',
    },
    component: () => import('../../pages/form-enhance/signature/signature.vue'),
  },
  {
    path: '/form-table-export-excel',
    meta: {
      name: '表格导出Excel',
    },
    component: () => import('../../pages/plugins/plugin-table-export-excel/plugin-table-export-excel.vue'),
  },
  {
    path: '/form-export-to-excel',
    meta: {
      name: 'Excel导出',
    },
    component: () => import('../../pages/plugins/plugins-export-to-excel/plugins-export-to-excel.vue'),
  },
];

export default formEnhanceRoutes;
