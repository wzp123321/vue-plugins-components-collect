import { MA_HOME_EQueryType, MA_HOME_EDateType } from './api';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { postRequest } from '@/service/request';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FResHandler, IRes, MA_HOME_ENodeType, MA_HOME_IBrainMapNode, TOKEN, MA_HOME_DATE_SCOPE } from './api';
import { formatDate } from '@/utils/index';

// 后台接口地址
const enum EPath {
  查询分析数据 = '/businessAnalyse/queryBrainMap',
  查询时间选择范围 = '/businessAnalyse/queryPeriod',
}

class DatabaseService {
  private readonly _bsLoading$ = new BehaviorSubject<boolean>(false);
  private readonly _bsDate$ = new BehaviorSubject<{
    dimension?: MA_HOME_EQueryType;
    dateType?: MA_HOME_EDateType;
    start?: Date;
    end?: Date;
  }>({});
  private readonly _bsMindMap$ = new BehaviorSubject<MA_HOME_IBrainMapNode | null>(null);
  private readonly _bsSearchParam$ = new BehaviorSubject<TReqBrainMap>({
    queryType: MA_HOME_EQueryType.运营期,
    durationType: MA_HOME_EDateType.按年,
  });

  //#region 状态
  public get refLoading$(): Observable<boolean> {
    return this._bsLoading$;
  }
  public get refEmpty$(): Observable<boolean> {
    return this._bsLoading$.pipe(
      startWith(false),
      map((v) => !v && this._bsMindMap$.value === null),
    );
  }
  //#endregion
  //#region 全量节点id, 用于判断生成的节点id是否重复
  private allNodeIds: string[] = [];

  //#region 时间维度数据
  public get dimension(): MA_HOME_EQueryType | undefined {
    return this._bsDate$.value.dimension;
  }
  public get dateType(): MA_HOME_EDateType | undefined {
    return this._bsDate$.value.dateType;
  }
  public get refDimension$(): Observable<MA_HOME_EQueryType | undefined> {
    return this._bsDate$.pipe(map((v) => v.dimension));
  }

  public get start(): Date | undefined {
    return this._bsDate$.value.start;
  }
  public get refStart$(): Observable<Date | undefined> {
    return this._bsDate$.pipe(map((v) => v.start));
  }

  public get end(): Date | undefined {
    return this._bsDate$.value.end;
  }
  public get refEnd$(): Observable<Date | undefined> {
    return this._bsDate$.pipe(map((v) => v.end));
  }

  public get bsSearchParam$(): Observable<TReqBrainMap> {
    return this._bsSearchParam$.pipe(map((v) => v));
  }
  //#endregion

  //#region 脑图数据
  public get refMindMap$(): Observable<MA_HOME_IBrainMapNode | null> {
    return this._bsMindMap$;
  }
  //#endregion

  public async query(
    queryType: MA_HOME_EQueryType,
    dateType: MA_HOME_EDateType,
    startDate?: string,
    endDate?: string,
  ): Promise<void> {
    const convertToDate = (
      data?: TResBrainMap,
    ): { dimension?: MA_HOME_EQueryType; dateType: MA_HOME_EDateType; start?: Date; end?: Date } => ({
      dateType: dateType,
      dimension: data ? queryType : undefined,
      start: data?.queryStart ? new Date(data.queryStart) : undefined,
      end: data?.queryEnd ? new Date(data.queryEnd) : undefined,
    });
    const convertToNode = (data?: IResBrainMapNode, position?: 'left' | 'right'): MA_HOME_IBrainMapNode | null =>
      data
        ? {
            // 部分id为null的节点会导致节点渲染有问题，所以随机生成一个id，随机生成的避免重复
            id: data.nodeId !== null ? data.nodeId : this.mapNodeCustomId(),
            name: data.nodeName,
            value: data.amount,
            unit: data.unit,
            remark: data.remark,
            operateName: data.operateName,
            position: (() => {
              if (position) {
                return position;
              }
              switch (+(data.nodeType ?? undefined)) {
                case MA_HOME_ENodeType.主节点:
                  return;
                case MA_HOME_ENodeType.收入:
                  position = 'left';
                  break;
                case MA_HOME_ENodeType.成本:
                  position = 'right';
                  break;
                default:
                  break;
              }
              return position;
            })(),
            isDeduction: data.deductFlag,
            extensions:
              data.extendTypeData?.map((extension) => ({
                code: extension.code,
                name: extension.name,
                value: extension.value,
                unit: extension.unit,
                color: extension.color,
              })) ?? [],
            energyCode: data.energyCode,
            popup: +data.popupType,
            children: data.children?.map((child) => convertToNode(child, position)!) ?? [],
          }
        : null;

    try {
      this._bsLoading$.next(true);
      let body: TReqBrainMap = { queryType: queryType, startDate, endDate };
      // 这里要改下
      // 如果按年-年相同   如果按月-年月相同
      if (
        (startDate &&
          endDate &&
          dateType === MA_HOME_EDateType.按年 &&
          formatDate(new Date(String(startDate)), 'yyyy') === formatDate(new Date(String(endDate)), 'yyyy')) ||
        (dateType === MA_HOME_EDateType.按月 && startDate === endDate) ||
        dateType === MA_HOME_EDateType.累计
      ) {
        body = {
          ...body,
          durationType: dateType,
        };
      }
      this._bsSearchParam$.next({
        ...body,
        durationType: dateType,
      });
      const res: IRes<TResBrainMap> = await postRequest(EPath.查询分析数据, { ...body, ...TOKEN });
      const data = FResHandler(res);
      this._bsDate$.next(convertToDate(data));
      // 拿到所有的id
      this.allNodeIds = this.getTreeAllChildIds(data?.treeNodeDatas);
      this._bsMindMap$.next(convertToNode(data?.treeNodeDatas));
    } catch (error) {
      this._bsDate$.next(convertToDate());
      this._bsMindMap$.next(null);
      console.warn('查询分析数据', '-->', error);
    } finally {
      this._bsLoading$.next(false);
    }
  }
  /**
   * 获取所有节点id
   * @param dataMap
   * @returns
   */
  private getTreeAllChildIds(dataMap: IResBrainMapNode) {
    if (!dataMap) {
      return [];
    }
    const ids: string[] = [dataMap.nodeId];
    function getIds(list: IResBrainMapNode[]) {
      list.forEach((item) => {
        if (item.nodeId && !ids.includes(item.nodeId)) {
          ids.push(item.nodeId);
        }

        if (item.children && item.children.length) {
          getIds(item.children);
        }
      });
    }
    if (dataMap.children && dataMap.children.length) {
      getIds(dataMap.children);
    }

    return ids;
  }
  /**
   * 生成一个不重复的随机id
   * @returns
   */
  private mapNodeCustomId() {
    let id: string = '999999999';
    const getId = () => {
      const randomId = (10000000000 * Math.random()).toFixed(0);
      // 根据目前节点id的规律，直接屏蔽一百以内的数字，以1开头的大数字比如100004;
      if (this.allNodeIds.includes(randomId) || +randomId <= 100 || randomId.startsWith('1')) {
        getId();
      } else {
        id = randomId;
      }
    };
    getId();

    return `custom-${id}`;
  }

  public queryDateScope(queryType: number): Promise<MA_HOME_DATE_SCOPE> {
    const convertDate = (data?: MA_HOME_DATE_SCOPE) =>
      data
        ? {
            time: data?.time ?? 0,
            endTime: data?.endTime ?? 0,
            startTime: data?.startTime ?? 0,
          }
        : {
            time: 0,
            endTime: 0,
            startTime: 0,
          };
    return new Promise(async (resolve) => {
      try {
        const res: IRes<MA_HOME_DATE_SCOPE> = await postRequest(EPath.查询时间选择范围, { queryType, ...TOKEN });
        const data = convertDate(res.data);
        resolve(data);
      } catch (error) {
        resolve({
          time: new Date().getTime(),
          startTime: new Date().getTime(),
          endTime: new Date().getTime(),
        });
        console.warn('查询时间范围', '-->', error);
        this._bsLoading$.next(false);
      }
    });
  }
}
export default new DatabaseService();

type TReqBrainMap = {
  queryType: MA_HOME_EQueryType;
  durationType?: MA_HOME_EDateType;
  startDate?: string;
  endDate?: string;
};

type TResBrainMap = {
  queryStart: number;
  queryEnd: number;
  treeNodeDatas: IResBrainMapNode;
};
interface IResBrainMapNode {
  amount: string;
  deductFlag: boolean;
  energyCode?: string;
  extendTypeData: { code: string; name: string; order: number; unit: string; value: string; color: string }[];
  nodeId: string;
  nodeName: string;
  nodeType: string;
  popupType: string;
  remark: string;
  operateName: string;
  unit: string;
  children: IResBrainMapNode[];
}
