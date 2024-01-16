import { ref } from 'vue';
import { Subject, Observable } from 'rxjs';

import { postRequest } from '@/services/request';
import { DTSD_ICheckedNodeVO, DTSD_IDepartmentVO, DTSD_ISelectedTreeVO } from './da-tree-select-dialog.api';
import { Common_ETreeLeaf, Common_ETreeType, Common_IHttpResponse, Common_IIdName } from '@/services/common/common-api';
import { DA_EPath } from '../department-assessment.api';
import { getCampusParams } from '@/utils/token';
import message from '@/utils/message';

class DaTreeSelectDialogService {
  // 可观察对象--选中节点
  private _selectedTreeIds$ = new Subject<number[]>();
  // 弹框开关
  private _visible = ref<boolean>(false);
  // 全选
  private _checkAll = ref<boolean>(false);
  // 半选
  private _isIndeterminate = ref<boolean>(false);
  // 数过滤文本
  private _treeFilterText = ref<string>('');
  // 科室树
  private _departmentTreeList = ref<DTSD_IDepartmentVO[]>([]);
  // 科室选中列表
  private _selectedList = ref<Common_IIdName<number>[]>([]);
  // 科室选中Ids
  private _selectedIds = ref<number[]>([]);
  // 展开节点
  private _expandedKeys = ref<number[]>([]);
  // 全部子节点
  private _allTreeNodes: Common_IIdName<number>[] = [];
  // loading
  private _loading = ref<boolean>(false);
  // 可观察对象--选中节点
  public get selectedTreeIds$() {
    return this._selectedTreeIds$ as unknown as Observable<number[]>;
  }
  // 弹框开关
  public get visible(): boolean {
    return this._visible.value;
  }
  // 弹框开关
  public set visible(value: boolean) {
    this._visible.value = value;
  }
  // 全选
  public get checkAll(): boolean {
    return this._checkAll.value;
  }
  // 全选
  public set checkAll(value: boolean) {
    this._checkAll.value = value;
  }
  // 半选
  public get isIndeterminate(): boolean {
    return this._isIndeterminate.value;
  }
  // 数过滤文本
  public get treeFilterText(): string {
    return this._treeFilterText.value;
  }
  // 数过滤文本
  public set treeFilterText(value: string) {
    this._treeFilterText.value = value;
  }
  // 科室树
  public get departmentTreeList(): DTSD_IDepartmentVO[] {
    return this._departmentTreeList.value;
  }
  // 科室选中列表
  public get selectedList(): Common_IIdName<number>[] {
    return this._selectedList.value;
  }
  public get selectedIds(): number[] {
    return this._selectedIds.value;
  }
  // 科室选中Ids
  public set selectedIds(value: number[]) {
    this._selectedIds.value = value;
  }
  // 科室选中Ids
  public get expandedKeys(): number[] {
    return this._expandedKeys.value;
  }
  // 全部子节点
  public get allTreeNodes(): Common_IIdName<number>[] {
    return this._allTreeNodes;
  }
  // loading
  public get loading(): boolean {
    return this._loading.value;
  }
  // 打开弹框
  public show() {
    this.queryDepartmentList();
    this.queryDepartSelected();

    this._treeFilterText.value = '';
    this._visible.value = true;
  }
  /**
   * 关闭
   */
  public close = () => {
    this._visible.value = false;
  };
  /**
   * 查询科室树列表
   */
  private async queryDepartmentList() {
    this._loading.value = true;
    const resetTree = (list: DTSD_IDepartmentVO[], expandedKeys: number[]) => {
      this._departmentTreeList.value = list;
      this._expandedKeys.value = expandedKeys;
    };
    const params = {
      treeType: Common_ETreeType.科室,
      energyCode: '',
      expandLevel: 2,
      ...getCampusParams(),
    };
    try {
      const res = await postRequest(DA_EPath.查询科室树, params);
      if (res?.success) {
        resetTree(res?.data?.data, res?.data?.expandTreeIds);
        this.mapAllTreeLeafNodes();
      } else {
        resetTree([], []);
      }
    } catch (error) {
      resetTree([], []);
    } finally {
      this._loading.value = false;
      this.mapAllChecked();
    }
  }
  /**
   * 查询选中的科室
   */
  private async queryDepartSelected() {
    try {
      const res: Common_IHttpResponse<DTSD_ISelectedTreeVO[]> = await postRequest(DA_EPath.查询已勾选的科室树);
      if (res?.success) {
        this._selectedList.value =
          res?.data?.map((item) => ({
            id: item.id,
            name: item.name,
          })) ?? [];
        this._selectedIds.value = res?.data?.map((item) => item.id);
      } else {
        this._selectedList.value = [];
      }
    } catch (error) {
      this._checkAll.value = false;
      this._isIndeterminate.value = false;
      this._selectedList.value = [];
    } finally {
      this.mapAllChecked();

      this._selectedTreeIds$.next(this._selectedIds.value);
    }
  }
  /**
   * 获取所有叶子节点
   */
  private mapAllTreeLeafNodes() {
    this._allTreeNodes = [];
    if (this._departmentTreeList.value?.length) {
      const mapTreeNode = (list: DTSD_IDepartmentVO[]) => {
        list?.forEach((item) => {
          if (item.treeLeaf === Common_ETreeLeaf.是) {
            this._allTreeNodes.push({
              id: item.id,
              name: item.treeName,
            });
          } else {
            if (item?.childTree?.length) {
              mapTreeNode(item?.childTree);
            }
          }
        });
      };
      mapTreeNode(this._departmentTreeList.value);
    }
  }
  /**
   * 计算是否是全选
   */
  private mapAllChecked() {
    this._checkAll.value = this._allTreeNodes?.length === this._selectedList?.value?.length;
    this._isIndeterminate.value = !this._checkAll.value && this._selectedList.value?.length !== 0;
  }
  /**
   * 勾选全选、半选
   * @param {boolean} val
   */
  public handleCheckAllChange = (val: boolean) => {
    if (val) {
      this._selectedIds.value = this._allTreeNodes?.map((item) => item.id);
      this._selectedList.value = [...this._allTreeNodes];
    } else {
      this._selectedIds.value = [];
      this._selectedList.value = [];
    }

    this.mapAllChecked();
    this._selectedTreeIds$.next(this._selectedIds.value);
  };
  /**
   * 节点选中
   * @param {DTSD_IDepartmentVO} data
   * @param {DTSD_ICheckedNodeVO} tree
   */
  public handleTreeCheck = (data: DTSD_IDepartmentVO, tree: DTSD_ICheckedNodeVO) => {
    this._selectedIds.value = tree?.checkedKeys;
    this._selectedList.value = tree?.checkedNodes?.map((item) => ({
      id: item.id,
      name: item?.treeName,
    }));
    this.mapAllChecked();
    this._selectedTreeIds$.next(this._selectedIds.value);
  };
  /**
   * 删除选中节点
   * @param {number} index
   */
  public handleSelectItemDelete = (id: number) => {
    this._selectedIds.value = this._selectedIds.value?.filter((item) => item !== id);
    this._selectedList.value = this._selectedList.value?.filter((item) => item.id !== id);

    this.mapAllChecked();
    this._selectedTreeIds$.next(this._selectedIds.value);
  };
  /**
   * 清空选中节点
   */
  public clear() {
    this._selectedIds.value = [];
    this._selectedList.value = [];

    this.mapAllChecked();
    this._selectedTreeIds$.next(this._selectedIds.value);
  }
  /**
   * 保存选中的科室节点
   * @returns {Promise<boolean>}
   */
  public handleSelectedTreeSave(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const res = await postRequest(DA_EPath.考核科室保存, {
          idList: this._selectedIds.value,
        });
        if (res?.success) {
          resolve(true);
          this._visible.value = false;
          message.success(res?.message ?? '操作成功');
        } else {
          resolve(false);
          message.error(res?.message ?? '操作失败');
        }
      } catch (error) {
        message.error('操作失败');
      }
    });
  }
}

export default new DaTreeSelectDialogService();
