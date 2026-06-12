import { FormFieldPermissionEnum } from './FormFieldPermissionEnum';
export default class FormFieldConfig {
	// 表单中的字段key
	key: Nullable<string>;
	// 表单字段的操作权限
	permission: Nullable<FormFieldPermissionEnum>;
	// 是否必填：true-必填、false-非必填
	required: Nullable<boolean>;
}