/**
 * Button 按钮组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface ButtonProps {
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** 按钮大小 */
  size?: 'large' | 'normal' | 'small' | 'mini';
  /** 按钮形状 */
  shape?: 'square' | 'circle';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 加载状态文字 */
  loadingText?: string;
  /** 按钮文字 */
  text?: string;
  /** 自定义颜色 */
  color?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  type: 'info',
  size: 'normal',
  shape: 'square',
  disabled: false,
  loading: false,
  loadingText: '',
  text: '',
  color: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
