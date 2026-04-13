/**
 * Steps 步骤条组件 Props 定义
 * @description 简化版步骤条组件
 */
import type { CSSProperties } from 'vue';

export interface StepsProps {
  /** 当前步骤 */
  current?: number;
  /** 步骤条方向 */
  direction?: 'horizontal' | 'vertical';
  /** 步骤条颜色 */
  activeColor?: string;
  /** 未完成颜色 */
  inactiveColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  current: 0,
  direction: 'horizontal',
  activeColor: '#2979ff',
  inactiveColor: '#909399',
  customClass: '',
  customStyle: () => ({}),
} as const;
