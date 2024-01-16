import { postRequest } from '@/services/request';

const energyRank = {
  /**
   * 查询能耗排名(配置)；
   */
  async getInitData(params: { id: string }) {
    const res = await postRequest(
      '/admin/consumptionRankConfig/getConsumptionRank',
      params,
    );
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
  async toSetEnergyRankData(params: {
    title: string;
    id: number;
    energyCode: string;
    treeIdList: any;
    treeType: string;
  }) {
    console.log(params);
    const res = await postRequest(
      '/admin/consumptionRankConfig/updateConfigContent',
      params,
    );
    return res;
  },
};

export default energyRank;
