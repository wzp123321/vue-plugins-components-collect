import IdName from './IdName';
export default class FunctionPropertyTreeNodeDTO extends IdName {
  // 上级id
  parentId: Nullable<string>;
  // 状态: true-有效,false-无效
  status: Nullable<boolean>;
  // 是否有下级节点
  hasChildren: Nullable<boolean>;
  // 直属下级节点
  children: Nullable<FunctionPropertyTreeNodeDTO[]>;
}
