import { ref } from 'vue';

import { CD_TS_ICodeName } from '../cd-table/cd-t-screen/cd-t-screen.api';
import { FResHandler } from '@/pages/management-analysis/ma-annual-details/services/services.api';
import commonService from '@/service/pkg/index';

class CdSearchBarService {
  //#region
  private _checkedRegion = ref<string[]>([]);

  private _regionList = ref<CD_TS_ICodeName[]>([]);

  public get checkedRegion(): string[] {
    return this._checkedRegion.value;
  }

  public set checkedRegion(value: string[]) {
    this._checkedRegion.value = value;
  }

  public get regionList(): CD_TS_ICodeName[] {
    return this._regionList.value;
  }
  //#endregion
  constructor() {
    this._checkedRegion.value = [];
    this._regionList.value = [];

    this.queryRegionList();
  }

  async queryRegionList() {
    try {
      const res = await commonService.queryDictionaryListByCode('region');
      const result = FResHandler<CD_TS_ICodeName[]>(res);
      if (result?.length) {
        this._regionList.value = result?.map((item) => {
          return {
            code: item?.code ?? '',
            name: item?.name ?? '',
          };
        });
      }
    } catch (error) {
      console.warn('查询大区列表Error========================>', error);
    }
  }
  select(value: string[]) {
    this._checkedRegion.value = value;
  }
}

export default CdSearchBarService;
