import { ref } from 'vue';

import {
  EXCEPTION_LOWLIMIT_MESSAGE,
  EXCEPTION_INCOHERENCE_MESSAGE,
  EXCEPTION_THRESHOLD_COMPARE_MESSAGE,
  EXCEPTION_THRESHOLD_EMPTY__MESSAGE,
  EXCEPTION_THRESHOLD_ZERO__MESSAGE,
  EXCEPTION_EXCEED_MESSAGE,
  Daar_IUpdateAlarmSectionParams,
  Daar_IThresholdErrorVO,
} from './daar-atc-section-configure.api';
import { Daar_IRealtimeAbnormalThresholdVO } from '../daar-abnormal-threshold-configure.api';
import { EDaarAbnormalType, EDaarAlarmLevel, EDaarThresholdType } from '../../../data-abnomal-alarm-rules.api';
import { EThresboldStatus } from '../../daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.api';
import { postRequest } from '@/services/request';
import { Common_ICodeName } from '@/services/common/common-api';

import message from '@/utils/message';
import { transferPercent, floatDivide } from '../../../../../utils/index';
import { cloneDeep } from 'lodash';

enum EPath {
  查询告警等级字典 = '/dict/query',
  修改告警阈值区间设置 = '/admin/abnormal/updateLimitThreshold',
}

class AlarmSectionConfigureService {
  //#region
  private _alarmDetail = ref<Daar_IUpdateAlarmSectionParams>({
    abnormalType: EDaarAbnormalType.用能异常,
    alarmLevel: EDaarAlarmLevel.重要,
    alarmLevelName: '',
    energyCode: '',
    energyCodeName: '',
    limitThresholds: [],
    status: EThresboldStatus.开启,
    thresholdName: '',
    thresholdType: EDaarThresholdType.用能增长,
  });

  private _visible = ref<boolean>(false);

  private _alarmLevels = ref<Common_ICodeName[]>([]);

  private _errorMessage = ref<string>('');

  private _exceptionList = ref<Daar_IThresholdErrorVO[]>([]);

  private _submitting = ref<boolean>(false);

  private _abnormalType = ref<EDaarAbnormalType>(EDaarAbnormalType.用能异常);

  public get alarmDetail(): Daar_IUpdateAlarmSectionParams {
    return this._alarmDetail.value as Daar_IUpdateAlarmSectionParams;
  }

  public get visible(): boolean {
    return this._visible.value;
  }

  public set visible(value: boolean) {
    this._visible.value = value;
  }

  public get alarmLevels(): Common_ICodeName[] {
    return this._alarmLevels.value;
  }

  public get errorMessage(): string {
    return this._errorMessage.value;
  }

  public get exceptionList(): Daar_IThresholdErrorVO[] {
    return this._exceptionList.value;
  }

  public get abnormalType(): EDaarAbnormalType {
    return this._abnormalType.value;
  }

  public set abnormalType(value: EDaarAbnormalType) {
    this._abnormalType.value = value;
  }
  //#endregion

  show(list: Daar_IRealtimeAbnormalThresholdVO[], abnormalType: EDaarAbnormalType) {
    this._abnormalType.value = abnormalType;
    this._alarmDetail.value = this.convert(list);

    this.queryDic();
    this._visible.value = true;
  }

  async queryDic() {
    try {
      const res = await postRequest(EPath.查询告警等级字典, 'alarm_level');
      if (res?.data?.length) {
        this._alarmLevels.value = res?.data ?? [];
      } else {
        this._alarmLevels.value = [];
      }
    } catch (error) {
      this._alarmLevels.value = [];
    }
  }

  convert(list: Daar_IRealtimeAbnormalThresholdVO[]): Daar_IUpdateAlarmSectionParams {
    return {
      abnormalType: list?.[0].abnormalType,
      alarmLevel: list?.[0].alarmLevel,
      alarmLevelName: list?.[0].alarmLevelText,
      energyCode: list?.[0].energyCode,
      energyCodeName: list?.[0].energyCodeName,
      limitThresholds: list?.map((item) => {
        return {
          lowerLimit: item?.lowerLimit,
          general:
            item?.general !== '' && item?.general !== null ? transferPercent(Number(item?.general), 100) + '' : '',
          serious:
            item?.serious !== '' && item?.serious !== null ? transferPercent(Number(item?.serious), 100) + '' : '',
          upperLimit: item?.upperLimit,
        };
      }),
      status: list?.[0].status,
      thresholdName: list?.[0].thresholdName,
      thresholdType: list?.[0].thresholdType,
    };
  }
  handleClose = () => {
    this._errorMessage.value = '';
    this._exceptionList.value = [];
    this._visible.value = false;
    this._submitting.value = false;
  };
  handleSectionAdd() {
    const upperLimit =
      this._alarmDetail.value.limitThresholds?.[this._alarmDetail.value.limitThresholds.length - 1]?.upperLimit ?? '';
    this._alarmDetail.value.limitThresholds.push({
      lowerLimit: upperLimit,
      general: '',
      serious: '',
      upperLimit: '',
    });
    this._exceptionList.value = [];
    this._errorMessage.value = '';
  }
  handleDelete(index: number) {
    this._alarmDetail.value.limitThresholds.splice(index, 1);
    this._exceptionList.value = [];
    this._errorMessage.value = '';
  }
  // 修改上限，下一区间的下限会自动继承
  handleLowerLimitChange(e: Event, index: number) {
    if (index !== this._alarmDetail.value.limitThresholds.length - 1) {
      this._alarmDetail.value.limitThresholds[index + 1].lowerLimit = (e?.target as HTMLInputElement)?.value;
    }
  }
  handleSubmit() {
    return new Promise(async (resolve) => {
      if (this._submitting.value) {
        return resolve(false);
      }
      this._submitting.value = true;

      if (this.checkSectionStandard()) {
        this._submitting.value = false;
        return resolve(false);
      }
      try {
        this._alarmLevels.value.forEach((item) => {
          if (this._alarmDetail.value.alarmLevel === item.code) {
            this._alarmDetail.value.alarmLevelName = item.name;
          }
        });
        const detail = cloneDeep(this._alarmDetail.value);
        detail.limitThresholds = detail.limitThresholds?.map((item) => {
          return {
            general: item.general !== '' && item.general !== null ? floatDivide(Number(item.general), 100) + '' : '',
            serious: item.serious !== '' && item.serious !== null ? floatDivide(Number(item.serious), 100) + '' : '',
            lowerLimit: item?.lowerLimit ?? '',
            upperLimit: item?.upperLimit ?? '',
          };
        });
        const res = await postRequest(EPath.修改告警阈值区间设置, detail);
        if (res?.success) {
          message.success(res?.message ?? '操作成功');
          this._visible.value = false;
          resolve(true);
        } else {
          message.error(res?.message ?? '操作失败');
          resolve(false);
        }
      } catch (error) {
        message.error('操作失败');
        resolve(false);
      } finally {
        this._submitting.value = false;
      }
    });
  }
  // 校验权限
  private checkSectionStandard() {
    this._exceptionList.value = [];
    this._errorMessage.value = '';

    try {
      // 非最后一条的上限为空
      this._alarmDetail.value.limitThresholds?.forEach((item, index) => {
        if (
          index !== this._alarmDetail.value.limitThresholds.length - 1 &&
          (item.upperLimit === '' || item.upperLimit === null)
        ) {
          this._errorMessage.value = EXCEPTION_INCOHERENCE_MESSAGE;
          this._exceptionList.value.push({
            rowIndex: index,
            columnIndex: 1,
          });
        }
      });

      // 第一个区间的下限为空
      if (this._errorMessage.value === '') {
        if (
          this._alarmDetail.value.limitThresholds?.[0].lowerLimit === '' ||
          this._alarmDetail.value.limitThresholds?.[0].lowerLimit === null
        ) {
          this._errorMessage.value = EXCEPTION_LOWLIMIT_MESSAGE;
          this._exceptionList.value.push({
            rowIndex: 0,
            columnIndex: 0,
          });
        }
      }

      // 区间上下限大小关系比较，比如1-1，2-2；1-4，6-3
      if (this._errorMessage.value === '') {
        this._alarmDetail.value.limitThresholds?.forEach((item, index) => {
          // 当前上限小于等于下限
          if (
            item.lowerLimit !== '' &&
            item.lowerLimit !== null &&
            item.upperLimit !== '' &&
            item.upperLimit !== null &&
            Number(item.lowerLimit) >= Number(item.upperLimit)
          ) {
            this._errorMessage.value = EXCEPTION_EXCEED_MESSAGE;
            this._exceptionList.value.push({
              rowIndex: index,
              columnIndex: 1,
            });
          }
        });
      }

      // 进行连贯校验 比如1-20，30-50
      if (this._errorMessage.value === '' && this._alarmDetail.value.limitThresholds.length > 1) {
        this._alarmDetail.value.limitThresholds?.forEach((item, index) => {
          if (index !== this._alarmDetail.value.limitThresholds.length - 1) {
            // 当前上限不等于下一区间的下限
            if (Number(item.upperLimit) !== Number(this._alarmDetail.value.limitThresholds[index + 1].lowerLimit)) {
              this._errorMessage.value = EXCEPTION_INCOHERENCE_MESSAGE;
              this._exceptionList.value.push({
                rowIndex: index,
                columnIndex: 1,
              });
            }
          }
        });
      }

      // 校验阈值是否为空
      if (this._errorMessage.value === '') {
        this._alarmDetail.value.limitThresholds?.forEach((item, index) => {
          if (item.general === '' || item.general === null) {
            this._errorMessage.value = EXCEPTION_THRESHOLD_EMPTY__MESSAGE;
            this._exceptionList.value.push({
              rowIndex: index,
              columnIndex: 2,
            });
          }
          if (
            this._abnormalType.value === EDaarAbnormalType.用能异常 &&
            (item.serious === '' || item.serious === null)
          ) {
            this._errorMessage.value = EXCEPTION_THRESHOLD_EMPTY__MESSAGE;
            this._exceptionList.value.push({
              rowIndex: index,
              columnIndex: 3,
            });
          }
        });
      }

      // 校验阈值是否为0
      if (this._errorMessage.value === '') {
        this._alarmDetail.value.limitThresholds?.forEach((item, index) => {
          if (item.general !== '' && item.general !== null && Number(item.general) === 0) {
            this._errorMessage.value = EXCEPTION_THRESHOLD_ZERO__MESSAGE;
            this._exceptionList.value.push({
              rowIndex: index,
              columnIndex: 2,
            });
          }
          if (
            this._abnormalType.value === EDaarAbnormalType.用能异常 &&
            item.serious !== '' &&
            item.serious !== null &&
            Number(item.serious) === 0
          ) {
            this._errorMessage.value = EXCEPTION_THRESHOLD_ZERO__MESSAGE;
            this._exceptionList.value.push({
              rowIndex: index,
              columnIndex: 3,
            });
          }
        });
      }

      // 校验普通、严重阈值大小关系
      if (this._errorMessage.value === '' && this._abnormalType.value === EDaarAbnormalType.用能异常) {
        this._alarmDetail.value.limitThresholds?.forEach((item, index) => {
          if (item.general && item.serious && Number(item.general) >= Number(item.serious)) {
            this._errorMessage.value = EXCEPTION_THRESHOLD_COMPARE_MESSAGE;
            this._exceptionList.value.push({
              rowIndex: index,
              columnIndex: 2,
            });
          }
        });
      }
    } catch (error) {
      console.log('%c✨✨校验区间✨✨', 'font-size: 24px', error);
      this._submitting.value = false;
    }

    return !!this._errorMessage.value;
  }
}

export default AlarmSectionConfigureService;
