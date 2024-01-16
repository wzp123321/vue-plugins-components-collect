import { postRequest } from '@/services/request';

// 所有的请求
export const addDialogService = {
  /**
   * 查询四则运算指标列表
   * @param params
   * @returns
   */
  async getDialogIndicatorList(params: {
    id: number;
    keyWord: string;
  }): Promise<HttpRequestModule.ResTemplate<FormulaItem[]>> {
    const res = await postRequest('/calculateIndex/queryIndexList', params);
    return res;
  },

  /**
   * 查询四则运算关联范围列表
   * @param params
   * @returns
   */
  async getDialogScopeList(params: {
    id: number;
    keyWord: string;
  }): Promise<HttpRequestModule.ResTemplate<FormulaItem[]>> {
    const res = await postRequest('/calculateIndex/queryRangeList', params);
    return res;
  },

  /**
   * 新增计算指标
   * @param params
   * @returns
   */
  async addIndicator(params: CalculationIndicatoItem): Promise<HttpRequestModule.ResTemplate<number>> {
    const res = await postRequest('/calculateIndex/saveCalculateIndex', params);
    return res;
  },
};

export interface FormulaItem {
  id: string;
  indexType: string;
  name: string;
  serialNumber: string;
}
export interface CalculationIndicatoItem {
  description: string;
  formulaComponentList: FormulaItem[];
  id: number;
  name: string;
  serialNumber: string;
  updateFlag?: string;
}

export const ColorType = {
  '3': '#FFF7CD', // 楼栋
  '4': '#E2FFC6', //楼层
  '5': '#F5E8FF', // 科室
};
export const FontColorType = {
  '3': '#FAAD14', // 楼栋
  '4': '#389E0D', //楼层
  '5': '#684AF3', // 科室
};
