import PageQd from './PageQd';
import { LocationTypeEnum } from './LocationTypeEnum';

export default class LocationV2FuzzyPageRequestVO extends PageQd {
  // 模糊查询name
  nameLike: Nullable<string>;
  // 待筛选的院区id
  projectIn: Nullable<string[]>;
  // 需要查询的空间类型：PROJECT-院区；BUILDING-建筑及分区；FLOOR-楼层及分区；ROOM-房间及分区; 传全部或不传都默认为查全部
  typeIn: Nullable<LocationTypeEnum[]>;
  // namepath是否包含根节点,默认为true包含根节点
	containsRootName: Nullable<boolean>;
}
