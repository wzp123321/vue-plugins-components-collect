import FuzzyQd from './FuzzyQd';
export default class OrganizationListQdDTO {
  // 父机构id等于
  parentIdEq: Nullable<string>;
  // 机构id in
  idIn: Nullable<string[]>;
  // 模糊查询参数,fields允许值:code、name
  fuzzyQd: Nullable<FuzzyQd>;
}
