import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

const energyBalanceService = {
  /**
   * 请求能流平衡数据
   * @param params
   * @returns
   */
  async queryEnergyBalanceData(params: EnergyBalanceModule.PageSearchParams) {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/energyBalance/queryEnergyBalanceTree';
    const res = await postRequest(url, p);
    return res;
  },
  /**
   * @description: 获取功能选择列表
   * @param {EnergyBalanceModule} params
   * @return {*}
   */

  async querySystemManagement(params: EnergyBalanceModule.QuerySystemManagementParams) {
    const url = 'systemManagement/query';
    const res = await postRequest(url, params);
    return res;
  },
  /**
   *获取能流平衡开关
   */
  async queryBalanceFlag() {
    const url = '/systemManagement/queryBalanceFlag';
    const res = await postRequest(url);
    return res;
  },
};

export default energyBalanceService;
