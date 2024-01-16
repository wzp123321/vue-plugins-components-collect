import { RouteRecordRaw } from 'vue-router';

const energyManageRoutes: RouteRecordRaw[] = [
  /** kpi定额配置start */
  {
    path: '/kpiQuotaConfigurations',
    name: 'kpiQuotaConfiguration',
    meta: {
      name: 'KPI管理',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "kpiQuota-configuration" */ '@/views/pages/kpi-quota-configuration/kpi-quota-configuration.vue'
      ),
  },
  /** kpi定额配置end */

  /** kpi管理start */
  {
    path: '/kpiManagement',
    name: 'kpiManagement',
    meta: {
      name: 'KPI管理',
      keepAlive: true,
    },
    component: () => import(/* webpackChunkName: "kpi-management" */ '@/views/pages/kpi-management/kpi-management.vue'),
  },
  /** kpi定额配置end */

  /** 报告报表管理 start */
  {
    path: '/reportManagement',
    name: 'reportManagement',
    meta: {
      breadcrumbName: '报告报表管理',
      keepAlive: true,
    },
    component: () =>
      import(/* webpackChunkName: "report-management" */ '@/views/pages/report-management/report-management.vue'),
  },
  /** 报告报表管理 end */

  /** 报告报表生成 start */
  {
    path: '/reportGeneration',
    name: 'reportGeneration',
    meta: {
      breadcrumbName: '报告报表生成',
      keepAlive: true,
    },
    component: () =>
      import(/* webpackChunkName: "reportGeneration" */ '@/views/pages/report-generation/report-generation.vue'),
  },
  /** 报告报表生成 end */
];

export default energyManageRoutes;
