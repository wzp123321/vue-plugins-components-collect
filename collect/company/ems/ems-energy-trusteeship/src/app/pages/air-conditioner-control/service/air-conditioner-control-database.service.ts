import { Injectable } from '@angular/core';
import { CResSubject } from 'src/app/core/communication/communication.api';
import {
  ACC_ICardItem,
  ACC_IChartItem,
  ACC_IEfficiencyRatio,
  ACC_IMonthChart,
  ACC_IOverviewItem,
  ACC_IQuery,
  ACC_IStrategyItem,
  ACC_IStrategyProcessItem,
  ACC_ISystemItem,
} from '../air-conditioner-control.api';
import { AirConditionerControlServiceModule } from './air-conditioner-control.service.module';

@Injectable({
  providedIn: AirConditionerControlServiceModule,
})
export class AirConditionerControlDatabaseService {
  //#region 响应式数据管理
  // 系统
  public readonly refSystemList$ = new CResSubject<ACC_ISystemItem[]>();
  public readonly refModeName$ = new CResSubject<string>('PLC自动模式');

  // 卡片
  public readonly refParamCardList$ = new CResSubject<{
    ratio: ACC_IEfficiencyRatio;
    temperature: ACC_ICardItem;
    load: ACC_ICardItem;
  }>();
  public readonly refLoadRateCard$ = new CResSubject<{ host: ACC_ICardItem; children: ACC_ICardItem[] }>();
  public readonly refMonthChart$ = new CResSubject<ACC_IMonthChart>();

  // 预览
  public readonly refOverview$ = new CResSubject<ACC_IOverviewItem>();

  // 负荷预测
  public readonly refPredictChart$ = new CResSubject<ACC_IChartItem>();

  // 节能量统计
  public readonly refStatisticsChart$ = new CResSubject<ACC_IChartItem>();

  // 空调运行优化策略
  public readonly refTodayStrategy$ = new CResSubject<{ date: Date; list: ACC_IStrategyItem[] }>();
  public readonly refMoreStrategy$ = new CResSubject<Array<{ date: string; list: ACC_IStrategyItem[] }>>();
  public readonly refStrategyProcess$ = new CResSubject<ACC_IStrategyProcessItem>();
  //#endregion

  //#region 内部持有数据管理
  // 查询参数
  private _dataQuery: ACC_IQuery;
  public set dataQuery(v: ACC_IQuery) {
    this._dataQuery = v;
  }
  public get dataQuery(): ACC_IQuery {
    return { ...this._dataQuery };
  }
  //#endregion
  constructor() {}
}
