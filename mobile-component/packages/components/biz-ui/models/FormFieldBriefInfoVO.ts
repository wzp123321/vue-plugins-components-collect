export default class FormFieldBriefInfoVO {
	// 字段key，生成规则为：form_控件类型_uuid
	code: Nullable<string>;
	// 字段名称
	name: Nullable<string>;
	// 字段是否必填：true-必填、false-非必填
	required: Nullable<boolean>;
}