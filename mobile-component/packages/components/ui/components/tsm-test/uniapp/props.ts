/**
 * Button 按钮组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface TestProps {
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const defaultProps = {
  type: 'info',
} as const;
