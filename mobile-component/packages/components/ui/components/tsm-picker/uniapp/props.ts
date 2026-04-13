/**
 * Picker 选择器组件 Props 定义
 * @description 简化版选择器组件
 */
import type { CSSProperties } from 'vue';

export interface PickerColumn {
  /** 选项列表 */
  values?: any[];
  /** 选项显示字段 */
  keyName?: string;
}

export interface PickerProps {
  /** 是否显示 */
  show?: boolean;
  /** 选择器标题 */
  title?: string;
  /** 选项列表 */
  columns?: any[] | PickerColumn[];
  /** 当前选中项的索引 */
  defaultIndex?: number;
  /** 是否显示取消按钮 */
  showCancelButton?: boolean;
  /** 是否显示确认按钮 */
  showConfirmButton?: boolean;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  title: '',
  columns: () => [],
  defaultIndex: 0,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: '取消',
  confirmText: '确认',
  customClass: '',
  customStyle: () => ({}),
} as const;
