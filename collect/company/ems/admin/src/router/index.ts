import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// 首屏组件改为同步
import Home from '../layouts/home/home.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
    children: [
      // 门户管理
      {
        path: '/pageDiy',
        name: 'pageDiy',
        meta: {
          name: '门户管理',
        },
        component: () => import('../pages/page-diy/index.vue'),
      },
      // 树绑定
      {
        path: '/bindingTree',
        name: 'bindingTree',
        meta: {
          name: '树-设备绑定',
        },
        component: () => import('../pages/tree-bind/tree-bind.vue'),
      },
      // 关联分析-全局参数配置
      {
        path: '/globalParameterManage',
        name: 'globalParameterManage',
        meta: {
          name: '全局参数配置',
        },
        component: () => import('../pages/relation-analysis/ra-global-parameter-manage/ra-global-parameter-manage.vue'),
      },
      // 关联分析-节点参数配置
      {
        path: '/nodeParameterManage',
        name: 'nodeParameterManage',
        meta: {
          name: '节点参数配置',
        },
        component: () => import('../pages/relation-analysis/ra-node-parameter-manage/ra-node-parameter-manage.vue'),
      },
      // 关联分析-作息时间
      {
        path: '/timeTableManage',
        name: 'timeTableManage',
        meta: {
          name: '作息时间',
        },
        component: () => import('../pages/relation-analysis/ra-timetable-manage/ra-timetable-manage.vue'),
      },
      // 关联分析-录入数据
      {
        path: '/dataEntry',
        name: 'dataEntry',
        meta: {
          name: '录入数据',
        },
        component: () => import('../pages/relation-analysis/ra-data-entry/ra-data-entry.vue'),
      },
      // 分组排名
      {
        path: '/groupRanked',
        name: 'groupRanked',
        meta: {
          name: '分组排名',
        },
        component: () => import('../pages/group-ranked/group-ranked.vue'),
      },
      // 标准库维护
      {
        path: '/standardLibraryMaintenance',
        name: 'standardLibraryMaintenance',
        meta: {
          name: '标准库维护',
        },
        component: () => import('../pages/standard-library-maintenance/standard-library-maintenance.vue'),
      },
      // 树管理
      {
        path: '/treeManage',
        name: 'treeManage',
        meta: {
          name: '树模型管理',
        },
        component: () => import('../pages/tree-manage/tree-manage.vue'),
      },
      // 操作建议库
      {
        path: '/operateSuggestion',
        name: 'operateSuggestion',
        meta: {
          name: '操作建议库',
        },
        component: () => import('../pages/operate-suggestion/operate-suggestion.vue'),
      },
      // 异常原因库
      {
        path: '/abnormalReason',
        name: 'abnormalReason',
        meta: {
          name: '异常原因库',
        },
        component: () => import('../pages/abnormal-reason/abnormal-reason.vue'),
      },
      // 能耗对比组
      {
        path: '/energyComparisonGroup',
        name: 'energyComparisonGroup',
        meta: {
          name: '能耗对比组',
        },
        component: () => import('../pages/energy-comparison-group/energy-comparison-group.vue'),
      },
      // 目标成本
      {
        path: '/targetCost',
        name: 'targetCost',
        meta: {
          name: '目标成本',
        },
        component: () => import('../pages/target-cost/target-cost.vue'),
      },
      // 阈值配置
      {
        path: '/thresholdConfig',
        name: 'thresholdConfig',
        meta: {
          name: '阈值配置',
        },
        component: () => import('../pages/threshold-config/threshold-config.vue'),
      },
      {
        path: '/dataAbnomalAlarmRules',
        name: 'dataAbnomalAlarmRules',
        meta: {
          name: '异常告警管理',
        },
        component: () => import('../pages/data-abnomal-alarm-rules/index.vue'),
      },
      // 对标体系
      {
        path: '/benchMarkingSystem',
        name: 'benchMarkingSystem',
        meta: {
          name: '对标体系',
        },
        component: () => import('../pages/benchmarking-system/benchmarking-system.vue'),
      },
      // 对标指标
      {
        path: '/benchMarkingIndex',
        name: 'benchMarkingIndex',
        meta: {
          name: '对标指标',
        },
        component: () => import('../pages/benchmarking-index/benchmarking-index.vue'),
      },
      // 指标管理
      {
        path: '/correlationIndex',
        name: 'correlationIndex',
        meta: {
          name: '指标管理',
        },
        component: () => import('../pages/correlation-index/correlation-index.vue'),
      },
      // 对标数据维护
      {
        path: '/benchmarkingDataMaintenance',
        name: 'benchmarkingDataMaintenance',
        meta: {
          name: '对标数据维护',
        },
        component: () => import('../pages/benchmarking-data-maintenance/benchmarking-data-maintenance.vue'),
      },
      // 指标数据维护
      {
        path: '/indicatorDataMaintenance',
        name: 'indicatorDataMaintenance',
        meta: {
          name: '指标数据维护',
        },
        component: () => import('../pages/indicator-data-maintenance/indicator-data-maintenance.vue'),
      },
      // 环境评估-环境评价
      {
        path: '/environmentEvaluation',
        name: 'environmentEvaluation',
        meta: {
          name: '环境评价',
        },
        component: () => import('../pages/environment-evaluation/environment-evaluation.vue'),
      },
      // 环境评估-评价参数配置
      {
        path: '/environmentBasicParamConfig',
        name: 'environmentBasicParamConfig',
        meta: {
          name: '评价参数配置',
        },
        component: () => import('../pages/basic-param-config/basic-param-config.vue'),
      },
      // 能耗体检报告配置
      {
        path: '/energyMedicalReportConfig',
        name: 'energyMedicalReportConfig',
        meta: {
          name: '能耗体检报告配置',
        },
        component: () => import('../pages/energy-medical-report-config/energy-medical-report-config.vue'),
      },
      // 等效电能源管理
      {
        path: '/equivalentElectric',
        name: 'equivalentElectric',
        meta: {
          name: '等效电能源管理',
        },
        component: () => import('../pages/equivalent-electric/equivalent-electric.vue'),
      },
      // 对标建筑配置
      {
        path: '/buildingInformation',
        name: 'buildingInformation',
        meta: {
          name: '对标建筑配置',
        },
        component: () => import('../pages/building-information-config/building-information-config.vue'),
      },
      // 菜单管理
      {
        path: '/menuManagement',
        name: 'menuManagement',
        meta: {
          name: '菜单管理',
        },
        component: () => import('../pages/menu-management-config/menu-management-config.vue'),
      },
      // 系统管理
      {
        path: '/systemManagement',
        name: 'systemManagement',
        meta: {
          name: '系统管理',
        },
        component: () => import('../pages/system-management-config/system-management-config.vue'),
      },
      // 科室能耗--分摊规则
      {
        path: '/adShareRules',
        name: 'AdShareRules',
        meta: {
          name: '分摊规则',
        },
        component: () => import('../pages/assessment-department/ad-share-rules/ad-share-rules.vue'),
      },
      // 科室能耗--基础指标维护
      {
        path: '/adBasicIndicatorMaintain',
        name: 'AdBasicIndicatorMaintain',
        meta: {
          name: '基础指标维护',
        },
        component: () =>
          import('../pages/assessment-department/ad-basic-indicators-maintain/ad-basic-indicators-maintain.vue'),
      },
      // 科室能耗--基础指标维护-数据维护
      {
        path: '/adBasicIndicatorMaintainDetail',
        name: 'AdBasicIndicatorMaintainDataMaintain',
        meta: {
          name: '基础指标维护',
        },
        component: () =>
          import(
            '../pages/assessment-department/ad-basic-indicators-maintain/ad-bim-data-maintain/ad-bim-data-maintain.vue'
          ),
      },
      // 科室能耗--分摊策略
      {
        path: '/adStrategy',
        name: 'AdStrategy',
        meta: {
          name: '分摊策略',
        },
        component: () => import('../pages/assessment-department/ad-share-strategy/ad-share-strategy.vue'),
      },
      // 断点续传记录
      {
        path: '/breakpointResume',
        name: 'BreakpointResume',
        meta: {
          name: '断点续传记录',
        },
        component: () => import('../pages/breakpoint-resume/breakpoint-resume.vue'),
      },
      // 404
      {
        path: '/:pathMatch(.*)',
        meta: {
          name: '404',
        },
        component: () => import('../layouts/not-found/not-found.vue'),
      },
    ],
  },
  {
    path: '/demo',
    component: () => import('Layouts/demo/demo.vue'),
  },
  {
    path: '/pConfigurationPage',
    meta: {
      name: '树权限配置',
    },
    component: () => import('../pages/permission-configure/permission-configure.vue'),
  },
  {
    path: '/forbidden',
    component: () => import('../layouts/not-permission/not-permission.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
