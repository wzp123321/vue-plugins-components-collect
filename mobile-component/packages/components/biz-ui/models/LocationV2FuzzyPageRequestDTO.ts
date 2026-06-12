import DataPermissionCheck from './DataPermissionCheck';
import PageQd from './PageQd';
import { GlobalLocationLevelEnum } from './GlobalLocationLevelEnum';
import { LocationTypeV2Enum } from './LocationTypeV2Enum';
export default class LocationV2FuzzyPageRequestDTO extends PageQd {
  // 模糊查询name
  nameLike: Nullable<string>;
  /**
   * 需要查询的空间类型：PROJECT-医院分区；BUILDING-建筑及分区；FLOOR-楼层及分区；ROOM-房间及分区; 传全部或不传都默认为查全部
   * @deprecated 已废弃
   */
  typeIn: Nullable<LocationTypeV2Enum[]>;
  // 空间层级 IN
  levelIn: Nullable<GlobalLocationLevelEnum[]>;
  // 待筛选的院区id
  projectIn: Nullable<string[]>;
  // namepath是否包含根节点,默认为true包含根节点
  containsRootName: Nullable<boolean>;
  // 数据权限校验
  dataPermissionCheck: Nullable<DataPermissionCheck>;
}
