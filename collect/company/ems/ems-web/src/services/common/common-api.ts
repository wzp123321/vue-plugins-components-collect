/*************************枚举***********************************/
// 系统类型，前后台
export enum CommonESystemType {
  前台 = 'web',
  后台 = 'admin',
}
// 树类型
export enum Common_ETreeType {
  区域 = '1',
  业态 = '2',
  支路 = '3',
  科室 = '4',
}
// 时间颗粒度
export enum Common_ETimeUnit {
  十分钟 = '10m',
  小时 = '1h',
  天 = '1d',
  月 = '1M',
  年 = '1y',
}
// 叶子节点
export enum Common_ETreeLeaf {
  是 = '1',
  不是 = '0',
}

// 公共请求路径
export const Common_EPath = {
  查询能源类型不带总能耗: '/admin/energy/code/listEnergyParentCodeExcludeTotal',
  根据后台树模型配置情况查询树类型 : '/admin/tree/queryExistTreeType',
  // 导出
  downLoad: {
    loadForecastingExport: '/forecast/exportExcelForecastData', // 负荷预测 导出
    energyConservationExport: '/saveenergyquota/downloadSaveEnergyQuotaTemplate', // 节能考核定额配置 导出
    energyRankingExportUrl: '/energyAnalyse/ExportExcelEnergyRanking', // 能耗排名导出
    energyContrastExportUrl: '/energyContrast/exportExcelEnergyContrast', // 能耗对比导出
    exportExcelEnergyAnalyse: '/energyAnalyse/exportExcelEnergyAnalyse', // 导出
    exportCorrelationAnalyseExcel: '/correlationAnalyse/exportCorrelationAnalyseExcel', // 关联分析前台导出
    exportDownloadKpiQuotaTemplate: '/kpiquota/downloadKpiQuotaTemplate', // kpi管理定额配置导出
    exportPeakStatistics: '/peakAnalyse/exportPeakStatistics', // 峰值分析 导出
    exportDownloadTreeTemplate: '/admin/tree/download/template',
    exportDownloadBenchmarkingCorrelationDataTemplate: '/admin/benchmarking/correlation/data/download/template', // 关联参数指标数据维护
    exportDownloadEnvironmentalMonitoringAnalysisUrl: '/environmental/assessment/exportEnvironmentalMonitoringAnalysis', // 环境监测分析
  },
};
/*************************枚举***********************************/

/*************************类型***********************************/
/**
 * 地址栏参数
 */
export interface URLQueryParams {
  showtype: string;
  corpid: string;
  token: string;
}

/**
 * 通用value、label
 */
export interface Common_IValueLabel<T = string> {
  value: T;
  label: string;
}

/**
 * 校验token 响应结果
 */
export interface CheckTokenRes {
  user?: {
    userId: number;
    name: string;
    loginName: string;
    tenantId: number;
    deptId: number;
    picUrl: string;
  };
  tenant?: {
    tenantId: number;
    tenantLogo: string;
    tenantName: string;
    platformName: string;
    tenantCode: string;
    loginUrl: string;
    multiCampus: boolean;
    businessType: number;
  };
  usable?: {
    item: string;
    values: { id: number; code: string; name: string }[];
  }[];
  used?: { item: string; code: string }[];
}

/**
 * http请求
 */
export interface Common_IHttpResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

/**
 * 校验token参数
 */
export interface KeepAliveParams {
  tenantCode: number;
  token: string;
}

/**
 * 登出参数
 */
export interface LogOutParams {
  tenantCode: string;
  tenantId: number;
  token: string;
}

/**
 * 更新选中院区参数
 */
export interface UpdateSelectedCampusParams {
  code: string;
  item?: string;
  orderId?: number;
  suiteId?: number;
  tenantId: string;
  type?: number;
  userId: string;
}

/**
 * 检验菜单
 * @param isDefaultUrl 是否需要跳转默认菜单，0不需要，1需要
 */
export interface CheckMenuParams {
  url: string;
}

/**
 * 菜单鉴权响应结果
 */
export interface CheckMenuRes {
  checkResult: boolean;
  defaultUrl: string;
}

// 能源类型
export interface Common_IEnergyVO {
  childEnergyCode?: Common_IEnergyVO[];
  co2Ratio: number;
  co2Unit: string;
  coalRatio: number;
  coalUnit: string;
  code: string;
  energyFlag: string;
  environmentFlag: string;
  id: number;
  moneyRatio: number;
  moneyUnit: string;
  name: string;
  parentCode: string;
  parentName: string;
  standardPoints: string;
  totalEnergyFlag: string;
  treeLeaf: string;
  treeSort: number;
  unit: string;
}

// code、name
export interface Common_ICodeName<T = string> {
  code: T;
  name: string;
}

// id、name
export interface Common_IIdName<T = string> {
  id: T;
  name: string;
}

// label、value
export interface Common_ILabelValue<T = string> {
  value: T;
  label: string;
}

// 通用对象
export interface Common_IObject {
  [key: string]: any;
}

/******************************************常量****************************************************/
// 默认表格表头高度
export const COMMON_TABLE_HEADER_HEIGHT = 52;
// 默认表格单元格高度
export const COMMON_TABLE_CELL_HEIGHT = 48;
