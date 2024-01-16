import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { getStorageData } from '@tiansu/tools';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map } from 'rxjs';
import {
  FConvertToBoolean,
  FConvertToNumber,
  FResHandler,
  IRes,
} from 'src/app/common/services/communication/communication.api';
import {
  WR_IWorkItem,
  WR_IWorkList,
  WR_IWorkPreview,
} from '../work-record.api';
import { WorkRecordDatabaseService } from './work-record-database.service';
import { WorkRecordServiceModule } from './work-record-service.module';

const PATH = {
  获取当日工作计划细则:
    '/energy/ems-api/energyManager/getEnergyManagerWorkDetail',
  获取工作时间表: '/energy/ems-api/energyManager/getEnergyManagerWorkList',
};

@Injectable({
  providedIn: WorkRecordServiceModule,
})
export class WorkRecordCommunicationService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private http: HttpClient,
    private nzMessage: NzMessageService,
    private sDatabase: WorkRecordDatabaseService
  ) {}

  /**
   * 获取缓存数据
   * @param name
   * @returns
   */
  private FGetStorageData(name: string) {
    return getStorageData(name);
  }
  /**
   * 获取当日工作计划细则
   * @param date 日期
   */
  public getEnergyManagerWorkDetail(date: Date): void {
    const body = { date: formatDate(date, 'yyyy-MM-dd', this.locale) };
    this.sDatabase.State_List_Searching = true;
    this.http
      .post<IRes<IGetEnergyManagerWorkDetailData>>(
        PATH.获取当日工作计划细则,
        body
      )
      .pipe(
        map((res): WR_IWorkList => {
          const data = FResHandler(res);
          return {
            score: data.score,
            daily: data.dailyWorks
              .map((work): WR_IWorkItem => {
                if (work.attachList?.length) {
                  work.attachList.forEach((item, index) => {
                    work.attachList[index] =
                      '/energy/ems-api/file/downloadSingleFile/' +
                      item +
                      '.png?tenantCode=' +
                      this.FGetStorageData('energy-corpid');
                  });
                }
                return {
                  id: work.dailyWorkId,
                  code: work.planCode,
                  name: work.measureName,
                  description: work.description,
                  state: FConvertToNumber(work.status),
                  begin: work.beginTime
                    ? new Date(
                        `${date.toLocaleDateString()} ${work.beginTime}:00`
                      )
                    : null,
                  end: work.endTime
                    ? new Date(
                        `${date.toLocaleDateString()} ${work.endTime}:00`
                      )
                    : null,
                  finish: work.finishTime ? new Date(work.finishTime) : null,
                  remark: work.remarks,
                  attaches: work.attachList,
                };
              })
              .sort((a, b) => {
                if (a.begin === b.begin) {
                  return +a.end - +b.end;
                }
                return +a.begin - +b.begin;
              }),
            weekly: data.weeklyWorks.map((work): WR_IWorkItem => {
              if (work.attachList?.length) {
                work.attachList.forEach((item, index) => {
                  work.attachList[index] =
                    '/energy/ems-api/file/downloadSingleFile/' +
                    item +
                    '.png?tenantCode=' +
                    this.FGetStorageData('energy-corpid');
                });
              }
              return {
                id: work.dailyWorkId,
                code: work.planCode,
                name: work.measureName,
                description: work.description,
                state: FConvertToNumber(work.status),
                finish: work.finishTime ? new Date(work.finishTime) : null,
                remark: work.remarks,
                attaches: work.attachList,
              };
            }),
            monthly: data.monthlyWorks.map((work): WR_IWorkItem => {
              if (work.attachList?.length) {
                work.attachList.forEach((item, index) => {
                  work.attachList[index] =
                    '/energy/ems-api/file/downloadSingleFile/' +
                    item +
                    '.png?tenantCode=' +
                    this.FGetStorageData('energy-corpid');
                });
              }
              return {
                id: work.dailyWorkId,
                code: work.planCode,
                name: work.measureName,
                description: work.description,
                state: FConvertToNumber(work.status),
                finish: work.finishTime ? new Date(work.finishTime) : null,
                deadline: work.deadline ? new Date(work.deadline) : null,
                remark: work.remarks,
                attaches: work.attachList,
              };
            }),
            special: data.specialWorks.map((work): WR_IWorkItem => {
              if (work.attachList?.length) {
                work.attachList.forEach((item, index) => {
                  work.attachList[index] =
                    '/energy/ems-api/file/downloadSingleFile/' +
                    item +
                    '.png?tenantCode=' +
                    this.FGetStorageData('energy-corpid');
                });
              }
              return {
                id: work.dailyWorkId,
                code: work.planCode,
                name: work.measureName,
                description: work.description,
                state: FConvertToNumber(work.status),
                finish: work.finishTime ? new Date(work.finishTime) : null,
                remark: work.remarks,
                attaches: work.attachList,
              };
            }),
            other: data.otherWorks.map((work): WR_IWorkItem => {
              if (work.attachList?.length) {
                work.attachList.forEach((item, index) => {
                  work.attachList[index] =
                    '/energy/ems-api/file/downloadSingleFile/' +
                    item +
                    '.png?tenantCode=' +
                    this.FGetStorageData('energy-corpid');
                });
              }
              return {
                id: work.dailyWorkId,
                code: work.planCode,
                name: work.measureName,
                description: work.description,
                state: FConvertToNumber(work.status),
                finish: work.finishTime ? new Date(work.finishTime) : null,
                remark: work.remarks,
                attaches: work.attachList,
              };
            }),
          };
        })
      )
      .subscribe({
        next: (v) => {
          this.sDatabase.Event_List_DataLoad.emit(v);
        },
        error: (error) => {
          console.warn(`获取当日工作计划细则 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
          this.sDatabase.Event_List_DataLoad.emit();
        },
      })
      .add(() => {
        this.sDatabase.State_List_Searching = false;
      });
  }

  /**
   * 获取工作时间表
   * @param start 开始日期
   * @param end 结束日期
   */
  public getEnergyManagerWorkList(start: Date, end: Date): void {
    const body: IGetEnergyManagerWorkListBody = {
      startTime: formatDate(start, 'yyyy-MM-dd', this.locale),
      endTime: formatDate(end, 'yyyy-MM-dd', this.locale),
    };
    this.sDatabase.State_Calendar_Searching = true;
    this.http
      .post<IRes<IGetEnergyManagerWorkListDataItem[]>>(
        PATH.获取工作时间表,
        body
      )
      .pipe(
        map((res): WR_IWorkPreview[] => {
          const data = FResHandler(res);
          return data.map((work) => {
            return {
              date: new Date(work.date),
              planned: FConvertToBoolean(work.hasWork),
              score: work.score,
            };
          });
        })
      )
      .subscribe({
        next: (v) => {
          this.sDatabase.setCalendarData(v);
        },
        error: (error) => {
          console.warn(`获取工作时间表 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
          this.sDatabase.setCalendarData([]);
        },
      })
      .add(() => {
        this.sDatabase.State_Calendar_Searching = false;
      });
  }
}

interface IGetEnergyManagerWorkDetailDataItem {
  attach: string;
  attachList: string[];
  beginTime: string; // 开始时间(HH:mm)
  dailyWorkId: number;
  deadline: string;
  description: string;
  detailId: number;
  endTime: string; // 结束时间(HH:mm)
  executionCycle: string;
  finishTime: string; // 完成时间(yyyy-MM-dd HH:mm:ss)
  measureName: string;
  planCode: string;
  remarks: string;
  status: string;
  timeRange: string;
  createTime?: string;
  relatedFunc?: string;
}
interface IGetEnergyManagerWorkDetailData {
  dailyWorks: IGetEnergyManagerWorkDetailDataItem[];
  monthlyWorks: IGetEnergyManagerWorkDetailDataItem[];
  otherWorks: IGetEnergyManagerWorkDetailDataItem[];
  score: number;
  specialWorks: IGetEnergyManagerWorkDetailDataItem[];
  weeklyWorks: IGetEnergyManagerWorkDetailDataItem[];
}

interface IGetEnergyManagerWorkListBody {
  endTime: string;
  startTime: string;
}
interface IGetEnergyManagerWorkListDataItem {
  date: string;
  hasWork: number;
  score: number;
}
