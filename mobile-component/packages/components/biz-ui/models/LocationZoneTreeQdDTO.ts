import DataPermissionCheck from './DataPermissionCheck';
import FuzzyQd from './FuzzyQd';
export default class LocationZoneTreeQdDTO {
  // 员工数据权限,(如需过滤数据权限则必传)
  projectPermissionCheck: Nullable<DataPermissionCheck>;
  // 空间分区类型编码等于
  typeCodeEq: Nullable<string>;
  // 空间分区id等于
  locationZoneIdEq: Nullable<string>;
  // 结果是否包含已删除的空间分区,默认false-不包含
  includeDeleted: Nullable<boolean>;
  // 模糊查询参数,fields允许值:name
  fuzzyQd: Nullable<FuzzyQd>;
}
