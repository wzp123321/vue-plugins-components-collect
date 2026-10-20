import Entity from './Entity';
export default class StandardEntity extends Entity {
	// 创建人id
	creatorId: Nullable<string>;
	// 创建人名称
	creatorName: Nullable<string>;
	// 创建时间
	createTime: Nullable<Date>;
	// 修改人
	updaterId: Nullable<string>;
	// 修改人
	updaterName: Nullable<string>;
	// 修改时间
	updateTime: Nullable<Date>;
}