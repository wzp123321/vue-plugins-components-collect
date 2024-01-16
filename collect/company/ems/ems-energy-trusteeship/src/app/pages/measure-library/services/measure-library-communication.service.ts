import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { map, switchMap } from 'rxjs';
import { ExceptionTableComponent } from 'src/app/common/components/exception-table/exception-table.component';
import {
  FBlobHandler,
  FConvertToBoolean,
  FConvertToNumber,
  FGetUploadFile,
  FResHandler,
  IRes,
} from 'src/app/common/services/communication/communication.api';
import {
  ML_EExecutionPeriod,
  ML_EMeasureOrigin,
  ML_EMeasureState,
  ML_EMeasureSystem,
  ML_ERelatedFunction,
  ML_IMeasureItem,
  ML_IQuery,
} from '../measure-library.api';
import { MeasureLibraryDatabaseService } from './measure-library-database.service';
import { MeasureLibraryServiceModule } from './measure-library.service.module';

const PATH = {
  新增措施: '/energy/ems-api/energyManager/addEnergyManagerMeasure',
  删除措施: '/energy/ems-api/energyManager/deleteEnergyManagerMeasure',
  下载模板:
    '/energy/ems-api/energyManager/downloadExcelEnergyManagerMeasureTemplate',
  导出措施列表: '/energy/ems-api/energyManager/exportExcelEnergyManagerMeasure',
  查询措施列表: '/energy/ems-api/energyManager/getEnergyManagerMeasureList',
  修改措施: '/energy/ems-api/energyManager/updateEnergyManagerMeasure',
  批量导入措施库数据:
    '/energy/ems-api/energyManager/uploadEnergyManagerMeasure',
};

@Injectable({
  providedIn: MeasureLibraryServiceModule,
})
export class MeasureLibraryCommunicationService {
  constructor(
    private http: HttpClient,
    private nzMessage: NzMessageService,
    private nzModal: NzModalService,
    private sDatabase: MeasureLibraryDatabaseService
  ) {}

  /**
   * 新增措施
   * @param req 措施条目
   */
  public addEnergyManagerMeasure(req: ML_IMeasureItem): void {
    const body: IAddEnergyManagerMeasureBody = {
      description: req.description,
      executionCycle: req.period,
      measureName: req.name,
      measureStatus: req.state,
      relatedFunc: req.relation,
      systemId: req.system,
    };
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.新增措施, body)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: () => {
          this.nzMessage.success('新增成功');
          this.sDatabase.Event_Form_DataChange.emit({
            success: true,
            reset: true,
          });
        },
        error: (error) => {
          console.warn(`新增措施 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`新增失败，${error}`);
          }
          this.sDatabase.Event_Form_DataChange.emit({ success: false });
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Saving = false;
      });
  }

  /**
   * 删除措施
   * @param id 措施id
   */
  public deleteEnergyManagerMeasure(id: number): void {
    const body: number = id;
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.删除措施, body)
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
          console.warn(`删除措施 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
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
   * 下载模板
   */
  public downloadExcelEnergyManagerMeasureTemplate(): void {
    this.sDatabase.State_Toolbar_Downloading = true;
    this.http
      .post(PATH.下载模板, null, { responseType: 'blob' })
      .pipe(switchMap((res) => FBlobHandler(res, '措施库导入模板.xlsx')))
      .subscribe({
        next: () => {
          this.nzMessage.success('下载成功');
        },
        error: (error) => {
          console.warn(`下载模板 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`下载失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Toolbar_Downloading = false;
      });
  }

  /**
   * 导出措施列表
   * @param req 查询参数
   */
  public exportExcelEnergyManagerMeasure(req: ML_IQuery): void {
    const body: IExportExcelEnergyManagerMeasureBody = {
      measureCode: req.code,
      measureName: req.name,
      measureStatus: req.state,
      systemId: req.system,
    };
    this.sDatabase.State_Toolbar_Exporting = true;
    this.http
      .post(PATH.导出措施列表, body, { responseType: 'blob' })
      .pipe(switchMap((res) => FBlobHandler(res, '措施库.xlsx')))
      .subscribe({
        next: () => {
          this.nzMessage.success('导出成功');
        },
        error: (error) => {
          console.warn(`导出措施列表 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`导出失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_Toolbar_Exporting = false;
      });
  }

  /**
   * 查询措施列表
   * @param req 查询参数
   */
  public getEnergyManagerMeasureList(req: ML_IQuery): void {
    const body: IGetEnergyManagerMeasureListBody = {
      measureCode: req.code,
      measureName: req.name,
      measureStatus: req.state,
      pageNum: req.index,
      pageSize: req.size,
      searchCount: true,
      systemId: req.system,
    };
    this.sDatabase.State_SearchBar_Searching = true;
    this.http
      .post<IRes<IGetEnergyManagerMeasureListData>>(PATH.查询措施列表, body)
      .pipe(
        map((res) => {
          const data = FResHandler(res);
          return {
            total: data.total,
            list: data.list
              .map((item, index): ML_IMeasureItem => {
                return {
                  id: item.id,
                  index: (req.index - 1) * req.size + index + 1,
                  code: item.measureCode,
                  name: item.measureName,
                  description: item.description,
                  system: FConvertToNumber(item.systemId),
                  period: FConvertToNumber(item.executionCycle),
                  state: FConvertToNumber(item.measureStatus),
                  relation: FConvertToNumber(item.relatedFunc),
                  origin: FConvertToNumber(item.measureSource),
                  entryTime: item.updateTime,
                  canDelete: FConvertToBoolean(item.canDelete),
                };
              })
              .sort((a, b) => a.index - b.index),
          };
        })
      )
      .subscribe({
        next: ({ total, list }) => this.sDatabase.setTableData(total, list),
        error: (error) => {
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
          console.warn(`查询措施列表 -> ${error}`);
        },
      })
      .add(() => {
        this.sDatabase.State_SearchBar_Searching = false;
      });
  }

  /**
   * 修改措施
   * @param req 措施条目
   */
  public updateEnergyManagerMeasure(req: ML_IMeasureItem): void {
    const body: IUpdateEnergyManagerMeasureBody = {
      canDelete: req.canDelete,
      description: req.description,
      executionCycle: req.period,
      id: req.id,
      measureCode: req.code,
      measureName: req.name,
      measureSource: req.origin,
      measureStatus: req.state,
      relatedFunc: req.relation,
      systemId: req.system,
    };
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.修改措施, body)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: () => {
          this.nzMessage.success('修改成功');
          this.sDatabase.Event_Form_DataChange.emit({
            success: true,
            reset: true,
          });
        },
        error: (error) => {
          console.warn(`修改措施 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`修改失败，${error}`);
          }
          this.sDatabase.Event_Form_DataChange.emit({ success: false });
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Saving = false;
      });
  }

  /**
   * 批量导入措施库数据
   * @param file 文件域
   */
  public uploadEnergyManagerMeasure(file: File): void {
    const body: FormData = FGetUploadFile(file);
    this.sDatabase.State_Toolbar_Importing = true;
    this.http
      .post<IRes<IUploadEnergyManagerMeasureData>>(
        PATH.批量导入措施库数据,
        body
      )
      .pipe(
        map(
          (
            res
          ): {
            success: boolean;
            list: { position: string; detail: string }[];
          } => {
            const data = FResHandler(res);
            return {
              success: FConvertToBoolean(data.successFlag),
              list: data.errorMessageList ?? [],
            };
          }
        )
      )
      .subscribe({
        next: ({ success, list }) => {
          if (success) {
            this.nzMessage.success('导入成功');
            this.sDatabase.Event_Form_DataChange.emit({
              success: true,
              reset: true,
            });
          } else {
            this.nzMessage.error('导入失败');
            this.sDatabase.Event_Form_DataChange.emit({ success: false });
            this.presentExceptionModal(list);
          }
        },
        error: (error) => {
          console.warn(`批量导入措施库数据 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`导入失败，${error}`);
          }
          this.sDatabase.Event_Form_DataChange.emit({ success: false });
        },
      })
      .add(() => {
        this.sDatabase.State_Toolbar_Importing = false;
      });
  }

  private presentExceptionModal(
    list: { position: string; detail: string }[]
  ): void {
    this.nzModal.create({
      nzTitle: '错误原因',
      nzContent: ExceptionTableComponent,
      nzFooter: null,
      nzWidth: 800,
      nzCentered: true,
      nzComponentParams: { height: 480, list },
    });
  }
}

interface IAddEnergyManagerMeasureBody {
  description: string; //	描述
  executionCycle: ML_EExecutionPeriod; //	建议执行周期 1-每日、2-工作日、3-每周、4-每月、5-特殊时间
  measureName: string; //	措施名
  measureStatus: ML_EMeasureState; //	措施状态 1-有效、2-无效
  relatedFunc: ML_ERelatedFunction; // 关联功能 1-能耗分析、2-能耗纵览、3-KPI管理、4-能耗告警、5-人工录入
  systemId: ML_EMeasureSystem; //	所属系统 1-暖通、2-能源管理系统、3-综合监控系统、4-其他
}

interface IExportExcelEnergyManagerMeasureBody {
  measureCode: string; // 措施编码
  measureName: string; // 措施名
  measureStatus: ML_EMeasureState; // 措施状态
  systemId: ML_EMeasureSystem; // 所属系统
}

interface IGetEnergyManagerMeasureListBody {
  measureCode: string; // 措施编码
  measureName: string; // 措施名
  measureStatus: ML_EMeasureState; // 措施状态
  orders?: {
    asc: boolean;
    column: string;
  }[]; // 排序
  pageNum: number; // 页码
  pageSize: number; // 每页数量
  searchCount?: boolean; // 是否查询总条数
  systemId: ML_EMeasureSystem; // 所属系统
}
interface IGetEnergyManagerMeasureListData {
  list: {
    canDelete: string; // 是否可删除或修改执行周期 1-可 0-不可
    description: string; //	措施描述
    executionCycle: string; // 建议执行周期 1-每日、2-工作日、3-每周、4-每月、5-特殊时间
    id: number;
    measureCode: string; //	措施编码
    measureName: string; //	措施名称
    measureSource: string; //	措施来源 1-人工录入、2-批量导入、3-app录入
    measureStatus: string; //	措施状态 1-有效、2-无效
    relatedFunc: string; // 关联功能 1-能耗分析、2-能耗纵览、3-KPI管理、4-能耗告警、5-人工录入
    systemId: string; //	所属系统 1-暖通、2-能源管理系统、3-综合监控系统、4-其他
    updateTime: string; // 录入时间
  }[]; //	结果集
  pageNum: number; //	当前页
  pageSize: number; // 每页的数量
  pages: number; //	总页数
  total: number; //	总记录数
}

interface IUpdateEnergyManagerMeasureBody {
  canDelete: boolean; // 是否可删除或修改执行周期 1-可 0-不可
  createTime?: string; // 录入时间
  description: string; //	措施描述
  executionCycle: ML_EExecutionPeriod; // 建议执行周期 1-每日、2-工作日、3-每周、4-每月、5-特殊时间
  id: number;
  measureCode: string; //	措施编码
  measureName: string; //	措施名称
  measureSource: ML_EMeasureOrigin; //	措施来源 1-人工录入、2-批量导入、3-app录入
  measureStatus: ML_EMeasureState; //	措施状态 1-有效、2-无效
  relatedFunc: ML_ERelatedFunction; // 关联功能 1-能耗分析、2-能耗纵览、3-KPI管理、4-能耗告警、5-人工录入
  systemId: ML_EMeasureSystem; //	所属系统 1-暖通、2-能源管理系统、3-综合监控系统、4-其他
}
interface IUploadEnergyManagerMeasureData {
  errorMessageList: { position: string; detail: string }[];
  successFlag: number;
}
