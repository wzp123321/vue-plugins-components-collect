/**
 * iframe id
 */
export const IFRAME_ID = 'ems_iframe';

// publicPath
const env = process.env.NODE_ENV || 'production';
export const PUBLIC_PATH = '/energy/ems';

// 外壳项目的基础地址
export const CONTAINER_PUBLIC_PATH = '/energy/ems/ems-container';

// 后台前缀地址
export const MANAGE_PUBLIC_PATH = env === 'production' ? '/energy/ems/ems-admin' : '/';

export const MENU_PARAMS = 1;

// 配置的路由路径
export const ROUTER_PATH = [
  '/home',
  '/energyAnalysis',
  '/energyContrast',
  '/energyBalance',
  '/loadForecasting',
  '/energyConservationAssess',
  '/energyConservationManage',
  '/energyRanking',
  '/relationAnalysis',
  '/kpiQuotaConfigurations',
  '/kpiManagement',
  '/energyAudit',
  '/energyAnomaly',
  '/peakology',
  '/airportBenchmarkingAnalysis',
  '/benchmarkingAnalysis',
  '/benchmarkingManage',
  '/logManagement',
  '/benchmarkingLibrary',
  '/reportManagement',
  '/alarmManagement',
  '/environmentEvaluation',
  '/transformer',
  '/reportGeneration',
  '/equipmentDetail',
  '/systemDetail',
  '/equipmentDetailInfo',
];

// 根据url去显示页面，节能考核定额配置，kpi管理定额配置，设备明细设备详情，日志管理，特殊处理
export const URL_REFLECTION = new Map([
  ['energyConservationManage', '/ems-web/energyConservationManage'],
  ['kpiQuotaConfigurations', '/ems-web/kpiQuotaConfigurations'],
  ['equipmentDetailInfo', '/ems-web/equipmentDetailInfo'],
  ['departmentAssessmentTarget', '/ems-web/departmentAssessmentTarget'],
  ['logManagement', '/ems-log/logManagement'],
]);

export const FORBIDDEN_CODE = 401;
