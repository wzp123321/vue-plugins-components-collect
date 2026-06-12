export default class GatewayConfigVO {
	// 分支类型：parallelGateway-并行分支、exclusiveGateway-条件分支、appointGateway-指定分支
	type: Nullable<string>;
	// 分支类型选择条件分支时，默认分支id
	defaultBranch: Nullable<string>;
}