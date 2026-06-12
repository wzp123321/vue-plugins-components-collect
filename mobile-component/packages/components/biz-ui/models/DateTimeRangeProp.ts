import { TimeFormatTypeEnum } from './TimeFormatTypeEnum';
export default class DateTimeRangeProp {
	// 标题
	label: Nullable<string>;
	// 时长标题
	durationLabel: Nullable<string>;
	// 是否允许修改时长
	canModifyDuration: Nullable<boolean>;
	// 时间类型
	timeFormat: Nullable<TimeFormatTypeEnum>;
	// 是否必填，默认为true
	required: Nullable<boolean>;
}