/**
 * RowNotice 横向通知栏组件 Props 定义
 * @description 简化版横向通知栏组件
 */
import type { CSSProperties } from 'vue';

export interface RowNoticeProps {
  /** 通知文本 */
  text?: string;
  /** 滚动速度 */
  speed?: number;
  /** 是否显示左侧图标 */
  showIcon?: boolean;
  /** 背景颜色 */
  bgColor?: string;
  /** 文字颜色 */
  color?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  text: '',
  speed: 50,
  showIcon: true,
  bgColor: '#fdf6ec',
  color: '#e6a23c',
  customClass: '',
  customStyle: () => ({}),
} as const;
