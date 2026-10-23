/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
import {
  EAlarmLabel,
  EAlarmLockoutFlag,
  EVoltageFlag,
} from '../../api/index.api';
import { ElMessage } from 'element-plus';
import alarmDetailService from './alarm-deatil.service';

interface commentList {
  id: number;
  commentTime: string;
  comment: string;
  username: string;
}
interface operationList {
  id: number;
  operateType: string;
  operateTypeName: string;
  loginName: string;
  operateTime: string;
}
export interface alarmChart {
  unit: string;
  value: number;
  valueTime: string;
  overrunValue: number;
  peakValue: number;
  peakValueTime: string;
  resumeValue: number;
  resumeValeTime: string;
  resumeTime: string;
  peakTime: string;
  data: {
    value: number;
    valueTime: string;
    overRunValue: number;
    alarmFlag: string;
    peakFlag: string;
    resumeFlag: string;
  }[];
  xaxis: number[];
  upFlag?: string;
  thresholdValue?: number;
  outOfLimitValue?: number;
  resumeOverrunValue?: number; // 恢复时越限值
  alarmLockoutFlag?: EAlarmLockoutFlag; // 告警时闭锁值开关
  alarmLockoutValue?: number; // 告警时闭锁值
  alarmElecValue?: number; // 告警时电流值
  resumeLockoutFlag?: EAlarmLockoutFlag; // 恢复时闭锁值开关
  resumeLockoutValue?: number; // 恢复时闭锁值
  resumeElecValue?: number; // 恢复时电流值
  voltageFlag?: EVoltageFlag; // 是否是电压类型
}
export interface alarmDetailRes {
  id: number;
  code?: string;
  objectName: string;
  recordType: string;
  levelCode: string;
  levelName: string;
  content: string;
  status: string;
  statusName: string;
  operationStatus: string;
  operationStatusName: string;
  spaceName: string;
  deviceName: string;
  pointName: string;
  systemCode: string;
  systemName: string;
  transAlarmTypeName: string;
  overrunFlag: string;
  upFlag: string;
  originAlarmTypeId: number;
  generationTime: string;
  commentList: commentList[];
  operationList: operationList[];
  alarmChart?: alarmChart;
  concentratorName: string;
  configId: number;
  labelList: EAlarmLabel[];
}
export interface addCommentQuery {
  comment: string;
  recordId: number;
  type: string;
  username: string;
}

// 获取告警详情
export class QueryAlarmDetailModule {
  private axiosInstance: any;

  constructor(axiosInstance: any) {
    this.axiosInstance = axiosInstance;
  }

  private _alarmDetailRes: alarmDetailRes = {
    id: 0,
    objectName: '',
    content: '',
    recordType: '',
    levelCode: '',
    levelName: '',
    status: '',
    statusName: '',
    operationStatus: '',
    operationStatusName: '',
    spaceName: '',
    deviceName: '',
    pointName: '',
    systemCode: '',
    systemName: '',
    transAlarmTypeName: '',
    originAlarmTypeId: 0,
    overrunFlag: '',
    upFlag: '',
    generationTime: '',
    commentList: [],
    operationList: [],
    concentratorName: '',
    alarmChart: {
      unit: '',
      value: 0,
      valueTime: '',
      overrunValue: 0,
      peakValue: 0,
      peakValueTime: '',
      peakTime: '',
      resumeValue: 0,
      resumeValeTime: '',
      resumeTime: '',
      data: [],
      xaxis: [],
    },
    configId: -1,
    labelList: [],
  };

  get alarmDetailRes() {
    return this._alarmDetailRes;
  }

  async queryAlarmDetail(query: {
    id: number;
    typeId: string;
    highPrecisionFlag: boolean;
  }) {
    try {
      const res = await alarmDetailService.queryRecordDetail(
        this.axiosInstance,
        query,
      );
      if (res && res.success) {
        if (res.data) {
          this._alarmDetailRes = res.data;
        } else {
          ElMessage.error('返回数据为空!');
        }
      } else {
        ElMessage.error(res.message || '查询告警详情失败');
      }
    } catch (error) {
      console.log(error);
    }
  }

  // 告警事件确认(未合并)
  async batchConfirmAlarm(param: any) {
    try {
      const res = await alarmDetailService.batchConfirmAlarm(
        this.axiosInstance,
        param,
      );
      return res?.success;
    } catch (error) {
      return false;
    }
  }
}
// 添加批注
export class AddCommentModule {
  private _addCommentRes: alarmDetailRes | undefined;

  private _addCommentQuery: addCommentQuery | undefined;

  get addCommentQuery() {
    return this._addCommentQuery;
  }

  set addCommentQuery(val) {
    this._addCommentQuery = val;
  }

  get addCommentRes() {
    return this._addCommentRes;
  }

  async addComment(axiosInstance: any, message: boolean = true) {
    try {
      const res = await alarmDetailService.addComment(
        axiosInstance,
        this._addCommentQuery!,
      );

      if (res && res.success) {
        message && ElMessage.success('新增成功');
        return true;
      }
      ElMessage.error(res?.errrmsg || '新增失败');
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
