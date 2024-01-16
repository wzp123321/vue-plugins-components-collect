import { EventEmitter, Injectable } from '@angular/core';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import {
  EE_EEventType,
  EE_ICardItem,
  EE_IChartEventItem,
  EE_IClassificationItem,
  EE_IDetailInfo,
  EE_IDetailTable,
  EE_IEventAdditionInfo,
  EE_IEventBaseInfo,
  EE_IEventItem,
  EE_IQuery,
} from '../energy-event.api';
import { EnergyEventServiceModule } from './energy-event.service.module';

@Injectable({
  providedIn: EnergyEventServiceModule,
})
export class EnergyEventDatabaseService {
  //#region 事件管理
  // 搜索栏数据确认事件
  public readonly Event_SearchBar_DataComfirm = new EventEmitter<boolean>();

  // 图表数据加载事件
  public readonly Event_Chart_DataLoad = new EventEmitter<boolean>();

  // 卡片类型选择事件
  public readonly Event_Cards_TypeSelect = new EventEmitter<EE_EEventType>();

  // 数据表分页器选项变更事件
  public readonly Event_Table_PaginationChange = new EventEmitter<void>();

  // 表单数据加载事件
  public readonly Event_Form_DataLoad = new EventEmitter<{
    base: EE_IEventBaseInfo;
    addition: EE_IEventAdditionInfo;
  }>();

  // 表单数据变更事件
  public readonly Event_Form_DataChange = new EventEmitter<{
    success: boolean;
    eventId?: number | null;
    reset?: boolean;
    drop?: boolean;
  }>();

  // 详情数据加载事件
  public readonly Event_Detail_DataLoad = new EventEmitter<{
    item: EE_IDetailInfo;
    table: EE_IDetailTable;
  }>();
  //#endregion

  //#region 状态管理
  private readonly _Status = {
    _SearchBar: { Initializing: false, Searching: false },
    _Chart: { Searching: false },
    _Cards: { Searching: false },
    _Table: { Searching: false, Exporting: false },
    _Form: { Searching: false, Saving: false },
    _Detail: { Searching: false, Downloading: false },
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

  // 图表
  public set State_Chart_Searching(v: boolean) {
    this._Status._Chart.Searching = v;
  }
  public get State_Chart_Searching(): boolean {
    return this._Status._Chart.Searching;
  }

  // 卡片
  public set State_Cards_Searching(v: boolean) {
    this._Status._Cards.Searching = v;
  }
  public get State_Cards_Searching(): boolean {
    return this._Status._Cards.Searching;
  }

  // 表格
  public set State_Table_Searching(v: boolean) {
    this._Status._Table.Searching = v;
  }
  public get State_Table_Searching(): boolean {
    return this._Status._Table.Searching;
  }

  public set State_Table_Exporting(v: boolean) {
    this._Status._Table.Exporting = v;
  }
  public get State_Table_Exporting(): boolean {
    return this._Status._Table.Exporting;
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

  // 详情
  public set State_Detail_Searching(v: boolean) {
    this._Status._Detail.Searching = v;
  }
  public get State_Detail_Searching(): boolean {
    return this._Status._Detail.Searching;
  }

  public set State_Detail_Downloading(v: boolean) {
    this._Status._Detail.Downloading = v;
  }
  public get State_Detail_Downloading(): boolean {
    return this._Status._Detail.Downloading;
  }
  //#endregion

  //#region 数据管理

  // 搜索栏
  private _SearchBarData: EE_IQuery = {
    date: null,
    type: 0,
    index: 1,
    size: 10,
  };

  public set Data_SearchBar_Type(v: EE_EEventType) {
    this._SearchBarData.type = v;
  }
  public get Data_SearchBar_Type(): EE_EEventType {
    return this._SearchBarData.type;
  }

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

  public get Data_SearchBar(): EE_IQuery {
    return this._SearchBarData;
  }

  public setSearchBarData(data: EE_IQuery): void {
    this._SearchBarData = {
      date: data.date,
      type: data.type ?? 0,
      index: data.index ?? 1,
      size: data.size ?? 10,
    };
  }

  // 单位
  private _UnitData = { cost: null as string };

  public set Data_Unit_Cost(v: string) {
    this._UnitData.cost = v;
  }
  public get Data_Unit_Cost(): string {
    return this._UnitData.cost;
  }

  // 图表
  private _ChartData = {
    zoom: [null, null] as [Date, Date],
    series: [] as [Date, number][],
    events: new Map<number, EE_IChartEventItem[]>(),
  };

  public get Data_Chart_Zoom(): [Date, Date] {
    return this._ChartData.zoom;
  }

  public get Data_Chart_Series(): [Date, number][] {
    return this._ChartData.series;
  }

  public get Data_Chart_Events(): Map<number, EE_IChartEventItem[]> {
    return this._ChartData.events;
  }

  public setChartData(
    zoom: [Date, Date],
    series: [Date, number][],
    events?: Map<number, EE_IChartEventItem[]>
  ): void {
    this._ChartData.zoom = zoom ?? [null, null];
    this._ChartData.series = series ?? [];
    this._ChartData.events = events ?? new Map<number, EE_IChartEventItem[]>();
  }

  // 卡片
  private _CardsData = new Map<EE_EEventType, EE_ICardItem>();

  public get Data_Cards(): Map<EE_EEventType, EE_ICardItem> {
    return this._CardsData;
  }

  public setCardsData(data: Map<EE_EEventType, EE_ICardItem>): void {
    this._CardsData = data ?? new Map<EE_EEventType, EE_ICardItem>();
  }

  // 表格
  private _TableData = { total: null as number, list: [] as EE_IEventItem[] };

  public get Data_Table_Total(): number {
    return this._TableData.total;
  }

  public get Data_Table_List(): EE_IEventItem[] {
    return this._TableData.list;
  }

  public setTableData(total: number, list: EE_IEventItem[]): void {
    this._TableData.total = total;
    this._TableData.list = list ?? [];
  }

  // 表单
  private _FormData = {
    types: [] as EE_EEventType[],
    classifications: [] as EE_IClassificationItem[],
    equipments: [] as { label: string; value: string }[],
    nodes: [] as NzTreeNodeOptions[],
    expands: [] as string[],
  };

  public set Data_Form_Types(v: EE_EEventType[]) {
    this._FormData.types = v;
  }
  public get Data_Form_Types(): EE_EEventType[] {
    return this._FormData.types ?? [];
  }

  public set Data_Form_Classifications(v: EE_IClassificationItem[]) {
    this._FormData.classifications = v;
  }
  public get Data_Form_Classifications(): EE_IClassificationItem[] {
    return this._FormData.classifications;
  }

  public set Data_Form_Equipments(v: { label: string; value: string }[]) {
    this._FormData.equipments = v;
  }
  public get Data_Form_Equipments(): { label: string; value: string }[] {
    return this._FormData.equipments;
  }

  public get Data_Form_Nodes(): NzTreeNodeOptions[] {
    return this._FormData.nodes;
  }

  public get Data_Form_Expands(): string[] {
    return this._FormData.expands;
  }

  public setFormDataOfTree(
    nodes?: NzTreeNodeOptions[],
    expands?: string[]
  ): void {
    this._FormData.nodes = nodes ?? [];
    this._FormData.expands = expands ?? [];
  }
  //#endregion

  constructor() {
    Object.freeze(this._Status);
  }
}
