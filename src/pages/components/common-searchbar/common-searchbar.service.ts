import { ref } from 'vue';
import { CS_ESearchBarType } from './common-searchbar.api';

class CmommonSearchBarService {
  //#region
  private _searchFormItemList = ref<CS_ESearchBarType[]>([]);

  public get searchFormItemList(): CS_ESearchBarType[] {
    return this._searchFormItemList.value;
  }
  //#endregion
}

export default CmommonSearchBarService;
