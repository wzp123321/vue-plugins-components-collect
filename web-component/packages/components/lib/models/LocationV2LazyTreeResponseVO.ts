export default class LocationV2LazyTreeResponseVO {
	// 空间名称
	realPName: Nullable<string>;
	// 空间名称
	name: Nullable<string>;
	// 空间全路径id
	idPath: Nullable<string>;
	// 空间全路径名称
	namePath: Nullable<string>;
	// 是否包含子节点
	hasChildren: Nullable<boolean>;
	// 
	id: Nullable<number>;
	// 
	pId: Nullable<number>;
	// 
	children: Nullable<LocationV2LazyTreeResponseVO[]>;
}