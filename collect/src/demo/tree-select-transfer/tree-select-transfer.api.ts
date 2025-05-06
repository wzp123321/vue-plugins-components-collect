// 树
export interface Tst_ITreeNodeData {
  [key: string]: any;
}
// props
export interface Tst_IDefaultProps {
  children: string;
  label: string;
}

// 树选中
export interface Tst_ITreeCheckEvent<T> {
  checkedNodes: T[];
  checkedKeys: number[];
  halfCheckedNodes: T[];
  halfCheckedKeys: number[];
}
