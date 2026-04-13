/**
 * Gap 间隔槽组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface GapProps {
  /** 高度 */
  height?: number | string;
  /** 背景颜色 */
  bgColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  height: 10,
  bgColor: 'transparent',
  customClass: '',
  customStyle: () => ({}),
} as const;
