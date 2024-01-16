/*
 * @Description: 容器服务
 * @Author: zpwan
 * @Date: 2022-06-29 10:06:13
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-07-07 19:10:58
 */
import { ref } from 'vue';
import permissionConfigureService from './permission-configure.service';

import { PermissionConfigureVO } from './permission-configure-api';

import { FGetQueryParam, FResHandler } from '../../../utils/token';
import message from '../../../utils/message';

class PermissionConfigureContainer {
  //#region
  private _roleCode = '';
  private _permissionDetail: PermissionConfigureVO = {
    areaTree: [],
    formatTree: [],
    branchTree: [],
    choosedTreeIdList4AreaTree: [],
    choosedTreeIdList4FormatTree: [],
    choosedTreeIdList4BranchTree: [],
  };
  private _submitting = false;
  private _loading = ref<boolean>(true);
  private _is_error = ref<boolean>(false);
  //#endregion
  //#region
  public get permissionDetail(): PermissionConfigureVO {
    return this._permissionDetail;
  }
  public get loading(): boolean {
    return this._loading.value;
  }
  public get is_error(): boolean {
    return this._is_error.value;
  }
  //#endregion
  //#region
  init() {
    this._roleCode = FGetQueryParam('roleCode') as string;
    return new Promise(async (resolve) => {
      this._is_error.value = false;
      this._loading.value = true;
      try {
        const res = await permissionConfigureService.getPermissionConfigureDetail(decodeURIComponent(this._roleCode));
        const result = FResHandler<PermissionConfigureVO>(res);
        if (result) {
          this._permissionDetail.areaTree = result?.areaTree ?? [];
          this._permissionDetail.formatTree = result?.formatTree ?? [];
          this._permissionDetail.branchTree = result?.branchTree ?? [];
          this._permissionDetail.choosedTreeIdList4AreaTree = result?.choosedTreeIdList4AreaTree ?? [];
          this._permissionDetail.choosedTreeIdList4BranchTree = result?.choosedTreeIdList4BranchTree ?? [];
          this._permissionDetail.choosedTreeIdList4FormatTree = result?.choosedTreeIdList4FormatTree ?? [];
          resolve(true);
        } else {
          this._permissionDetail.areaTree = [];
          this._permissionDetail.formatTree = [];
          this._permissionDetail.branchTree = [];
          this._permissionDetail.choosedTreeIdList4AreaTree = [];
          this._permissionDetail.choosedTreeIdList4FormatTree = [];
          this._permissionDetail.choosedTreeIdList4BranchTree = [];

          this._is_error.value = true;
          resolve(true);
        }
      } catch (error) {
        this._permissionDetail.areaTree = [];
        this._permissionDetail.formatTree = [];
        this._permissionDetail.branchTree = [];
        this._permissionDetail.choosedTreeIdList4AreaTree = [];
        this._permissionDetail.choosedTreeIdList4FormatTree = [];
        this._permissionDetail.choosedTreeIdList4BranchTree = [];
        resolve(true);
        this._is_error.value = true;
      } finally {
        this._loading.value = false;
      }
    });
  }
  //#endregion
  //#region
  async submit(roleAreaTreeIds: number[], roleBusinessTreeIds: number[], roleBranchTreeIds: number[]) {
    try {
      if (this._submitting) {
        return;
      }
      this._submitting = true;
      const roleCode = this._roleCode;
      const res = await permissionConfigureService.getPermissionConfigureUpdate({
        roleCode: decodeURIComponent(roleCode),
        roleAreaTreeIds,
        roleBusinessTreeIds,
        roleBranchTreeIds,
      });
      const result = FResHandler<number>(res);
      if (result) {
        window.parent?.postMessage('success', '*');
      }
    } catch (error) {
      message.error(error as string);
    } finally {
      this._submitting = false;
    }
  }
  //#endregion
}

export default new PermissionConfigureContainer();
