// 移动角色分组请求
export default class MoveRoleGroupVORequest {
	// 正在拖动的角色分组id
	targetId: Nullable<string>;
	// 最终放入的角色分组id
	destinationId: Nullable<string>;
	// 新顺序角色id列表
	sequentialIds: Nullable<string[]>;
}