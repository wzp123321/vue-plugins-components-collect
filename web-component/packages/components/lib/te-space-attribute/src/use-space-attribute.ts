import { onMounted, ref } from 'vue';
import LocationFunctionV2OpenApi from '../../api/LocationFunctionV2OpenApi';
import FunctionPropertyTreeNodeDTO from '../../models/FunctionPropertyTreeNodeDTO';
import FunctionPropertyTreeQueryDTO from '../../models/FunctionPropertyTreeQueryDTO';

export interface TreeNode extends FunctionPropertyTreeNodeDTO {
  disabled?: boolean;
  parent?: TreeNode;
  children: Nullable<TreeNode[]>;
}

export const useSpaceAttribute = (props) => {
  const treeData = ref<TreeNode[]>([]);

  onMounted(() => {
    getTreeData();
  });

  const getTreeData = () => {
    const params = new FunctionPropertyTreeQueryDTO();
    LocationFunctionV2OpenApi.queryFunctionPropertyForTree(props.axios, props.tenantId, params).then((res) => {
      let data = res.data || [];
      if (data[0]?.children) {
        data = data[0].children; // 去除 空间功能属性 根节点
        data.forEach((item) => ((item as TreeNode).disabled = true)); // 第一层禁用
        traverse(data);
        treeData.value = data;
      }
    });
  };

  // 遍历树：添加parent属性
  const traverse = (data?: TreeNode[]) => {
    data?.forEach((item) => {
      item.children?.forEach((child) => (child.parent = item));
      traverse(item.children);
    });
  };

  // 获取后代节点id
  const getChildrenIds = (data: TreeNode, ids: string[]) => {
    ids.push(data.id!);
    data.children?.forEach((child) => getChildrenIds(child, ids));
    return ids;
  };

  // 获取祖先节点id
  const getParentIds = (data: TreeNode) => {
    const ids: string[] = [];
    let parent = data.parent;
    while (parent) {
      ids.push(parent.id!);
      parent = parent.parent;
    }
    return ids;
  };

  // 节点选中，判断父节点的子节点是否全部选中，若全部选中，则继续向上判断。返回父节点ids
  const getCheckedPIds = (data: TreeNode, curValue: string[]) => {
    const res: string[] = [];
    const value = [...curValue];
    let parent = data.parent;
    while (
      parent &&
      !parent.disabled &&
      value.length >= parent.children!.length &&
      parent.children!.every((child) => value.includes(child.id!))
    ) {
      res.push(parent.id!);
      value.push(parent.id!);
      parent = parent.parent;
    }
    return res;
  };

  // 是否选中
  const getIsChecked = (data: TreeNode) => (props.modelValue || []).includes(data.id);
  // 是否半选
  const getIsHalfChecked = (data: TreeNode) =>
    !getIsChecked(data) && data.children?.some((child) => getIsChecked(child));

  return {
    treeData,
    getChildrenIds,
    getParentIds,
    getCheckedPIds,
    getIsChecked,
    getIsHalfChecked,
  };
};
