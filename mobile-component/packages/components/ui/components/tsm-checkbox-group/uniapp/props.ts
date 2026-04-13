/**
 * CheckboxGroup 复选框组组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface CheckboxGroupProps {
  /** 选中项的名称列表 */
  modelValue?: (string | number)[];
  /** 是否禁用所有复选框 */
  disabled?: boolean;
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
  /** 标签文字颜色 */
  labelColor?: string;
  /** 标签文字大小 */
  labelSize?: number | string;
  /** 是否禁用标签点击 */
  labelDisabled?: boolean;
  /** 排列方向 */
  placement?: 'row' | 'column';
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  modelValue: () => [],
  disabled: false,
  shape: 'circle',
  activeColor: '#2979ff',
  inactiveColor: '#c8c9cc',
  size: 21,
  iconSize: 12,
  iconColor: '#ffffff',
  labelColor: '#606266',
  labelSize: 15,
  labelDisabled: false,
  placement: 'row',
  customClass: '',
  customStyle: () => ({}),
} as const;
