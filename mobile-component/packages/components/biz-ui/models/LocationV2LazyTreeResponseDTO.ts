import { GlobalLocationLevelEnum } from './GlobalLocationLevelEnum';
export default class LocationV2LazyTreeResponseDTO {
  // 空间名称
  name: Nullable<string>;
  // 空间全路径id
  idPath: Nullable<string>;
  // 空间全路径名称
  namePath: Nullable<string>;
  /**
   * 是否包含子节点
   * @deprecated 已废弃
   */
  hasChildren: Nullable<boolean>;
  /**
   * 是否包含下一层级的节点
   * 组件中的hasSubLevel含义表示有下一层级和树hasChildren不一样:组件中楼栋同样有子节点，子节点有房间才叫hasChildren,有楼栋分区不叫有hasChildren
   */
  hasSubLevel: Nullable<boolean>;
  //
  id: Nullable<string>;
  //
  pId: Nullable<string>;
  //
  children: Nullable<LocationV2LazyTreeResponseDTO[]>;
  /**
   * 当level是分区时，是否查询分区的上级节点名称
   * @deprecated 已废弃
   */
  realPName: Nullable<string>;
  // 空间层级
  level: Nullable<GlobalLocationLevelEnum>;
}
