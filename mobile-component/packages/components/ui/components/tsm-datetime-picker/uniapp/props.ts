/**
 * DatetimePicker 日期时间选择器组件 Props 定义
 * @description 简化版日期时间选择器组件
 */
export type DateValue = string | number | [string | number, string | number];

export enum DATETIME_PICKER_MODE {
  DATE = 'date',
  MONTH = 'month',
  YEAR = 'year',
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second',
  DATE_HOUR = 'date-hour',
  DATE_MINUTE = 'date-minute',
  DATE_SECOND = 'date-second',
}

export type DatetimePickerMode = DATETIME_PICKER_MODE;

export enum RANGE_TAB {
  START = 'start',
  END = 'end',
}

export type PickerColumns = {
  years: number[];
  months: number[];
  days: number[];
  hours: number[];
  minutes: number[];
  seconds: number[];
};

export type PickerChangeEvent = {
  detail?: {
    value?: number[];
  };
};

export type RangeTab = RANGE_TAB;

export const YEAR_COLUMN_MODES: string[] = [
  DATETIME_PICKER_MODE.DATE,
  DATETIME_PICKER_MODE.MONTH,
  DATETIME_PICKER_MODE.YEAR,
  DATETIME_PICKER_MODE.DATE_HOUR,
  DATETIME_PICKER_MODE.DATE_MINUTE,
  DATETIME_PICKER_MODE.DATE_SECOND,
];

export const MONTH_COLUMN_MODES: string[] = [
  DATETIME_PICKER_MODE.DATE,
  DATETIME_PICKER_MODE.MONTH,
  DATETIME_PICKER_MODE.DATE_HOUR,
  DATETIME_PICKER_MODE.DATE_MINUTE,
  DATETIME_PICKER_MODE.DATE_SECOND,
];

export const DAY_COLUMN_MODES: string[] = [
  DATETIME_PICKER_MODE.DATE,
  DATETIME_PICKER_MODE.DATE_HOUR,
  DATETIME_PICKER_MODE.DATE_MINUTE,
  DATETIME_PICKER_MODE.DATE_SECOND,
];

export const HOUR_COLUMN_MODES: string[] = [
  DATETIME_PICKER_MODE.HOUR,
  DATETIME_PICKER_MODE.MINUTE,
  DATETIME_PICKER_MODE.SECOND,
  DATETIME_PICKER_MODE.DATE_HOUR,
  DATETIME_PICKER_MODE.DATE_MINUTE,
  DATETIME_PICKER_MODE.DATE_SECOND,
];

export const MINUTE_COLUMN_MODES: string[] = [
  DATETIME_PICKER_MODE.MINUTE,
  DATETIME_PICKER_MODE.SECOND,
  DATETIME_PICKER_MODE.DATE_MINUTE,
  DATETIME_PICKER_MODE.DATE_SECOND,
];

export const SECOND_COLUMN_MODES: string[] = [DATETIME_PICKER_MODE.SECOND, DATETIME_PICKER_MODE.DATE_SECOND];

export interface DatetimePickerProps {
  /** 当前选中值 */
  value?: string | number | [string | number, string | number];
  /** 选择器类型 */
  mode?: 'date' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'date-hour' | 'date-minute' | 'date-second';
  /** 最小可选日期 */
  minDate?: number;
  /** 最大可选日期 */
  maxDate?: number;
  /** 是否显示 */
  show?: boolean;
  /** 标题 */
  title?: string;
  /** 是否开启范围选择 */
  range?: boolean;
}

export const defaultProps = {
  value: '',
  mode: 'date',
  minDate: Date.now() - 10 * 365 * 24 * 60 * 60 * 1000,
  maxDate: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
  show: false,
  title: '',
  range: false,
} as const;
