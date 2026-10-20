export default class RoleGroupTreeNodeVO {
	// 角色分组id
	id: Nullable<string>;
	// 角色分组父id
	parentId: Nullable<string>;
	// 角色分组名称
	name: Nullable<string>;
	// 角色分组子节点
	children: Nullable<RoleGroupTreeNodeVO[]>;
}