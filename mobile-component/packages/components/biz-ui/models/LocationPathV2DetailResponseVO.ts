export default class LocationPathV2DetailResponseVO {
	// 数据id
	id: Nullable<string>;
	// 名称
	name: Nullable<string>;
	// 所属院区ID
	projectId: Nullable<string>;
	// 所属院区名称
	projectName: Nullable<string>;
	// 所属建筑ID
	buildingId: Nullable<string>;
	// 所属建筑名称
	buildingName: Nullable<string>;
	// 所属建筑分区ID
	buildingAreaId: Nullable<string>;
	// 所属建筑分区名称
	buildingAreaName: Nullable<string>;
	// 所属楼层ID
	floorId: Nullable<string>;
	// 所属楼层名称
	floorName: Nullable<string>;
	// 所属楼层分区ID
	floorAreaId: Nullable<string>;
	// 所属楼层分区名称
	floorAreaName: Nullable<string>;
	// 所属房间ID
	roomId: Nullable<string>;
	// 所属房间名称
	roomName: Nullable<string>;
	// 所属房间分区ID
	roomAreaId: Nullable<string>;
	// 所属房间分区名称
	roomAreaName: Nullable<string>;
	/**
	 * 空间id全路径
	 * 全路径数据
	 */
	idPath: Nullable<string>;
	/**
	 * 空间名称全路径
	 * 全路径数据
	 */
	namePath: Nullable<string>;
}