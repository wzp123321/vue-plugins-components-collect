import { ref } from 'vue';

import { postRequest } from '@/services/request';
import { Daar_IAbnormalVO, Daar_IEditStore } from './daar-min-abnormal-value-configure.api';
import { EDaarAbnormalTab } from '../../data-abnomal-alarm-rules.api';

import { cloneDeep } from 'lodash';
import message from '@/utils/message';

enum EPath {
  查询最小告警值 = '/admin/abnormal/queryStaringValue',
  修改最小告警值 = '/admin/abnormal/updateStaringValue',
}

class MinAbnormalConfigureService {
  //#region
  private _configureType = ref<EDaarAbnormalTab>(EDaarAbnormalTab.实时异常);

  private _loading = ref<boolean>(true);

  private _dataSource = ref<Daar_IAbnormalVO[]>([]);

  private originDataSource: Daar_IAbnormalVO[] = [];

  private _isEditing = ref<boolean>(false);

  private _isSubmitting = ref<boolean>(false);

  private _editStore = ref<Daar_IEditStore>({
    column: '',
    rowIndex: -1,
    originValue: '',
  });

  public get configureType(): EDaarAbnormalTab {
    return this._configureType.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get dataSource(): Daar_IAbnormalVO[] {
    return this._dataSource.value;
  }

  public get isEditing(): boolean {
    return this._isEditing.value;
  }

  public get isSubmitting(): boolean {
    return this._isSubmitting.value;
  }

  public get editStore(): Daar_IEditStore {
    return this._editStore.value;
  }
  //#endregion
  constructor(type: EDaarAbnormalTab) {
    this._configureType.value = type;
  }

  public query() {
    return new Promise(async (resolve) => {
      try {
        this._loading.value = true;
        const res = await postRequest(EPath.查询最小告警值, this._configureType.value);
        if (res?.data?.length) {
          this._dataSource.value = this.convert(res?.data) ?? [];
          this.originDataSource = cloneDeep(this._dataSource.value);

          resolve(
            this._dataSource.value?.map((item) => {
              return {
                code: item.energyCode,
                name: item.energyCodeName,
                unit: item?.unit,
              };
            }) ?? [],
          );
        } else {
          this._dataSource.value = [];
          resolve([]);
        }
      } catch (error) {
        resolve([]);
        this._dataSource.value = [];
      } finally {
        this._loading.value = false;
      }
    });
  }

  convert(list: Daar_IAbnormalVO[]) {
    return (
      list?.map((item) => {
        return {
          id: item?.id ?? null,
          energyCode: item?.energyCode ?? '',
          energyCodeName: item?.energyCodeName ?? '',
          deadbandValue: item?.deadbandValue ?? '',
          businessType: item?.businessType ?? '',
          unit: item?.unit ?? '',
        };
      }) ?? []
    );
  }

  public triggerEdit() {
    this._isEditing.value = true;
  }

  public async handleEditSubmit() {
    if (this._isSubmitting.value) {
      return;
    }

    this._isSubmitting.value = true;
    try {
      const params = {
        businessType: this._configureType.value,
        startingValues: this._dataSource.value?.map((item) => {
          return {
            businessType: item?.businessType,
            deadbandValue: item?.deadbandValue,
            energyCode: item?.energyCode,
            energyCodeName: item?.energyCodeName,
            id: item?.id,
            unit: item?.unit,
          };
        }),
      };
      const res = await postRequest(EPath.修改最小告警值, params);
      if (res?.success) {
        message.success(res?.message ?? '操作成功');
        this._isEditing.value = false;
        this.query();
      } else {
        this._dataSource.value = cloneDeep(this.originDataSource);
        message.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      this._dataSource.value = cloneDeep(this.originDataSource);
      message.error('操作失败');
    } finally {
      this._isSubmitting.value = false;
    }
  }

  public cancelEdit() {
    this._isEditing.value = false;
    this._dataSource.value = cloneDeep(this.originDataSource);
  }
}

export default MinAbnormalConfigureService;
