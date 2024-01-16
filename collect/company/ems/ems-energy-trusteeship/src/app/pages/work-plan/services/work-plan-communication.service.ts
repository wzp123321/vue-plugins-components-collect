import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map } from 'rxjs';
import {
  FConvertToNumber,
  FResHandler,
  IRes,
} from 'src/app/common/services/communication/communication.api';
import {
  ML_EExecutionPeriod,
  ML_EMeasureState,
  ML_EMeasureSystem,
} from '../../measure-library/measure-library.api';
import {
  WP_EExecutionPeriod,
  WP_EExecutionType,
  WP_EPlanState,
  WP_ESkipHoliday,
  WP_IPlanDetail,
  WP_IPlanInfo,
  WP_IPlanItem,
  WP_IPlanTime,
  WP_IPlanTime_Day,
  WP_IPlanTime_Month,
  WP_IPlanTime_Special,
  WP_IPlanTime_Week,
  WP_IQuery,
} from '../work-plan.api';
import { WorkPlanDatabaseService } from './work-plan-database.service';
import { WorkPlanServiceModule } from './work-plan-service.module';

const PATH = {
  新增工作计划: '/energy/ems-api/energyManager/addWorkPlan',
  删除工作计划: '/energy/ems-api/energyManager/deleteWorkPlan',
  编辑工作计划: '/energy/ems-api/energyManager/editWorkPlanInfo',
  获取措施列表: '/energy/ems-api/energyManager/queryMeasureList',
  获取工作计划详情: '/energy/ems-api/energyManager/queryWorkPlanInfo',
  获取工作计划列表: '/energy/ems-api/energyManager/queryWorkPlanList',
  更新工作计划状态: '/energy/ems-api/energyManager/updatePlanStatus',
};

@Injectable({
  providedIn: WorkPlanServiceModule,
})
export class WorkPlanCommunicationService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private http: HttpClient,
    private nzMessage: NzMessageService,
    private sDatabase: WorkPlanDatabaseService
  ) {}

  /**
   * 新增工作计划
   * @param req 工作计划详情
   */
  public addWorkPlan(req: WP_IPlanInfo): void {
    const body: IAddWorkPlanBody = {
      beginTime: req.dateRange?.length
        ? formatDate(req.dateRange[0], 'yyyy-MM-dd', this.locale)
        : null,
      description: req.description,
      endTime: req.dateRange?.length
        ? formatDate(req.dateRange[1], 'yyyy-MM-dd', this.locale)
        : null,
      executionCycle: req.period,
      planDetailList: req.details.map((detail) => {
        return {
          detailTimeList: detail.timesheet.map((time) => {
            return {
              beginTime: time.begin
                ? typeof time.begin === 'string'
                  ? time.begin
                  : formatDate(time.begin, 'HH:mm', this.locale)
                : null,
              endTime: time.end
                ? typeof time.end === 'string'
                  ? time.end
                  : formatDate(time.end, 'HH:mm', this.locale)
                : null,
              executionDate:
                time.execution
                  ?.map((day) => {
                    if (typeof day === 'number') {
                      return day;
                    } else {
                      return formatDate(day.date, 'yyyy-MM-dd', this.locale);
                    }
                  })
                  .join(',') || null,
              type: time.type,
            };
          }),
          id: detail.id,
          measureId: detail.measure === 0 ? null : detail.measure,
          measureName: detail.measureName,
          remark: detail.description ?? null,
          systemId: detail.system ?? null,
          newFlag: detail.newFlag ?? false,
        };
      }),
      planName: req.name,
      skipHoliday: req.holiday,
    };
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.新增工作计划, body)
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
          console.warn(`新增工作计划 -> ${error}`);
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
   * 删除工作计划
   * @param id 工作计划id
   */
  public deleteWorkPlan(id: number): void {
    const body: number = id;
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.删除工作计划, body)
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
          console.warn(`删除工作计划 -> ${error}`);
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
   * 编辑工作计划
   * @param req 工作计划详情
   */
  public editWorkPlanInfo(req: WP_IPlanInfo): void {
    const body: IEditWorkPlanInfoBody = {
      beginTime: req.dateRange?.length
        ? formatDate(req.dateRange[0], 'yyyy-MM-dd', this.locale)
        : null,
      description: req.description,
      endTime: req.dateRange?.length
        ? formatDate(req.dateRange[1], 'yyyy-MM-dd', this.locale)
        : null,
      executionCycle: req.period,
      planDetailList: req.details.map((detail) => {
        return {
          detailTimeList: detail.timesheet.map((time) => {
            return {
              beginTime: time.begin
                ? typeof time.begin === 'string'
                  ? time.begin
                  : formatDate(time.begin, 'HH:mm', this.locale)
                : null,
              endTime: time.end
                ? typeof time.end === 'string'
                  ? time.end
                  : formatDate(time.end, 'HH:mm', this.locale)
                : null,
              executionDate:
                time.execution
                  ?.map((day) => {
                    if (typeof day === 'number') {
                      return day;
                    } else {
                      return formatDate(day.date, 'yyyy-MM-dd', this.locale);
                    }
                  })
                  .join(',') || null,
              type: time.type,
            };
          }),
          id: detail.id,
          measureId: detail.measure === 0 ? null : detail.measure,
          remark: detail.description ?? null,
          measureName: detail.measureName,
          systemId: detail.system ?? null,
          newFlag: detail.newFlag ?? false,
        };
      }),
      planId: req.id,
      planName: req.name,
      skipHoliday: req.holiday,
    };
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.编辑工作计划, body)
      .pipe(map((res) => FResHandler(res)))
      .subscribe({
        next: () => {
          this.nzMessage.success('编辑成功');
          this.sDatabase.Event_Form_DataChange.emit({
            success: true,
            reset: true,
          });
        },
        error: (error) => {
          console.warn(`编辑工作计划 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`编辑失败，${error}`);
          }
          this.sDatabase.Event_Form_DataChange.emit({ success: false });
        },
      })
      .add(() => {
        this.sDatabase.State_Form_Saving = false;
      });
  }

  /**
   * 获取措施列表
   * @param detail 计划细则条目
   * @param period 执行周期
   */
  public queryMeasureList(
    detail: WP_IPlanDetail,
    period: WP_EExecutionPeriod,
    type?: string
  ): void {
    const body: IQueryMeasureListBody = {
      deleteFlag: false,
      executionCycle: period as unknown as ML_EExecutionPeriod,
      measureStatus: ML_EMeasureState.有效,
      systemId: detail.system,
    };
    this.sDatabase.State_Form_Searching = true;
    this.http
      .post<IRes<IQueryMeasureListDataItem[]>>(PATH.获取措施列表, body)
      .pipe(
        map((res): { label: string; value: number; description: string }[] => {
          const data = FResHandler(res);
          return data.map((item) => {
            return {
              label: item.measureName,
              value: item.id,
              description: item.description,
            };
          });
        })
      )
      .subscribe({
        next: (v) => {
          detail.measureOptions = v;
          this.setMeasureList(detail, type);
        },
        error: (error) => {
          console.warn(`获取措施列表 -> ${error}`);
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
   * 获取工作计划详情
   * @param id 工作计划id
   */
  public queryWorkPlanInfo(id: number): void {
    const body: number = id;
    this.sDatabase.State_Form_Searching = true;
    this.http
      .post<IRes<IQueryWorkPlanInfoData>>(PATH.获取工作计划详情, body)
      .pipe(
        map((res): WP_IPlanInfo => {
          const data = FResHandler(res);
          return {
            id: data.planId,
            code: data.planCode,
            name: data.planName,
            description: data.description,
            period: FConvertToNumber(data.executionCycle),
            state: FConvertToNumber(data.planStatus),
            holiday: FConvertToNumber(data.skipHoliday),
            dateRange:
              data.beginTime && data.endTime
                ? [new Date(data.beginTime), new Date(data.endTime)]
                : null,
            details: data.planDetailList.map((detail) => {
              let timesheet: WP_IPlanTime[] = [];
              switch (FConvertToNumber(data.executionCycle)) {
                case WP_EExecutionPeriod.每日:
                case WP_EExecutionPeriod['工作日（周一至周五）']:
                  timesheet = detail.detailTimeList.map(
                    (time): WP_IPlanTime_Day => {
                      return {
                        id: time.timeId,
                        begin: time.beginTime
                          ? new Date(
                              `${new Date().toLocaleDateString()} ${
                                time.beginTime
                              }`
                            )
                          : null,
                        end: time.endTime
                          ? new Date(
                              `${new Date().toLocaleDateString()} ${
                                time.endTime
                              }`
                            )
                          : null,
                      };
                    }
                  );
                  break;
                case WP_EExecutionPeriod.每周:
                  timesheet = detail.detailTimeList.map(
                    (time): WP_IPlanTime_Week => {
                      return {
                        id: time.timeId,
                        execution:
                          time.executionDate?.split(',').map((day) => +day) ??
                          [],
                      };
                    }
                  );
                  break;
                case WP_EExecutionPeriod.每月:
                  timesheet = detail.detailTimeList.map(
                    (time): WP_IPlanTime_Month => {
                      return {
                        id: time.timeId,
                        begin: time.beginTime,
                        end: time.endTime,
                        type: FConvertToNumber(time.type),
                      };
                    }
                  );
                  break;
                case WP_EExecutionPeriod.特殊时间:
                  timesheet = detail.detailTimeList.map(
                    (time): WP_IPlanTime_Special => {
                      return {
                        id: time.timeId,
                        execution: time.executionDate?.split(',').map((day) => {
                          return { date: new Date(day) };
                        }) ?? [{ date: null }],
                      };
                    }
                  );
                  break;
                default:
                  break;
              }
              return {
                id: detail.id,
                system: FConvertToNumber(detail.systemId),
                measure: detail.measureId,
                measureName: detail.measureName,
                newFlag: detail.newFlag,
                description: detail.remarks,
                timesheet,
              };
            }),
          };
        })
      )
      .subscribe({
        next: (v) => {
          this.sDatabase.Event_Form_DataLoad.emit(v);
        },
        error: (error) => {
          console.warn(`获取工作计划详情 -> ${error}`);
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
   * 根据返回信息设置措施列表
   * @param detail
   */
  public setMeasureList(detail: WP_IPlanDetail, type?: string): void {
    if (
      !detail.measureOptions.some((item) => item.value === detail.measure) &&
      type !== '新增计划'
    ) {
      detail.measureOptions.push({
        description: detail.description,
        label: detail.measureName,
        value: detail.measure,
      });
    }
  }

  /**
   * 获取工作计划列表
   * @param req 查询参数
   */
  public queryWorkPlanList(req: WP_IQuery): void {
    const body: IQueryWorkPlanListBody = {
      pageNum: req.index,
      pageSize: req.size,
      planCode: req.code,
      planName: req.name,
      planStatus: req.state,
      searchCount: true,
    };
    this.sDatabase.State_SearchBar_Searching = true;
    this.http
      .post<IRes<IQueryWorkPlanListData>>(PATH.获取工作计划列表, body)
      .pipe(
        map((res) => {
          const data = FResHandler(res);
          return {
            total: data.total,
            list: data.list
              .map((item, index): WP_IPlanItem => {
                return {
                  id: item.id,
                  index: (req.index - 1) * req.size + index + 1,
                  code: item.planCode,
                  name: item.planName,
                  description: item.description,
                  period: FConvertToNumber(item.executionCycle),
                  state: FConvertToNumber(item.planStatus),
                  effectiveTime: item.effectedTime,
                  entryTime: item.createTime,
                };
              })
              .sort((a, b) => a.index - b.index),
          };
        })
      )
      .subscribe({
        next: ({ total, list }) => this.sDatabase.setTableData(total, list),
        error: (error) => {
          console.warn(`获取工作计划列表 -> ${error}`);
          if (error && !error?.toLowerCase()?.includes('login')) {
            this.nzMessage.error(`查询失败，${error}`);
          }
        },
      })
      .add(() => {
        this.sDatabase.State_SearchBar_Searching = false;
      });
  }

  /**
   * 更新工作计划状态
   * @param id 工作计划id
   * @param state 目标计划状态
   */
  public updatePlanStatus(
    id: number,
    state: WP_EPlanState.正在执行 | WP_EPlanState.暂停
  ): void {
    const body: IUpdatePlanStatusBody = { planId: id, planStatus: state };
    this.sDatabase.State_Form_Saving = true;
    this.http
      .post<IRes>(PATH.更新工作计划状态, body)
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
          console.warn(`更新工作计划状态 -> ${error}`);
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
}

interface IAddWorkPlanBody {
  beginTime: string; // 生效开始时间
  description: string; //	计划描述
  endTime: string; // 生效结束时间
  executionCycle: WP_EExecutionPeriod;
  planDetailList: {
    detailTimeList: {
      beginTime: string; // 开始时间
      endTime: string; // 结束时间
      executionDate: string; // 执行日
      type: WP_EExecutionType;
    }[]; // 细节时间
    id: number; // 细节id
    measureId: number; // 措施id
    remark: string; // 备注
  }[]; // 计划明细
  planName: string; // 计划名称
  skipHoliday: WP_ESkipHoliday;
}

interface IEditWorkPlanInfoBody {
  beginTime: string; // 生效开始时间
  description: string; //	计划描述
  endTime: string; // 生效结束时间
  executionCycle: WP_EExecutionPeriod;
  planDetailList: {
    detailTimeList: {
      beginTime: string; // 开始时间
      endTime: string; // 结束时间
      executionDate: string; // 执行日
      type: WP_EExecutionType;
    }[]; // 细节时间
    id: number; // 细节id
    measureId: number; // 措施id
    remark: string; // 备注
  }[]; // 计划明细
  planId: number; // 计划id
  planName: string; // 计划名称
  skipHoliday: WP_ESkipHoliday;
}

interface IQueryMeasureListBody {
  deleteFlag: boolean; //	措施删除标记 1-已删除、0-未删除
  executionCycle: ML_EExecutionPeriod; //	执行周期 1-每日、2-工作日、3-每周、4-每月、5-特殊时间
  measureStatus: ML_EMeasureState; //	措施状态 1-有效、2-无效
  systemId: ML_EMeasureSystem; //	对应系统 0-全部 1-暖通 2-能源管理系统 3-综合监控系统 4-其他
}
interface IQueryMeasureListDataItem {
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
}

interface IQueryWorkPlanInfoData {
  beginTime: string; // 生效开始时间
  description: string; //	计划描述
  endTime: string; // 生效结束时间
  executionCycle: string; // 执行周期 1-每日、2-工作日、3-每周、4-每月、5-特殊时间
  planDetailList: {
    deleteFlag: string; // 措施删除标记 1-已删除、0-未删除
    detailTimeList: {
      beginTime: string; // 开始时间
      endTime: string; // 结束时间
      executionDate: string; // 执行日
      timeId: number;
      type: string; // 月任务类型 1-每日执行，2-持续执行
    }[]; // 细节时间
    id: number; // 细节id
    measureId: number; // 措施id
    measureName: string; // 措施名
    newFlag?: boolean; // 是否新增
    remarks: string; // 备注
    systemId: string; // 系统id
  }[]; // 计划明细
  planId: number; // 计划id
  planName: string; // 计划名称
  planCode: string; // 计划编码
  skipHoliday: string; // 是否跳过节假日 1-节假日跳过、0-节假日顺延 -执行周期为每日、工作日和每周时，SkipHoliday为1
  planStatus: string; // 计划状态 1-尚未启动、2-正在执行、3-暂停、4-已完成
}

interface IQueryWorkPlanListBody {
  orders?: {
    asc: boolean;
    column: string;
  }[]; // 排序
  pageNum: number; // 页码
  pageSize: number; // 每页数量
  planCode: string; // 计划编码
  planName: string; // 计划名称
  planStatus: WP_EPlanState; // 计划状态 0-全部、1-尚未启动、2-正在执行、3-暂停、4-已完成
  searchCount?: boolean; // 是否查询总条数
}
interface IQueryWorkPlanListData {
  list: {
    beginTime: string; // 生效开始时间
    createTime: string; // 录入时间
    description: string; //	计划描述
    detailId: number; // 计划明细id
    effectedTime: string; // 生效时间
    endTime: string; // 生效结束时间
    executionCycle: string; // 执行周期 1-每日、2-工作日、3-每周、4-每月、5-特殊时间
    id: number;
    planCode: string; // 计划编码
    planName: string; // 计划名称
    planStatus: string; // 计划状态 1-尚未启动、2-正在执行、3-暂停、4-已完成
  }[]; //	结果集
  pageNum: number; //	当前页
  pageSize: number; // 每页的数量
  pages: number; //	总页数
  total: number; //	总记录数
}

interface IUpdatePlanStatusBody {
  planId: number; // 计划id
  planStatus: WP_EPlanState.正在执行 | WP_EPlanState.暂停; // 计划状态 2-正在执行 3-暂停
}
