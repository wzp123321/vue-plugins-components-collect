/**
 * Calendar 日历组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface CalendarProps {
  /** 是否显示 */
  show?: boolean;
  /** 当前选中的日期 */
  value?: string;
  /** 最小可选日期 */
  minDate?: string;
  /** 最大可选日期 */
  maxDate?: string;
  /** 选择器标题 */
  title?: string;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  value: '',
  minDate: '',
  maxDate: '',
  title: '选择日期',
  showConfirm: true,
  confirmText: '确认',
  customClass: '',
  customStyle: () => ({}),
} as const;
