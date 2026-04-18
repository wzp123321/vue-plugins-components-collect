/**
 * Overlay 遮罩层组件 Props 定义
 * @description 简化版遮罩层组件
 */
import type { CSSProperties } from 'vue';

export interface OverlayProps {
  /** 是否显示 */
  show?: boolean;
  /** 层级 */
  zIndex?: number;
  /** 动画时长 */
  duration?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  zIndex: 1000,
  duration: 300,
  customClass: '',
  customStyle: () => ({}),
} as const;
