/*
 * @Description: 单个树服务
 * @Author: zpwan
 * @Date: 2022-06-28 16:04:00
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-07-21 19:23:26
 */
import { ref, nextTick } from 'vue';
import { TreeVO } from './permission-configure-api';

import { ElTree } from 'element-plus';
import { getTreeExpandKeys } from '@/utils/index';

const defaultProps = {
  label: 'treeName',
  children: 'childTree',
};

const node_key = 'id';

class PermissionConfigureTree {
  //#region
  private _title: string = '';
  private _is_indeterminate = ref<boolean>(false);
  private _is_check_all = ref<boolean>(false);
  private _checkedList = ref<number[]>([]);
  private _treeList = ref<TreeVO[]>([]);
  private _expanded_keys = ref<number[]>([]);
  private allKeys: number[] = [];
  public readonly defaultProps = defaultProps;
  public readonly node_key = node_key;
  public treeRef = ref(ElTree);
  //#endregion
  //#region
  public get title(): string {
    return this._title;
  }
  public get is_indeterminate(): boolean {
    return this._is_indeterminate.value;
  }
  public set is_indeterminate(value: boolean) {
    this._is_indeterminate.value = value;
  }
  public get is_check_all(): boolean {
    return this._is_check_all.value;
  }
  public set is_check_all(value: boolean) {
    this._is_check_all.value = value;
  }
  public get checkedList(): number[] {
    return this._checkedList.value;
  }
  public set checkedList(value: number[]) {
    this._checkedList.value = value;
  }
  public get treeList(): TreeVO[] {
    return this._treeList.value;
  }
  public get expanded_keys(): number[] {
    return this._expanded_keys.value;
  }
  public set expanded_keys(value: number[]) {
    this._expanded_keys.value = value;
  }
  //#endregion
  init(title: string, treeList: TreeVO[], checkedList: number[]) {
    this._expanded_keys.value = getTreeExpandKeys(treeList, 'id', 'childTree') || [];
    this._is_check_all.value = false;
    this._is_indeterminate.value = false;
    this._title = '';
    this._title = title;
    this._treeList.value = treeList;
    this._checkedList.value = checkedList;
    this.allKeys = this.getTreeAllChildIds(treeList);

    if (treeList?.length) {
      this.checkSelectedAll();
    }
  }
  //#region
  handleCheckAllChange = (value: boolean) => {
    if (!value) {
      this._checkedList.value = [];
    } else {
      this._checkedList.value = this.getTreeAllChildIds(this._treeList.value);
      nextTick(() => {
        setTimeout(() => {
          const nodes = this.treeRef.value?.getCheckedKeys();
          this._checkedList.value = nodes;
        });
      });
    }

    this._is_indeterminate.value = !value && this._checkedList.value?.length > 0;

    this.handleTreeRender();
  };
  //#endregion
  //#region
  handleTreeCheck = (node: TreeVO, data: any) => {
    // 1.选中节点被选中 --- 需要勾选父节点至最顶级节点以及所有子节点
    // 2.节点取消勾选  --- 不影响父节点勾选，所有子节点被取消勾选
    const { checkedKeys } = data;
    const parentIds = node?.parentIds?.length
      ? node?.parentIds?.split(',')?.map((item) => {
          return Number(item);
        })
      : [];
    const childIds = this.getTreeAllChildIds(node?.childTree);
    this._checkedList.value = checkedKeys;
    if (checkedKeys?.includes(node?.id)) {
      this._checkedList.value = [...this._checkedList.value, ...parentIds, ...childIds];
      this._checkedList.value = Array.from(new Set(this._checkedList.value));
    } else {
      this._checkedList.value = this._checkedList.value?.filter((item) => {
        return !childIds?.includes(item);
      });
    }

    this.checkSelectedAll();
  };
  //#endregion
  //#region
  getTreeAllChildIds(list: TreeVO[]) {
    if (!list || list?.length === 0) {
      return [];
    }
    let ids: number[] = [];
    function getIds(list: TreeVO[]) {
      list.forEach((item) => {
        ids.push(item?.id);

        if (item?.childTree?.length) {
          getIds(item?.childTree);
        }
      });
    }
    getIds(list);

    return ids;
  }
  //#endregion
  //#region
  checkSelectedAll() {
    this._is_check_all.value = this._checkedList.value?.length === this.allKeys?.length;
    this._is_indeterminate.value = this._checkedList.value?.length > 0 && !this._is_check_all.value;

    this.handleTreeRender();
  }
  //#endregion
  //#region
  handleTreeRender() {
    nextTick(() => {
      if (this.treeRef.value) {
        this.treeRef.value?.setCheckedKeys(this._checkedList.value, false);
      }
    });
  }
}

export default PermissionConfigureTree;
