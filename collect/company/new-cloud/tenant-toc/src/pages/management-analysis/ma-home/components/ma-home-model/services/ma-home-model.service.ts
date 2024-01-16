import { getRequest, postRequest } from '@/service/request';
import { MhmEnergyTotal, MhmEnergySavingTable } from './ma-home-model.api';
import { TOKEN } from '../../../services/api';
import { Subject } from 'rxjs';

// 后台接口地址
const enum EPath {
  节能总收益弹框表格数据 = '/businessAnalyse/energySavingTotalSurplusTable',
  节能总收益弹框柱状图数据 = '/businessAnalyse/energySavingTotalSurplusLineChart',
  技术节能折线图数据 = '/businessAnalyse/techEnergySavingLineChart',
  技术节能表格数据 = '/businessAnalyse/techEnergySavingTable',
  货物成本数据 = '/business/analyse/node/data/ordinary/query',
  普通弹框能源 = '/business/analyse/node/data/ordinary/queryEnergy',
}

class MaHomeModeService {
  /**
   * 节能总收益弹框表格数据
   * @param queryStart 起始时间
   * @param queryEnd 结束时间
   */
  public queryEnergySavingDetailTable = async (params: MhmEnergyTotal) => {
    const res = await postRequest(EPath.节能总收益弹框表格数据, { ...params, ...TOKEN });
    return res;
  };
  /**
   * 节能总收益弹框柱状图数据
   * @param queryStart 起始时间
   * @param queryEnd 结束时间
   */
  public queryEnergySavingTotalSurplusLineChart = async (params: MhmEnergyTotal) => {
    const res = await postRequest(EPath.节能总收益弹框柱状图数据, { ...params, ...TOKEN });
    return res;
  };
  /**
   * 技术节能折线图数据
   * @param queryStart 起始时间
   * @param queryEnd 结束时间
   */
  public queryTechEnergySavingLineChart = async (params: MhmEnergyTotal) => {
    const res = await postRequest(EPath.技术节能折线图数据, { ...params, ...TOKEN });
    return res;
  };
  /**
   * 技术节能表格数据
   * @param queryStart 起始时间
   * @param queryEnd 结束时间
   */
  public queryTechEnergySavingTable = async (params: MhmEnergySavingTable) => {
    const res = await postRequest(EPath.技术节能表格数据, { ...params, ...TOKEN });
    return res;
  };
  /**
   * 货物成本数据
   * @param queryStart 起始时间
   * @param queryEnd 结束时间
   */
  public queryGoodsCost = async (params: any) => {
    const res = await postRequest(EPath.货物成本数据, { ...params, ...TOKEN });
    return res;
  };
  /**
   * 普通弹框能源
   * @param queryStart 起始时间
   * @param queryEnd 结束时间
   */
  public queryEnergy = async (params: any) => {
    const res = await postRequest(EPath.普通弹框能源, { ...params, ...TOKEN });
    return res;
  };

  //#region 订阅表格数据
  _getIsCHange = new Subject<string>();
  getIsChangeType = this._getIsCHange.asObservable();
  getIsChange(data: string) {
    this._getIsCHange.next(data);
  }
  //#endregion
}
export default new MaHomeModeService();
