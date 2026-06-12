/**
 * ButtonGroup 按钮组组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface ButtonGroupProps {
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  customClass: '',
  customStyle: () => ({}),
} as const;
