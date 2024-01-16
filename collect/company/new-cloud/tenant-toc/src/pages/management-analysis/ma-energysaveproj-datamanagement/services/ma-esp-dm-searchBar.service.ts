/*
 * @Description: 搜索栏
 * @Autor: zpwan
 * @Date: 2022-04-20 14:39:17
 * @LastEditors: zpwan
 * @LastEditTime: 2022-05-06 14:20:06
 */
import { ref } from 'vue';

import { getTenant } from '@/utils/index';
import commonService from '@/service/pkg/index';
import energySaveProjectService from '@/pages/management-analysis/ma-energysaveproj-datamanagement/services/ma-esp-dm.service.ts';

const tenant = getTenant();

class MaEspSearchBarService {
  //#region
  private _espForm = ref<MaEnergySaveProjDM.SearchForm>({
    projectCode: '',
    year: '',
  });
  private _projectName = ref<string>('');
  private _yearList = ref<GeneralModule.DictionaryInfo[]>([]);
  private _unit = ref<string>('');
  private _projectTypeList = ref<NHouseholdNumber.EnergyCodeVO[]>([]);
  //#endregion

  //#region
  public get espForm(): MaEnergySaveProjDM.SearchForm {
    return this._espForm.value;
  }
  public get projectTypeList(): NHouseholdNumber.EnergyCodeVO[] {
    return this._projectTypeList.value;
  }
  public get unit(): string {
    return this._unit.value;
  }
  public get yearList(): GeneralModule.DictionaryInfo[] {
    return this._yearList.value;
  }
  public get projectName(): string {
    return this._projectName.value;
  }
  //#endregion

  init = async () => {
    try {
      await this.queryEnergyTypeList();
      await this.queryTrustYear();

      if (this._projectTypeList.value?.length) {
        this._espForm.value.projectCode = this._projectTypeList.value[0].code;
        this._projectName.value = this._projectTypeList.value[0].name;
        this._unit.value = this._projectTypeList.value[0].unit;
      }

      const curYear = new Date().getFullYear() + '';
      if (this._yearList.value?.length) {
        const flag = this._yearList.value.some((item) => {
          return item.code === curYear;
        });

        this._espForm.value.year = flag ? curYear : this._yearList.value[0].code;
      }

      if (this._yearList.value?.length === 0 || this._projectTypeList.value?.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };
  // 查询托管年
  queryTrustYear = async () => {
    const tenant = getTenant();
    const res = await commonService.queryBaseHead(tenant, '/baseHead/queryHostingYears');
    try {
      if (res && res.code === 200 && res.success) {
        this._yearList.value = res.data;
      } else {
        this._yearList.value = [];
      }
    } catch (error) {
      this._yearList.value = [];
    }
  };
  // 查询项目类型
  queryEnergyTypeList = async () => {
    try {
      const res = await energySaveProjectService.getEnergySaveType(tenant);
      if (res && res.code === 200 && res.data) {
        this._projectTypeList.value = res.data;
      } else {
        this._projectTypeList.value = [];
      }
    } catch (error) {
      this._projectTypeList.value = [];
    }
  };
  // 更新单位
  refreshParams = () => {
    this._projectTypeList.value.forEach((item) => {
      if (this._espForm.value.projectCode === item.code) {
        this._unit.value = item.unit;
        this._projectName.value = item.name;
      }
    });
  };
  reset = () => {
    if (this._projectTypeList.value?.length) {
      this._espForm.value.projectCode = this._projectTypeList.value[0].code;
      this._unit.value = this._projectTypeList.value[0].unit;
    }
    if (this._yearList.value?.length) {
      // this._espForm.value.year = this._yearList.value[0].code;
      const curYear = new Date().getFullYear() + '';
      const flag = this._yearList.value.some((item) => {
        return item.code === curYear;
      });
      this._espForm.value.year = flag ? curYear : this._yearList.value[0].code;
    }
  };
}

export default new MaEspSearchBarService();
