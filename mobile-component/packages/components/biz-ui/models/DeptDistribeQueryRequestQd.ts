export default class DeptDistribeQueryRequestQd {
	// 空间配置方案编码
	distribeCodeEq: Nullable<string>;
	// 空间配置方案关联的空间id
	locIdIn: Nullable<string[]>;
	// 是否只查询配置了空间的部门（默认为否）
	distribedDeptOnly: Nullable<boolean>;
}