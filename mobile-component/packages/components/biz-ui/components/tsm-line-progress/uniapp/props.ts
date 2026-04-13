/**
 * LineProgress 线性进度条组件 Props 定义
 * @description 简化版线性进度条组件
 */
import type { CSSProperties } from 'vue';

export interface LineProgressProps {
  /** 进度值 */
  value?: number;
  /** 进度条高度 */
  height?: number | string;
  /** 进度条颜色 */
  color?: string;
  /** 背景颜色 */
  bgColor?: string;
  /** 是否显示文字 */
  showText?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: 0,
  height: 8,
  color: '#2979ff',
  bgColor: '#ebedf0',
  showText: true,
  customClass: '',
  customStyle: () => ({}),
} as const;
