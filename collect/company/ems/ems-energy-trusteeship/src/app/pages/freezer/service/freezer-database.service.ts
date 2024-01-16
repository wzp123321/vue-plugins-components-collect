import { EventEmitter, Injectable } from '@angular/core';
import { CResSubject } from 'src/app/core/communication/communication.api';
import {
  F_IAnalysisSource,
  F_IBenchmarkItem,
  F_IEfficiencyNodeItem,
  F_IOptionItem,
  F_IParameterItem,
  F_IPowerItem,
  F_IQuery,
} from '../freezer.api';
import { FreezerServiceModule } from './freezer.service.module';

@Injectable({ providedIn: FreezerServiceModule })
export class FreezerDatabaseService {
  //#region 响应式数据管理
  // 搜索栏
  public readonly refSearchEvent = new EventEmitter<void>();
  public readonly refEfficiencyNodes$ = new CResSubject<F_IEfficiencyNodeItem[]>();
  public readonly refParameterTypes$ = new CResSubject<F_IOptionItem<string>[]>();

  // 能耗总览
  public readonly refPowerValues$ = new CResSubject<F_IPowerItem>();

  // 能效对标
  public readonly refBenchmarkValues$ = new CResSubject<{ standards: F_IBenchmarkItem[]; current: F_IBenchmarkItem }>();

  // 参数水平
  public readonly refParameterList$ = new CResSubject<F_IParameterItem[]>();

  // 能效分析
  public readonly refAnalysisValues$ = new CResSubject<F_IAnalysisSource>();
  public readonly refAnalysisExport$ = new CResSubject();

  // 参数排名
  public readonly refParameterRank$ = new CResSubject<{ param: string; list: F_IParameterItem[] }>();
  //#endregion

  //#region 内部持有数据管理
  // 查询参数
  private _dataQuery: F_IQuery;
  public set dataQuery(v: F_IQuery) {
    this._dataQuery = v;
  }
  public get dataQuery(): F_IQuery {
    return { ...this._dataQuery };
  }
  //#endregion

  constructor() {}
}
