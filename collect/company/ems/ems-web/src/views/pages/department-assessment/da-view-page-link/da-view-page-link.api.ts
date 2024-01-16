// 记录缓存的key
export const DVPL_SESSION_KEY = 'ems-analysis-query-params';
// 跳转页面类型
export enum DVPL_EPageType {
  科室能耗分析 = '科室能耗分析',
}
// 可跳转页面
export const DVPL_VIEW_PAGES = [
  {
    name: DVPL_EPageType.科室能耗分析,
    url: '/web/energyAnalysis',
    icon: 'IconEmsEnergyAnalysis',
  },
];
