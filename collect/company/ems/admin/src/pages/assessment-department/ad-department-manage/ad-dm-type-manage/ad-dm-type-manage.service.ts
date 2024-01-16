/*
 * @Description: 科室类型管理
 * @Author: zpwan
 * @Date: 2022-10-10 14:46:57
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-10-10 16:32:11
 */
import { ref } from 'vue';

import { ADDM_IDepartmentTypeVO } from './ad-dm-type-manage.api';

export class DepartmentTypeManageService {
  //#region
  private _dataSource = ref<ADDM_IDepartmentTypeVO[]>([]);

  private _loading = ref<boolean>(true);

  private _visible = ref<boolean>(false);

  private _typeVO = ref<ADDM_IDepartmentTypeVO>({
    id: '',
    name: '',
  });

  public get dataSource(): ADDM_IDepartmentTypeVO[] {
    return this._dataSource.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get visible(): boolean {
    return this._visible.value;
  }

  public set visible(value: boolean) {
    this._visible.value = value;
  }

  public get typeVO(): ADDM_IDepartmentTypeVO {
    return this._typeVO.value;
  }
  //#endregion

  constructor() {
    this._dataSource.value = [];
    this._visible.value = false;
    this._typeVO.value.id = '';
    this._typeVO.value.name = '';
  }

  query() {
    this._loading.value = false;
  }

  handleAddShow = () => {
    this._visible.value = true;
  };

  handleEditShow(item: ADDM_IDepartmentTypeVO) {
    this._typeVO.value.id = item.id;
    this._typeVO.value.name = item.name;
    this._visible.value = true;
  }

  handleClose = () => {
    this._visible.value = false;
  };
}
