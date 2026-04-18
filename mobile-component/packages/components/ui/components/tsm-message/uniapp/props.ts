/**
 * Message 消息提示组件 Props 定义
 * @description 简化版顶部消息提示组件，自动收起
 */
import type { CSSProperties } from 'vue';

export interface MessageProps {
  /** 到顶部的距离 */
  top?: number | string;
  /** 主题类型 */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** 字体颜色 */
  color?: string;
  /** 背景颜色 */
  bgColor?: string;
  /** 展示的文字内容 */
  message?: string;
  /** 展示时长，为0时不消失，单位ms */
  duration?: number;
  /** 自定义类名 */
  customClass?: string;
  customStyle?: CSSProperties;
}

export const defaultProps = {
  top: 0,
  type: 'info',
  color: 'var(--tsm-color-text-primary)',
  bgColor: 'var(--tsm-color-bg-white)',
  message: '',
  duration: 3000,
  customClass: '',
  customStyle: () => ({}),
} as const;
