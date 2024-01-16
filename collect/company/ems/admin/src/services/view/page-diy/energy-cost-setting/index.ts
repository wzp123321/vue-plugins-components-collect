import { postRequest } from '@/services/request';

const energyCostSetting = {
  /**
   * 获取能源类型初始数据；
   */
  async getEnergyCode() {
    const res = await postRequest('/admin/energy/code/listEnergyParentCodeExcludeTotal');
    return res;
  },
  /**
   * 获取初始数据；
   */
  async getInitData(params: number) {
    const res = await postRequest('/admin/componentCostAnalyseConfig/queryCostAnalyseConfig', params);
    return res;
  },
  /**
   * 保存配置数据；
   */
  async saveData(params: { id: number; title: string; energyCodeList: string[] }) {
    const res = await postRequest('/admin/componentCostAnalyseConfig/saveCostAnalyseConfig', params);
    return res;
  },
};

export default energyCostSetting;
