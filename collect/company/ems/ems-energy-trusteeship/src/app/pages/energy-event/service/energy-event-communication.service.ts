import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { getStorageData } from '@tiansu/tools';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { map, switchMap } from 'rxjs';
import {
  FBlobHandler,
  FConvertToBoolean,
  FConvertToDate,
  FConvertToNumber,
  FGetUploadFiles,
  FResHandler,
  IRes,
} from 'src/app/core/communication/communication.api';
import {
  EE_EAdjustType,
  EE_EAreaEntryMode,
  EE_EAreaTreeType,
  EE_EChangeType,
  EE_EEquipmentEntryMode,
  EE_EEventType,
  EE_ENodeEntryMode,
  EE_IAttachItem,
  EE_ICardItem,
  EE_IChartEventItem,
  EE_IClassificationItem,
  EE_IDetailInfo,
  EE_IDetailTable,
  EE_IEventAdditionInfo,
  EE_IEventBaseInfo,
  EE_IEventItem,
  EE_IQuery,
  EE_IRelationInfo,
} from '../energy-event.api';
import { EnergyEventDatabaseService } from './energy-event-database.service';
import { EnergyEventServiceModule } from './energy-event.service.module';

const PATH = {
  获取能耗单位: '/energy/ems-api/energyEvent/queryTotalEnergyUnit',
  删除能源事件: '/energy/ems-api/energyEvent/deleteEvent',
  导出能源事件: '/energy/ems-api/energyEvent/exportExcelEnergyEvent',
  判断查询年是否有数据: '/energy/ems-api/energyEvent/isHaveData',
  设备列表: '/energy/ems-api/energyEvent/listDeviceByDeviceName',
  卡片列表: '/energy/ems-api/energyEvent/queryEventCardList',
  能源事件详情: '/energy/ems-api/energyEvent/queryEventDetails',
  能源事件分页列表: '/energy/ems-api/energyEvent/queryEventList',
  查询能源事件对象: '/energy/ems-api/energyEvent/queryEventObject',
  时间轴折线图: '/energy/ems-api/energyEvent/queryEventTimeAxisChart',
  能源事件类型数据: '/energy/ems-api/energyEvent/queryEventTypeList',
  保存能源事件: '/energy/ems-api/energyEvent/saveEventForm',

  保存关联关系: '/energy/ems-api/boundary/energy/addEvent',

  分类分项能源:
    '/energy/ems-api/admin/energy/code/listEnergyParentCodeExcludeTotal',
  区域业态树: '/energy/ems-api/admin/tree/listTreeByEnergyCodeWithoutAuthority',
};

@Injectable({
  providedIn: EnergyEventServiceModule,
})
export class EnergyEventCommunicationService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private http: HttpClient,
    private nzMessage: NzMessageService,
    private sDatabase: EnergyEventDatabaseService
  ) {}

  /**
   * 获取能耗单位
   */
  public queryTotalEnergyUnit(): void {
    this.http
      .post<IRes<string>>(PATH.获取能耗单位, null)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: (v) => {
          this.sDatabase.Data_Unit_Cost = v;
        },
        error: (error) => {
          console.warn(`获取能耗单位 -> ${error}`);
          this.sDatabase.Data_Unit_Cost = null;
        },
      });
  }

  /**
   * 删除能源事件
   * @param id 事件id
   */
  public deleteEvent(id: number): void {
    const body: number = id;
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.删除能源事件, body)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: () => {
          this.nzMessage.success('删除成功');
          this.sDatabase.Event_Form_DataChange.emit({
            success: true,
            reset: false,
            drop: true,
          });
        },
        error: (error) => {
          console.warn(`删除能源事件 -> ${error}`);
          ''.toLowerCase();
          if (error && !error.toloca?.includes('login')) {
            this.nzMessage.error(`删除失败，${error}`);
          }
          this.sDatabase.Event_Form_DataChange.emit({ success: false });
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Saving = false;
      });
  }

  /**
   * 导出能源事件
   * @param req 查询参数
   */
  public exportExcelEnergyEvent(req: EE_IQuery): void {
    const body: number = +formatDate(req.date, 'yyyy', this.locale);
    this.sDatabase.State_Table_Exporting = true;
    this.http
      .post(PATH.导出能源事件, body, { responseType: 'blob' })
      .pipe(switchMap((res) => FBlobHandler(res, '能源事件信息.xlsx')))
      .subscribe({
        next: () => {
          this.nzMessage.success('导出成功');
        },
        error: (error) => {
          console.warn(`导出能源事件 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`导出失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Table_Exporting = false;
      });
  }

  /**
   * 判断查询年是否有数据
   * @param req 查询参数
   */
  public isHaveData(req: EE_IQuery): void {
    const body: number = +formatDate(req.date, 'yyyy', this.locale);
    this.sDatabase.State_SearchBar_Searching = true;
    this.http
      .post<IRes<boolean>>(PATH.判断查询年是否有数据, body)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: (v) => {
          this.sDatabase.Event_SearchBar_DataComfirm.emit(v);
        },
        error: (error) => {
          console.warn(`判断查询年是否有数据 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
          this.sDatabase.Event_SearchBar_DataComfirm.emit(false);
        },
      })
      .add(() => {
        this.sDatabase.State_SearchBar_Searching = false;
      });
  }

  /**
   * 设备列表
   * @param name 设备名称
   */
  public listDeviceByDeviceName(name?: string): void {
    const body: string = name ?? null;
    this.sDatabase.State_Form_Searching = true;
    this.sDatabase.Data_Form_Equipments = [];
    this.http
      .post<IRes<IDeviceDataItem[]>>(PATH.设备列表, body)
      .pipe(
        map((res): { label: string; value: string }[] => {
          const data = FResHandler(res);
          return data.map((item) => ({
            label: item.deviceName,
            value: item.deviceId?.toString(),
          }));
        })
      )
      .subscribe({
        next: (v) => {
          this.sDatabase.Data_Form_Equipments = v;
        },
        error: (error) => {
          console.warn(`设备列表 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Searching = false;
      });
  }

  /**
   * 卡片列表
   * @param req 查询参数
   */
  public queryEventCardList(req: EE_IQuery): void {
    const body: number = +formatDate(req.date, 'yyyy', this.locale);
    this.sDatabase.State_Cards_Searching = true;
    this.http
      .post<IRes<IQueryEventCardListDataItem[]>>(PATH.卡片列表, body)
      .pipe(
        map((res): Map<EE_EEventType, EE_ICardItem> => {
          const data = FResHandler(res);
          return new Map<EE_EEventType, EE_ICardItem>(
            data.map((card) => [
              card.id,
              { count: card.count, consumption: card.value, cost: card.cost },
            ])
          );
        })
      )
      .subscribe({
        next: (v) => {
          this.sDatabase.setCardsData(v);
        },
        error: (error) => {
          console.warn(`卡片列表 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Cards_Searching = false;
      });
  }
  /**
   * 获取缓存数据
   * @param name
   * @returns
   */
  private FGetStorageData(name: string) {
    return getStorageData(name);
  }
  /**
   * 能源事件详情
   * @param id 事件id
   */
  public queryEventDetails(id: number): void {
    const body: number = id;
    this.sDatabase.State_Detail_Searching = true;
    this.http
      .post<IRes<IQueryEventDetailsData>>(PATH.能源事件详情, body)
      .pipe(
        map((res): { item: EE_IDetailInfo; table: EE_IDetailTable } => {
          const data = FResHandler(res);
          const photos: EE_IAttachItem[] = [];
          const files: EE_IAttachItem[] = [];
          data.baseInfo?.fileList?.forEach((item) => {
            if (item.imgFlag) {
              photos.push({
                id: item.fileId,
                name: item.fileName,
                src:
                  '/energy/ems-api/file/downloadSingleFile/' +
                  item.fileUrl +
                  '.png?tenantCode=' +
                  this.FGetStorageData('energy-corpid'),
              });
            } else {
              files.push({
                id: item.fileId,
                name: item.fileName,
                src:
                  '/energy/ems-api/file/downloadSingleFile/' +
                  item.fileUrl +
                  '.png?tenantCode=' +
                  this.FGetStorageData('energy-corpid'),
              });
            }
          });
          return {
            item: {
              type: data.baseInfo?.eventTypeId,
              title: data.baseInfo?.eventTitle,
              photos,
              files,
              description: data.baseInfo?.eventDetail,
              person: data.baseInfo?.entryPersonnel,
              from: data.baseInfo?.startTime,
              to: data.baseInfo?.endTime,
              mode: FConvertToNumber(data.baseInfo?.entryMode),
              changeType: FConvertToNumber(data.baseInfo?.changeType),
              adjustType: FConvertToNumber(data.baseInfo?.adjustmentType),
              select: data.baseInfo?.energyObjects,
              relations:
                data.baseInfo?.relationData?.map((relation) => ({
                  name: relation.codeName,
                  value: relation.codeValue,
                })) ?? [],
            },
            table: {
              header: data.table?.theadNameList,
              body: data.table?.tbodyValueList,
            },
          };
        })
      )
      .subscribe({
        next: ({ item, table }) => {
          this.sDatabase.Event_Detail_DataLoad.emit({ item, table });
        },
        error: (error) => {
          console.warn(`能源事件详情 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
          this.sDatabase.Event_Detail_DataLoad.emit(null);
        },
      })
      .add(() => {
        this.sDatabase.State_Detail_Searching = false;
      });
  }

  /**
   * 能源事件分页列表
   * @param req 查询参数
   */
  public queryEventList(req: EE_IQuery): void {
    const body: IQueryEventListBody = {
      eventTypeId: req.type,
      pageNum: req.index,
      pageSize: req.size,
      queryTime: +formatDate(req.date, 'yyyy', this.locale),
      searchCount: true,
    };
    this.sDatabase.State_Table_Searching = true;
    this.http
      .post<IRes<IQueryEventListData>>(PATH.能源事件分页列表, body)
      .pipe(
        map((res): { total: number; list: EE_IEventItem[] } => {
          const data = FResHandler(res);
          return {
            total: data.total,
            list: data.list
              .filter((item) => !req.type || item.eventTypeId === req.type)
              .map(
                (item, index): EE_IEventItem => ({
                  id: item.id,
                  index: (data.pageNum - 1) * data.pageSize + index + 1,
                  title: item.title,
                  type: item.eventTypeId,
                  begin:
                    item.eventTypeId === EE_EEventType.空调供应时段调整
                      ? null
                      : FConvertToDate(item.startTime),
                  end:
                    item.eventTypeId === EE_EEventType.空调供应时段调整
                      ? null
                      : FConvertToDate(item.endTime),
                  originalTime:
                    item.eventTypeId === EE_EEventType.空调供应时段调整
                      ? FConvertToDate(item.startTime)
                      : null,
                  adjustTime:
                    item.eventTypeId === EE_EEventType.空调供应时段调整
                      ? FConvertToDate(item.endTime)
                      : null,
                  description: item.detail,
                  consumption: item.energyValue,
                  cost: item.energyCost,
                  entryTime: item.entryTime,
                })
              )
              .sort((a, b) => a.index - b.index),
          };
        })
      )
      .subscribe({
        next: ({ total, list }) => {
          this.sDatabase.setTableData(total, list);
        },
        error: (error) => {
          console.warn(`能源事件分页列表 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Table_Searching = false;
      });
  }

  /**
   * 查询能源事件对象
   * @param id 事件id
   */
  public queryEventObject(id: number): void {
    const body: number = id;
    this.sDatabase.State_Form_Searching = true;
    this.http
      .post<IRes<IQueryEventObjectBody>>(PATH.查询能源事件对象, body)
      .pipe(
        map(
          (
            res
          ): { base: EE_IEventBaseInfo; addition: EE_IEventAdditionInfo } => {
            const data = FResHandler(res);
            const photos: EE_IAttachItem[] = [];
            const files: EE_IAttachItem[] = [];
            data.fileList?.forEach((item) => {
              if (item.imgFlag) {
                photos.push({
                  id: item.fileId,
                  name: item.fileName,
                  src:
                    '/energy/ems-api/file/downloadSingleFile/' +
                    item.fileUrl +
                    '.png?tenantCode=' +
                    this.FGetStorageData('energy-corpid'),
                });
              } else {
                files.push({
                  id: item.fileId,
                  name: item.fileName,
                  src:
                    '/energy/ems-api/file/downloadSingleFile/' +
                    item.fileUrl +
                    '.png?tenantCode=' +
                    this.FGetStorageData('energy-corpid'),
                });
              }
            });

            let type: EE_EChangeType | EE_EAdjustType = null;
            let id: string = null;
            let ids: string[] = [];
            switch (data.eventTypeId) {
              case EE_EEventType.用能区域变化:
              case EE_EEventType.区域业务调整:
                id = data.energyObjects;
                break;
              case EE_EEventType.大功率用能设备变更:
                type = FConvertToNumber(data.changeType);
                ids = data.energyObjects?.split(',') ?? [];
                break;
              case EE_EEventType.空调供应时段调整:
                type = FConvertToNumber(data.adjustmentType);
                ids = data.energyObjects?.split(',') ?? [];
                break;
              default:
                break;
            }

            return {
              base: {
                id: data.id,
                type: data.eventTypeId,
                title: data.eventTitle,
                photos,
                files,
                description: data.eventDetail,
                deleteAttaches: [],
              },
              addition: {
                event: data.eventTypeId,
                from: FConvertToDate(data.startTime),
                to: FConvertToDate(data.endTime),
                type,
                mode: FConvertToNumber(data.entryMode),
                id,
                ids,
                relations: data.relationData?.map((relation) => ({
                  code: relation.energyCode,
                  name: relation.codeName,
                  value: relation.codeValue,
                  unit: relation.codeUnit,
                })),
              },
            };
          }
        )
      )
      .subscribe({
        next: ({ base, addition }) => {
          this.sDatabase.Event_Form_DataLoad.emit({ base, addition });
        },
        error: (error) => {
          console.warn(`查询能源事件对象 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
          this.sDatabase.Event_Form_DataLoad.emit({
            base: null,
            addition: null,
          });
        },
      })
      .add(() => {
        this.sDatabase.State_Detail_Searching = false;
      });
  }

  /**
   * 时间轴折线图
   * @param req 查询参数
   */
  public queryEventTimeAxisChart(req: EE_IQuery): void {
    const body: number = +formatDate(req.date, 'yyyy', this.locale);
    this.sDatabase.State_Chart_Searching = true;
    this.http
      .post<IRes<IQueryEventTimeAxisChartData>>(PATH.时间轴折线图, body)
      .pipe(
        map(
          (
            res
          ): {
            zoom: [Date, Date];
            series: [Date, number][];
            events?: Map<number, EE_IChartEventItem[]>;
          } => {
            const data = FResHandler(res);
            return {
              zoom: data.zoom.map((date) => FConvertToDate(date)) as [
                Date,
                Date
              ],
              series: Object.entries(data.series).map(([date, value]) => [
                FConvertToDate(date),
                value,
              ]),
              events: new Map<number, EE_IChartEventItem[]>(
                Object.entries(data.events).map(([date, events]) => [
                  +FConvertToDate(date),
                  events.map((event) => ({
                    type: event.type,
                    value: event.value,
                    title: event.title,
                    description: event.detail,
                  })),
                ])
              ),
            };
          }
        )
      )
      .subscribe({
        next: ({ zoom, series, events }) => {
          this.sDatabase.setChartData(zoom, series, events);
          this.sDatabase.Event_Chart_DataLoad.emit(true);
        },
        error: (error) => {
          console.warn(`时间轴折线图 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
          this.sDatabase.setChartData(null, null);
          this.sDatabase.Event_Chart_DataLoad.emit(false);
        },
      })
      .add(() => {
        this.sDatabase.State_Chart_Searching = false;
      });
  }

  /**
   * 能源事件类型数据
   */
  public queryEventTypeList(): void {
    this.sDatabase.State_Form_Searching = true;
    this.sDatabase.Data_Form_Types = [];
    this.http
      .post<IRes<number[]>>(PATH.能源事件类型数据, null)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: (v) => {
          this.sDatabase.Data_Form_Types = v;
        },
        error: (error) => {
          console.warn(`能源事件类型数据 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Searching = false;
      });
  }

  /**
   * 保存能源事件
   * @param base 基础信息
   * @param addition 分类信息
   */
  public saveEventForm(
    base: EE_IEventBaseInfo,
    addition: EE_IEventAdditionInfo
  ): void {
    const req: ISaveEventFormBodyItem = {
      adjustmentType:
        addition.event === EE_EEventType.空调供应时段调整
          ? (addition.type as EE_EAdjustType)
          : null,
      changeType:
        addition.event === EE_EEventType.大功率用能设备变更
          ? (addition.type as EE_EChangeType)
          : null,
      deleteFileIdList: base.deleteAttaches,
      endTime: addition.to
        ? formatDate(addition.to, 'yyyy-MM-dd', this.locale)
        : null,
      energyObjects: addition.ids?.length ? addition.ids.join() : addition.id,
      entryMode: addition.mode ?? null,
      eventDetail: base.description,
      eventTitle: base.title,
      eventTypeId: base.type,
      id: base.id,
      relationData: addition.relations?.map((relation) => ({
        codeValue: +relation.value,
        energyCode: relation.code,
        energyCodeName: relation.name,
        energyCodeUnit: relation.unit,
      })),
      startTime: addition.from
        ? formatDate(addition.from, 'yyyy-MM-dd', this.locale)
        : null,
    };
    const files = [
      ...base.photos.filter((photo) => !photo.id).map((photo) => photo.file),
      ...base.files.filter((file) => !file.id).map((file) => file.file),
    ];
    const body = FGetUploadFiles(files);
    body.append('paramJson', JSON.stringify(req));
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.保存能源事件, body)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: (v) => {
          this.nzMessage.success('保存成功');
          this.sDatabase.Event_Form_DataChange.emit({
            success: true,
            reset: true,
            eventId: Number(v),
          });
        },
        error: (error) => {
          console.warn(`保存能源事件 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`保存失败，${error}`);
          }
          this.sDatabase.Event_Form_DataChange.emit({ success: false });
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Saving = false;
      });
  }
  /**
   * 保存能源事件与异常关联关系
   * @param params
   */
  public saveAnomalyEventRelationShip(params: EE_IRelationInfo) {
    this.http
      .post<IRes>(PATH.保存关联关系, params)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: () => {},
        error: (error) => {},
      })
      .add(() => {});
  }

  /**
   * 分类分项能源
   */
  public getClassificationList(): void {
    this.sDatabase.State_Form_Searching = true;
    this.sDatabase.Data_Form_Classifications = [];
    this.http
      .post<IRes<IGetClassificationListDataItem[]>>(PATH.分类分项能源, null)
      .pipe(
        map((res): EE_IClassificationItem[] => {
          const data = FResHandler(res);
          return data.map((item) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            unit: item.unit,
          }));
        })
      )
      .subscribe({
        next: (v) => {
          this.sDatabase.Data_Form_Classifications = v;
        },
        error: (error) => {
          console.warn(`分类分项能源 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Searching = false;
      });
  }

  /**
   * 区域业态树
   * @param type 区域业态树类型
   */
  public getAreaTreeList(type: EE_EAreaTreeType): void {
    const body: IGetAreaTreeListBody = {
      treeType: type,
      energyCode: '00000',
      expandLevel: 2,
      wholeHospitalFlag: true,
    };
    this.sDatabase.State_Form_Searching = true;
    this.sDatabase.setFormDataOfTree();
    this.http
      .post<IRes<{ data: IGetAreaTreeListNode[]; expandTreeIds: string[] }>>(
        PATH.区域业态树,
        body
      )
      .pipe(
        map((res): { nodes: NzTreeNodeOptions[]; expands: string[] } => {
          const data = FResHandler(res);
          // console.log(data);
          const expands: string[] =
            data.expandTreeIds?.map((item) => item.toString()) ?? [];
          const handler = (node: IGetAreaTreeListNode): NzTreeNodeOptions => {
            // if (node.treeLevel < 3) {
            //   expands.push(node.id.toString());
            // }
            //  console.log(expands);
            return {
              title: node.treeName,
              key: node.id.toString(),
              isLeaf: FConvertToBoolean(node.treeLeaf),
              children: node.childTree?.map((child) => handler(child)) ?? [],
            };
          };

          return { nodes: data.data.map((node) => handler(node)), expands };
        })
      )
      .subscribe({
        next: ({ nodes, expands }) => {
          this.sDatabase.setFormDataOfTree(nodes, expands);
        },
        error: (error) => {
          console.warn(`区域业态树 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Searching = false;
      });
  }

  public download(url: string, name?: string): void {
    this.sDatabase.State_Detail_Downloading = true;
    this.http
      .get(url, { responseType: 'blob' })
      .pipe(switchMap((res) => FBlobHandler(res, name)))
      .subscribe({
        next: () => {
          this.nzMessage.success('下载成功');
        },
        error: (error) => {
          console.warn(`下载 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`下载失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Detail_Downloading = false;
      });
  }
}

interface IDeviceDataItem {
  deviceId: number;
  deviceName: string;
}

interface IQueryEventCardListDataItem {
  cost: string;
  name: string;
  count: number;
  id: number;
  value: string;
}

interface IQueryEventDetailsData {
  baseInfo: {
    eventTypeId?: number;
    eventTitle?: string;
    startTime?: string;
    endTime?: string;
    fileList?: {
      fileId: number;
      fileName: string;
      fileUrl: string;
      imgFlag: boolean;
    }[];
    eventDetail?: string;
    entryPersonnel?: string;
    entryMode?: string;
    relationData?: {
      codeName: string;
      codeValue: string;
      energyCode: string;
    }[];
    energyObjects?: string;
    adjustmentType?: string;
    changeType?: string;
  };
  table: {
    theadNameList?: string[];
    tbodyValueList?: string[][];
  };
}

interface IQueryEventListBody {
  eventTypeId: EE_EEventType;
  orders?: { asc: boolean; column: string }[];
  pageNum: number;
  pageSize: number;
  queryTime: number;
  searchCount: boolean;
}
interface IQueryEventListData {
  list: {
    detail: string;
    endTime: string;
    energyCost: string;
    energyValue: string;
    entryTime: string;
    eventTypeId: number;
    id: number;
    startTime: string;
    title: string;
  }[];
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
}

interface IQueryEventTimeAxisChartData {
  events: {
    [key: string]: {
      detail: string;
      title: string;
      type: number;
      value: number;
    }[];
  };
  series: { [key: string]: number };
  zoom: [string, string];
}

interface IQueryEventObjectBody {
  id: number;
  eventTypeId: number;
  eventTitle: string;
  startTime: string;
  endTime?: string;
  relationData?: {
    codeName: string;
    codeUnit: string;
    codeValue: string;
    energyCode: string;
  }[];
  fileList?: {
    fileId: number;
    fileName: string;
    fileUrl: string;
    imgFlag: boolean;
  }[];
  eventDetail?: string;
  entryPersonnel?: string;

  adjustmentType?: string;
  changeType?: string;
  entryMode?: string;
  energyObjects?: string;
}

interface ISaveEventFormBodyItem {
  adjustmentType: EE_EAdjustType;
  changeType: EE_EChangeType;
  deleteFileIdList: number[];
  endTime: string;
  energyObjects: string;
  entryMode: EE_EEquipmentEntryMode | EE_EAreaEntryMode | EE_ENodeEntryMode;
  eventDetail: string;
  eventTitle: string;
  eventTypeId: EE_EEventType;
  id: number;
  relationData: {
    codeValue: number;
    energyCode: string;
    energyCodeName: string;
    energyCodeUnit: string;
  }[];
  startTime: string;
}

interface IGetClassificationListDataItem {
  co2Ratio: number; // 转二氧化碳的比率
  coalRatio: number; // 转化煤的比率
  code: string; // 能源编码
  energyFlag: string; // 是否是能耗
  environmentFlag: string; // 环境标记 0-否、1-是
  id: number;
  moneyRatio: number; // 转人民币比率
  name: string; // 名称
  parentCode: string; // 父节点编码
  parentName: string; // 父节点名称
  standardPoints: string; // 标准点位
  totalEnergyFlag: string; // 是否记入总能耗
  treeLeaf: string; // 是否最末级 0-不是、1-是
  treeSort: number; // 排序号
  unit: string; // 单位
}

interface IGetAreaTreeListBody {
  keyword?: string; // 树名称
  nodeType?: number; // 节点类型 1-院区、2-楼栋、3-楼层、4-科室
  parentId?: number;
  treeLevel?: number;
  treeType: EE_EAreaTreeType; // 树节点类型 1-区域、2-业态
  energyCode: string;
  expandLevel?: number;
  wholeHospitalFlag: boolean;
}
interface IGetAreaTreeListNode {
  airConditionedArea: number; // 空调面积
  area: number; // 区域面积
  autoGenerated: number; // 是否自动生成标记 0-否、1-是、-1-未填写
  hospitalCode: string; // 所属院区
  id: number;
  nodeType: string; // 节点类型 1-院区、2-楼栋、3-楼层、4-科室
  nodeTypeText: string; // 节点类型文字 1-院区、2-楼栋、3-楼层、4-科室
  parentId: number; // 父节点编号
  parentIds: string; // 所有父级编号
  peopleNumber: number; // 拥有的人数
  treeLeaf: number; // 是否最末级 1-是、0-不是
  treeLevel: number; // 层次级别
  treeName: string; // 节点名称
  treeNames: string; // 全节点名
  treeSort: number; // 本级排序号（升序）
  treeType: string; // 树节点类型 1-区域、2-业态
  childTree: IGetAreaTreeListNode[];
}
