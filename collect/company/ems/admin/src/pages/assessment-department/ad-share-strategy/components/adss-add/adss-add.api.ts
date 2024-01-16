import { postRequest } from '@/services/request';

export const StrategyService = {
  /**
   * 获取能源类型
   * @returns
   */
  async getEnergyType(): Promise<HttpRequestModule.ResTemplate<EnergyTypeItem[]>> {
    const res = await postRequest('/admin/energy/code/listEnergyParentCodeExcludeTotal');
    return res;
  },

  /**
   * 获取分摊规则
   * @returns
   */
  async getShareRule(): Promise<HttpRequestModule.ResTemplate<RuleItemVO[]>> {
    const res = await postRequest('/apportionRule/listRules');
    return res;
  },

  /**
   * 新增分摊策略
   * @params 新增的分摊策略
   * @returns
   */
  async addShareSource(params: StrategyInfo): Promise<HttpRequestModule.ResTemplate<number>> {
    const res = await postRequest('/admin/apportion/strategy/add', params);
    return res;
  },

  /**
   * 编辑分摊策略
   * @params 新增的分摊策略
   * @returns
   */
  async updateShareSource(params: StrategyInfo): Promise<HttpRequestModule.ResTemplate<number>> {
    const res = await postRequest('/admin/apportion/strategy/update', params);
    return res;
  },
};

export interface EnergyTypeItem {
  code: string;
  name: string;
  id: number;
}
export interface RuleItemVO {
  description: string;
  formulaComponentList: {
    id: string;
    indexType: string;
    name: string;
    serialNumber: string;
  }[];
  id: number;
  name: string;
  serialNumber: string;
}

export interface RuleItem {
  id: string;
  name: string;
}

export enum sourceType {
  点位 = '0',
  变量 = '1',
}

export interface StrategyInfo {
  apportionedName: string;
  apportionedObjectList: RuleItem[];
  apportionedObjectType: string;
  apportionedStartTime: string;
  apportionedEndTime: string;
  apportionedSources: SourceItem[];
  energyCode: string;
  apportionedRuleId: string;
  id: number;
}

export interface SourceItem {
  apportionedSourceFormula: string;
  apportionedSourceType: string;
  apportionedSourceVarList: {
    concentratorId: string;
    concentratorName: string;
    deviceId: string;
    deviceName: string;
    pointNumber: string;
    pointNumberName: string;
    standardPointCode: string;
  }[];
}
