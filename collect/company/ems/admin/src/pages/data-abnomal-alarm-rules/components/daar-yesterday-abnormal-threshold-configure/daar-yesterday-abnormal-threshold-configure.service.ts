import { ref } from 'vue';
import { postRequest } from '@/services/request';
import message from '@/utils/message';
import { floatDivide, transferPercent } from '@/utils';

import {
  Daar_IYesterdayAbnormalVO,
  IYesterdayAbnormalUpdateStatusParams,
} from './daar-yesterday-abnormal-threshold-configure.api';
import { Common_ICodeName } from '@/services/common/common-api';
import { EDaarAbnormalType } from '../../data-abnomal-alarm-rules.api';
import { EThresboldStatus } from '../daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.api';

enum EPath {
  查询告警等级字典 = '/dict/query',
  查询昨日异常告警阈值 = '/admin/abnormal/threshold/config/queryAll',
  修改昨日异常告警状态 = '/admin/abnormal/threshold/config/update',
  修改昨日异常阈值 = '/admin/abnormal/threshold/config/update',
}

class YesterdayAbnormalThresholdConfigureService {
  //#region
  private _dataSource = ref<Daar_IYesterdayAbnormalVO[]>([]);

  private _editRow = ref<Daar_IYesterdayAbnormalVO>({
    abnormalType: -1,
    abnormalTypeName: '',
    alarmLevel: '',
    alarmLevelText: '',
    general: '',
    id: -1,
    serious: '',
    status: '',
    thresholdName: '',
    thresholdType: '',
  });

  private _loading = ref<boolean>(true);

  private submitting: boolean = false;

  private _editStatusParams = ref<IYesterdayAbnormalUpdateStatusParams>({
    id: -1,
    status: EThresboldStatus.关闭,
    reason: '',
  });

  private _alarmLevels = ref<Common_ICodeName[]>([]);

  private _editStatusVisible = ref<boolean>(false);

  private _editDetailVisible = ref<boolean>(false);

  public get dataSource(): Daar_IYesterdayAbnormalVO[] {
    return this._dataSource.value;
  }

  public get editRow(): Daar_IYesterdayAbnormalVO {
    return this._editRow.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get editStatusParams(): IYesterdayAbnormalUpdateStatusParams {
    return this._editStatusParams.value;
  }

  public set editStatusParams(value: IYesterdayAbnormalUpdateStatusParams) {
    this._editStatusParams.value.id = value?.id;
    this._editStatusParams.value.reason = value?.reason;
    this._editStatusParams.value.status = value?.status;
  }

  public get alarmLevels(): Common_ICodeName[] {
    return this._alarmLevels.value;
  }

  public get editStatusVisible(): boolean {
    return this._editStatusVisible.value;
  }

  public set editStatusVisible(value: boolean) {
    this._editStatusVisible.value = value;
  }

  public get editDetailVisible(): boolean {
    return this._editDetailVisible.value;
  }

  public set editDetailVisible(value: boolean) {
    this._editDetailVisible.value = value;
  }
  //#endregion
  constructor() {
    this.query();
    this.queryDic();
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

  public async query() {
    try {
      this._loading.value = true;
      const res = await postRequest(EPath.查询昨日异常告警阈值);
      if (res?.data?.length) {
        this._dataSource.value = res?.data ?? [];
      } else {
        this._dataSource.value = [];
      }
    } catch (error) {
      this._dataSource.value = [];
    } finally {
      this._loading.value = false;
    }
  }

  public mapSpanMethod = ({
    row,
    column,
    rowIndex,
    columnIndex,
  }: {
    row: Daar_IYesterdayAbnormalVO;
    column: any;
    rowIndex: number;
    columnIndex: number;
  }) => {
    const colspan = 1;
    let rowspan = 1;
    if (column?.label === '能源异常类型') {
      if (rowIndex === 0) {
        rowspan = 2;
      }
      if (rowIndex === 1) {
        rowspan = 0;
      }
    } else if (column.label === '告警等级') {
      if (rowIndex === 0) {
        if (this._dataSource.value[0].alarmLevel === this._dataSource.value[1].alarmLevel) {
          rowspan = 2;
        } else {
          rowspan = 1;
        }
      } else if (rowIndex === 1) {
        if (this._dataSource.value[0].alarmLevel === this._dataSource.value[1].alarmLevel) {
          rowspan = 0;
        } else {
          rowspan = 1;
        }
      }
    }

    return {
      rowspan,
      colspan,
    };
  };

  public triggerEdit(row: Daar_IYesterdayAbnormalVO) {
    this._editRow.value = {
      ...this._editRow.value,
      ...row,
      general: row.general !== '' && row.general !== null ? transferPercent(Number(row.general), 100) + '' : '',
      serious: row.serious !== '' && row.serious !== null ? transferPercent(Number(row.serious), 100) + '' : '',
    };
    this._editDetailVisible.value = true;
  }

  public handleStatusEditClose = () => {
    this._editStatusVisible.value = false;
    this._editDetailVisible.value = false;
  };

  handleStatusChange(value: EThresboldStatus, id: number) {
    this._editStatusParams.value.status = value;
    this._editStatusParams.value.id = id;
    this._editStatusParams.value.reason = '';
    this._editStatusVisible.value = true;
  }

  public async handleStatusUpdateSubmit() {
    if (this.submitting) {
      return;
    }
    this.submitting = true;
    try {
      const res = await postRequest(EPath.修改昨日异常告警状态, this._editStatusParams.value);
      if (res && res?.data) {
        message.success(res?.message ?? '操作成功');
        this._editStatusVisible.value = false;
        this.query();
      } else {
        message.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      this.submitting = false;
    }
  }

  public async handleDetailUpdateSubmit() {
    const { alarmLevel, general, id, serious, abnormalType } = this._editRow.value;
    const types = [
      EDaarAbnormalType.排名变化,
      EDaarAbnormalType.关联分析异常,
      EDaarAbnormalType.峰值时间异常,
      EDaarAbnormalType.成本异常,
    ];

    if (!types.includes(abnormalType) && (general === '' || serious === '')) {
      message.error('阈值不可为空');
      this.submitting = false;
      return;
    }

    if (!types.includes(abnormalType) && ((general && Number(general) === 0) || (serious && Number(serious) === 0))) {
      message.error('阈值不可为0');
      this.submitting = false;
      return;
    }

    // 判断严重是否大于普通
    if (!types.includes(abnormalType) && general !== '' && serious !== '' && Number(general) >= Number(serious)) {
      message.error('普通阈值不得大于或等于严重阈值！');
      this.submitting = false;
      return;
    }
    // 是节能考核
    if (
      !types.includes(abnormalType) &&
      abnormalType === EDaarAbnormalType.节能考核异常 &&
      ((general !== '' && Number(general) < 100) || (serious !== '' && Number(serious) < 100))
    ) {
      message.error('节能考核异常阈值不得小于100%');
      this.submitting = false;
      return;
    }
    if (this.submitting) {
      return;
    }
    this.submitting = true;

    let alarmLevelName = '';
    this._alarmLevels.value.forEach((item) => {
      if (item.code === alarmLevel) {
        alarmLevelName = item.name;
      }
    });
    const params = {
      alarmLevel,
      alarmLevelName,
      general: general !== '' && general !== null ? floatDivide(Number(general), 100) : null,
      serious: serious !== '' && serious !== null ? floatDivide(Number(serious), 100) : null,
      id,
    };
    try {
      const res = await postRequest(EPath.修改昨日异常阈值, params);
      if (res && res?.data) {
        message.success(res?.message ?? '操作成功');
        this._editDetailVisible.value = false;
        this.query();
      } else {
        message.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      this.submitting = false;
    }
  }
}

export default YesterdayAbnormalThresholdConfigureService;
