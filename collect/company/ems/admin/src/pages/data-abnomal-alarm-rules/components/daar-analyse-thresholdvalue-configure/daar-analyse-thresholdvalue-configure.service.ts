import { ref } from 'vue';
import {
  Daar_IAnalyseThresholdValueVO,
  EThresboldStatus,
  Daar_IAnalyseUpdateStatusParams,
  Daar_IAnalyseEditParams,
} from './daar-analyse-thresholdvalue-configure.api';

import { postRequest } from '@/services/request';
import message from '@/utils/message';
import { transferPercent, floatDivide } from '../../../../utils/index';

enum EPath {
  查询异常阈值区间配置 = '/admin/alarm/energy/analyse/config/queryAll',
  修改异常阈值配置状态 = '/admin/alarm/energy/analyse/config/update',
  修改异常阈值 = '/admin/alarm/energy/analyse/config/update',
}

class ThresholdValueConfigureService {
  //#region
  private _dataSource = ref<Daar_IAnalyseThresholdValueVO[]>([]);

  private _loading = ref<boolean>(true);

  private _statusUpdateParams = ref<Daar_IAnalyseUpdateStatusParams>({
    id: -1,
    status: EThresboldStatus.关闭,
    reason: '',
  });

  private _editParams = ref<Daar_IAnalyseEditParams>({
    id: -1,
    threshold: '',
    abnormalTypeName: '',
  });

  private _statusUpdateVisible = ref<boolean>(false);

  private _editVisible = ref<boolean>(false);

  private submitting: boolean = false;

  public get dataSource(): Daar_IAnalyseThresholdValueVO[] {
    return this._dataSource.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get statusUpdateParams(): Daar_IAnalyseUpdateStatusParams {
    return this._statusUpdateParams.value;
  }

  public set statusUpdateParams(value: Daar_IAnalyseUpdateStatusParams) {
    this._statusUpdateParams.value.id = value?.id;
    this._statusUpdateParams.value.reason = value?.reason;
    this._statusUpdateParams.value.status = value?.status;
  }

  public get editParams(): Daar_IAnalyseEditParams {
    return this._editParams.value;
  }

  public set editParams(value: Daar_IAnalyseEditParams) {
    this._editParams.value.id = value?.id;
    this._editParams.value.threshold = value?.threshold;
    this._editParams.value.abnormalTypeName = value?.abnormalTypeName;
  }

  public get statusUpdateVisible(): boolean {
    return this._statusUpdateVisible.value;
  }

  public set statusUpdateVisible(value: boolean) {
    this._statusUpdateVisible.value = value;
  }

  public get editVisible(): boolean {
    return this._editVisible.value;
  }

  public set editVisible(value: boolean) {
    this._editVisible.value = value;
  }
  //#endregion
  constructor() {
    this.query();
  }

  async query() {
    try {
      this._loading.value = true;
      const res = await postRequest(EPath.查询异常阈值区间配置);
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

  // 打开切换状态编辑原因弹框
  handleStatusChange(value: EThresboldStatus, id: number) {
    this._statusUpdateParams.value.status = value;
    this._statusUpdateParams.value.id = id;
    this._statusUpdateParams.value.reason = '';
    this._statusUpdateVisible.value = true;
  }

  handleStatusUpdateClose = () => {
    this._statusUpdateVisible.value = false;
  };

  async handleStatusUpdateSubmit() {
    if (this.submitting) {
      return;
    }
    this.submitting = true;
    try {
      const res = await postRequest(EPath.修改异常阈值配置状态, this._statusUpdateParams.value);
      if (res && res?.data) {
        message.success(res?.message ?? '操作成功');
        this._statusUpdateVisible.value = false;
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

  handleEditShow(id: number, abnormalTypeName: string, threshold: string) {
    this._editParams.value.id = id;
    this._editParams.value.abnormalTypeName = abnormalTypeName;
    this._editParams.value.threshold = threshold === '' ? threshold : transferPercent(100, Number(threshold)) + '';
    this._editVisible.value = true;
  }

  handleEditClose = () => {
    this._editVisible.value = false;
  };

  async handleEditSubmit() {
    if (this._editParams.value.threshold === '') {
      message.error('阈值不可为空');
      this.submitting = false;
      return;
    }
    if (this._editParams.value.threshold && Number(this._editParams.value.threshold) === 0) {
      message.error('阈值不可为0');
      this.submitting = false;
      return;
    }
    if (this.submitting) {
      return;
    }
    this.submitting = true;
    try {
      const res = await postRequest(EPath.修改异常阈值, {
        id: this._editParams.value.id,
        threshold:
          this._editParams.value.threshold === '' || this._editParams.value.threshold === null
            ? null
            : floatDivide(Number(this._editParams.value.threshold), 100),
      });
      if (res && res?.data) {
        message.success(res?.message ?? '操作成功');
        this._editVisible.value = false;
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

export default ThresholdValueConfigureService;
