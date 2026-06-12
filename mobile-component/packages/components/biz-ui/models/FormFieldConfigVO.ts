export default class FormFieldConfigVO {
	// 表单中的字段key
	key: Nullable<string>;
	// 表单字段的操作权限：edit-编辑、readonly-只读、hidden-隐藏
	permission: Nullable<string>;
	// 是否必填：1-必填、0-非必填
	required: Nullable<number>;
}