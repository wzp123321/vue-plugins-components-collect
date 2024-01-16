import { postRequest } from '@/service/request';
import { FResHandler, IRes, TOKEN, MA_HOME_EQueryType } from '../../../../services/api';
import { CH_IBaseInfo, MHM_MasterInfoDate, MHM_MasterInfoType, MHM_MasterParamType } from './mhm-master-node-model.api';
import { Subject } from 'rxjs';
import { formatDate } from '@/utils';
import { endOfYear, startOfYear } from 'date-fns';
// 后台接口地址
const enum EPath {
  主节点弹框 = '/business/analyse/node/data/main/query',
  系统时间 = '/weather/queryWeather',
}

/**
 * 主节点弹框
 * @classdesc 查询主节点弹框12个月详情
 * @default MhmMasterNodeModelService *单例模式
 */

class MhmMasterNodeModelService {
  //#region 状态
  private _loading = false;
  public get isLoading(): boolean {
    return this._loading;
  }

  private _isEmpty = false;
  public get isEmpty(): boolean {
    return this._isEmpty;
  }
  //#endregion

  // 服务器时间
  private _time: Date | undefined;
  public get time(): Date {
    return this._time ?? new Date();
  }

  constructor() {
    // this.query();
  }

  _getMasterNodeInfoList = new Subject<MHM_MasterInfoType[]>();
  masterNodeInfoData = this._getMasterNodeInfoList.asObservable();

  getMasterNodeInfoList(data: MHM_MasterInfoType[]) {
    this._getMasterNodeInfoList.next(data);
  }
  /**
   * 12月数据
   * @param param
   * @returns
   */
  public async queryMasterNode(param: {
    queryType: MA_HOME_EQueryType;
    nodeId: number;
    year: number;
    queryStart: number;
    queryEnd: number;
  }): Promise<boolean> {
    this._loading = true;
    const convert = (data: MHM_MasterInfoType[]): Array<MHM_MasterInfoType> =>
      data?.map((item) => ({
        month: item.month,
        date: item.date,
        value: item.value,
        unit: item.unit,
        status: item.status,
        maxOrMinStatus: item.maxOrMinStatus,
      })) ?? [];
    let masterData: MHM_MasterInfoType[] = [];
    try {
      const queryParam: MHM_MasterParamType = {
        ...TOKEN,
        ...param,
        ...this.mapQueryDateScope(param.year, param.queryStart, param.queryEnd),
      };
      console.log('queryParam-------', queryParam);
      const res: IRes<MHM_MasterInfoType[]> = await postRequest(EPath.主节点弹框, queryParam);
      const data = FResHandler(res);
      masterData = convert(data);
      if (!masterData || masterData.length === 0) {
        this._isEmpty = true;
      } else {
        this._isEmpty = false;
      }
    } catch (error) {
      this._isEmpty = true;
      console.warn('查询主节点弹框12个月详情', '-->', error);
    } finally {
      this._loading = false;
    }
    this.getMasterNodeInfoList(masterData);
    return this._isEmpty;
  }
  /**
   * 根据查询时间范围以及年，返回对应查询范围
   * @param year
   * @param start
   * @param end
   * @returns
   */
  private mapQueryDateScope = (year: number, start: number, end: number) => {
    const yearStart = year === new Date(start).getFullYear() ? start : startOfYear(new Date(year, 1, 1)).getTime();
    const yearEnd = year === new Date(end).getFullYear() ? end : endOfYear(new Date(year, 1, 1)).getTime();

    return {
      queryStart: yearStart,
      queryEnd: yearEnd,
    };
  };
  /**
   * 系统时间
   */
  public async query(): Promise<void> {
    const convert = (data: MHM_MasterInfoDate): CH_IBaseInfo | undefined =>
      data
        ? {
            time: data.timestamp ? new Date(data.timestamp) : new Date(),
          }
        : undefined;

    try {
      const res: IRes<MHM_MasterInfoDate> = await postRequest(EPath.系统时间, '');
      const data = FResHandler(res);

      this._time = convert(data)?.time ?? new Date();
      // console.log(convert(data));
    } catch (error) {
      console.warn('项目系统时间', '-->', error);
    }
  }
}

export default new MhmMasterNodeModelService();
