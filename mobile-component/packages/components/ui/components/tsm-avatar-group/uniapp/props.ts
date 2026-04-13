/**
 * AvatarGroup 头像组组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface AvatarGroupProps {
  /** 头像列表 */
  urls?: string[];
  /** 头像大小 */
  size?: number | string;
  /** 头像形状 */
  shape?: 'circle' | 'square';
  /** 最大显示数量 */
  maxCount?: number;
  /** 头像间距 */
  gap?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  urls: () => [],
  size: 40,
  shape: 'circle',
  maxCount: 5,
  gap: -10,
  customClass: '',
  customStyle: () => ({}),
} as const;
