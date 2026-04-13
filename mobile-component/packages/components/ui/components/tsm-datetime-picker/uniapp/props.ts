/**
 * DatetimePicker 日期时间选择器组件 Props 定义
 * @description 简化版日期时间选择器组件
 */
import type { CSSProperties } from 'vue';

export interface DatetimePickerProps {
  /** 当前选中值 */
  value?: string | number;
  /** 选择器类型 */
  mode?: 'date' | 'time' | 'datetime';
  /** 最小可选日期 */
  minDate?: number;
  /** 最大可选日期 */
  maxDate?: number;
  /** 是否显示 */
  show?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: '',
  mode: 'date',
  minDate: Date.now() - 10 * 365 * 24 * 60 * 60 * 1000,
  maxDate: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
  show: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
