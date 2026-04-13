/**
 * Sticky 吸顶组件 Props 定义
 * @description 简化版吸顶组件
 */
import type { CSSProperties } from 'vue';

export interface StickyProps {
  /** 吸顶距离 */
  offsetTop?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  offsetTop: 0,
  customClass: '',
  customStyle: () => ({}),
} as const;
