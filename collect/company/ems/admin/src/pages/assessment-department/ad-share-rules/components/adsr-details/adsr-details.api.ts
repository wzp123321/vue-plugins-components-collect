import { postRequest } from '@/services/request';

export const ruleService = {
  /**
   * 查询分页列表
   * @param params
   * @returns
   */
  async getRuleList(
    params: ADSR_IQueryParams,
  ): Promise<HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<RuleItem[]>>> {
    const res = await postRequest('/apportionRule/queryApportionRulePage', params);
    return res;
  },

  /**
   * 查看分摊规则详情
   * @param params
   * @returns
   */
  /**
   * 查看指标详情
   * @param params
   * @returns
   */
  async getRuleDetails(indexId: number): Promise<HttpRequestModule.ResTemplate<RuleItem>> {
    const res = await postRequest(`/apportionRule/queryApportionRuleDetail/${indexId}`);
    return res;
  },

  /**
   * 新增分摊规则
   * @param params
   * @returns
   */
  async addOrEditRule(params: any): Promise<HttpRequestModule.ResTemplate<number>> {
    const res = await postRequest('/apportionRule/saveApportionRule', params);
    return res;
  },

  /**
   * 删除规则
   * @param params
   * @returns
   */
  async deleteRule(indexId: number): Promise<HttpRequestModule.ResTemplate<number>> {
    const res = await postRequest(`/apportionRule/deleteApportionRule/${indexId}`);
    return res;
  },

  /**
   * 查询是否存在基础指标
   * @returns
   */
  async getFlag(): Promise<HttpRequestModule.ResTemplate<boolean>> {
    const res = await postRequest('/apportionRule/queryBasicIndexExistFlag');
    return res;
  },
};

export interface RuleItem {
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

export interface ADSR_IQueryParams {
  orders: {
    asc: boolean;
    column: string;
  }[];
  pageNum: number;
  pageSize: number;
  searchCount: boolean;
}
