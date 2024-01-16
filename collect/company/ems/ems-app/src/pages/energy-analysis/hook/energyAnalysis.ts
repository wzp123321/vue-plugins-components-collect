import { reactive } from 'vue';
// 接口
import type { Ea_IAnalysisRes, Ea_ISearchParams } from '../energy-analysis.api';
import type { Common_IHttpResponseImpl } from '@/api/model';
// 枚举
import { EA_EPath } from '../constant/enum';
// 请求方法
import { commonHttp } from '@/api/request';
// 工具方法
import { FResHandler } from '@/utils';

export const useEnergyAnalysisController = () => {
  // 详情
  const analysisDetail = reactive<Ea_IAnalysisRes>({
    totalItem: {
      timeStamp: null,
      energyValue: null,
      lastMonthRatio: null,
      lastMonthValue: null,
      lastYearRatio: null,
      lastYearValue: null,
    },
    chartItem: {
      unit: '',
      title: '',
      itemList: [],
    },
  });
  /**
   * 查询能耗分析详情
   * @param {Ea_ISearchParams} params
   * @returns {Promise<void>}
   */
  const queryAnalysisInfo = async (params: Ea_ISearchParams): Promise<void> => {
    const res: Common_IHttpResponseImpl<Ea_IAnalysisRes> = await commonHttp.post(EA_EPath.查询详情, params);
    const result = FResHandler<Ea_IAnalysisRes>(res);
    analysisDetail.totalItem.timeStamp = result.totalItem.timeStamp ?? null;
    analysisDetail.totalItem.energyValue = result.totalItem.energyValue ?? null;
    analysisDetail.totalItem.lastYearValue = result.totalItem.lastYearValue ?? null;
    analysisDetail.totalItem.lastMonthValue = result.totalItem.lastMonthValue ?? null;
    analysisDetail.totalItem.lastMonthRatio = result.totalItem.lastMonthRatio ?? null;
    analysisDetail.totalItem.lastYearRatio = result.totalItem.lastYearRatio ?? null;
    analysisDetail.chartItem.unit = result.chartItem.unit ?? '';
    analysisDetail.chartItem.title = result.chartItem.title ?? '';
    analysisDetail.chartItem.itemList = result.chartItem.itemList ?? [];
    console.log('%c✨✨查询能耗分析数据✨✨', 'font-size: 24px', result);
  };

  return {
    analysisDetail,
    queryAnalysisInfo,
  };
};
