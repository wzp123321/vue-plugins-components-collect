import PageParam from './PageParam';
export default class SearchEmployeeVORequest extends PageParam {
  // 关键词（姓名/工号 模糊匹配）
  keywordLike: Nullable<string>;
  // 部门id
  deptIdEq: Nullable<string>;
  // 岗位id
  jobIdEq: Nullable<string>;
  // 职务id
  titleIdEq: Nullable<string>;
  // 员工类型
  staffTypeEq: Nullable<string>;
  // 状态
  disabledEq: Nullable<boolean>;
  // 是否离职：true-离职，false-在职
  resignedEq: Nullable<boolean>;
  // 通讯手机号完全匹配
  phoneEq: Nullable<string>;
}
