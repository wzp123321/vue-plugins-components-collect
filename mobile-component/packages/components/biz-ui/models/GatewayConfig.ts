import { GatewayTypeEnum } from './GatewayTypeEnum';
export default class GatewayConfig {
	// 分支类型
	type: Nullable<GatewayTypeEnum>;
	// 分支类型选择条件分支时，默认分支id
	defaultBranch: Nullable<string>;
}