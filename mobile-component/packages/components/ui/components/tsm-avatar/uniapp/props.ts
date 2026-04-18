/**
 * Avatar 头像组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface AvatarProps {
  /** 头像类型 */
  type?: 'picture' | 'icon' | 'text';
  /** 头像文本内容 */
  text?: string;
  /** 头像图片地址 */
  src?: string;
  /** 头像大小 */
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  /** 背景颜色 */
  bgColor?: string;
  /** 文字颜色 */
  color?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  type: 'picture',
  src: '',
  size: 'm',
  bgColor: 'var(--tsm-color-primary-border)',
  color: 'var(--tsm-color-primary)',
  borderColor: 'var(--palette-indigo-400)',
  customClass: '',
  customStyle: () => ({}),
} as const;
