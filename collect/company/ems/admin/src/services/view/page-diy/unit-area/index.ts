import { postRequest } from '@/services/request';

const unitArea = {
  /**
   * 获取初始数据；
   */
  async getInitData(params: number) {
    const res = await postRequest(
      '/admin/componentUnitAreaRankConfig/queryUnitAreaRankConfig',
      params,
    );
    return res;
  },
  /**
   * 保存数据；
   */
  async saveData(params: {
    componentCode: string;
    energyCode: string;
    id: number;
    title: string;
    treeIds: number[];
    treeType: string;
  }) {
    const res = await postRequest(
      '/admin/componentUnitAreaRankConfig/saveUnitAreaRankConfig',
      params,
    );
    return res;
  },
};

export default unitArea;
