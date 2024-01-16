import { postRequest } from '@/services/request';

enum Peakology_EPath {
  exportPeakStatistics = '/peakAnalyse/exportPeakStatistics', // 导出
  queryPeakLineChart = '/peakAnalyse/queryPeakLineChart', // 折线图
  queryPeakStatistics = '/peakAnalyse/queryPeakStatistics', // 散点图
  queryPeakPieChart = '/peakAnalyse/PeakAnalysePowerSubPieChart', // 饼图-下级节点
  queryPeakLastPieChart = '/peakAnalyse/PeakAnalysePowerEndPieChart', // 饼图-末级节点
}

interface HttpType {
  endTime: string;
  energyCode: string;
  exportType: number | string;
  isSelf: boolean;
  startTime: string;
  timeUnit: string;
  treeIds: number[];
  type: number;
  valueMean: number;
}
const peakology = {
  /**
   * 导出接口
   * @param params
   * @returns
   */
  async exportPeakStatistics(params: HttpType) {
    const res = await postRequest(Peakology_EPath.exportPeakStatistics, params);
    return res;
  },
  /**
   * 获取折线图数据
   * @param params
   * @returns
   */
  async queryPeakLineChart(params: HttpType) {
    const res = await postRequest(Peakology_EPath.queryPeakLineChart, params);
    return res;
  },

  /**
   * 获取散点图数据
   * @param params
   * @returns
   */
  async queryPeakStatistics(params: HttpType) {
    const res = await postRequest(Peakology_EPath.queryPeakStatistics, params);
    return res;
  },

  /**
   * 获取下级节点饼图数据
   * @param params
   * @returns
   */
  async queryPeakPieChart(params: HttpType) {
    const res = await postRequest(Peakology_EPath.queryPeakPieChart, params);
    return res;
  },

  /**
   * 获取下级节点饼图数据
   * @param params
   * @returns
   */
  async queryPeakLastPieChart(params: HttpType) {
    const res = await postRequest(Peakology_EPath.queryPeakLastPieChart, params);
    return res;
  },
};

export default peakology;
