import { RouteRecordRaw } from 'vue-router';

const containerRoutes: RouteRecordRaw[] = [
  // 项目管理
  {
    path: '/projectManage',
    name: 'ContainerProjectManage',
    meta: { name: '项目管理' },
    component: () =>
      import(/* webpackChunkName: "tenant-project-manage" */ '@/pages/project-manage/project-manage.vue'),
    children: [
      {
        path: '/projectManage/editor',
        name: 'ContainerProjectEditor',
        meta: { name: '项目编辑' },
        component: () =>
          import(
            /* webpackChunkName: "tenant-project-editor" */ '@/pages/project-manage/pm-add-editor/pm-add-editor.vue'
          ),
        children: [],
      },
      {
        path: '/projectManage/view',
        name: 'ContainerProjectView',
        meta: { name: '项目查看' },
        component: () =>
          import(/* webpackChunkName: "tenant-project-view" */ '@/pages/project-manage/pm-view/pm-view.vue'),
        children: [],
      },
    ],
  },
  // 经营分析
  {
    path: '/maHome',
    name: 'ManagementAnalysis',
    meta: { name: '经营分析' },
    component: () =>
      import(/* webpackChunkName: "tenant-managementAnalysis" */ '@/pages/management-analysis/ma-home/ma-home.vue'),
  },
  {
    path: '/maAnnualDetails',
    name: 'AnnualDetails',
    meta: { name: '能耗预算全期表' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-maAnnualDetails" */ '@/pages/management-analysis/ma-annual-details/ma-annual-details.vue'
      ),
  },
  {
    path: '/householdNumberManagement',
    name: 'HouseholdNumberManagement',
    meta: { name: '户号管理' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-householdNumberManagement" */ '@/pages/household-number-manage/household-number-manage.vue'
      ),
  },
  {
    path: '/benchmarkValueMaintenance',
    name: 'BenchmarkValueMaintenance',
    meta: { name: '基准值维护' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-benchmarkValueMaintenance" */ '@/pages/benchmark-value-maintenance/benchmark-value-maintenance.vue'
      ),
  },
  {
    path: '/maHouseholdNumberEntry',
    name: 'HouseholdNumberEntry',
    meta: { name: '户号数据录入' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-maHouseholdNumberEntry" */ '@/pages/management-analysis/ma-householdnumber-entry/ma-householdnumber-entry.vue'
      ),
  },
  {
    path: '/maEnergySaveProjectDataManage',
    name: 'EnergySaveProjDataManage',
    meta: { name: '节能项目数据管理' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-ma-maEnergySaveProjectDataManage" */ '@/pages/management-analysis/ma-energysaveproj-datamanagement/ma-energysaveproj-datamanagement.vue'
      ),
  },
  {
    path: '/maMonthlyData',
    name: 'MonthlyData',
    meta: { name: '月度明细表' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-ma-maMonthlyData" */ '@/pages/management-analysis/ma-monthly-data/ma-monthly-data.vue'
      ),
  },
  {
    path: '/costAdditionalRecording',
    name: 'CostAdditionalRecording',
    meta: { name: '成本补录' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-cost-additional-recording" */ '@/pages/cost-additional-recording/cost-additional-recording.vue'
      ),
  },
  {
    path: '/energyConsumptionBudget',
    name: 'EnergyConsumptionBudget',
    meta: { name: '能耗预算表' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-energyConsumptionBudget" */ '@/pages/energy-consumption-budget/energy-consumption-budget.vue'
      ),
  },
  {
    path: '/energyConsumptionControl',
    name: 'EnergyConsumptionControl',
    meta: { name: '能耗管控' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-EnergyConsumptionControl" */ '@/pages/energy-consumption-control/energy-consumption-control.vue'
      ),
  },
  {
    path: '/costPreAccountingDeviation',
    name: 'CostPreAccountingDeviation',
    meta: { name: '成本预核算偏差' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-cost-pre-accounting-deviation" */ '@/pages/cost-pre-accounting-deviation/cost-pre-accounting-deviation.vue'
      ),
  },
  {
    path: '/workSheetDetail',
    name: 'workSheetDetail',
    meta: { name: '工单分析' },
    component: () =>
      import(/* webpackChunkName: "tenant-workSheetDetail" */ '@/pages/worksheet-detail/worksheet-detail.vue'),
  },
  {
    path: '/fileManagement',
    name: 'FileManagement',
    meta: { name: '文件管理' },
    component: () =>
      import(/* webpackChunkName: "tenant-workSheetDetail" */ '@/pages/file-management/file-management.vue'),
  },
  {
    path: '/energyAccountingDeviation',
    name: 'EnergyAccountingDeviation',
    meta: { name: '能源预核算偏差' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-energy-accounting-deviation" */ '@/pages/energy-accounting-deviation/energy-accounting-deviation.vue'
      ),
  },
  {
    path: '/energySavingManagement',
    name: 'EnergySavingManagement',
    meta: { name: '节能量管理' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-energy-saving-management" */ '@/pages/energy-saving-management/energy-saving-management.vue'
      ),
  },
  {
    path: '/boundaryManagement',
    name: 'BoundaryManagement',
    meta: { name: '边界管理' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-boundary-management" */ '@/pages/boundary-management/boundary-management.vue'
      ),
  },
  {
    path: '/workInstruction',
    name: 'WorkInstruction',
    meta: { name: '工作指引' },
    component: () =>
      import(/* webpackChunkName: "tenant-work-instruction" */ '@/pages/work-instruction/work-instruction.vue'),
  },
  {
    path: '/projectBudget',
    name: 'ProjectBudget',
    meta: { name: '项目预算' },
    component: () =>
      import(/* webpackChunkName: "tenant-project-budget" */ '@/pages/project-budget/project-budget.vue'),
  },
  {
    path: '/projectAccounting',
    name: 'ProjectAccounting',
    meta: { name: '项目核算' },
    component: () =>
      import(/* webpackChunkName: "tenant-project-accounting" */ '@/pages/project-accounting/project-accounting.vue'),
  },
  {
    path: '/energyConsumptionAccounting',
    name: 'EnergyConsumptionAccounting',
    meta: { name: '能耗核算' },
    component: () =>
      import(
        /* webpackChunkName: "tenant-energy-consumption-accounting" */ '@/pages/energy-consumption-accounting/energy-consumption-accounting.vue'
      ),
  },
];

export default containerRoutes;
