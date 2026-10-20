import { LocationTypeEnum } from './LocationTypeEnum';
export default class LocationV2DetailRequestVO {
  // 空间类型：PROJECT-院区；BUILDING-建筑及分区；FLOOR-楼层及分区；ROOM-房间及分区
  typeEq: Nullable<LocationTypeEnum>;
  // 选中数据id
  idEq: Nullable<string>;
  // 待筛选的院区id
  projectIn: Nullable<string[]>;
}
