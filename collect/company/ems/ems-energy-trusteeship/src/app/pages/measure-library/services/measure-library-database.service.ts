import { EventEmitter, Injectable } from '@angular/core';
import { ML_IQuery, ML_IMeasureItem } from '../measure-library.api';
import { MeasureLibraryServiceModule } from './measure-library.service.module';

@Injectable({
  providedIn: MeasureLibraryServiceModule,
})
export class MeasureLibraryDatabaseService {
  //#region 事件管理
  // 数据表分页器选项变更事件
  public readonly Event_Table_PaginationChange = new EventEmitter<void>();

  // 表单数据变更事件
  public readonly Event_Form_DataChange = new EventEmitter<{ success: boolean; reset?: boolean; drop?: boolean }>();
  //#endregion

  //#region 状态管理
  private readonly _Status = {
    _SearchBar: { Initializing: false, Searching: false },
    _Toolbar: { Exporting: false, Importing: false, Downloading: false },
    _Form: { Saving: false },
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

  // 功能栏
  public set State_Toolbar_Exporting(v: boolean) {
    this._Status._Toolbar.Exporting = v;
  }
  public get State_Toolbar_Exporting(): boolean {
    return this._Status._Toolbar.Exporting;
  }

  public set State_Toolbar_Importing(v: boolean) {
    this._Status._Toolbar.Importing = v;
  }
  public get State_Toolbar_Importing(): boolean {
    return this._Status._Toolbar.Importing;
  }

  public set State_Toolbar_Downloading(v: boolean) {
    this._Status._Toolbar.Downloading = v;
  }
  public get State_Toolbar_Downloading(): boolean {
    return this._Status._Toolbar.Downloading;
  }

  // 表单
  public set State_Form_Saving(v: boolean) {
    this._Status._Form.Saving = v;
  }
  public get State_Form_Saving(): boolean {
    return this._Status._Form.Saving;
  }
  //#endregion

  //#region 数据管理
  // 搜索栏
  private _SearchBarData: ML_IQuery = { name: null, code: null, system: null, state: null, index: 1, size: 10 };

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

  public get Data_SearchBar(): ML_IQuery {
    return this._SearchBarData;
  }

  public setSearchBarData(data: ML_IQuery) {
    this._SearchBarData = {
      name: data.name,
      code: data.code,
      system: data.system,
      state: data.state,
      index: data.index ?? 1,
      size: data.size ?? 10,
    };
  }

  // 数据表
  private _TableData = { total: null as number, list: [] as ML_IMeasureItem[] };

  public get Data_Table_Total(): number {
    return this._TableData.total;
  }

  public get Data_Table_List(): ML_IMeasureItem[] {
    return [...this._TableData.list];
  }

  public setTableData(total: number, list: ML_IMeasureItem[]): void {
    this._TableData.total = total;
    this._TableData.list = list ?? [];
  }
  //#endregion

  constructor() {
    Object.freeze(this._Status);
  }
}
