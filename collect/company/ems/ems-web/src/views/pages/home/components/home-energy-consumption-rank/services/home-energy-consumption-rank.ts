import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

const EnergyConsumptionRankService = {
  /**
   * 获取能耗排名数据
   */
  async getConsumptionRank(param: EnergyConsumptionRankModule.TableParam) {
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const res: HttpRequestModule.ResTemplate<EnergyConsumptionRankModule.TableRes> = await postRequest(
      '/consumptionRankConfig/getReceptionConsumptionRank',
      p,
    );
    return res;
  },
};

export default EnergyConsumptionRankService;
