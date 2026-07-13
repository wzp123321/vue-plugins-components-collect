import { onMounted, ref } from 'vue';
import { mockSpaceAttributes, type MockSpaceAttr } from '../../_mock/space-attribute';

export type TreeNode = any;

/**
 * 自定义 hook: 树构建 + 选中/半选状态计算
 */
export const useSpaceAttribute = (props: { modelValue: string[] }) => {
  const treeData = ref<TreeNode[]>([]);

  const build = (): TreeNode[] => {
    const traverse = (data?: TreeNode[]) => {
      data?.forEach((item) => {
        item.children?.forEach((child: any) => (child.parent = item));
        traverse(item.children);
      });
    };
    const tree = mockSpaceAttributes as unknown as TreeNode[];
    traverse(tree);
    return tree;
  };

  onMounted(() => {
    treeData.value = build();
  });

  /** 获取后代节点 id */
  const getChildrenIds = (data: TreeNode, ids: string[] = []): string[] => {
    ids.push(data.id!);
    data.children?.forEach((child: any) => getChildrenIds(child, ids));
    return ids;
  };

  /** 获取祖先节点 id */
  const getParentIds = (data: TreeNode): string[] => {
    const ids: string[] = [];
    let parent = data.parent;
    while (parent) {
      ids.push(parent.id!);
      parent = parent.parent;
    }
    return ids;
  };

  /** 节点选中时，判断父节点的子节点是否全部选中。返回需要联选的父节点 ids */
  const getCheckedPIds = (data: TreeNode, curValue: string[]): string[] => {
    const res: string[] = [];
    const value = [...curValue];
    let parent = data.parent;
    while (
      parent &&
      !parent.disabled &&
      value.length >= parent.children!.length &&
      parent.children!.every((child: any) => value.includes(child.id!))
    ) {
      res.push(parent.id!);
      value.push(parent.id!);
      parent = parent.parent;
    }
    return res;
  };

  /** 节点取消时，判断父节点的所有子节点是否都未选中。返回需要联取消的父节点 ids */
  const getUncheckedPIds = (data: TreeNode, curValue: string[]): string[] => {
    const res: string[] = [];
    let parent = data.parent;
    while (parent && !parent.disabled && parent.children!.every((child: any) => !curValue.includes(child.id!))) {
      res.push(parent.id!);
      parent = parent.parent;
    }
    return res;
  };

  /** 是否选中 */
  const getIsChecked = (data: TreeNode) => (props.modelValue || []).includes(data.id!);

  /** 是否半选: 自己未选但有子被选 */
  const getIsHalfChecked = (data: TreeNode) =>
    !getIsChecked(data) && (data.children || []).some((child: any) => getIsChecked(child));

  return {
    treeData,
    getChildrenIds,
    getParentIds,
    getCheckedPIds,
    getUncheckedPIds,
    getIsChecked,
    getIsHalfChecked,
  };
};

export type { MockSpaceAttr, TreeNode as SpaceAttrTreeNode };
