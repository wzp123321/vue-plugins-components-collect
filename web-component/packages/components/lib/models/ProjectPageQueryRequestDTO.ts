import DataPermissionCheck from './DataPermissionCheck';
import PageQd from './PageQd';
export default class ProjectPageQueryRequestDTO extends PageQd {
  // 院区ids
  projectIdIn: Nullable<string[]>;
  // 用户数据权限
  dataPermissionCheck: Nullable<DataPermissionCheck>;
}
