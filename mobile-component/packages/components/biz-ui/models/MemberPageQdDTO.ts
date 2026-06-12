import PageQd from './PageQd';
import { IdentityTypeEnum } from './IdentityTypeEnum';
export default class MemberPageQdDTO extends PageQd {
	// 流程实例id等于
	processInstanceIdEq: Nullable<string>;
	// 人员身份类型等于 {@link IdentityTypeEnum}
	typeEq: Nullable<IdentityTypeEnum>;
}