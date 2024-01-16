import { postRequest } from '@/service/request';
import { MA_AD_IProjectItem } from '../ma-annual-details.api';
import { TDeepReadonly, IRes, TOKEN, FResHandler } from './services.api';

// 后台接口地址
const enum EPath {
  查询年度详情表格数据 = '/allStageBudget/queryAllStageBudgetDataVO',
}

/**
 * 表格服务
 * @description 实现年度明细表表格数据相关支撑服务
 * @default TableService 表单服务（单例模式）
 */
class TableService {
  private _loading = false;
  private _data?: {
    years: string[];
    benchmark: MA_AD_IProjectItem;
    consumptionBefore: MA_AD_IProjectItem;
    energySaving: MA_AD_IProjectItem;
    consumptionAfter: MA_AD_IProjectItem;
    totalSaving: MA_AD_IProjectItem;
    adjustment: MA_AD_IProjectItem;
    summary: MA_AD_IProjectItem;
    contrast: MA_AD_IProjectItem;
    dividend: MA_AD_IProjectItem;
    totalAreaFlag: boolean;
  };

  //#region 状态
  public get isLoading(): boolean {
    return this._loading;
  }

  public get isEmpty(): boolean {
    return this._data == undefined;
  }
  //#endregion

  // 经营期
  public get years(): readonly string[] {
    return this._data?.years ?? [];
  }

  //#region 分项数据
  // 能耗基准
  public get benchmark(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.benchmark;
  }
  // 改造前能耗
  public get consumptionBefore(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.consumptionBefore;
  }
  // 节能量
  public get energySaving(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.energySaving;
  }
  // 改造后能耗
  public get consumptionAfter(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.consumptionAfter;
  }
  // 总经营节能量
  public get totalSaving(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.totalSaving;
  }
  // 调差
  public get adjustment(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.adjustment;
  }
  // 经营汇总
  public get summary(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.summary;
  }
  // 与原可研对比
  public get contrast(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.contrast;
  }
  // 国网&天溯&合作伙伴
  public get dividend(): TDeepReadonly<MA_AD_IProjectItem | undefined> {
    return this._data?.dividend;
  }
  //#endregion

  public async query(): Promise<void> {
    let itemName = '';
    const converter = (data: IAnnualDetailsProjectItem): MA_AD_IProjectItem => ({
      projectName: data?.modelName,
      energyList:
        data?.energyValueList?.map((item, index) => {
          let rowSpan = 1;
          if (itemName === '' || (itemName !== '' && itemName !== item.itemName)) {
            itemName = item.itemName ?? '';
            const list =
              data?.energyValueList?.filter((childItem) => {
                return childItem.itemName === item.itemName;
              }) ?? [];
            rowSpan = list?.length * 5;
          } else {
            rowSpan = 0;
          }

          return {
            energyName: item.areaName || item.itemName,
            itemName: item.itemName,
            amount: { name: item.amount?.name, unit: item.amount?.unit, values: item.amount?.values ?? [] },
            price: { name: item.price?.name, unit: item.price?.unit, values: item.price?.values ?? [] },
            cost: { name: item.payment?.name, unit: item.payment?.unit, values: item.payment?.values ?? [] },
            itemTotal: { name: item.itemTotal?.name, unit: item.itemTotal?.unit, values: item.itemTotal?.values ?? [] },
            areaFlag: item.areaFlag,
            itemTotalFlag: item.itemTotalFlag,
            rowSpan: rowSpan,
          };
        }) ?? [],
      otherList:
        data?.valueList?.map((item) => ({
          itemName: item.itemName,
          name: item.name,
          unit: item.unit,
          values: item.values ?? [],
        })) ?? [],
      total: {
        itemName: data?.total?.itemName,
        name: data?.total?.name,
        unit: data?.total?.unit,
        values: data?.total?.values ?? [],
      },
    });

    try {
      this._loading = true;
      const res: IRes<IAnnualDetailsRes> = await postRequest(EPath.查询年度详情表格数据, TOKEN);
      const data = FResHandler(res);
      this._data = {
        years: data?.title,
        benchmark: converter(data?.body?.benchmarkVO),
        consumptionBefore: converter(data?.body?.energyRetrofitBeforeVO),
        energySaving: converter(data?.body?.energySavingVO),
        consumptionAfter: converter(data?.body?.energyRetrofitAfterVO),
        totalSaving: converter(data?.body?.totalEnergySavingVO),
        adjustment: converter(data?.body?.energyAdjustmentVO),
        summary: converter(data?.body?.businessSummaryVO),
        contrast: converter(data?.body?.feasibilityResearchVO),
        dividend: converter(data?.body?.incomeDistributionVO),
        totalAreaFlag: data?.totalAreaFlag,
      };
    } catch (error) {
      console.warn('查询年度详情表格数据', '-->', error);
    } finally {
      this._loading = false;
    }
  }
}
export default new TableService();

interface IAnnualDetailsRes {
  title: string[];
  body: {
    benchmarkVO: IAnnualDetailsProjectItem; // 能耗基准
    energyRetrofitBeforeVO: IAnnualDetailsProjectItem; // 改造前能耗
    energySavingVO: IAnnualDetailsProjectItem; // 节能量
    energyRetrofitAfterVO: IAnnualDetailsProjectItem; // 改造后能耗
    totalEnergySavingVO: IAnnualDetailsProjectItem; // 总经营节能量
    energyAdjustmentVO: IAnnualDetailsProjectItem; // 调差
    businessSummaryVO: IAnnualDetailsProjectItem; // 经营汇总
    feasibilityResearchVO: IAnnualDetailsProjectItem; // 与原可研对比
    incomeDistributionVO: IAnnualDetailsProjectItem; // 国网&天溯&合作伙伴
  };
  totalAreaFlag: boolean;
}
interface IAnnualDetailsProjectItem {
  modelName: string;
  energyValueList?: Array<IAnnualDetailsEnergyItem>;
  valueList?: Array<IAnnualDetailsUnitItem>;
  total?: IAnnualDetailsUnitItem;
  itemTotalFlag?: boolean;
  areaFlag?: boolean;
}
interface IAnnualDetailsEnergyItem {
  itemName: string;
  areaName: string;
  amount: IAnnualDetailsUnitItem; // 能耗量 | 节能量
  price: IAnnualDetailsUnitItem; // 单价
  payment: IAnnualDetailsUnitItem; // 单项能耗费用 | 节约费用
  itemTotal: IAnnualDetailsUnitItem;
  itemTotalFlag?: boolean;
  areaFlag?: boolean;
}
interface IAnnualDetailsUnitItem {
  itemName?: string;
  name?: string;
  unit: string;
  values: string[];
}
