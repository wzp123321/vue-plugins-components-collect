import MemberOptions from './MemberOptions';
import OperatorConfig from './OperatorConfig';
import { TimeoutTimeUnitEnum } from './TimeoutTimeUnitEnum';
export default class GrabOrderConfig {
	// 候选人配置
	candidateOptions: Nullable<MemberOptions>;
	// 是否开启超时设置：1-开启、0关闭
	isTimeoutSet: Nullable<number>;
	// 超时时间
	timeout: Nullable<number>;
	// 超时时间单位
	timeUnit: Nullable<TimeoutTimeUnitEnum>;
	// 超时处理人配置
	operatorConfig: Nullable<OperatorConfig>;
}