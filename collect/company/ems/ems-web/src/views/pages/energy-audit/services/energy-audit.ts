import { postRequest } from '@/services/request';

enum EA_EPath {
  管理树 = '/energyAudit/getEnergyYearAudit',
}

const energyAudit = {
  /**
   * 管理树
   * @param params
   * @returns
   */
  async queryData(params: { timeUnit: string; year: string }) {
    const res = await postRequest(EA_EPath.管理树, params);
    return res;
  },
};

export default energyAudit;
