import { IRes, FResHandler } from '@/core/communication';
import { TDeepReadonly } from '@/core/types';
import axios from 'axios';
import { TH_MA_IClassification, TH_MA_IModule, TH_MA_IStatistic } from './th-management-analysis.api';

// 后台接口地址
const enum EPath {
  经营分析 = '/project/screen/businessAnalyse',
}

/**
 * 本年经营分析组件模块服务
 * @classdesc 维护本年经营分析组件模块数据
 * @exports ManagementAnalysisService 本年经营分析组件模块服务（普通类）
 */
export class ManagementAnalysisService {
  private _loading = false;
  private _data?: TH_MA_IModule;

  //#region 状态
  public get isLoading(): boolean {
    return this._loading;
  }
  //#endregion

  // 模块跳转标记
  public get tag(): string | undefined {
    return this._data?.tag;
  }

  //#region 经营分析数据
  // 盈余
  public get surplus(): Readonly<Partial<TH_MA_IStatistic>> {
    return { ...this._data?.surplus };
  }
  // 节能率
  public get saving(): Readonly<Partial<TH_MA_IStatistic>> {
    return { ...this._data?.saving };
  }
  // 分项列表
  public get list(): TDeepReadonly<Array<TH_MA_IClassification>> {
    return this._data?.list ?? [];
  }
  //#endregion

  /**
   * 查询本年经营分析组件模块数据
   */
  public async query(): Promise<void> {
    const convert = (data: IResManagementAnalysis): TH_MA_IModule | undefined =>
      data
        ? {
            tag: data.url,
            surplus: { value: data.surplus, unit: data.surplusUnit },
            saving: { value: data.energySaveRatio, unit: data.energySaveRatioUnit },
            list: data.itemList?.map((item) => ({
              code: item.energyCode,
              name: item.energyName,
              benchmark: item.benchmarkValue,
              value: item.actualValue,
              unit: item.unit,
            })),
          }
        : undefined;

    try {
      this._loading = true;
      const res: IRes<IResManagementAnalysis> = await axios.post(EPath.经营分析);
      const data = FResHandler(res);
      this._data = convert(data);
    } catch (error) {
      console.warn('经营分析', '-->', error);
    } finally {
      this._loading = false;
    }
  }
}

interface IResManagementAnalysis {
  energySaveRatio: number; // 节能率
  energySaveRatioUnit: string; // 节能率单位
  itemList: Array<{
    actualValue: number; // 实际值
    benchmarkValue: number; // 基准值
    energyCode: string; // 分项名称Code
    energyName: string; // 分项名称
    unit: string; // 单位
  }>;
  surplus: number;
  surplusUnit: string;
  url: string;
}
