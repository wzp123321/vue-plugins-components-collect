/*
 * @Description: 表格
 * @Autor: zpwan
 * @Date: 2022-04-20 14:39:30
 * @LastEditors: zpwan
 * @LastEditTime: 2022-05-06 11:11:52
 */
import { ref } from 'vue';
import energySaveProjectService from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm.service.ts';

import { getTenant } from '@/utils/index';
import message from '@/utils/message';

class MaEspTableService {
  //#region
  private _loading = ref<boolean>(true);
  private _is_error = ref<boolean>(false);
  private _dataSource = ref<MaEnergySaveProjDM.EnergySaveProjVO[]>([]);
  private _is_searching = ref<boolean>(false);
  private _searchParams = ref<MaEnergySaveProjDM.SearchParams>({
    projectCode: '',
    year: '',
    tenantCode: '',
    tenantId: 0,
  });
  //#endregion

  //#region
  public get loading(): boolean {
    return this._loading.value;
  }
  public set loading(value: boolean) {
    this._loading.value = value;
  }
  public get is_error(): boolean {
    return this._is_error.value;
  }
  public set is_error(value: boolean) {
    this._is_error.value = value;
  }
  public get dataSource(): MaEnergySaveProjDM.EnergySaveProjVO[] {
    return this._dataSource.value;
  }
  public get searchParams(): MaEnergySaveProjDM.SearchParams {
    return this._searchParams.value;
  }
  //#endregion

  query = async (params: MaEnergySaveProjDM.SearchForm) => {
    if (!params.year) {
      message.error('请选择年份！');
      this._loading.value = false;
      return;
    }
    if (this._is_searching.value) {
      return;
    }
    this._is_error.value = false;
    this._is_searching.value = true;
    const tenant = getTenant();
    const { projectCode, year } = params;
    this._loading.value = true;
    try {
      this._searchParams.value = {
        ...tenant,
        projectCode,
        year,
      };
      const res = await energySaveProjectService.getEnergySaveProjectList(this._searchParams.value);
      if (res && res.code === 200 && res.data?.length) {
        this.converter(res.data);
        this._is_error.value = false;
      } else {
        this._is_error.value = true;
        this._dataSource.value = [];
      }
    } catch (error) {
      this._is_error.value = true;
      this._dataSource.value = [];
    } finally {
      setTimeout(() => {
        this._loading.value = false;
      }, 200);
      this._is_searching.value = false;
    }
  };
  converter = (list: MaEnergySaveProjDM.EnergySaveProjVO[]) => {
    this._dataSource.value = list.map((item) => {
      return {
        actualBillEndTime: item?.actualBillEndTime,
        actualBillStartTime: item?.actualBillStartTime,
        actualPrice: item?.actualPrice,
        benchmarkValue: item?.benchmarkValue,
        contractBillEndTime: item?.contractBillEndTime,
        contractBillStartTime: item?.contractBillStartTime,
        contractPrice: item?.contractPrice,
        energyValue: item?.energyValue,
        month: item?.month,
        saveValue: item?.saveValue,
        surplus: item?.surplus,
      };
    });
  };
}

export default new MaEspTableService();
