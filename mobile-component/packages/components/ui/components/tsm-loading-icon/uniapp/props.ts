/**
 * LoadingIcon 加载图标组件 Props 定义
 * @description 简化版加载图标组件
 */
import type { CSSProperties } from 'vue';

export interface LoadingIconProps {
  /** 加载图标类型 */
  mode?: 'circle' | 'flower';
  /** 图标大小 */
  size?: number | string;
  /** 图标颜色 */
  color?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  mode: 'circle',
  size: 24,
  color: '#2979ff',
  customClass: '',
  customStyle: () => ({}),
} as const;
