import { FResHandler, IRes } from '@/core/communication';
import { FGetCookie } from '@/core/token';
import { FConvertToNumber, TDeepReadonly } from '@/core/types';
import axios from 'axios';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { CH_EProjectState, CH_IProjectInfo, CH_IProjectStatistic } from '../cloud-home.api';

// 后台接口地址
const enum EPath {
  查询项目总数及各状态项目数量 = '/operationCenter/queryProjectNumber',
  查询地图以及能源事件 = '/operationCenter/queryMapAndEnergyEvents/',
  更新历史能源事件状态 = '/project/screen/updateHistoryEnergyEventStatus',
}

/**
 * 项目服务
 * @classdesc 维护项目统计信息及地图联动状态
 * @default ProjectService *单例模式
 */
class ProjectService {
  private readonly _bsSelectedState$ = new BehaviorSubject<CH_EProjectState | null>(null);
  private readonly _bsStatistics$ = new BehaviorSubject<Array<Partial<CH_IProjectStatistic>>>([]);
  private readonly _bsProjects$ = new BehaviorSubject<Array<Partial<CH_IProjectInfo>>>([]);

  // 已选项目状态 *Observable
  public get refSelectedState$(): Observable<CH_EProjectState | null> {
    return this._bsSelectedState$;
  }

  // 项目统计数据 *Observable
  public get refStatistics$(): Observable<Map<CH_EProjectState, number>> {
    return this._bsStatistics$.pipe(
      filter((v) => v.length > 0),
      map(
        (v) =>
          new Map(
            v.filter((item) => item.state != null && item.count != null).map((item) => [item.state!, item.count!]),
          ),
      ),
    );
  }

  // 项目信息 *
  public get refProjects$(): Observable<TDeepReadonly<Array<CH_IProjectInfo>>> {
    return this._bsProjects$.pipe(
      filter((v) => v.length > 0),
      map((v) => v.filter((item) => item.id && item.code) as Array<CH_IProjectInfo>),
    );
  }

  constructor() {
    // this.queryProjectStatistic();
    // this.queryProjectInfo();
  }

  public selectProjectsByState(state: CH_EProjectState): void {
    if (state === this._bsSelectedState$.value) {
      this._bsSelectedState$.next(null);
    } else {
      this._bsSelectedState$.next(state);
    }
  }

  public async updateEventState(id: string, code: string): Promise<void> {
    try {
      const body: TReqEventUpdate = { loginName: FGetCookie('username') ?? '', tenantId: id, tenantCode: code };

      await axios.post(EPath.更新历史能源事件状态, body);
    } catch (error) {
      console.warn('更新历史能源事件状态', '-->', error);
    }
  }

  public async queryProjectStatistic(): Promise<void> {
    try {
      const convert = (data: TResProjectNumber): Array<Partial<CH_IProjectStatistic>> =>
        data?.map((item) => ({
          state: FConvertToNumber(item.status),
          count: FConvertToNumber(item.number),
        })) ?? [];

      const res: IRes<TResProjectNumber> = await axios.post(EPath.查询项目总数及各状态项目数量);
      const data = FResHandler(res);
      this._bsStatistics$.next(convert(data));
    } catch (error) {
      console.warn('查询项目总数及各状态项目数量', '-->', error);
    }
  }

  public async queryProjectInfo(): Promise<void> {
    try {
      const convert = (data: TResProjectInfo): Array<Partial<CH_IProjectInfo>> =>
        data?.map((item) => ({
          id: item.tenantId?.toString(),
          code: item.tenantCode,
          tag: item.eventUrl,
          name: item.name,
          coordinate: [FConvertToNumber(item.longitude), FConvertToNumber(item.latitude)],
          alarm: item.hasNewEnergyEvent,
          state: FConvertToNumber(item.status),
          profitState: FConvertToNumber(item.profitStatus),
          start: item.startTime,
          end: item.endTime,
          manager: item.energyManager,
          surplus: { value: item.surplus, unit: item.surplusUnit },
          clickFlag: item.clickFlag,
        })) ?? [];

      const res: IRes<TResProjectInfo> = await axios.post(
        `${EPath.查询地图以及能源事件}${FGetCookie('username') ?? ''}`,
      );
      const data = FResHandler(res);
      this._bsProjects$.next(convert(data));
    } catch (error) {
      console.warn('查询地图以及能源事件', '-->', error);
    }
  }
}
export default new ProjectService();

type TResProjectNumber = Array<{ number: string; status: string }>;

type TResProjectInfo = Array<{
  endTime: string; // 托管结束时间
  energyManager: string; // 能源经理
  hasNewEnergyEvent: boolean; // 是否含有新能源事件
  latitude: string; // 纬度
  longitude: string; // 经度
  name: string; // 租户名称
  profitStatus: string; // 盈利情况 1-亏损 2-低盈利 3-中盈利 4-高盈利
  startTime: string; // 托管开始时间
  status: string; // 项目状态 1-已签约未进场 2-建设期 3-运营期
  surplus: number; // 盈余
  surplusUnit: string; // 盈余单位
  tenantCode: string;
  tenantId: number;
  eventUrl: string;
  clickFlag: boolean; // 权限
}>;

type TReqEventUpdate = {
  loginName: string;
  tenantCode: string;
  tenantId: string;
};
