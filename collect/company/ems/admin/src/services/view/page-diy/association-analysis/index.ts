import { postRequest } from '@/services/request';

const associationAnalysis = {
  /**
   * 查询关联分析(配置)；
   */
  async getInitData(params: { id: string }) {
    const res = await postRequest('/admin/componentCorrelationConfig/queryCorrelationConfig', params);
    return res;
  },
  /**
   * 查询能源分类分项；
   */
  async getEnergyListSelect() {
    const res = await postRequest('/admin/energy/code/listEnergyParentCode');
    return res;
  },
  /**
   * 保存编辑后的能耗排名配置；
   */
  async toSetEnergyRankData(params: { title: string; id: number; correlationTreeInfoMap: {}; componentCode: string }) {
    const res = await postRequest('/admin/componentCorrelationConfig/saveCorrelationConfig', params);
    return res;
  },
};

export default associationAnalysis;
