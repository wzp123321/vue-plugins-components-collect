import FuzzyQd from '../models/FuzzyQd';
import DataPermissionCheck from './DataPermissionCheck';
import { OrganizationIdentityTypeEnum } from './OrganizationIdentityTypeEnum';
import { ProjectDatasourceEnum } from './ProjectDatasourceEnum';
export default class ProjectListRequestDTO {
  /**
   * 应用实例id
   * @deprecated 已废弃
   */
  appInstanceId: string = '';
  /**
   * 数据权限作用域（如需过滤数据权限则必传）
   * @deprecated 已废弃
   */
  scopeCode: Nullable<string>;
  // 模糊搜索组合条件,fields允许值:name
  fuzzyQd: Nullable<FuzzyQd>;
  // 数据权限下数据查询 （如需过滤数据权限则必传）
  dataPermissionCheck: Nullable<DataPermissionCheck>;
  // 院区数据源。PROJECT-院区 ORGANIZATION_PROJECT-组织授权院区（为空认为是ORGANIZATION_PROJECT）
  datasource: Nullable<ProjectDatasourceEnum>;
  // 组织在院区下的身份类型
  organizationIdentityTypeIn: Nullable<OrganizationIdentityTypeEnum[]>;
}
