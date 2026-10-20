import JobDeptInfoVO from './JobDeptInfoVO';
export default class JobInfoVO {
  // 岗位ID
  id: string = '';
  // 岗位名称
  name: string = '';
  // 岗位编码
  jobNo: string = '';
  // 简称
  shortName: Nullable<string>;
  // 父级岗位分组id
  groupId: string = '';
  // 父级岗位分组名称
  groupName: string = '';
  // 适用部门
  deptList: JobDeptInfoVO[] = [];
  // 描述
  description: Nullable<string>;
  // 乐观锁
  versionId: string = '';
}
