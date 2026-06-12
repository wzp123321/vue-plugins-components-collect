import DataPermissionCheck from './DataPermissionCheck';
import { GlobalLocationLevelEnum } from './GlobalLocationLevelEnum';
import { LocationTypeEnum } from './LocationTypeEnum';
export default class LocationV2DetailRequestDTO {
  /**
   * 空间类型：PROJECT-院区；BUILDING-建筑及分区；FLOOR-楼层及分区；ROOM-房间及分区
   * @deprecated 已废弃
   */
  typeEq: Nullable<LocationTypeEnum>;
  // 空间层级 IN
  levelIn: Nullable<GlobalLocationLevelEnum[]>;
  // 选中数据id
  idEq: Nullable<string>;
  // 待筛选的院区id
  projectIn: Nullable<string[]>;
  /**
   * 当level是分区时，是否查询分区的上级节点名称
   * @deprecated 已废弃
   */
  fetchRealPName: Nullable<boolean>;
  // 数据权限检验
  dataPermissionCheck: Nullable<DataPermissionCheck>;
}
