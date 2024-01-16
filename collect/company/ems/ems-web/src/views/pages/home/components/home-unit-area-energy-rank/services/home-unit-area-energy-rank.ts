import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

const UnitAreaEnergyRankService = {
  /**
   * 获取单位面积能耗排名数据
   */
  async getUnitAreaRank(param: UnitAreaEnergyRankModule.TableListParam) {
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const res: HttpRequestModule.ResTemplate<UnitAreaEnergyRankModule.TableListItem[]> = await postRequest(
      '/energyPortal/queryUnitAreaRankData',
      p,
    );
    return res;
  },
};

export default UnitAreaEnergyRankService;
