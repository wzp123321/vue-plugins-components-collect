/**
 * LoadingPage 加载页组件 Props 定义
 * @description 简化版加载页组件
 */
import type { CSSProperties } from 'vue';

export interface LoadingPageProps {
  /** 加载图标类型 */
  mode?: 'circle' | 'flower';
  /** 图标大小 */
  iconSize?: number | string;
  /** 图标颜色 */
  iconColor?: string;
  /** 加载文字 */
  text?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 背景颜色 */
  bgColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  mode: 'circle',
  iconSize: 32,
  iconColor: '#2979ff',
  text: '加载中...',
  textColor: '#909399',
  bgColor: '#ffffff',
  customClass: '',
  customStyle: () => ({}),
} as const;
