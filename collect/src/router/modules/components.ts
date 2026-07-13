import { RouteRecordRaw } from 'vue-router';

const components: RouteRecordRaw[] = [
  {
    path: '/component-home',
    meta: {
      name: '组件',
    },
    component: () => import('../../pages/components/index.vue'),
  },
  {
    path: '/component-inputFilter',
    meta: {
      name: '输入框过滤',
    },
    component: () => import('../../pages/components/input-filter/input-filter.vue'),
  },
  {
    path: '/component-vue3-virtual-list',
    meta: {
      name: '虚拟表格',
    },
    component: () => import('../../pages/components/vue3-virtual-list-container/vue3-virtual-list-container.vue'),
  },
  {
    path: '/spark-upload',
    meta: {
      name: '大文件上传',
    },
    component: () => import('../../pages/components/spark-upload/index.vue'),
  },
  {
    path: '/virtual-card-load',
    meta: {
      name: '虚拟卡片加载',
    },
    component: () => import('../../pages/components/virtual-card-load/virtual-card-load.vue'),
  },
  {
    path: '/te-drag-design',
    meta: { name: 'te-drag-design 拖拽设计' },
    component: () => import('../../pages/components/te-drag-design/te-drag-design.vue'),
  },
  {
    path: '/te-qrcode-view',
    meta: { name: 'te-qrcode-view 二维码预览' },
    component: () => import('../../pages/components/te-qrcode-view/te-qrcode-view.vue'),
  },
  {
    path: '/te-print-template-view',
    meta: { name: 'te-print-template-view 打印模板' },
    component: () => import('../../pages/components/te-print-template-view/te-print-template-view.vue'),
  },
  {
    path: '/te-print-one-code',
    meta: { name: 'te-print-one-code 一码通打印' },
    component: () => import('../../pages/components/te-print-one-code/te-print-one-code.vue'),
  },
  {
    path: '/te-title',
    meta: { name: 'te-title 头衔选择' },
    component: () => import('../../pages/components/te-title/te-title.vue'),
  },
  {
    path: '/te-department',
    meta: { name: 'te-department 部门选择' },
    component: () => import('../../pages/components/te-department/te-department.vue'),
  },
  {
    path: '/te-employee-group',
    meta: { name: 'te-employee-group 员工组' },
    component: () => import('../../pages/components/te-employee-group/te-employee-group.vue'),
  },
  {
    path: '/te-employee-scope-v2',
    meta: { name: 'te-employee-scope-v2 员工范围' },
    component: () => import('../../pages/components/te-employee-scope-v2/te-employee-scope-v2.vue'),
  },
  {
    path: '/te-print-qr',
    meta: { name: 'te-print-qr 多打印机分发' },
    component: () => import('../../pages/components/te-print-qr/te-print-qr.vue'),
  },
  {
    path: '/te-space-select',
    meta: { name: 'te-space-select 空间级联' },
    component: () => import('../../pages/components/te-space-select/te-space-select.vue'),
  },
  {
    path: '/te-project-select',
    meta: { name: 'te-project-select 项目选择' },
    component: () => import('../../pages/components/te-project-select/te-project-select.vue'),
  },
  {
    path: '/te-icon-lib',
    meta: { name: 'te-icon-lib 图标库' },
    component: () => import('../../pages/components/te-icon-lib/te-icon-lib.vue'),
  },
  {
    path: '/te-space-attribute',
    meta: { name: 'te-space-attribute 空间属性' },
    component: () => import('../../pages/components/te-space-attribute/te-space-attribute.vue'),
  },
  {
    path: '/te-space-zone-tree',
    meta: { name: 'te-space-zone-tree 分区树' },
    component: () => import('../../pages/components/te-space-zone-tree/te-space-zone-tree.vue'),
  },
];

export default components;
