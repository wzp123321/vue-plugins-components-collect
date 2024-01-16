import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map, Subject, switchMap } from 'rxjs';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import {
  FBlobHandler,
  FGetUploadFiles,
  FConvertToBoolean,
  FConvertToNumber,
  FGetUploadFile,
  FResHandler,
  IRes,
} from 'src/app/common/services/communication/communication.api';
import {
  verificationParamType,
  errorListParam,
  erorrListDeils,
} from '../manual-entry.api';
import { ManualEntryTableDataService } from './manual-entry-table-data.service';
import { ManualEntryService } from './manual-entry.service';

const PATH = {
  批量导出: '/energy/ems-api/manualentry/download/all',
  批量导入: '/energy/ems-api/manualentry/uploadManualentry',
  下载模板: '/energy/ems-api/manualentry/downloadTemplate',
  录入: '',
};

@Injectable()
export class ManualEntryToolbarService {
  constructor(
    private http: HttpClient,
    private nzMessage: NzMessageService,
    private meService: ManualEntryService,
    private meTableDataService: ManualEntryTableDataService
  ) {}

  // 是否可以批量导出
  private isExporting: boolean = false;
  public get getIsExporting(): boolean {
    return this.isExporting;
  }
  public set setIsExporting(item: boolean) {
    this.isExporting = item;
  }

  private batchExportLoading: boolean = false;
  public get bELoading(): boolean {
    return this.batchExportLoading;
  }

  /**
   * 批量导出
   * @param param 查询的参数
   */
  doExport(param: verificationParamType) {
    const flag = this.verificationParam(param);
    if (!flag) {
      return;
    }
    const keys = [
      'dateType',
      'endDate',
      'energyCode',
      'entryType',
      'keyWords',
      'objectId',
      'orders',
      'pageNum',
      'pageSize',
      'searchCount',
      'startDate',
    ];
    let params = {};
    Object.keys(param).forEach((k: any) => {
      if (keys.includes(k)) {
        params = {
          ...params,
          [k]: (param as any)[k],
        };
      }
    });
    this.isExporting = true;
    this.batchExportLoading = true;
    const loading = this.nzMessage.loading('正在批量导出', {
      nzDuration: 0,
    }).messageId;
    this.http
      .post(PATH.批量导出, params, { responseType: 'blob' })
      .pipe(switchMap((res) => FBlobHandler(res, '人工录入历史记录.xlsx')))
      .subscribe({
        next: () => {
          this.nzMessage.success('批量导出成功');
        },
        error: (error) => {
          console.warn(`批量导出人工录入列表 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`导出失败，${error}`);
          }
        },
      })
      .add(() => {
        this.isExporting = false;
        //  this.nzMessage.remove(loading);
      });
  }
  /**
   * 批量导出参数
   * @param param
   * @returns
   */
  verificationParam(param: verificationParamType) {
    if (!param.endDate || !param.startDate) {
      this.nzMessage.error('请选择数据时间!');
      return false;
    }
    return true;
  }
  // 是否可以下载模板
  private isDownloading: boolean = false;
  public get getIsDownloading(): boolean {
    return this.isDownloading;
  }
  public set setIsDownloading(item: boolean) {
    this.isDownloading = item;
  }
  /**
   * 下载模板
   */
  doDownload(): void {
    this.isDownloading = true;
    const loading = this.nzMessage.loading('正在下载模板', {
      nzDuration: 0,
    }).messageId;
    this.http
      .post(PATH.下载模板, null, { responseType: 'blob' })
      .pipe(switchMap((res) => FBlobHandler(res, '人工录入下载模板.xlsm')))
      .subscribe({
        next: () => {
          this.nzMessage.success('下载成功');
        },
        error: (error) => {
          console.warn(`下载模板 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`下载失败，${error}`);
          }
          this.nzMessage?.remove(loading);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  // 是否可以批量导入
  private isImporting: boolean = false;
  public get getIsImporting(): boolean {
    return this.isImporting;
  }
  public set setIsImporting(item: boolean) {
    this.isImporting = item;
  }

  private isImportColse = new Subject<boolean>();
  getIsImportColseType = this.isImportColse.asObservable();
  getIsImportColse(data: boolean) {
    this.isImportColse.next(data);
  }
  public doImport(file: File[]): void {
    this.isLoading = true;
    const body: FormData = FGetUploadFiles(file);
    this.isImporting = true;
    this.http
      .post<IRes>(PATH.批量导入, body)
      .pipe(
        map((res) => {
          const data: any = FResHandler(res);
          console.log('data---------', data);
          return {
            data: data,
          };
        })
      )
      .subscribe({
        next: ({ data }) => {
          if (data && data.length > 0) {
            this.errorListModelShow = true;
            this.importUploadResult = data;
          } else {
            this.nzMessage.success('导入成功');
            // 列表
            this.meService.getSearchParamList.subscribe((data) => {
              if (!data.objectId) {
                const valueInputType = [
                  { value: '1', name: '消耗值' },
                  { value: '2', name: '表头值' },
                ];
                this.meService.setInputValueType = valueInputType;
              } else {
                if (data.objectType === '1') {
                  const valueInputType = [{ value: '1', name: '消耗值' }];
                  this.meService.setInputValueType = valueInputType;
                } else {
                  const valueInputType = [
                    { value: '1', name: '消耗值' },
                    { value: '2', name: '表头值' },
                  ];
                  this.meService.setInputValueType = valueInputType;
                }
              }
            });

            this.meTableDataService.Data_Table_Index = 1;
            this.meTableDataService.Data_Table_Size = 10;
            this.meTableDataService.Event_Table_PaginationChange.emit();
          }

          this.getIsImportColse(false);
        },
        error: (error) => {
          console.log('errro ==== ', error);
          this.errorListModelShow = false;
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`导入失败，${error}`);
          }
          this.getIsImportColse(false);
          console.warn(`批量导入人工录入数据 -> ${error}`);
          // this.errorListModelShow = true;
        },
      })
      .add(() => {
        this.isImporting = false;
        this.isLoading = false;
      });
  }

  // 是否打开错误页面
  private errorListModelShow: boolean = false;
  public get getErrorListModelShow(): boolean {
    return this.errorListModelShow;
  }
  public set setErrorListModelShow(isShow: boolean) {
    this.errorListModelShow = isShow;
  }

  // 错误列表
  private isLoading: boolean = false;
  public get getIsLoading(): boolean {
    return this.isLoading;
  }
  public set setIsLoading(isLoadingShow: boolean) {
    this.isLoading = isLoadingShow;
  }
  private importResult: errorListParam[] = [];
  public get getImportResult(): errorListParam[] {
    return this.importResult;
  }
  public set setImportResult(data: errorListParam[]) {
    this.importResult = data;
  }
  // 错误列表
  private importUploadResult: erorrListDeils[] = [];
  public get getImportUploadResult(): erorrListDeils[] {
    return this.importUploadResult;
  }
  public set setImportUploadResult(data: erorrListDeils[]) {
    this.importUploadResult = data;
  }

  // 错误列表分页
  public readonly Event_Table_PaginationChange = new EventEmitter<void>();
  private tableData = {
    index: 1,
    size: 10,
    total: (null as number) || 10,
  };

  public set Data_Table_Index(v: number) {
    this.tableData.index = v;
  }
  public get Data_Table_Index(): number {
    return this.tableData.index;
  }

  public set Data_Table_Size(v: number) {
    this.tableData.size = v;
  }
  public get Data_Table_Size(): number {
    return this.tableData.size;
  }

  public get Data_Table_Total(): number {
    return this.tableData.total;
  }

  public set index(v: number) {
    if (v === this.index) {
      return;
    }

    this.Data_Table_Index = v;
    this.Event_Table_PaginationChange.emit();
  }
  public get index(): number {
    return this.Data_Table_Index;
  }

  public set size(v: number) {
    if (v === this.size) {
      return;
    }

    this.Data_Table_Size = v;
    this.Event_Table_PaginationChange.emit();
  }
  public get size(): number {
    return this.Data_Table_Size;
  }

  public get total(): number {
    return this.Data_Table_Total;
  }
  public set total(total: number) {
    this.tableData.total = total;
  }

  // 错误列表详情
  private errorDertailsList = new Subject<erorrListDeils[]>();
  getErrorDertailsList = this.errorDertailsList.asObservable();
  setErrorDertailsList(data: erorrListDeils[]) {
    this.errorDertailsList.next(data);
  }

  // 录入弹窗
  private modalShow = new Subject<boolean>();
  modalShowType = this.modalShow.asObservable();
  modalShowDate(data: boolean) {
    this.modalFlag = data;
    this.modalShow.next(data);
  }

  public modalFlag: boolean = false;
  // 录入弹框开关
  public get getModalFlag(): boolean {
    return this.modalFlag;
  }
  public set setModalFlag(data: boolean) {
    this.modalFlag = data;
  }
}
