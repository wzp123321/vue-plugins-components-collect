/*
 * @Description: 基准值维护
 * @Autor: zpwan
 * @Date: 2022-04-20 17:13:33
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-29 14:04:29
 */
import { ref } from 'vue';
import message from '@/utils/message';
import { getTenant } from '@/utils/index';

import energySaveProjectService from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm.service.ts';

import espTable from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm-table.service';

class MaEspBasicService {
  //#region
  private _submitting = ref<boolean>(false);
  private _visible = ref<boolean>(false);
  private _basicLoading = ref<boolean>(false);
  private _basicValue = ref<MaEnergySaveProjDM.BasicValueVO>({
    id: 0,
    createTime: 0,
    updateTime: 0,
    tenantId: 0,
    tenantCode: '',
    projectCode: 0,
    projectName: '',
    january: '',
    february: '',
    march: '',
    april: '',
    may: '',
    june: '',
    july: '',
    august: '',
    september: '',
    october: '',
    november: '',
    december: '',
  });
  //#endregion

  //#region
  public get submitting(): boolean {
    return this._submitting.value;
  }
  public get visible(): boolean {
    return this._visible.value;
  }
  public set visible(value: boolean) {
    this._visible.value = value;
  }
  public get basicLoading(): boolean {
    return this._basicLoading.value;
  }
  public get basicValue(): MaEnergySaveProjDM.BasicValueVO {
    return this._basicValue.value;
  }
  //#endregion

  show = async (params: MaEnergySaveProjDM.SearchForm, projectName: string) => {
    const tenant = getTenant();
    this._visible.value = true;
    await this.queryBasicValue();
    this._basicValue.value.projectCode = Number(params.projectCode) ?? 0;
    this._basicValue.value.projectName = projectName;
    this._basicValue.value.tenantCode = tenant.tenantCode;
    this._basicValue.value.tenantId = tenant.tenantId;
  };
  close = () => {
    this._visible.value = false;
  };
  submit = async () => {
    if (this._submitting.value) {
      return;
    }
    this._submitting.value = true;
    const {
      tenantId,
      tenantCode,
      projectCode,
      projectName,
      january,
      february,
      march,
      april,
      may,
      june,
      july,
      august,
      september,
      october,
      november,
      december,
    } = this._basicValue.value;
    let params: MaEnergySaveProjDM.BasicValueMaintainParams = {
      tenantId,
      tenantCode,
      projectCode,
      projectName,
    };
    if (january !== '') {
      params = {
        ...params,
        january: Number(january),
      };
    }
    if (february !== '') {
      params = {
        ...params,
        february: Number(february),
      };
    }
    if (march !== '') {
      params = {
        ...params,
        march: Number(march),
      };
    }
    if (april !== '') {
      params = {
        ...params,
        april: Number(april),
      };
    }
    if (may !== '') {
      params = {
        ...params,
        may: Number(may),
      };
    }
    if (june !== '') {
      params = {
        ...params,
        june: Number(june),
      };
    }
    if (july !== '') {
      params = {
        ...params,
        july: Number(july),
      };
    }
    if (august !== '') {
      params = {
        ...params,
        august: Number(august),
      };
    }
    if (september !== '') {
      params = {
        ...params,
        september: Number(september),
      };
    }
    if (october !== '') {
      params = {
        ...params,
        october: Number(october),
      };
    }
    if (november !== '') {
      params = {
        ...params,
        november: Number(november),
      };
    }
    if (december !== '') {
      params = {
        ...params,
        december: Number(december),
      };
    }
    try {
      const res = await energySaveProjectService.getBasicValueEditor(params);
      if (res && res.code === 200 && res.data) {
        message.success('修改成功！');
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      this._submitting.value = false;
    }
  };
  // 初始化查询
  queryBasicValue = async () => {
    try {
      this._basicLoading.value = true;
      const res = await energySaveProjectService.getBasicValue(espTable.searchParams);
      if (res && res.code === 200 && res.data) {
        this._basicValue.value.january = res.data?.january ?? '';
        this._basicValue.value.february = res.data?.february ?? '';
        this._basicValue.value.march = res.data?.march ?? '';
        this._basicValue.value.april = res.data?.april ?? '';
        this._basicValue.value.may = res.data?.may ?? '';
        this._basicValue.value.june = res.data?.june ?? '';
        this._basicValue.value.july = res.data?.july ?? '';
        this._basicValue.value.august = res.data?.august ?? '';
        this._basicValue.value.september = res.data?.september ?? '';
        this._basicValue.value.october = res.data?.october ?? '';
        this._basicValue.value.november = res.data?.november ?? '';
        this._basicValue.value.december = res.data?.december ?? '';
        this._basicValue.value.projectCode = res.data?.projectCode ?? '';
        this._basicValue.value.projectName = res.data?.projectName ?? '';
        this._basicValue.value.tenantCode = res.data?.tenantCode ?? '';
        this._basicValue.value.tenantId = res.data?.tenantId ?? '';
      } else {
        this._basicValue.value = {
          id: 0,
          createTime: 0,
          updateTime: 0,
          tenantId: 0,
          tenantCode: '',
          projectCode: 0,
          projectName: '',
          january: '',
          february: '',
          march: '',
          april: '',
          may: '',
          june: '',
          july: '',
          august: '',
          september: '',
          october: '',
          november: '',
          december: '',
        };
      }
    } catch (error) {
      this._basicValue.value = {
        id: 0,
        createTime: 0,
        updateTime: 0,
        tenantId: 0,
        tenantCode: '',
        projectCode: 0,
        projectName: '',
        january: '',
        february: '',
        march: '',
        april: '',
        may: '',
        june: '',
        july: '',
        august: '',
        september: '',
        october: '',
        november: '',
        december: '',
      };
    } finally {
      this._basicLoading.value = false;
    }
  };
}

export default new MaEspBasicService();
