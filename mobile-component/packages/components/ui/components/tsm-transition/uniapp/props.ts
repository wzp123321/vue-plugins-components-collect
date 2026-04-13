/**
 * Transition 动画组件 Props 定义
 * @description 简化版动画组件
 */
import type { CSSProperties } from 'vue';

export interface TransitionProps {
  /** 是否显示 */
  show?: boolean;
  /** 动画模式 */
  mode?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom';
  /** 动画时长 */
  duration?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  mode: 'fade',
  duration: 300,
  customClass: '',
  customStyle: () => ({}),
} as const;
