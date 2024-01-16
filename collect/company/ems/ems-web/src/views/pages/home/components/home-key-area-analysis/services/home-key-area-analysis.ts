import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

const keyAreaAnalysis = {
  /**
   * 获取区域树
   */
  async getAreaTree(param: { id: number; energyCode: string }) {
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const res = await postRequest('/portal/component/keyAreas/energy/areasTree', p);
    return res;
  },
  /**
   * 获取卡片能源数据
   */
  async getEnergy(param: KeyAreaAnalysisModule.Energy) {
    const res = await postRequest('/portal/component/keyAreas/energy', param);
    return res;
  },
};

export default keyAreaAnalysis;
