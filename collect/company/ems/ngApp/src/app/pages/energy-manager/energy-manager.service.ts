import { Injectable } from '@angular/core';
import { RESTFULService } from '@src/app/common/services/communication/restful.service';
import {
  FCommonResponseHandler,
  FGetRequestBody,
  ICommonResponse,
  URL_PATH,
} from '@src/app/common/services/communication/communication.api';
import { ICalendarWorkData, ITodayWorkData } from './ems-calendar/ems-calendar.api';
import { ITaskFeedBackParam, ITaskFeedBackData } from './em-task-feedback/em-task-feedback.interface';
import { IWeekSummaryData, IWeekSummaryList } from './em-week-summary/em-week-summary.interface.ts';

@Injectable()
export class EnergyManagerService {
  constructor(private sRESTFUL: RESTFULService) {}

  /**
   * 任务反馈-完成任务
   * @param param 、任务id、描述、照片列表
   * @returns 是否成功、是否全部完成
   */

  public async finishDailyWork(param: ITaskFeedBackParam): Promise<ITaskFeedBackData> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<ITaskFeedBackData>>(
        URL_PATH.EnergyManager.FinishDailyWork,
        FGetRequestBody(param)
      );
      return FCommonResponseHandler<ITaskFeedBackData>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 今日模式获取日常工作数据
   * @returns 今日模式下的日常工作数据
   */
  public async getTodayWork(param: any): Promise<ITodayWorkData> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<ITodayWorkData>>(
        URL_PATH.EnergyManager.GetTodayWork,
        FGetRequestBody(param)
      );
      return FCommonResponseHandler<ITodayWorkData>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 日历模式获取指定日期的工作数据
   * @param date 日期（yyyy-MM-dd）
   * @returns 日历模式下指定日期的工作数据
   */
  public async getCalendarWork(date: string): Promise<ICalendarWorkData> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<ICalendarWorkData>>(
        URL_PATH.EnergyManager.GetCalendarWork,
        FGetRequestBody({ date })
      );
      return FCommonResponseHandler<ICalendarWorkData>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 新增措施
   * @param body 请求体
   * -measureName（措施名称）
   * -executionCycle（1-每日、2-工作日、3-每周、4-每月、5-特殊时间）
   * -measureStatus（1-有效、2-无效）
   * -description（描述）
   */
  public async addMeasure(body: {
    measureName: string;
    executionCycle: number;
    measureStatus: number;
    description?: string;
  }): Promise<void> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<void>>(
        URL_PATH.EnergyManager.AddMeasure,
        FGetRequestBody(body)
      );
      return FCommonResponseHandler<void>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取待办数量
   * @returns 代办数量对象
   */
  public async getTodoQuantity(): Promise<{ count: number }> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<{ count: number }>>(URL_PATH.EnergyManager.todoQuantity);
      return FCommonResponseHandler<{ count: number }>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取一周小结列表
   * @param index 请求页页码，从 1 开始
   * @param size 每页列表数量
   * @returns 对应长度的一周小结列表数组
   */
  public async getWeeklyReportList(index: number = 1, size: number = 5): Promise<IWeekSummaryData[]> {
    const body = {
      orders: [
        {
          asc: false,
          column: 'begin_time',
        },
      ],
      pageNum: index,
      pageSize: size,
      searchCount: true,
    };
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<IWeekSummaryList>>(
        `${URL_PATH.EnergyManager.GetWeeklyReportList}`,
        FGetRequestBody(body)
      );
      const data = FCommonResponseHandler<IWeekSummaryList>(res);
      return data?.list as IWeekSummaryData[];
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取服务天数
   * @returns 服务天数、是否弹出鼓励框
   */
  public async getServiceDays(): Promise<any> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<any>>(`${URL_PATH.EnergyManager.GetServiceDays}`);
      return FCommonResponseHandler<any>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取区域根节点名称
   * @returns 根节点名称
   */
  public async getRootName(): Promise<string> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<string>>(`${URL_PATH.EnergyManager.GetRootName}`);
      return FCommonResponseHandler<string>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取今日告警数量
   * @returns 今日告警数量
   */
  public async getAlarmCount(): Promise<number> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<number>>(`${URL_PATH.Alarm.GetTodayAlarmCount}`);
      return FCommonResponseHandler<number>(res);
    } catch (error) {
      throw error;
    }
  }
}
