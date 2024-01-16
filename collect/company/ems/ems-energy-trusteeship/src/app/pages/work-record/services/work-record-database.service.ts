import { EventEmitter, Injectable } from '@angular/core';
import { WR_IWorkList, WR_IWorkPreview } from '../work-record.api';
import { WorkRecordServiceModule } from './work-record-service.module';

@Injectable({
  providedIn: WorkRecordServiceModule,
})
export class WorkRecordDatabaseService {
  //#region 事件管理
  // 日历日期变更事件
  public readonly Event_Calendar_DateChange = new EventEmitter<Date>();

  // 列表数据加载事件
  public readonly Event_List_DataLoad = new EventEmitter<WR_IWorkList>();
  //#endregion

  //#region 状态管理
  private readonly _Status = {
    _Calendar: { Searching: false },
    _List: { Searching: false },
  };

  // 日历
  public set State_Calendar_Searching(v: boolean) {
    this._Status._Calendar.Searching = v;
  }
  public get State_Calendar_Searching(): boolean {
    return this._Status._Calendar.Searching;
  }

  // 列表
  public set State_List_Searching(v: boolean) {
    this._Status._List.Searching = v;
  }
  public get State_List_Searching(): boolean {
    return this._Status._List.Searching;
  }
  //#endregion

  //#region 数据管理
  // 日历
  private _CalendarData: WR_IWorkPreview[] = [];

  public get Data_Calendar(): WR_IWorkPreview[] {
    return [...this._CalendarData];
  }

  public setCalendarData(data: WR_IWorkPreview[]) {
    this._CalendarData = data ?? [];
  }
  //#endregion

  constructor() {
    Object.freeze(this._Status);
  }
}
