/**
 * Avatar 头像组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface AvatarProps {
  /** 头像图片地址 */
  src?: string;
  /** 头像形状 */
  shape?: 'circle' | 'square';
  /** 头像大小 */
  size?: number | string;
  /** 头像文字 */
  text?: string;
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
  src: '',
  shape: 'circle',
  size: 40,
  text: '',
  bgColor: '#c0c4cc',
  color: '#ffffff',
  customClass: '',
  customStyle: () => ({}),
} as const;
