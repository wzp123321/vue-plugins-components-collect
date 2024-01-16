import { postRequest } from '@/services/request';
export const calculationService = {
  /**
   * 查询分页列表
   * @param params
   * @returns
   */
  async getIndicatorList(
    params: ADSR_IQueryParams,
  ): Promise<HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<CalculationIndicatoItem[]>>> {
    const res = await postRequest('/calculateIndex/queryCalculateIndexPage', params);
    return res;
  },

  /**
   * 查看指标详情
   * @param params
   * @returns
   */
  async getIndicatorDetails(indexId: number): Promise<HttpRequestModule.ResTemplate<CalculationIndicatoItem>> {
    const res = await postRequest(`/calculateIndex/queryCalculateIndexDetail/${indexId}`);
    return res;
  },

  /**
   * 删除指标
   * @param params
   * @returns
   */
  async deleteIndicator(indexId: number): Promise<HttpRequestModule.ResTemplate<number>> {
    const res = await postRequest(`/calculateIndex/deleteCalculateIndex/${indexId}`);
    return res;
  },
  /**
   * 新增计算指标
   * @param params
   * @returns
   */
  async addOrEditIndicator(params: CalculationIndicatoItem): Promise<HttpRequestModule.ResTemplate<number>> {
    const res = await postRequest('/calculateIndex/saveCalculateIndex', params);
    return res;
  },
};

export interface ADSR_IQueryParams {
  orders: {
    asc: boolean;
    column: string;
  }[];
  pageNum: number;
  pageSize: number;
  searchCount: boolean;
}

export interface CalculationIndicatoItem {
  description: string;
  formulaComponentList: FormulaItem[];
  id: number;
  name: string;
  serialNumber: string;
  updateFlag?: string;
}

export interface FormulaItem {
  id: string;
  indexType: string;
  name: string;
  serialNumber: string;
}
