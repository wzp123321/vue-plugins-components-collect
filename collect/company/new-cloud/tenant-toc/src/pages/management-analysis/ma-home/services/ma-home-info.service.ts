/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { postRequest } from '@/service/request';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MA_HOME_IBaseInfo, MA_HOME_ERiskRank, FResHandler, IRes, TOKEN, MA_HOME_INodeExtensionItem } from './api';

// 后台接口地址
const enum EPath {
  项目名称标签 = '/project/screen/queryHomePage',
  操作项列表 = '/businessAnalyse/querySelectOptions',
}

class InfoService {
  private readonly _bsInfo$ = new BehaviorSubject<Partial<MA_HOME_IBaseInfo>>({});
  private readonly _bsNodeExtensions$ = new BehaviorSubject<MA_HOME_INodeExtensionItem[]>([]);

  //#region 项目基础数据
  public get name(): string {
    return this._bsInfo$.value.name ?? '天溯运营中心';
  }
  //#endregion

  //#region 项目周期数据
  public get refStart$(): Observable<Date> {
    return this._bsInfo$.pipe(
      filter((v) => !!v.start),
      map((v) => v.start!)
    );
  }
  public get refEnd$(): Observable<Date> {
    return this._bsInfo$.pipe(
      filter((v) => !!v.end),
      map((v) => v.end!)
    );
  }
  //#endregion

  //#region 项目类型数据
  // 托管类型
  public get refHostingType$(): Observable<string> {
    return this._bsInfo$.pipe(
      filter((v) => !!v?.hostingType),
      map((v) => v.hostingType!)
    );
  }
  // 风险类型
  public get refRiskType$(): Observable<MA_HOME_ERiskRank> {
    return this._bsInfo$.pipe(
      filter((v) => !!v?.riskType),
      map((v) => v.riskType!)
    );
  }
  // 基准类型
  public get refBenchmarkType$(): Observable<string> {
    return this._bsInfo$.pipe(
      filter((v) => !!v?.benchmarkType),
      map((v) => v.benchmarkType!)
    );
  }
  // 收益类型
  public get refProfitType$(): Observable<string> {
    return this._bsInfo$.pipe(
      filter((v) => !!v?.profitType),
      map((v) => v.profitType!)
    );
  }
  // 收益分享详细内容
  public get refProfitDetailList$(): Observable<readonly string[]> {
    return this._bsInfo$.pipe(
      filter((v) => !!v?.profitDetails?.length),
      map((v) => v.profitDetails!)
    );
  }
  //#endregion

  //#region 节点拓展操作
  public get refNodeExtensions$(): Observable<MA_HOME_INodeExtensionItem[]> {
    return this._bsNodeExtensions$;
  }
  //#endregion

  constructor() {
    this.queryProjectInfo();
    this.queryOperationList();
  }

  private async queryProjectInfo(): Promise<void> {
    const convert = (data?: TResProjectInfo): Partial<MA_HOME_IBaseInfo> => ({
      time: data?.time ? new Date(data.time) : new Date(),
      name: data?.hospitalName,
      start: data?.startTime ? new Date(data.startTime) : undefined,
      end: data?.endTime ? new Date(data.endTime) : undefined,
      hostingType: data?.hostingTypeName,
      riskType: data?.riskRatingName,
      benchmarkType: data?.benchmarkType,
      profitType: data?.profit,
      profitDetails: data?.profitDetail ?? [],
    });

    try {
      const res: IRes<TResProjectInfo> = await postRequest(EPath.项目名称标签, TOKEN);
      const data = FResHandler(res);
      this._bsInfo$.next(convert(data));
    } catch (error) {
      console.warn('项目名称标签', '-->', error);
    }
  }

  private async queryOperationList(): Promise<void> {
    const convert = (data?: TResOperationList): MA_HOME_INodeExtensionItem[] =>
      data?.map((item, index) => ({ code: item.code, name: item.name, order: index })) ?? [];

    try {
      const res: IRes<TResOperationList> = await postRequest(EPath.操作项列表, TOKEN);
      const data = FResHandler(res);
      this._bsNodeExtensions$.next(convert(data));
    } catch (error) {
      console.warn('操作项列表', '-->', error);
    }
  }
}
export default new InfoService();

type TResProjectInfo = {
  benchmarkType: string;
  hospitalName: string;
  hospitalUrl: string;
  hostingTypeName: string;
  profit: string;
  profitDetail: string[];
  riskRatingName: MA_HOME_ERiskRank;
  time: number;
  startTime: number;
  endTime: number;
};

type TResOperationList = { code: string; name: string }[];
