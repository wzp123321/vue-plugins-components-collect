import MemberOptions from './MemberOptions';
import { MultiPersonApproveTypeEnum } from './MultiPersonApproveTypeEnum';
import { NullOperatorHandleTypeEnum } from './NullOperatorHandleTypeEnum';
import { SameOperatorHandleTypeEnum } from './SameOperatorHandleTypeEnum';
export default class OperatorConfig {
	// 执行人配置
	operatorOptions: Nullable<MemberOptions>;
	// 抄送人配置
	ccOptions: Nullable<MemberOptions>;
	// 多人审批方式
	approveType: Nullable<MultiPersonApproveTypeEnum>;
	// 执行人为空时的处理方式
	nullOperatorType: Nullable<NullOperatorHandleTypeEnum>;
	// 执行人为空选择指定人员审批时，指定的员工id列表
	nullOperatorList: Nullable<string[]>;
	// 执行人与发起人相同时的处理方式
	sameOperatorType: Nullable<SameOperatorHandleTypeEnum>;
}