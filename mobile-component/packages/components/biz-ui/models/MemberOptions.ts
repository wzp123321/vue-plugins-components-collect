import { MemberTypeEnum } from './MemberTypeEnum';
export default class MemberOptions {
	// 选人类型
	type: Nullable<MemberTypeEnum>;
	// 选为指定成员时，指定的员工id列表
	memberList: Nullable<string[]>;
	// 业务指定时，指定的人员参数编码
	personnelParamCode: Nullable<string>;
}