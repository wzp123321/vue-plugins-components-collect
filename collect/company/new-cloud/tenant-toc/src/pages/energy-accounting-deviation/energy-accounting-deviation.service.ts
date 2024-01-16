import { ref } from 'vue';
import { Subject, Observable } from 'rxjs';
// 服务相关
import { postRequest } from '@/service/request';
import { CommonIHttpRes } from '@/service/api';
import { EadIQueryParams, EadISearchForm } from './ead-search-bar/ead-search-bar.api';
import { EadIBrainMapRes, EadItreeNodeDatas, EadIBrainMapNode, EadENodePositionType } from './ead-home/ead-home.api';
import {
  EccIDateScopeVO,
  EccSbEPeriodType,
} from '../energy-consumption-control/components/ecc-search-bar/ecc-search-bar.api';
import { EadENodePosition } from './energy-accounting-deviation.api';
// 工具类
import { formatDate, getTenant } from '@/utils';
import { endOfMonth, endOfYear, isThisMonth, isThisYear, startOfMonth, startOfYear } from 'date-fns';
import message from '@/utils/message';
// 请求地址
enum EPath {
  获取主页脑图 = '/energyDeviation/queryBrainMap',
}
class EadDataBaseService {
  // 是否是空数据
  private _isEmpty = ref<boolean>(false);
  // 是否是空数据
  public get isEmpty(): boolean {
    return this._isEmpty.value;
  }
  // loading
  private readonly _eadLoading$ = new Subject<boolean>();
  // 查询时间范围-时间段文本
  private readonly _eadTimeStr$ = new Subject<string>();
  // 脑图数据
  private readonly _eadMindMap$ = new Subject<EadIBrainMapNode | null>();
  // loading
  public get eadLoading$(): Observable<boolean> {
    return this._eadLoading$;
  }
  // 查询时间范围-时间段文本
  public get eadTimeStr$(): Observable<string> {
    return this._eadTimeStr$;
  }
  // 脑图数据
  public get eadMindMap$(): Observable<EadIBrainMapNode | null> {
    return this._eadMindMap$;
  }
  /**
   * 查询脑图数据
   * @param params 查询入参
   * @returns
   */
  async query(params: EadISearchForm, lastTimeStamp: EccIDateScopeVO, isInitFlag: boolean = false) {
    console.log('%c✨✨✨✨', 'font-size: 24px', params, lastTimeStamp);
    // 判断查询参数是否有能源类型，如果没有则提示
    if (!params.energyCode) {
      if (!isInitFlag) {
        message.error('能源类型不能为空');
      }
      this.nextData(false, null, true);
      return;
    }
    // 判断查询参数是否有托管周期或时间，如果没有则提示
    if (
      (params.periodType === EccSbEPeriodType.按托管期 && !params.hostingPeriodIndex) ||
      ((params.periodType === EccSbEPeriodType.按年 || params.periodType === EccSbEPeriodType.按月) &&
        !params.yearMonthStr)
    ) {
      this.nextData(false, null, true);
      if (!isInitFlag) {
        message.error('日期不能为空');
      }
      return;
    }
    try {
      const queryParams = this.mapQueryParams(params, lastTimeStamp);
      this._eadLoading$.next(true);
      const res: CommonIHttpRes<EadIBrainMapRes> = await postRequest(EPath.获取主页脑图, queryParams);
      if (res?.success) {
        this._eadTimeStr$.next(res?.data.timeStr);
        this.nextData(false, this.convertToNode(res?.data?.treeNodeDatas), false);
      } else {
        this._eadTimeStr$.next('');
        this.nextData(false, null, true);
      }
    } catch (error) {
      console.log('%c✨✨查询脑图Error✨✨', 'font-size: 24px', error);
      this._eadTimeStr$.next('');
      this.nextData(false, null, true);
    }
  }
  /**
   * 获取请求入参
   * @param params
   * @returns
   */
  private mapQueryParams(params: EadISearchForm, lastTimeStamp: EccIDateScopeVO): EadIQueryParams {
    const { energyCode, periodType, hostingAreaId, yearMonthStr } = params;
    const { startTimeStr, endTimeStr } = this.mapQueryTime(yearMonthStr ?? [], periodType, lastTimeStamp);
    const queryParams: EadIQueryParams = {
      energyCode,
      hostingAreaId,
      startTimeStr,
      endTimeStr,
      ...getTenant(),
    };
    return queryParams;
  }
  /**
   * 根据时间范围处理查询时间
   * @param yearMonthStr
   * @param periodType
   * @param lastTimeStamp
   * @returns
   */
  private mapQueryTime(yearMonthStr: Date[], periodType: string, lastTimeStamp: EccIDateScopeVO) {
    let startTimeStr = '';
    let endTimeStr = '';
    if (yearMonthStr?.length === 2) {
      // 如果是按托管期
      if (periodType === EccSbEPeriodType.按托管期) {
        startTimeStr = formatDate(yearMonthStr?.[0], 'yyyy-MM');
        console.log(
          '------------',
          yearMonthStr,
          yearMonthStr?.[1].getTime(),
          lastTimeStamp.endTimeMillis,
          Math.min(yearMonthStr?.[1].getTime(), lastTimeStamp.endTimeMillis as number),
        );
        endTimeStr = formatDate(
          new Date(Math.min(yearMonthStr?.[1].getTime(), lastTimeStamp.endTimeMillis as number)),
          'yyyy-MM',
        );
      } else {
        if (periodType === EccSbEPeriodType.按年) {
          startTimeStr = formatDate(startOfYear(yearMonthStr?.[0]), 'yyyy-MM');
        } else {
          startTimeStr = formatDate(startOfMonth(yearMonthStr?.[0]), 'yyyy-MM');
        }

        if (
          (periodType === EccSbEPeriodType.按年 && isThisYear(yearMonthStr?.[1])) ||
          (periodType === EccSbEPeriodType.按月 && isThisYear(yearMonthStr?.[1]) && isThisMonth(yearMonthStr?.[1]))
        ) {
          endTimeStr = formatDate(
            new Date(Math.min(new Date().getTime(), lastTimeStamp.endTimeMillis ?? 0)),
            'yyyy-MM',
          );
        } else {
          endTimeStr = formatDate(
            periodType === EccSbEPeriodType.按年 ? endOfYear(yearMonthStr?.[1]) : endOfMonth(yearMonthStr?.[1]),
            'yyyy-MM',
          );
        }
      }
    } else {
      startTimeStr = '';
      endTimeStr = '';
    }

    return {
      startTimeStr,
      endTimeStr,
    };
  }
  /**
   * 处理数据
   * @param loading loading
   * @param data 脑图数据
   * @param isEmpty 是否为空
   */
  private nextData(loading: boolean, data: EadIBrainMapNode | null, isEmpty: boolean) {
    this._eadLoading$.next(loading);
    this._eadMindMap$.next(data);
    this._isEmpty.value = isEmpty;
  }
  /**
   * 把接口返回的数据处理成业务需要的数据格式
   * @param data 脑图数据
   * @param position 节点在脑图渲染的位置
   * @returns
   */
  private convertToNode(data: EadItreeNodeDatas, position?: 'left' | 'right'): EadIBrainMapNode {
    return {
      nodeId: data?.nodeId,
      nodeName: data?.nodeName,
      amount: data?.amount,
      unit: data?.unit,
      nodeType: data?.nodeType,
      deductFlag: data?.deductFlag,
      position: (() => {
        // 如果已经有position，则不再二次判断
        if (position) {
          return position;
        }
        // 根据节点类型处理位置
        switch (data?.nodeType) {
          case EadENodePositionType.中间节点:
            return;
          case EadENodePositionType.左半边:
            position = EadENodePosition.左边;
            break;
          case EadENodePositionType.右半边:
            position = EadENodePosition.右边;
            break;
          default:
            break;
        }
        return position;
      })(),
      children: data?.children?.map((child) => this.convertToNode(child, position)!) ?? [],
    };
  }
}

export default new EadDataBaseService();
