import MessageTypeConfig from './MessageTypeConfig';
import RejectInfo from './RejectInfo';
import { ProcessActionCodeEnum } from './ProcessActionCodeEnum';
import { TimeoutTimeUnitEnum } from './TimeoutTimeUnitEnum';
export default class AdvancedConfig {
	// 节点绑定的业务状态编码
	businessStatusCode: Nullable<string>;
	// 消息提醒方式列表
	messageTypes: Nullable<MessageTypeConfig[]>;
	// 是否自动处理：1-自动处理、0-不自动处理
	isAuto: Nullable<number>;
	// 超时时间
	timeout: Nullable<number>;
	// 超时时间的单位
	timeUnit: Nullable<TimeoutTimeUnitEnum>;
	// 超时自动处理的业务动作编码
	businessActionCode: Nullable<string>;
	// 超时自动处理的流程动作
	processActionCode: Nullable<ProcessActionCodeEnum>;
	// 驳回按钮的配置
	rejectConfig: Nullable<RejectInfo>;
	// 工作台（PC）任务详情地址界面动作编码
	taskDetailAddressPc: Nullable<string>;
	// 工作台（移动端）待办列表界面动作编码
	todoListAddressMobile: Nullable<string>;
}