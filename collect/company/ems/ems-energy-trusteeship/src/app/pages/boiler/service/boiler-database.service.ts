import { EventEmitter, Injectable } from '@angular/core';
import { CResSubject } from 'src/app/core/communication/communication.api';
import {
  B_EfficiencyItem,
  B_IAnalysisSource,
  B_IBenchmarkItem,
  B_IEfficiencyNodeItem,
  B_IOptionItem,
  B_IParameterItem,
  B_IQuery,
} from '../boiler.api';
import { BoilerServiceModule } from './boiler.service.module';

@Injectable({ providedIn: BoilerServiceModule })
export class BoilerDatabaseService {
  //#region 响应式数据管理
  // 搜索栏
  public readonly refSearchEvent = new EventEmitter<void>();
  public readonly refEfficiencyNodes$ = new CResSubject<B_IEfficiencyNodeItem[]>();
  public readonly refParameterTypes$ = new CResSubject<B_IOptionItem<string>[]>();

  // 投入产出效率总览
  public readonly refEfficiencyValues$ = new CResSubject<B_EfficiencyItem>();

  // 能效对标
  public readonly refBenchmarkValues$ = new CResSubject<{ standards: B_IBenchmarkItem[]; current: B_IBenchmarkItem }>();

  // 参数水平
  public readonly refParameterList$ = new CResSubject<B_IParameterItem[]>();

  // 能效分析
  public readonly refAnalysisValues$ = new CResSubject<B_IAnalysisSource>();
  public readonly refAnalysisExport$ = new CResSubject();

  // 参数排名
  public readonly refParameterRank$ = new CResSubject<{ param: string; list: B_IParameterItem[] }>();
  //#endregion

  //#region 内部持有数据管理
  // 查询参数
  private _dataQuery: B_IQuery;
  public set dataQuery(v: B_IQuery) {
    this._dataQuery = v;
  }
  public get dataQuery(): B_IQuery {
    return { ...this._dataQuery };
  }
  //#endregion

  constructor() {}
}
