/*
 * @Author: yut
 * @Date: 2023-07-10 14:48:49
 * @LastEditors: yut
 * @LastEditTime: 2023-07-11 11:56:07
 * @Descripttion:
 */
import energyAnalysisRoutes from './energy-analysis';
import energyTrustShipRoutes from './energy-trustship';
import energySavingRoutes from './energy-saving-expert';
import energyBrainRoutes from './energy-brain';
import energyManageRoutes from './energy-manage';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  /** 能耗门户 start */
  {
    path: '/home',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/pages/home/home.vue'),
    meta: {
      name: '能耗门户',
      keepAlive: true,
    },
  },
  /** 能源审计start */
  {
    path: '/energyAudit',
    name: 'energyAudit',
    meta: {
      name: '能源审计',
      keepAlive: true,
    },
    component: () => import(/* webpackChunkName: "energy-audit" */ '@/views/pages/energy-audit/energy-audit.vue'),
  },
  /** 能源审计end */
  /** 告警管理 start */
  {
    path: '/alarmManagement',
    name: 'alarmManagement',
    meta: {
      breadcrumbName: '告警管理',
      keepAlive: true,
    },
    component: () =>
      import(/* webpackChunkName: "alarm-management" */ '@/views/pages/alarm-management/alarm-management.vue'),
  },
  /** 告警管理 end */
  /** 科室考核 start */
  {
    path: '/departmentAssessment',
    name: 'departmentAssessment',
    meta: {
      breadcrumbName: '科室考核',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "department-assessment" */ '@/views/pages/department-assessment/department-assessment.vue'
      ),
  },
  /** 科室考核 end */
  /** 科室考核目标维护 start */
  {
    path: '/departmentAssessmentTarget',
    name: 'departmentAssessmentTarget',
    meta: {
      breadcrumbName: '科室考核',
      keepAlive: true,
    },
    component: () =>
      import(
        /* webpackChunkName: "department-assessment-target" */ '@/views/pages/department-assessment-target/department-assessment-target.vue'
      ),
  },
  /** 科室考核目标维护 end */

  /** 能耗门户 end */
  ...energyAnalysisRoutes,
  ...energyTrustShipRoutes,
  ...energySavingRoutes,
  ...energyBrainRoutes,
  ...energyManageRoutes,
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/not-found/not-found.vue'),
  },
];

export default routes;
