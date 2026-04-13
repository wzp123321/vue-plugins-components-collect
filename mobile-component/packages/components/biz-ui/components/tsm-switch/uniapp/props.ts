/**
 * Switch 开关组件 Props 定义
 * @description 简化版开关组件
 */
import type { CSSProperties } from 'vue';

export interface SwitchProps {
  /** 是否选中 */
  checked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选中时的颜色 */
  activeColor?: string;
  /** 未选中时的颜色 */
  inactiveColor?: string;
  /** 开关大小 */
  size?: number | string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  checked: false,
  disabled: false,
  activeColor: '#2979ff',
  inactiveColor: '#c8c9cc',
  size: 50,
  customClass: '',
  customStyle: () => ({}),
} as const;
