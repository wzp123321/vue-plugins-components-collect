import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map, Subject, switchMap } from 'rxjs';
import {
  FBlobHandler,
  FConvertToBoolean,
  FConvertToNumber,
  FGetUploadFile,
  FResHandler,
  IRes,
} from 'src/app/common/services/communication/communication.api';
import { verificationParamType, pagesType, tableListType } from '../manual-entry.api';

const PATH = {
  人工录入列表查询: '/energy/ems-api/manualentry/list',
};

@Injectable()
export class ManualEntryTableDataService {
  // 加载中
  private isLoading: boolean = true;
  public get getIsLoading(): boolean {
    return this.isLoading;
  }
  public set setIsLoading(flag: boolean) {
    this.isLoading = flag;
  }
  // 分页
  private pages: pagesType;
  public get getPages(): pagesType {
    return this.pages;
  }
  public set setPages(data: pagesType) {
    this.pages = data;
  }
  // 列表数据
  private list: tableListType[] = [];
  public get getList(): tableListType[] {
    return this.list;
  }
  public set setList(data: tableListType[]) {
    this.list = data;
  }

  // 数据表
  private _TableData = {
    index: 1,
    size: 10,
    total: null as number,
    list: [] as tableListType[],
  };

  public set Data_Table_Index(v: number) {
    this._TableData.index = v;
  }
  public get Data_Table_Index(): number {
    return this._TableData.index;
  }

  public set Data_Table_Size(v: number) {
    this._TableData.size = v;
  }
  public get Data_Table_Size(): number {
    return this._TableData.size;
  }

  public get Data_Table_Total(): number {
    return this._TableData.total;
  }

  public get Data_Table_List(): tableListType[] {
    return [...this._TableData.list];
  }

  // 空调运行策略进度 strategyEmpty
  public get getEmpty(): boolean {
    return !this.isLoading && this.list.length === 0;
  }

  public readonly Event_Table_PaginationChange = new EventEmitter<void>();
  constructor(private http: HttpClient, private nzMessage: NzMessageService) {}

  /**
   * 人工录入查询历史能耗值
   * @param param
   */
  public getTableList(param: verificationParamType): void {
    this.isLoading = true;
    const flag = this.verificationParam(param);
    if (!flag) {
      return;
    }
    this.http
      .post<IRes<any>>(PATH.人工录入列表查询, param)
      .pipe(
        map((res) => {
          const data: any = FResHandler(res);
          const list = data;
          // const list: any = {
          //   "pageNum":1,
          //   "pageSize":10,
          //   "total":1,
          //   "pages":1,
          //   "list":[
          //       {
          //           "entryType":"1",
          //           "entryTime":"2022-01-19 09:54:00",
          //           "dataTime":"2022-01-17至2022-01-18",
          //           "allocationDetail":{
          //               "allocationPeriod":"2天",
          //               "dateRange":"2022年01月17日至2022年01月18日",
          //               "allocationName":"平均分摊",
          //               "allocationDetails":[
          //                   "1月17日500kWh",
          //                   "1月18日500kWh"
          //               ]
          //           },
          //           "objectName":"测试树节点",
          //           "id":1,
          //           "entryTypeName":"消耗值",
          //           "entryValue":1800,
          //           "energyName":"电",
          //           "objectId":1,
          //           "energyCode":"01000"
          //       }
          //   ]
          // }
          const pages = {
            pageNum: list.pageNum,
            pageSize: list.pageSize,
            total: list.total,
            pages: list.pages,
          };
          return {
            pages: pages,
            data: list.list,
          };
        })
      )
      .subscribe({
        next: ({ pages, data }) => {
          this.pages = pages;
          this.list = data;
          this._TableData.list = data;
          this._TableData.total = pages.total;
          // this.isLoading = false;
        },
        error: (error) => {
          console.warn(`查询人工录入列表数据 -> ${error}`);
          this.list = [];
          this._TableData.list = [];
          // this.isLoading = false;
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
  /**
   * 验证参数
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
}
