import { getCampusParams } from '@/utils/token';
import { postRequest } from '@/services/request';

const homeAlarmEventService = {
  /**
   * 请求时段分析数据
   * @param params
   * @returns
   */
  async queryDuringAnalysisData() {
    const params = getCampusParams();
    const url = '/energyPortal/queryAlarmTimePeriodAnalysisLineChart';
    const res = await postRequest(url, params);
    return res;
  },
  /**
   * 请求分级统计数据
   * @param params
   * @returns
   */
  async queryClassificationStatisticsData(params: { timeType: number }) {
    const p = {
      ...params,
      ...getCampusParams(),
    };

    const res = await postRequest('/energyPortal/queryAlarmLevelStatisticsPieChart', p);
    return res;
  },
};

export default homeAlarmEventService;
