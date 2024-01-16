import { RouteRecordRaw } from 'vue-router';

const energySavingRoutes: RouteRecordRaw[] = [
  /** 设备明细 start */
  {
    path: '/equipmentDetail',
    name: 'equipmentDetail',
    meta: {
      breadcrumbName: '设备明细',
      keepAlive: true,
    },
    component: () =>
      import(/* webpackChunkName: "equipmentDetail" */ '@/views/pages/equipment-detail/equipment-detail.vue'),
  },
  /** 设备明细详情页 end */

  /** 系统明细 start */
  {
    path: '/systemDetail',
    name: 'systemDetail',
    meta: {
      breadcrumbName: '系统明细',
      keepAlive: true,
    },
    component: () => import(/* webpackChunkName: "systemDetail" */ '@/views/pages/system-detail/system-detail.vue'),
  },
  /** 系统明细 end */

  /** 设备明细详情页 start */
  {
    path: '/equipmentDetailInfo',
    name: 'equipmentDetailInfo',
    meta: {
      breadcrumbName: '设备明细',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "equipmentDetailInfo" */ '@/views/pages/equipment-detail-info/equipment-detail-info.vue'
      ),
  },
  /** 设备明细详情页 end */

  /** 变压器 start */
  {
    path: '/transformer',
    name: 'transformer',
    meta: {
      breadcrumbName: '变压器',
      keepAlive: true,
    },
    component: () => import(/* webpackChunkName: "transformer" */ '@/views/pages/transformer/transformer.vue'),
  },
  /** 变压器 end */
];

export default energySavingRoutes;
