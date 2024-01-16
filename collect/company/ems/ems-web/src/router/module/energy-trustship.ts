import { RouteRecordRaw } from 'vue-router';

const energyTrustShipRoutes: RouteRecordRaw[] = [
  /** 节能考核start */
  {
    path: '/energyConservationAssess',
    name: 'energyConservationAssess',
    meta: {
      name: '节能考核',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "energyConservationAssess" */ '@/views/pages/energy-conservation-assess/energy-conservation-assess.vue'
      ),
  },
  /** 节能考核end */
  /** 定额配置start */
  {
    path: '/energyConservationManage',
    name: 'energyConservationManage',
    meta: {
      name: '定额配置',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "energyConservationManage" */ '@/views/pages/energy-conservation/energy-conservation.vue'
      ),
  },
  /** 定额配置end */

  /** 能源异常start */
  {
    path: '/energyAnomaly',
    name: 'energyAnomaly',
    meta: {
      name: '能源异常',
      keepAlive: true,
    },
    component: () => import(/* webpackChunkName: "energy-anomaly" */ '@/views/pages/energy-anomaly/energy-anomaly.vue'),
  },
  /** 能源异常end */
];

export default energyTrustShipRoutes;
