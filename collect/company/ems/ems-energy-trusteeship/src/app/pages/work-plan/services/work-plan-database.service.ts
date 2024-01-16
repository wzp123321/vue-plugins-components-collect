import { EventEmitter, Injectable } from '@angular/core';
import { WP_IPlanInfo, WP_IPlanItem, WP_IQuery } from '../work-plan.api';
import { WorkPlanServiceModule } from './work-plan-service.module';

@Injectable({
  providedIn: WorkPlanServiceModule,
})
export class WorkPlanDatabaseService {
  //#region 事件管理
  // 数据表分页器选项变更事件
  public readonly Event_Table_PaginationChange = new EventEmitter<void>();

  // 表单数据变更事件
  public readonly Event_Form_DataChange = new EventEmitter<{ success: boolean; reset?: boolean; drop?: boolean }>();

  // 表单数据加载事件
  public readonly Event_Form_DataLoad = new EventEmitter<WP_IPlanInfo>();
  //#endregion

  //#region 状态管理
  private readonly _Status = {
    _SearchBar: { Initializing: false, Searching: false },
    _Form: { Searching: false, Saving: false },
  };

  // 搜索栏
  public set State_SearchBar_Initializing(v: boolean) {
    this._Status._SearchBar.Initializing = v;
  }
  public get State_SearchBar_Initializing(): boolean {
    return this._Status._SearchBar.Initializing;
  }

  public set State_SearchBar_Searching(v: boolean) {
    this._Status._SearchBar.Searching = v;
  }
  public get State_SearchBar_Searching(): boolean {
    return this._Status._SearchBar.Searching;
  }

  // 表单
  public set State_Form_Searching(v: boolean) {
    this._Status._Form.Searching = v;
  }
  public get State_Form_Searching(): boolean {
    return this._Status._Form.Searching;
  }

  public set State_Form_Saving(v: boolean) {
    this._Status._Form.Saving = v;
  }
  public get State_Form_Saving(): boolean {
    return this._Status._Form.Saving;
  }
  //#endregion

  //#region 数据管理
  // 搜索栏
  private _SearchBarData: WP_IQuery = { name: null, code: null, state: null, index: 1, size: 10 };

  public set Data_SearchBar_Index(v: number) {
    this._SearchBarData.index = v;
  }
  public get Data_SearchBar_Index(): number {
    return this._SearchBarData.index;
  }

  public set Data_SearchBar_Size(v: number) {
    this._SearchBarData.size = v;
  }
  public get Data_SearchBar_Size(): number {
    return this._SearchBarData.size;
  }

  public get Data_SearchBar(): WP_IQuery {
    return this._SearchBarData;
  }

  public setSearchBarData(data: WP_IQuery) {
    this._SearchBarData = {
      name: data.name,
      code: data.code,
      state: data.state,
      index: data.index ?? 1,
      size: data.size ?? 10,
    };
  }

  // 数据表
  private _TableData = { total: null as number, list: [] as WP_IPlanItem[] };

  public get Data_Table_Total(): number {
    return this._TableData.total;
  }

  public get Data_Table_List(): WP_IPlanItem[] {
    return [...this._TableData.list];
  }

  public setTableData(total: number, list: WP_IPlanItem[]): void {
    this._TableData.total = total;
    this._TableData.list = list ?? [];
  }
  //#endregion

  constructor() {
    Object.freeze(this._Status);
  }
}
