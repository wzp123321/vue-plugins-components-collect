import DateTimeProp from './DateTimeProp';
import DateTimeRangeProp from './DateTimeRangeProp';
import DepartmentProp from './DepartmentProp';
import DescriptionProp from './DescriptionProp';
import EmployeeProp from './EmployeeProp';
import FileProp from './FileProp';
import ImageProp from './ImageProp';
import InputProp from './InputProp';
import MultiSelectProp from './MultiSelectProp';
import NumberProp from './NumberProp';
import SelectProp from './SelectProp';
import TextAreaProp from './TextAreaProp';
import VideoProp from './VideoProp';
import { BusinessFieldTypeEnum } from './BusinessFieldTypeEnum';
import { FormComponentTypeEnum } from './FormComponentTypeEnum';
import { FormFieldPermissionEnum } from './FormFieldPermissionEnum';
import { FormWidgetTypeEnum } from './FormWidgetTypeEnum';
export default class FormWidgetInstance {
	// 表单控件类型
	widgetType: Nullable<FormWidgetTypeEnum>;
	// 基本控件类型
	componentType: Nullable<FormComponentTypeEnum>;
	// 表单控件唯一id，生成规则为：form_控件类型_uuid
	key: Nullable<string>;
	// 业务字段编码，使用业务控件时才有值
	businessFieldCode: Nullable<string>;
	// 实际输入值
	value: Nullable<string>;
	// 输入值类型
	valueType: Nullable<BusinessFieldTypeEnum>;
	// 表单字段的操作权限
	permission: Nullable<FormFieldPermissionEnum>;
	// 是否必填：true-必填、false-非必填
	required: Nullable<boolean>;
	// 单行文本控件属性配置
	input: Nullable<InputProp>;
	// 多行文本控件属性配置
	textarea: Nullable<TextAreaProp>;
	// 说明文本控件属性配置
	description: Nullable<DescriptionProp>;
	// 数字控件属性配置
	number: Nullable<NumberProp>;
	// 单选控件属性配置
	select: Nullable<SelectProp>;
	// 多选控件属性配置
	multiSelect: Nullable<MultiSelectProp>;
	// 时间控件属性配置
	dateTime: Nullable<DateTimeProp>;
	// 时间区间控件属性配置
	dateTimeRange: Nullable<DateTimeRangeProp>;
	// 图片控件属性配置
	image: Nullable<ImageProp>;
	// 附件控件属性配置
	file: Nullable<FileProp>;
	// 视频控件属性配置
	video: Nullable<VideoProp>;
	// 员工选择控件属性配置
	employee: Nullable<EmployeeProp>;
	// 部门选择控件属性配置
	department: Nullable<DepartmentProp>;
	// 子控件列表，widgetType为container时必填
	children: Nullable<FormWidgetInstance[]>;
}