/**
 * Checkbox 复选框组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface CheckboxProps {
  /** 复选框的名称/标识（与 value 二选一） */
  name?: string | number;
  /** 复选框的值（与 name 二选一，优先级低于 name） */
  value?: string | number;
  /** 是否选中 */
  checked?: boolean;
  /** 是否半选（indeterminate 状态） */
  indeterminate?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 复选框形状 */
  shape?: 'circle' | 'square';
  /** 选中时的颜色 */
  activeColor?: string;
  /** 未选中时的颜色 */
  inactiveColor?: string;
  /** 复选框大小 */
  size?: number | string;
  /** 图标大小 */
  iconSize?: number | string;
  /** 图标颜色 */
  iconColor?: string;
  /** 标签文字 */
  label?: string;
  /** 标签文字颜色 */
  labelColor?: string;
  /** 是否禁用标签点击 */
  labelDisabled?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  name: '',
  value: '',
  checked: false,
  indeterminate: false,
  disabled: false,
  readonly: false,
  shape: 'square',
  activeColor: '',
  inactiveColor: '#d9d9d9',
  size: 16,
  iconSize: 12,
  iconColor: '#ffffff',
  label: '',
  labelColor: '',
  labelSize: 16,
  labelDisabled: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
