import PageQd from './PageQd';
export default class LocationPageQueryRequestDTO extends PageQd {
  // 空间ids
  idIn: Nullable<string[]>;
  // 空间编码
  codeIn: Nullable<string[]>;
  // 空间ids
  parentId: Nullable<string>;
  // 空间名称模糊搜索
  nameLike: Nullable<string>;
  // 空间责任部门id
  deptId: Nullable<string>;
  // 院区ids
  projectIdIn: Nullable<string[]>;
}
