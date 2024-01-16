import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

interface KpiServiceType {
  componentCode: string;
  id: number;
  timeType: string | number;
}

export interface KpiSaveDateType {
  componentCode: string;
  componentTitle: string;
  energyCode: string;
  energyCodeId: number;
  energyCodeName: string;
  energyCodeUnit: string;
  id: number;
  keyPointHighPercentage: number | string;
  keyPointLowPercentage: number | string;
  kpiType: number | string;
  quotaType: string;
}
const kpiService = {
  /**
   * 获取kpi数据
   */
  async getKpiData(param: KpiServiceType) {
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const res = await postRequest('/portal/component/kpi', p);
    return res;
  },
  /**
   * 获取初始数据；
   */
  async getInitData(params: number) {
    const res = await postRequest('/admin/portal/component/configGet/kpi', params);
    return res;
  },
  /**
   * 获取能源类型数据
   */
  async getEnergyData(params: any) {
    const res = await postRequest('/admin/portal/component/config/kpi/type', params);
    return res;
  },
  /**
   * 保存数据；
   */
  async saveData(params: KpiSaveDateType) {
    const res = await postRequest('/admin/portal/component/config/kpi', params);
    return res;
  },
};

export default kpiService;
