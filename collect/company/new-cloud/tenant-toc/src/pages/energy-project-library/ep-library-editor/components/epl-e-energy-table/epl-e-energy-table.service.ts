import { postRequest } from '@/service/request';
import { HospitalDataDataRequest, HospitalDataDataResponse } from './epl-e-energy-table.api';

enum EPath {
  查询历史能耗列表 = 'hospitalData/data',
}

class HistoryEnergyTableService {
  /**
   * 查询历史能耗列表
   */
  public queryHistoryEnergyTableList = async (
    params: HospitalDataDataRequest
  ): Promise<HttpRequestModule.ResTemplate<HospitalDataDataResponse>> => {
    const res = await postRequest(EPath.查询历史能耗列表, params);
    return res;
  };
}

export const Service = new HistoryEnergyTableService();
