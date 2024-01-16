import { cloneDeep } from 'lodash';
import message from '@/utils/message';
import { Common_ICodeName } from '@/services/common/common-api';
import { postRequest } from '@/services/request';
import { ref } from 'vue';
import { EDaarAbnormalType } from '../../data-abnomal-alarm-rules.api';
import { EThresboldStatus } from '../daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.api';
import {
  Daar_IRealtimeAbnormalThresholdVO,
  DaarIRealTimeUpdateStatusParams,
  Daar_IUpdateStatusParams,
  Daar_IEnergyVO,
} from './daar-abnormal-threshold-configure.api';

enum EPath {
  查询实时异常区间阈值设置 = '/admin/abnormal/queryLimitThreshold',
  修改实时异常区间阈值状态 = '/admin/abnormal/updateLimitThresholdStatus',
}

class AbnormalConfigureService {
  //#region
  private _loading = ref<boolean>(true);

  private _dataSource = ref<Daar_IRealtimeAbnormalThresholdVO[]>([]);

  private _energyCode = ref<string>('');

  private _energyCodeName: string = '';

  private _abnormalType = ref<EDaarAbnormalType>(EDaarAbnormalType.用能异常);

  private _energyCodeList = ref<Daar_IEnergyVO[]>([]);

  private _energyUnit = ref<string>('');

  private _updateStatusParams = ref<Daar_IUpdateStatusParams>({
    row: null,
    reason: '',
  });

  private _statusUpdateVisible = ref<boolean>(false);

  public get loading(): boolean {
    return this._loading.value;
  }

  public get dataSource(): Daar_IRealtimeAbnormalThresholdVO[] {
    return this._dataSource.value;
  }

  public get energyCode(): string {
    return this._energyCode.value;
  }

  public set energyCode(value: string) {
    this._energyCode.value = value;
  }

  public get abnormalType(): EDaarAbnormalType {
    return this._abnormalType.value;
  }

  public set abnormalType(value: EDaarAbnormalType) {
    this._abnormalType.value = value;
  }

  public get energyCodeList(): Daar_IEnergyVO[] {
    return this._energyCodeList.value;
  }

  public get energyUnit(): string {
    return this._energyUnit.value;
  }

  public get updateStatusParams(): Daar_IUpdateStatusParams {
    return this._updateStatusParams.value;
  }

  public set updateStatusParams(value: Daar_IUpdateStatusParams) {
    this._updateStatusParams.value = value;
  }

  public get statusUpdateVisible(): boolean {
    return this._statusUpdateVisible.value;
  }

  public set statusUpdateVisible(value: boolean) {
    this._statusUpdateVisible.value = value;
  }
  //#endregion

  initEnergyCodeList(list: Daar_IEnergyVO[]) {
    if (!list || list?.length === 0) {
      this._loading.value = false;
      return;
    }
    this._energyCodeList.value = list;

    this.setEnergyCode(list?.[0]?.code, list?.[0]?.name, list?.[0]?.unit);
  }

  setEnergyCode = (enegyCode: string, energyCodeName: string, unit: string) => {
    this._energyCode.value = enegyCode;
    this._energyCodeName = energyCodeName;
    this._energyUnit.value = unit;

    if (this._energyCode.value) {
      this.query();
    }
  };

  async query() {
    this._loading.value = true;
    try {
      const res = await postRequest(EPath.查询实时异常区间阈值设置, {
        abnormalType: this._abnormalType.value,
        energyCode: this._energyCode.value,
      });
      if (res?.data) {
        this._dataSource.value = this.convert(res?.data);
      } else {
        this._dataSource.value = [];
      }
    } catch (error) {
      this._dataSource.value = [];
    } finally {
      this._loading.value = false;
    }
  }

  convert(list: Daar_IRealtimeAbnormalThresholdVO[]): Daar_IRealtimeAbnormalThresholdVO[] {
    return (
      list?.map((item) => {
        return {
          abnormalType: item?.abnormalType,
          lowerLimit: item?.lowerLimit,
          thresholdName: item?.thresholdName,
          general: item?.general,
          alarmLevelText: item?.alarmLevelText,
          serious: item?.serious,
          upperLimit: item?.upperLimit,
          alarmLevel: item?.alarmLevel,
          id: item?.id,
          energyCodeName: item?.energyCodeName,
          thresholdType: item?.thresholdType,
          energyCode: item?.energyCode,
          status: item?.status,
        };
      }) ?? []
    );
  }

  show(row: Daar_IRealtimeAbnormalThresholdVO) {
    this._updateStatusParams.value.reason = '';
    this._updateStatusParams.value.row = cloneDeep(row);
    this._statusUpdateVisible.value = true;
  }

  handleClose = () => {
    this._updateStatusParams.value.reason = '';
    this._updateStatusParams.value.row = null;
    this._statusUpdateVisible.value = false;
  };

  // 确认修改状态
  async confirmChangeStatus() {
    const { row, reason } = this._updateStatusParams.value;
    try {
      const params: DaarIRealTimeUpdateStatusParams = {
        energyCode: this._energyCode.value,
        status: row && row.status === EThresboldStatus.关闭 ? EThresboldStatus.开启 : EThresboldStatus.关闭,
        thresholdType: (row as Daar_IRealtimeAbnormalThresholdVO).thresholdType,
        abnormalType: (row as Daar_IRealtimeAbnormalThresholdVO).abnormalType,
        reason,
      };
      const res = await postRequest(EPath.修改实时异常区间阈值状态, params);
      if (res?.success) {
        message.success(res?.message ?? '操作成功');
        this._statusUpdateVisible.value = false;
        this.query();
      } else {
        message.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  }
}

export default AbnormalConfigureService;
