export default class MemberInfo {
	// 执行人
	assignees: Nullable<string[]>;
	// 抄送人
	ccs: Nullable<string[]>;
	// 候选人
	candidates: Nullable<string[]>;
}